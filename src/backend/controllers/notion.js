const { Client } = require('@notionhq/client');
const { getFromCache, setToCache } = require('./cache');
const { basename, join } = require('path')
const { openAsBlob } = require('node:fs');
const express = require('express');
const dotenv = require('dotenv');
dotenv.config();

const router = express.Router();

// Middleware function
const myMiddleware = (req, res, next) => {
    next(); // Pass control to the next middleware
};

// Use middleware
router.use(myMiddleware);

let notion = null;

router.get('/health-check', async (req, res) => {
    try {
        notion = await initializeNotion();
        const response = await notion.databases.query({
            database_id: process.env.DATABASE_CET_ID,
            filter: {
                property: 'done',
                checkbox: { equals: false }
            }
        });
        
        let responseString = '';
        if (response.results.length > 0) {
            responseString = responseString.concat('| ', 'Notion connection [✅]');
        } else {
            responseString = responseString.concat('| ', 'Notion connection [❌]');
        }
        res.json({ status: responseString });
    } catch (error) {
        console.error('Health check error:', error); // Log the error for debugging
        res.status(500).json({ status: 'Health check error', error: error.message });
    }
});

router.get('/get-people/:people_type', async (req, res) => {
    const  peopleType = req.params.people_type
    console.log('going for people: ', peopleType); 
    const cacheKey = `bnc:people:${peopleType}`; // Unique key for caching  
    try {
        let people = null;
        // Try to get data from cache
        const cachedPeople = await getFromCache(cacheKey);
        if (cachedPeople) {
            //console.log('Retrieved people from cache');
            people = cachedPeople;
        }else{  
            //console.log('No cached people');
            const response = await notion.databases.query({
                database_id: process.env.DATABASE_PPL_ID,
                sorts: [{ property: 'Name', direction: 'ascending' }], 
            });
            response_results = response.results
            filtered_people = []
            for (person of response_results) {
                if(person.properties.type.select.name === peopleType && person.properties.mail.email != null) {
                    //console.log(person.properties)
                    filtered_people.push(person);
                }
            }
            people = filtered_people.map(item => {
                const pp_status = item.properties.status.status.name;
                return {
                    id: item.properties.todoist.rich_text[0].plain_text,
                    name: item.properties.Name.title[0].text.content + (pp_status != 'active' ? ' ('+pp_status+')' : '') 
                };
            });
            // Add the "all" option
            people.unshift({ id: 'all', name: 'All' });
            console.log(`people count ${people.length}`);
            await setToCache(cacheKey, people, 3600 * 24 * 15);
            console.log('Fetched people from source and stored in cache'); 
        }
        res.status(200).json({ status: 'success', people: people });
    } catch (error) {
        console.error('Error fetching people:', error);
        res.status(500).json({ status: 'Error fetching people', error: error.message });
    }
});


async function createNotionClient() {
    if (!process.env.NOTION_TOKEN) {
        throw new Error("Notion client is not initialized.");
    }
    return new Client({ auth: process.env.NOTION_TOKEN });
}

async function initializeNotion() {
    if (!notion) {
        notion = await createNotionClient(); // Await the client creation
    }
    return notion;
}

// Call the async function to initialize notion
initializeNotion().catch(error => {
    console.error("Failed to initialize Notion client:", error);
});

/**
 * Sends data to Notion Moon Log including family and personal information.
 * Validates input parameters and appends data to the Notion block.
 * Calculates and displays percentage equations based on the input data.
 * Logs any errors that occur during the process.
 */
async function sendToNotionMoonLog(sumFamilia, totFamiliar, sumPersonal, totPersonal, familiarString, personalString) {
    try {
        const currentDate = new Date().toISOString().slice(0, 10);
        if (!process.env.BLOCK_STAT_LOG) {
            throw new Error('Missing `env.BLOCK_STAT_LOG` environment variable.');
        }
        if (![sumFamilia, totFamiliar, sumPersonal, totPersonal].every(val => typeof val === 'number') || ![familiarString, personalString].every(val => typeof val === 'string')) {
            throw new Error('Invalid input parameters. Expected number for sumFamilia, totFamiliar, sumPersonal, totPersonal; string for familiarString, personalString.');
        }
        const porcFam = sumFamilia > 0 ? totFamiliar / sumFamilia : 0;
        const porcPer = sumPersonal > 0 ? totPersonal / sumPersonal : 0;
    
        const response = await notion.blocks.children.append({
            block_id: process.env.BLOCK_STAT_LOG,
            children: [
                {
                    "type": "heading_2",
                    "heading_2": {
                        "rich_text": [{
                            "type": "text",
                            "text": {
                                "content": currentDate,
                                "link": null
                            }
                        }],
                        "color": "default",
                        "is_toggleable": true
                    }
                }
            ],
        });
        const newBlockID = response.results[0].id;
        const response2 = await notion.blocks.children.append({
            block_id: newBlockID,
            children: [
                {"type": "callout","callout": {"rich_text": [{
                    "type": "text",
                    "text": {
                        "content": familiarString,
                        "link": null
                    }
                }],
                "icon": {"emoji": "🫀"},
                "color": "orange"
                }
                },
                {"type": "callout","callout": {"rich_text": [{
                    "type": "text",
                    "text": {
                        "content": personalString,
                        "link": null
                    }
                }],
                "icon": {"emoji": "🧠"},
                "color": "blue"
                }
                },
                {
                    "type": "equation",
                    "equation": {
                        "expression": `x = \\begin{cases}
                            ${porcFam.toFixed(2)}f &\\text{if } \\frac {${totFamiliar.toFixed(2)}t} {${sumFamilia.toFixed(2)}s} \\\\
                            ${porcPer.toFixed(2)}p &\\text{if } \\frac {${totPersonal.toFixed(2)}t} {${sumPersonal.toFixed(2)}s} \\\\
                            \\end{cases}
                            \\xrightarrow[${(totPersonal - sumPersonal).toFixed(2)}]{${(totFamiliar - sumFamilia).toFixed(2)}}
                            \\infty`
                    }
                },
                {"type": "divider","divider": {}},
            ],
        });
        // Validate response2
        if (!response2 || !response2.results || !Array.isArray(response2.results)) {
            throw new Error('Invalid response2 structure');
        }
        //console.log("🌕 Moon Log", response2);
    } catch (error) {
        console.error('Error sending to Notion Moon Log:', error);
        console.error('API call failed:', error.message); // Additional error logging
        console.error('Stack trace:', error.stack); // Log the stack trace for debugging
    }
}

async function addNotionPageToDatabase( databaseId, pageProperties, monto, externalIconURL, iconType) {
    const currentDay = new Date().getDay() ;
    const emoji = currentDay % 4 == 0 ? 
         (monto < 0? '✊🏼': '🤘🏼'):(currentDay % 4 == 1 ? 
              (monto < 0? '💸': '💰'):(currentDay % 4 == 2 ? 
                  (monto < 0? '📤': '📩'):(currentDay % 4 == 3 ? 
                      (monto < 0? '📉': '📈'):(monto < 0? '🕷️': '🕸️'))));
    //implemement wait for 5 seconds
    //await new Promise(resolve => setTimeout(resolve, 5000)); 
    let created = null;
    if(!externalIconURL)
        created = await notion.pages.create({parent: {database_id: databaseId,},properties: pageProperties,
        icon: {emoji: emoji},});
    else if(iconType.type === 'external') {
        created = await notion.pages.create({parent: {database_id: databaseId,},properties: pageProperties,
        icon: {external:{url:externalIconURL}},});
    } else if(iconType.type == 'custom_emoji') {
        created = await notion.pages.create({parent: {database_id: databaseId,},properties: pageProperties,
            icon: iconType,});
    }
    return created;
}

/**
   * Updates a Notion page with the provided financial information.
   * Retrieves the page, calculates the updated financial values, and updates the page accordingly.
   * 
   * @param databaseId The ID of the database containing the page to be updated.
   * @param notionIdPeople The ID of the person associated with the page in Notion.
   * @param monto_fin The final financial amount to be updated on the page.
   * @param monto_modif The modified financial amount to be updated on the page.
   * @returns A promise that resolves to the updated page object.
   */
async function updateNotionPage(databaseId, notionIdPeople, monto_modif, monto_fin) {
    let updated = null;
    try {
        const response = await notion.databases.query({
            database_id: databaseId,
            filter: {
                "and": [
                { property: 'πpol', relation: { contains: notionIdPeople } }
                ]
            },
            sorts: [{ property: 'pred_date', direction: 'descending' }]
        });
        console.log("updateNotionPage 🔢 = ", response.results.length, notionIdPeople);
        const data = response.results;
        const pageid = data[0].id;
        let monto_ant = 0;
        let start_date = new Date().toISOString().slice(0, 10);
        const fullPage = await notion.pages.retrieve({ page_id: pageid });
        if ('properties' in fullPage) {
            const montoModif = fullPage.properties.monto_modif;
            start_date = fullPage.properties.pred_date.date.start;
            monto_ant = montoModif?.number ?? 0;
        }
        // Calculate the number of days between start_date and end_date
        const end_date = new Date().toISOString().slice(0, 10);
        const daysBetween = Math.ceil((new Date(end_date) - new Date(start_date)) / (1000 * 60 * 60 * 24)); // Calculate days
        if (monto_fin !== 0) {
            updated = await notion.pages.update({ page_id: pageid, properties: { monto_fin: { number: monto_fin },plazo: { number: daysBetween }, pred_date: { date: {end: end_date, start: start_date} } } });
        } else if (monto_modif !== 0) {
            updated = await notion.pages.update({ page_id: pageid, properties: { monto_modif: { number: monto_modif + monto_ant } } });
        } 
    } catch (error) {
        console.error('Error updateNotionPage:', error); 
        throw error;
    }finally{
        return updated;
    }
}

async function updateNotionMissmatch(notionId, monto_antes) {
    console.log("updateNotionMissmatch 🔢 = ", notionId, monto_antes);
    const updated = await notion.pages.update({ page_id: notionId, properties: { antes: { number: monto_antes } } });
    return updated;
}

router.get('/get-list-of-winners', async (req, res) => {
    console.log("🎁i'm i n m.f.")
    const response = await getListOfWinners();
    let winners = '';
    for (const winner of response) {
        console.log("🎁", winner.properties.todoist.rollup.array[0].rich_text[0].plain_text);
        winners += '💡'+ winner.properties.mvmnt_date.formula.date.start + ' | ' + winner.properties.todoist.rollup.array[0].rich_text[0].plain_text + '\n';
    }


    res.json({ status: response.length , winners: winners });
});

async function getListOfWinners(){
    try{
        const response = await notion.databases.query({
            database_id: process.env.DATABASE_MVN_ID,
            filter: {
                "and": [
                    { property: 'concept', rich_text: { contains: 'Cupón' } },
                    { property: 'concept', rich_text: { does_not_contain: 'distributed' } },
                ]
            },
            sorts: [{ property: 'created time', direction: 'descending' }]
        });
        //console.log("response", response.results);
        return response.results;
    }catch(error){
        console.error('Error getListOfWinners:', error);
        throw error;
    }
}



module.exports = { sendToNotionMoonLog, addNotionPageToDatabase
    , updateNotionPage, updateNotionMissmatch, getListOfWinners
    , router };