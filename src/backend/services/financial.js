const express = require('express');
const { sendToNotionMoonLog } = require('../controllers/notion');
const { movimiento, mantenimiento, dispersionNomina, inversiones, sobrinas, markAsProcessed, executeLastMvmnts, parseSpanishDate, executeCCProcess, linkTheFinalAmount } = require('./core');
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const multer = require('multer');
const xlsx = require('xlsx'); // Make sure to install this package
const upload = multer({ dest: 'uploads/' }); // Directory to store uploaded files
const fs = require('fs');
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

      const todoistProcessed = new Set(); // Use a Set for processed todoists

      data.forEach(async (item) => {
          const { πpol_to } = item.properties;
          const promises = []; // Array to hold promises for concurrent processing
      
          for (const todoist of πpol_to.multi_select) {
              if (!todoistProcessed.has(todoist.name)) {
                  const todoistName = todoist.name; // Store the name for later use
                  const promise = await linkTheFinalAmount(todoistName)
                      .then(() => {
                          todoistProcessed.add(todoistName); // Add to Set after successful processing
                      })
                      .catch((error) => {
                          console.error("Error processing todoist:", todoistName, error);
                      });
                  promises.push(promise); // Add the promise to the array
              } else {
                  console.log("todoist already processed", todoist.name);
              }
          }
          // Wait for all promises to resolve
          await Promise.all(promises);
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

// Endpoint to process the uploaded XLSX file
router.post('/process-xlsx', upload.single('file'), async (req, res) => {
  try {
      const filePath = req.file.path;
      const fileName = req.file.originalname;
      const workbook = xlsx.readFile(filePath);
      const sheetName = workbook.SheetNames[0]; // Get the first sheet
      const sheet = workbook.Sheets[sheetName];
      const records = xlsx.utils.sheet_to_json(sheet); // Convert to JSON

      const cleanedData = records.map((row) => {
        const fechaRaw = row.Fecha;
        const description = row.Descripción ;
        const descriptionTrim = description.replace(/ /g, "");
        const pagosDepositos = row['Pagos y Depósitos'];
        const comprasRaw = row.Compras;
  
        const fecha = parseSpanishDate(fechaRaw);
        const compras = parseFloat(comprasRaw.replace('$', '').replace(',', '').trim());
        const key = fecha.replace(/-/g, "") + descriptionTrim + compras.toString();
  
        return {
          key,
          fecha,
          description,
          descriptionTrim,
          pagosDepositos,
          compras
        };      
      });

      const recordsProcessed = await executeCCProcess(cleanedData);
      if (recordsProcessed > 0) {
        const currentDateFormatted = (new Date()).toISOString().slice(0, 10).replace(/-/g, '');       
  
        // Ensure the "uploads" directory exists
        const backupPath = process.env.BKP_CC_PATH || '';
        try {
          if (!backupPath) throw new Error('BKP_CC_PATH is not defined');
          await fs.promises.stat(backupPath);
        } catch (e) {
          if (e.code === 'ENOENT') {
            await fs.promises.mkdir(backupPath, { recursive: true });
          } else {
            throw e;
          }
        }   
        // Move and rename the processed file
        const newFileName = `processed_${currentDateFormatted}_${fileName}`; 
        const newFilePath = `${backupPath}/${newFileName}`;
        await fs.promises.rename(filePath, newFilePath); // Move and rename the file
        console.log(`File moved to: ${newFilePath}`); 
      }

      res.json({ status: ` ${recordsProcessed} records out of ${records.length}`, records: recordsProcessed});
  } catch (error) {
      console.error('Error processing file:', error);
      res.status(500).json({ status: 'Error processing file', error: error.message });
  }
});

module.exports = router;