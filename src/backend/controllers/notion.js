const { Client } = require('@notionhq/client');
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

    try {
        const response = await notion.databases.query({
            database_id: process.env.DATABASE_PPL_ID, // Use your database ID
            sorts: [{ property: 'Name', direction: 'ascending' }], // Sort by Name property
        });
        response_results = response.results
        filtered_people = []
        // filter the people based on the peopleType
        for (person of response_results) {
            //console.log('todoist',person.properties.todoist.rich_text[0].plain_text)
            if(person.properties.type.select.name === peopleType && person.properties.mail.email != null) {
                //console.log(person)
                //console.log(person.properties.Name.title[0].text.content, person.properties.mail.email)
                filtered_people.push(person);
            }
        }

        const people = filtered_people.map(item => {
            return {
                id: item.properties.todoist.rich_text[0].plain_text,
                name: item.properties.Name.title[0].text.content // Adjust based on your property structure
            };
        });


        // Add the "all" option
        people.unshift({ id: 'all', name: 'All' });

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
    await new Promise(resolve => setTimeout(resolve, 5000)); 
    if(!externalIconURL)
        await notion.pages.create({parent: {database_id: databaseId,},properties: pageProperties,
        icon: {emoji: emoji},});
    else if(iconType.type === 'external') {
        await notion.pages.create({parent: {database_id: databaseId,},properties: pageProperties,
        icon: {external:{url:externalIconURL}},});
    } else if(iconType.type == 'custom_emoji') {
        await notion.pages.create({parent: {database_id: databaseId,},properties: pageProperties,
            icon: iconType,});
        }
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



module.exports = { sendToNotionMoonLog, addNotionPageToDatabase, updateNotionPage, updateNotionMissmatch, router };