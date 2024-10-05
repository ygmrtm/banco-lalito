const express = require('express');
const { sendToNotionMoonLog } = require('../controllers/notion');
const { movimiento, mantenimiento, dispersionNomina, inversiones, sobrinas, markAsProcessed, executeLastMvmnts } = require('./core');
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();

if (!process.env.NOTION_TOKEN || !process.env.DATABASE_PPL_ID || !process.env.DATABASE_BAK_ID || !process.env.SENDGRID_API_KEY) {
    throw new Error('Missing required environment variables for authentication.');
}

// API endpoint for processing pending transactions
router.post('/pendientes', async (req, res) => {
  const formattedDate = new Date().toISOString().slice(0, 10);
  console.log("executePendingProcess:", formattedDate);
    try {
      const response = await notion.databases.query({
        database_id: process.env.DATABASE_BAK_ID,
        filter: {
          and: [
            { property: "processed", checkbox: { equals: false } },
            { property: "pending", checkbox: { equals: false } },
            { property: "when_final", formula: { date: { on_or_before: formattedDate } } },
          ],
        },
        sorts: [{ property: "when_final", direction: "ascending" }],
      });
  
      const data = response.results;
  
      data.forEach((item) => {
        const { id: pageBlgId, properties } = item;
        const { type, mto_to, description, πpol_to, πpol_from, when_final } = properties;
        let markAsDone = true;
  
        switch (type.select.name) {
          case "(nom)ina":
            dispersionNomina(mto_to.number, description.rich_text[0].plain_text);
            break;
          case "(mto)":
          case "(int)ereses":
            mantenimiento(properties);
            break;
          case "(mov)imiento":
            movimiento(mto_to.number, when_final.formula.date.start, description.rich_text[0].plain_text, πpol_to.multi_select, πpol_from.multi_select);
            break;
          case "(sob)rinas":
            sobrinas(mto_to.number, description.rich_text[0].plain_text + formattedDate.replace(/-/g, ""), πpol_from.multi_select);
            break;
          case "(inv)ersion":
            inversiones(properties);
            break;
          default:
            console.log("IDK_WTD");
            markAsDone = false;
        }
        if (markAsDone) markAsProcessed(pageBlgId);
      });
      res.json({ status: "Processed " + data.length + " pending transactions." });
    } catch (error) {
      console.error("Error executePendingProcess:", error);    
      res.status(500).json({ status: "Error executePendingProcess", error: error.message });
    }
});

router.get('/health-check', async (req, res) => {
  try {
    let responseString = ''
    const response = await notion.databases.query({database_id: process.env.DATABASE_BAK_ID});
    responseString = responseString.concat('Notion connection [✅]');
    res.json({ status: responseString });
  } catch (error) {
      console.error('Health check error:', error);
      res.status(500).json({ status: 'Health check error', error: error.message });
  }
});

router.post('/estadisticas', async (req, res) => {
  console.log(`== Executing general Balance`);
  try {
      const response = await notion.databases.query({
          database_id: process.env.DATABASE_PPL_ID,
          filter: {
              and: [
                  { property: 'status', status: { equals: "active" } },
                  { property: 'current$', formula: { number: { greater_than: 0 } } }
              ]
          }
      });
      console.log("πpol 🔢 = ", response.results.length);

      const data = response.results; 
      let sumPersonal = 0, sumFamilia = 0, totPersonal = 0, totFamiliar = 0;
      let familiarString = '', personalString = '';
      data.forEach((item) => {
        const current = item.properties.current$.formula.number;
        const todoist = item.properties.todoist.rich_text[0].plain_text;
        const aka = item.properties.Name.title[0].text.content;
        const it = aka.includes('Don') ? 'he' : (aka.includes('Doña') ? 'she' : 'it');
        const type = item.properties.type.select.name;

        if (type === 'A') {
            sumFamilia += current;
            familiarString += (it === 'he' ? '🗿' : (it === 'she' ? '💋' : '🫁')).concat(todoist);
        } else if (type === 'Q') {
            sumPersonal += current;
            personalString += (it === 'he' ? '🗿' : (it === 'she' ? '💋' : '🫁')).concat(todoist);
        } else if (type === 'totales') {
            if (todoist.toLowerCase().includes("familia")) {
                totFamiliar += current;
                familiarString += (it === 'he' ? '🗿' : (it === 'she' ? '💋' : '🫁')).concat(todoist);
            } else {
                totPersonal += current;
                personalString += (it === 'he' ? '🗿' : (it === 'she' ? '💋' : '🫁')).concat(todoist);
            }
        }
    });
    sendToNotionMoonLog(sumFamilia, totFamiliar, sumPersonal, totPersonal, familiarString, personalString);      
    } catch (error) {
      console.error('Error generateBalance:', error);
    }
  res.json({ status: "Done statistics..." });

});


router.post('/send-emails', async (req, res) => {
    try {
      const { days, todoist } = await req.body;
      console.log("Received days:", days, "Received todoist:", todoist);
      const responded = await executeLastMvmnts(days, todoist);
      const message = 'Emails sent successfully ' + responded;
      res.json({ status: message });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ status: 'Error sending emails', error: error.message });
    }
});



module.exports = router;