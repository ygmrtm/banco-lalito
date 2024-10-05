const { Client } = require('@notionhq/client');
const dotenv = require('dotenv');
dotenv.config();

let notion = null;
const currentDate = new Date().toISOString().slice(0, 10);

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

async function addNotionPageToDatabase( databaseId, pageProperties, monto, externalIconURL) {
    const currentDay = new Date().getDay() ;
    const emoji = currentDay % 4 == 0 ? 
         (monto < 0? '✊🏼': '🤘🏼'):(currentDay % 4 == 1 ? 
              (monto < 0? '💸': '💰'):(currentDay % 4 == 2 ? 
                  (monto < 0? '📤': '📩'):(currentDay % 4 == 3 ? 
                      (monto < 0? '📉': '📈'):(monto < 0? '🕷️': '🕸️'))));
  
    if(!externalIconURL)
      await notion.pages.create({parent: {database_id: databaseId,},properties: pageProperties,
      icon: {emoji: emoji},});
    else 
      await notion.pages.create({parent: {database_id: databaseId,},properties: pageProperties,
        icon: {external:{url:externalIconURL}},});
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
  async function updateNotionPage(databaseId, notionIdPeople, monto_fin, monto_modif) {
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
      let updated = null;
  
      const fullPage = await notion.pages.retrieve({ page_id: pageid });
  
      if ('properties' in fullPage) {
        const montoModif = fullPage.properties.monto_modif;
        monto_ant = montoModif?.number ?? 0;
      }
  
      if (monto_fin !== 0) {
        updated = await notion.pages.update({ page_id: pageid, properties: { monto_fin: { number: monto_fin } } });
      } else if (monto_modif !== 0) {
        updated = await notion.pages.update({ page_id: pageid, properties: { monto_modif: { number: monto_modif + monto_ant } } });
      }
  
    } catch (error) {
      console.error('Error updateNotionPage:', error); 
    }finally{
      return updated;
    }
  }
  

module.exports = { sendToNotionMoonLog, addNotionPageToDatabase, updateNotionPage };