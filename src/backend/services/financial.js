const express = require('express');
const { sendToNotionMoonLog } = require('../controllers/notion');
const { movimiento, mantenimiento, dispersionNomina, inversiones, sobrinas, markAsProcessed, executeLastMvmnts, parseSpanishDate, executeCCProcess } = require('./core');
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const multer = require('multer');
const xlsx = require('xlsx'); // Make sure to install this package
const upload = multer({ dest: 'uploads/' }); // Directory to store uploaded files
const fs = require('fs');
const dotenv = require('dotenv');
dotenv.config();
const router = express.Router();
const DATABASE_NOT_ID = process.env.DATABASE_NOT_ID || '';


if (!process.env.NOTION_TOKEN || !process.env.DATABASE_PPL_ID || !process.env.DATABASE_BAK_ID || !process.env.SENDGRID_API_KEY) {
    throw new Error('Missing required environment variables for authentication.');
}

// API endpoint for getting pending transactions
router.get('/get-pendientes', async (req, res) => {
  const formattedDate = new Date().toISOString().slice(0, 10);
  console.log("get-pendientes:", formattedDate);
    try {
      const response = await notion.databases.query({
        database_id: process.env.DATABASE_BAK_ID,
        filter: {
          and: [
            { property: "processed", checkbox: { equals: false } },
            { property: "when_final", formula: { date: { on_or_before: formattedDate } } },
          ],
        },
      });
      let toProcess = 0, pendingConfirm = 0;
      const data = response.results;
      data.forEach((item) => {
        if (item.properties.pending.checkbox) pendingConfirm++;
        else toProcess++;
      });
      res.json({ status: "Pendents | " + toProcess + " ✅" + (pendingConfirm > 0 ? " | "+pendingConfirm + " ⏳ "  : "") 
        ,total: toProcess + pendingConfirm
        ,tasks: data
        ,readytoprocess:toProcess
        ,pendingConfirm:pendingConfirm
      });
    } catch (error) {
      console.error("Error get-pendientes:", error);    
      res.status(500).json({ status: "Error get-pendientes", error: error.message });
    }
});

// Add this endpoint to handle task updates
router.post('/confirm-task/:id', async (req, res) => {
  const taskId = req.params.id;
  try {
      // Logic to update the task's pending status in the database
      await notion.pages.update({
          page_id: taskId,
          properties: {
              pending: { checkbox: false }
          }
      });
      res.status(200).json({ status: 'Task updated successfully' });
  } catch (error) {
      console.error('Error updating task:', error);
      res.status(500).json({ status: 'Error updating task', error: error.message });
  }
});

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
      // Create a map to store current values by todoist
      const currentValuesMap = new Map();     

      // Process items sequentially with delay
      for (const item of data) {
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
            movimiento(mto_to.number, when_final.formula.date.start, description.rich_text[0].plain_text, πpol_to.multi_select, πpol_from.multi_select, currentValuesMap);
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
        //console.log(currentValuesMap)
        if (markAsDone) markAsProcessed(pageBlgId);

        // Add 5 second delay between items
        await new Promise(resolve => setTimeout(resolve, 5000));
      }
      
      res.json({ status: "Processed " + data.length + " pending transactions." });
    } catch (error) {
      console.error("Error executePendingProcess:", error);    
      res.status(500).json({ status: "Error executePendingProcess", error: error.message });
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
    const mvmnts_notifications = await executeLastMvmnts( 31, 'all', sendMail=false);    
    console.log(mvmnts_notifications);
    } catch (error) {
      console.error('Error generateBalance:', error);
    }
  res.json({ status: "Done statistics..." });

});

router.post('/send-emails', async (req, res) => {
    try {
      const headers_ = await req.headers;
      const days = headers_.days;
      const todoist = headers_.todoist;
      const response = await executeLastMvmnts(days, todoist, sendMail=false);
      res.json({ status: response.status , confirmations: response.confirmations , message: response.message });
    } catch (error) {
        console.error('Error sending emails:', error);
        res.status(500).json({ status: 'Error sending emails', error: error.message });
    }
});

router.get('/get-notifications/:is_read', async (req, res) => {
  const is_read = req.params.is_read != 'false';  
  const formattedDate = new Date().toISOString().slice(0, 10);
  console.log("get-notifications:", formattedDate);
  try {
    const response = await notion.databases.query({  
      database_id: DATABASE_NOT_ID,
      filter: {"and": [{ property: 'is_read', checkbox: { equals: is_read } },
                      { property: 'notification_type', select: { equals: "email" } },
                ]}, 
              sorts: [{ property: 'send_date', direction: 'descending' }]
              });  
    const data = response.results;
    /*data.forEach((item) => {
      console.log(item.properties.todoist.rollup.array[0].rich_text[0].plain_text);
    });*/
    res.json({ notifications: data });
  } catch (error) {
    console.error("Error get-notifications:", error);    
    res.status(500).json({ status: "Error get-notifications", error: error.message });
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
        const pagosDepositos = row['Pagos y Depósitos']?row['Pagos y Depósitos']:0.0;
        const comprasRaw = row.Compras? parseFloat(row.Compras.replace('$', '').replace(',', '').trim()) : 0.0;
  
        const fecha = parseSpanishDate(fechaRaw);
        //console.log(comprasRaw);
        //const compras = parseFloat(comprasRaw.replace('$', '').replace(',', '').trim());
        const key = fecha.replace(/-/g, "") + descriptionTrim + comprasRaw.toString();
  
        return {
          key,
          fecha,
          description,
          descriptionTrim,
          pagosDepositos,
          comprasRaw
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