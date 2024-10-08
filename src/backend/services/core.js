
const { addNotionPageToDatabase, updateNotionPage, updateNotionMissmatch } = require("../controllers/notion.js");
const { templateMail, sendFinancialReport } = require("./mail.js");
const { Client } = require('@notionhq/client');
const notion = new Client({ auth: process.env.NOTION_TOKEN });
const dotenv = require('dotenv');
dotenv.config();

const mainAccount = 'perfiles'
const familyAccount = 'inversion.banamex.familiar'
const DATABASE_PPL_ID = process.env.DATABASE_PPL_ID || '';
const DATABASE_BAK_ID = process.env.DATABASE_BAK_ID || '';
const DATABASE_MVN_ID = process.env.DATABASE_MVN_ID || '';
const DATABASE_CET_ID = process.env.DATABASE_CET_ID || '';
const DATABASE_CC_ID = process.env.DATABASE_CC_ID || '';


/**
 * Calculates the number of days between two given dates.
 * 
 * @param date1 - The first date.
 * @param date2 - The second date.
 * @returns The number of days between the two dates.
 */ 
function getDaysBetweenDates(date1, date2) {
  const oneDayInMs = 1000 * 60 * 60 * 24;
  const diffInMs = Math.abs(date2.getTime() - date1.getTime());
  const diffInDays = Math.ceil(diffInMs / oneDayInMs);
  return diffInDays;
}


/**
 * Generates a random key based on the input parameters.
 * 
 * @param who The string used to determine the key prefix.
 * @param plazo The number used to generate the key suffix.
 * @returns A string representing the random key.
 */
function getRandomKey(who, plazo) {
  const numberToEmojiMap = { 
    1: '1️⃣', 2: '2️⃣', 3: '3️⃣', 4: '4️⃣', 5: '5️⃣',
    6: '6️⃣', 7: '7️⃣', 8: '8️⃣', 9: '9️⃣', 0: '0️⃣',
  };

  let emojiFinal = '';
  let nameKey = who.toLowerCase().includes("cetes") ? 'CT' :
                who.toLowerCase().includes("klar") ? 'KL' :
                who.toLowerCase().includes("finsus") ? 'FN' :
                who.toLowerCase().includes("cajita") ? 'NU' :
                who.toLowerCase().includes("stori") ? 'ST' :
                who.toLowerCase().includes("banamex") ? 'BX' :
                who.toLowerCase().includes("dinn") ? 'DN' :
                who.toLowerCase().includes("credito") ? '💳' : '🗿🏷️';
  nameKey += who.toLowerCase().includes("familia") ? 'FM' : 'PR';

  for (let i = 1000; i >= 1; i /= 10) {
    const digit = Math.floor(plazo / i) % 10;
    const emoji = numberToEmojiMap[digit] || '*️⃣';
    emojiFinal = emoji + emojiFinal;
  }

  nameKey += emojiFinal;
  nameKey += Math.floor(Math.random() * 900 + 100).toString();

  console.log("namekey:", nameKey);
  return nameKey;
}


const markAsProcessed = async (pageBlgId) => {
  await notion.pages.update({
    page_id: pageBlgId,
    properties: {
      processed: {
        checkbox: true,
      },
    },
  });
}


/**
 * Calculates the week number for a given date.
 * 
 * @param date - The date for which the week number is calculated
 * @returns The week number of the given date
 */
function getWeekNumber(date) {
  const tempDate = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  tempDate.setUTCDate(tempDate.getUTCDate() + 4 - (tempDate.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(tempDate.getUTCFullYear(), 0, 1));
  const weekNo = Math.ceil((((tempDate.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);

  return weekNo;
}



const dispersionNomina = async (monto, description) => {
  console.log(`== Executing nomina dispersion for amount: ${monto} | ${description}`);
  try {
    const response = await notion.databases.query({
        database_id: DATABASE_PPL_ID,
        filter: {
          "and":[
            { property: 'pq', number: { greater_than: 0 } },
            { property: 'status', status: { equals: "active" } },
            { property: 'type', select: { equals: "Q" } }
          ]
        },
      });
      console.log("dispersionNomina 🔢 = ", response.results.length);
      const data = response.results;
      let properties = {
        Name: { title: [{ text: { content: mainAccount } }] },
        description: { rich_text: [{ text: { content: description } }] },
        mto_to: { number: monto },
        type: { select: { name: '(mov)imiento' } },
        πpol_to: { multi_select: [{ name: mainAccount }] }
      }
      await addNotionPageToDatabase(DATABASE_BAK_ID, properties, monto); //perfiles
      data.forEach((item) => {  
          const pq = item.properties.pq.number;
          const todoist = item.properties.todoist.rich_text[0].plain_text;
          properties = {
            Name: { title: [{ text: { content: todoist } }] },
            description: {rich_text: [{text: {content: (description.concat('|',monto.toString()))}}]},
            mto_to: { number: monto * pq },
            type: { select: { name: '(mov)imiento' } },
            πpol_to: { multi_select: [{ name: todoist }] }
          }
          addNotionPageToDatabase(DATABASE_BAK_ID, properties, monto);
      });  
    } catch (error) {
      console.error('Error dispersionNomina:', error);
    }
    console.log(`Nomina of ${monto} dispersed successfully.`);
};
  

/**
 * Executes maintenance operations based on the provided properties.
 * 
 * @param properties - The properties object containing information for the maintenance.
 * @returns A Promise that resolves once the maintenance operations are completed.
 */
const mantenimiento = async (properties) => {
      const monto = properties.mto_to.number;
      const todoist = properties.πpol_to.multi_select[0].name;
      const currentWeekNumber = getWeekNumber(new Date());
      const description = properties.description.rich_text[0].plain_text + ' W' + currentWeekNumber;
      console.log(`== Executing mantenimiento for amount: ${monto} | ${todoist} | ${description}`);
    
      try {
          const response = await notion.databases.query({
              database_id: DATABASE_PPL_ID,
              filter: {
                  "and": [
                      { property: 'status', status: { equals: "active" } },
                      { property: 'todoist', rich_text: { equals: todoist } }
                  ]
              },
          });
          console.log("mantenimiento 🔢 = ", response.results.length, todoist);
        
          const data = response.results;
          let current = 0;
          let ajuste = 0;
        
          data.forEach((item) => {
              const generaBloqueInversion = item.properties.generaBloqueInversion.checkbox;
              current = item.properties.current$.formula.number;
              ajuste = monto - current;
            
              const propertiesIns = {
                  Name: { title: [{ text: { content: todoist } }] },
                  description: { rich_text: [{ text: { content: description } }] },
                  mto_to: { number: ajuste },
                  type: { select: { name: '(mov)imiento' } },
                  πpol_to: { multi_select: [{ name: todoist }] }
              };
            
            addNotionPageToDatabase(DATABASE_BAK_ID, propertiesIns, ajuste);
            
              if (todoist.toLowerCase().includes("familia")) {
                  interesFamiliar(ajuste, todoist, description);
              }
            
              if (generaBloqueInversion) {
                  insertCetesPlazosDB(properties, description);
              }
          });
        
          console.log(`From: ${current} To:${monto} then created:${ajuste} to adjust it.`);
      } catch (error) {
          console.error('Error mantenimiento:', error);
      }
  };


const interesFamiliar = async (ajuste, fromAcc, description) => {
      console.log(`== Executing interesFamiliar for amount: ${ajuste} | ${fromAcc} | ${description}`);

      try {
          const response = await notion.databases.query({
              database_id: DATABASE_PPL_ID,
              filter: {
                  "and":[
                      { property: 'status', status: { equals: "active" }},
                      { property: 'type', select: { equals: "A" }},
                      { property: 'current$', formula: { number: { greater_than: 0 }}}
                  ]
              },
          });
          console.log("interesFamiliar 🔢 = ", response.results.length);
          const data = response.results;
          const totalFamiliar = data.reduce((total, item) => total + item.properties.current$.formula.number, 0);
          console.log(`totalFamiliar=${totalFamiliar}`);
        
          data.forEach(async (item) => {  
            const pageid = item.id;
            const pq = item.properties.current$.formula.number / totalFamiliar;
            const todoist = item.properties.todoist.rich_text[0].plain_text;
            const pieceOfPay = ajuste * pq;
            const properties = {
                Name: { title: [{ text: { content: todoist }}]},
                description: { rich_text: [{ text: { content: `${description} | origen:${fromAcc} | $${pieceOfPay.toFixed(2)}` }}]},
                mto_to: { number: pieceOfPay },
                type: { select: { name: '(mov)imiento' }},
                πpol_to: { multi_select: [{ name: todoist }]}
            };
            addNotionPageToDatabase(DATABASE_BAK_ID, properties, pieceOfPay);
            await notion.pages.update({ page_id: pageid, properties: { pq: { number: pq } } });
          });  

      } catch (error) {
          console.error('Error interesFamiliar:', error);
      }
  };


/**
 * Executes a movement operation with the specified amount, date, description, people involved in the transaction.
 * Generates a unique transaction key and logs the details of the movement.
 * Retrieves data from the database based on the people involved and updates the notion page accordingly.
 * Handles the case where there is a 'from' entity by generating the opposite amount.
 * 
 * @param monto The amount of the movement.
 * @param when The date of the movement.
 * @param description The description of the movement.
 * @param peopleTo The entities to which the amount is transferred.
 * @param peopleFrom The entity from which the amount is transferred.
 * @returns A Promise that resolves when the movement operation is completed.
 */
const movimiento = async (monto,when, description, peopleTo, peopleFrom) => {
    const transactionKey = new Date().toISOString().slice(0, 10).replace(/-/g, '') + Math.floor(100 + Math.random() * 900).toString();
    console.log(`== Executing movimiento for amount: ${monto} | ${when} | ${description} | From[${peopleFrom.length}]=>[${peopleTo.length}]`);
    try {
      let totalForFrom = 0;
      let stringOfTo = '';
      for (const ente of peopleTo) {  ////////loop πpol_to
        const todoist = ente.name;
        const response = await notion.databases.query({
          database_id: DATABASE_PPL_ID,
          filter: {
            "and": [
              { property: 'status', status: { equals: "active" } },
              { property: 'todoist', rich_text: { equals: todoist } },
            ]
          },
        });
        console.log("movimiento 🔢 = ", response.results.length, todoist);
        const data = response.results;
        //console.log(data);
        data.forEach((item) => { 
          const current = item.properties.current$.formula.number;
          const notionid = item.id;
          const generaBloqueInversion = item.properties.generaBloqueInversion.checkbox;
          const properties = {
            name: { title: [{ text: { content: transactionKey } }] },
            concept: { rich_text: [{ text: { content: description } }] },
            antes: { number: current },
            monto: { number: monto },
            πpol:{relation:[{id:notionid}]},
            legacyCreationDate:{date:{start:when}},
          };
          //console.log('properties:', properties);
          addNotionPageToDatabase(DATABASE_MVN_ID, properties, monto);
          if (generaBloqueInversion)
            updateNotionPage(DATABASE_CET_ID, notionid, 0,monto);  
        });
        totalForFrom += monto;
        stringOfTo = stringOfTo + '🚻 '+ todoist;
  
      }
      //in case has a πpol_from generates the opposite monto.
      if(peopleFrom.length > 0)
        fromProcess(transactionKey, totalForFrom * -1, peopleFrom[0].name, stringOfTo,description);
      

    } catch (error) {
      console.error('Error movimiento:', error);
    }
  };

/**
 * Executes a 'FROM' movement with the provided transaction details.
 * 
 * @param {string} transactionKey - The unique key for the transaction.
 * @param {number} monto - The amount involved in the transaction.
 * @param {string} fromTodoist - The source Todoist for the transaction.
 * @param {string} toTodoist - The destination Todoist for the transaction.
 * @param {string} description - Additional description for the transaction.
 */
  async function fromProcess(transactionKey, monto, fromTodoist, toTodoist, description){
      console.log(`== Executing FROM movement : ${monto} | ${fromTodoist} | ${toTodoist} | ${description}`);
      try {
          const response = await notion.databases.query({
              database_id: DATABASE_PPL_ID,
              filter: {
                  "and": [
                      { property: 'status', status: { equals: "active" } },
                      { property: 'todoist', rich_text: { equals: fromTodoist } },
                  ]
              },
          });
          console.log("fromProcess 🔢 = ", response.results.length, fromTodoist);
          const data = response.results;
          data.forEach((item) => { 
              const current = item.properties.current$.formula.number;
              const notionid = item.id;
              const properties = {
                  name: { title: [{ text: { content: transactionKey } }] },
                  concept: { rich_text: [{ text: { content:  `${description} | distributed to: ${toTodoist}`} }] },
                  antes: { number: current },
                  monto: { number: monto },
                  πpol: { relation: [{ id: notionid }] },
              };
              addNotionPageToDatabase(DATABASE_MVN_ID, properties, monto);
          });
      } catch (error) {
          console.error('Error fromProcess:', error);
      }
  }

  
/**
 * Executes the 'sobrinas' process for a specified amount, description, and people involved.
 * Retrieves active data from the database and processes it based on urgency levels.
 * Logs the number of results and handles potential errors.
 */
const sobrinas = async (monto, description, peopleFrom) => {
      console.log(`== Executing sobrinas for amount: ${monto} | ${description} `);
      try {
          const response = await notion.databases.query({
              database_id: DATABASE_PPL_ID,
              filter: {
                  "and":[
                      { property: 'status', status: { equals: "active" }},
                      { property: 'type', select: { equals: "A" }},
                      { property: 'when_max_limite', date: { is_not_empty: true }},
                      { property: 'max_limite_alcanzado', number: { greater_than: 0 }},
                  ]
              },
              sorts: [{ property: 'indiceLanaDias', direction: 'ascending' }]
          });
          console.log("sobrinas 🔢 = ", response.results.length);
          const data = response.results;

          let properties = {
              Name: { title: [{ text: { content: peopleFrom[0].name }}] },
              description: { rich_text: [{ text: { content: description }}] },
              mto_to: { number: (monto * -1) },
              type: { select: { name: '(mov)imiento' }},
              πpol_to: { multi_select: [{ name:  peopleFrom[0].name }]},
            };
          await addNotionPageToDatabase(DATABASE_BAK_ID, properties, monto * -1);   
          
          const properties2 = {
            Name: { title: [{ text: { content: familyAccount }}] },
            description: { rich_text: [{ text: { content: description }}] },
            mto_to: { number: monto },
            type: { select: { name: '(mov)imiento' }},
            πpol_to: { multi_select: [{ name:  familyAccount }]},
            πpol_from: { multi_select: [{ name:  mainAccount }]},
          };
          await addNotionPageToDatabase(DATABASE_BAK_ID, properties2, monto );   

          let i = 1;
          data.forEach((item) => {  
              const pq = (i === 1 ? 0.40 : (i === 2 ? 0.30 : (i === 3 ? 0.20 : (i === 4 ? 0.10 : 0))));
              const todoist = item.properties.todoist.rich_text[0].plain_text;
              const indiceUrgencia = item.properties.indiceLanaDias.formula.number;
              properties = {
                  Name: { title: [{ text: { content: todoist }}] },
                  description: { rich_text: [{ text: { content: (`${description} ind:${indiceUrgencia.toFixed(2)}`) }}] },
                  mto_to: { number: monto * pq },
                  type: { select: { name: '(mov)imiento' }},
                  πpol_to: { multi_select: [{ name: todoist }]}
              };
              i++;
              addNotionPageToDatabase(DATABASE_BAK_ID, properties, monto * pq);
          }); 
      } catch (error) {
          console.error('Error sobrinas:', error);
      }
  };


/**
 * Executes an investment operation based on the provided properties.
 * Calculates the investment details and updates the database accordingly.
 * 
 * @param proper - The properties object containing investment details.
 * @returns A Promise that resolves once the investment operation is completed.
 */
const inversiones = async (proper) => {
      console.log(`== Executing inversiones ==`);

      const { mto_to, description, πpol_to, πpol_from, serie, folio, when_final, days, when_ends, increm, mto_final } = proper;
      const monto = mto_to.number;
      let descriptionText = description.rich_text[0].plain_text;
      const peopleTo = πpol_to.multi_select;
      const peopleFrom = πpol_from.multi_select;
      const currentWeekNumber = getWeekNumber(new Date());
      const serieValue = serie.formula.string.length > 0 ? serie.formula.string : new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const folioNumber = folio.number ? folio.number : 1980;
      const fIni = when_final.formula.date.start;
      const daysValue = days.formula.number ? days.formula.number : 30;  
      const dateTemp = new Date(fIni);
      dateTemp.setDate(dateTemp.getDate() + daysValue);
      const fFin = when_ends.date ? when_ends.date.start : dateTemp.toISOString().slice(0, 10);
      const incremValue = increm.number ? increm.number : 0.10;
      const mtoFinalValue = mto_final.formula.number ? mto_final.formula.number : monto; 

      try {
          descriptionText = `${descriptionText} ${daysValue}d:w${currentWeekNumber} con folio:${folioNumber} y serie:${serieValue} al ${incremValue * 100}%`;
          insertCetesPlazosDB(proper, descriptionText);

          if (peopleFrom.length > 0) {
              const properties = {
                  Name: { title: [{ text: { content: peopleFrom[0].name } }] },
                  description: { rich_text: [{ text: { content: descriptionText } }] },
                  mto_to: { number: (monto * -1) },
                  type: { select: { name: '(mov)imiento' } },
                  πpol_to: { multi_select: [{ name: peopleFrom[0].name }] },
                  when_user: { date: { start: fIni } }
              };

              properties.description.rich_text[0].text.content = `INI ${descriptionText}`;
              await addNotionPageToDatabase(DATABASE_BAK_ID, properties, -1);

              properties.mto_to.number = mtoFinalValue;
              properties.when_user.date.start = fFin;
              properties.description.rich_text[0].text.content = `FIN ${descriptionText}`;
              await addNotionPageToDatabase(DATABASE_BAK_ID, properties, 1);

              properties.Name.title[0].text.content = properties.πpol_to.multi_select[0].name = peopleTo[0].name;
              properties.mto_to.number = mtoFinalValue * -1;
              await addNotionPageToDatabase(DATABASE_BAK_ID, properties, -1);

              properties.mto_to.number = mtoFinalValue - monto;
              properties.description.rich_text[0].text.content = `INT ${descriptionText}`;
              await addNotionPageToDatabase(DATABASE_BAK_ID, properties, 1);

              properties.mto_to.number = monto;
              properties.when_user.date.start = fIni;
              properties.description.rich_text[0].text.content = `INI ${descriptionText}`;
              await addNotionPageToDatabase(DATABASE_BAK_ID, properties, 1);
          }
      } catch (error) {
          console.error('Error inversiones:', error);
      }
  }

/**
 * Inserts data related to Cetes Plazos into the database.
 * 
 * @param proper - The data object containing information about the Cetes Plazos.
 * @param description - The description of the Cetes Plazos data.
 */
async function insertCetesPlazosDB(proper, description){
  const monto = Number(proper.mto_to.number);
  const peopleTo = proper.πpol_to.multi_select[0].name;
  let serie = proper.serie.formula.string.length > 0 ? proper.serie.formula.string : new Date().toISOString().slice(0, 10).replace(/-/g, '');
  serie = Number(serie);
  const folio = Number(proper.folio.number) ?? 1980;
  const fIni = proper.when_final.formula.date.start;
  const days = Number(proper.days.formula.number) ?? 30;  
  const dateTemp = new Date(fIni);
  dateTemp.setDate(dateTemp.getDate() + days);
  const fFin = proper.when_ends.date?.start ?? dateTemp.toISOString().slice(0, 10);
  const increm = Number(proper.increm.number) ?? 0.10;
  const mto_final = Number(proper.mto_final.formula.number) ?? monto; 
  console.log('== insertCetesPlazosDB', serie, folio, fIni, fFin, increm, days, mto_final, description);  
  try {
    const response = await notion.databases.query({
      database_id: DATABASE_PPL_ID,
      filter: {
        "and": [{ property: 'status', status: { equals: "active" } },
          { property: 'todoist', rich_text: { equals: peopleTo } },]
      },
    });
    console.log("cetesPlazos 🔢 = ", response.results.length, peopleTo);
    const data = response.results;
    const notionid = data[0] && data[0].id;
    let generaBloqueInversion;
    let externalIconURL = '';
    data.forEach((item) => {  
      externalIconURL = item.icon.external.url;
      generaBloqueInversion = item.properties.generaBloqueInversion.checkbox;
    });
    
    const properTimeline = {
      incremental: { title: [{ text: { content: getRandomKey(peopleTo, days) } }] },
      description: { rich_text: [{ text: { content: description } }] },
      πpol: { relation: [{ id: notionid }] },
      tasa_pred: { number: increm }, tasa_fin: { number: increm },
      monto_inv: { number: monto }, monto_fin: { number: mto_final },
      serie: { number:serie }, folio: { number: folio },
      plazo: { number: days },
      pred_date: { date: { start: fIni, end: fFin } },
    };
    //console.log(properTimeline);
    if (generaBloqueInversion)
      updateNotionPage(DATABASE_CET_ID, notionid, monto, 0);
    await addNotionPageToDatabase(DATABASE_CET_ID, properTimeline, 1, externalIconURL);
  } catch (error) {
    console.error('Error insertCetesPlazosDB:', error);
  }
}


/**
 * Retrieves movements from a database within a specified time range for a given notion ID.
 * 
 * @param notionid - The ID of the notion to retrieve movements for.
 * @param from - The start date of the time range.
 * @param to - The end date of the time range.
 * @returns An array of objects representing the retrieved movements, including concept, amount, final balance, color, and movement date.
 */
async function getMovements(notionid,todoist, from, to) {
  console.log(`== getMovements for ${notionid} [${from.toISOString().slice(0, 10)},${to.toISOString().slice(0, 10)}] ==`);
  let nextCursor = null;
  const returnArray = [];
    try {
        do{
            let response;
            if (notionid && !nextCursor){
                response = await notion.databases.query({  
                database_id: DATABASE_MVN_ID,
                filter: {"and": [{ property: 'πpol', relation: { contains: notionid } },
                    { property: 'mvmnt_date', formula: { date: { on_or_after: from.toISOString().slice(0, 10) } } },
                    { property: 'mvmnt_date', formula: { date: { on_or_before: to.toISOString().slice(0, 10) } } }]}, 
                sorts: [{ property: 'mvmnt_date', direction: 'descending' }]
                });
            }else if(notionid && nextCursor !== ''){
                response = await notion.databases.query({  
                    database_id: DATABASE_MVN_ID,
                    start_cursor: nextCursor,
                    filter: {"and": [{ property: 'πpol', relation: { contains: notionid } },
                        { property: 'mvmnt_date', formula: { date: { on_or_after: from.toISOString().slice(0, 10) } } },
                        { property: 'mvmnt_date', formula: { date: { on_or_before: to.toISOString().slice(0, 10) } } }]}, 
                    sorts: [{ property: 'mvmnt_date', direction: 'descending' }]
                    });
            }else if(!nextCursor){
                response = await notion.databases.query({  
                database_id: DATABASE_MVN_ID,
                filter: {"and": [{ property: 'mvmnt_date', formula: { date: { on_or_after: from.toISOString().slice(0, 10) } } },
                        { property: 'mvmnt_date', formula: { date: { on_or_before: to.toISOString().slice(0, 10) } } }]}, 
                sorts: [{ property: 'created time', direction: 'ascending' }]
                });
            } else {
                response = await notion.databases.query({  
                database_id: DATABASE_MVN_ID,
                start_cursor: nextCursor,
                filter: {"and": [{ property: 'mvmnt_date', formula: { date: { on_or_after: from.toISOString().slice(0, 10) } } },
                        { property: 'mvmnt_date', formula: { date: { on_or_before: to.toISOString().slice(0, 10) } } }]}, 
                sorts: [{ property: 'created time', direction: 'ascending' }]
                });
            }
            console.log("getMovements 🔢 = ", response.results.length, notionid);
            const data = response.results || [];
            data.forEach((item) => {
              returnArray.push({
                concept: item.properties.concept.rich_text[0].plain_text,
                monto: item.properties.monto.number,
                despues: item.properties.despues.formula.number,
                color: item.properties.color.formula.string,
                mvmnt_date: item.properties.mvmnt_date.formula.date.start.slice(0, 10),
                todoist: item.properties.todoist.rollup.array[0].rich_text[0].plain_text,
                notionid: item.id,
                antes: item.properties.antes.number
                });
            });
            nextCursor = response.next_cursor;
        }while(nextCursor);
        return returnArray;
  } catch (error) {
    console.error('Error getMovements:', error);
    return []; 
  }    
}

const formatter = new Intl.NumberFormat('es-MX', {
  style: 'currency',
  currency: 'MXN',
  minimumFractionDigits: 2,
});  

/**
 * Generates a random item from the given data based on the 'current$' property value being greater than 0.
 * 
 * @param data - The array of objects containing the data to select from.
 * @returns A randomly selected item from the 'todoist' property along with a ghost emoji and skull emoji.
 */ 
function generaRifa(data){
  const array = [];
  data.forEach((item) => {
    const value = Number(item.properties.current$.formula.number);
    const todoist = item.properties.todoist.rich_text[0].plain_text;
    if(value > 0 ){
        array.push(todoist);
        array.push("👻.💀");
    } 
  });
  return array[Math.floor(Math.random() * array.length)];
}

/**
 * Executes the process to send the last movements within a specified number of days for a given todoist.
 * Retrieves data from the database, calculates financial metrics, and sends a financial report via email.
 * @param todoistToLook The todoist to look for in the database
 * @param days The number of days to consider for the last movements
 * @returns A Promise that resolves once the process is completed
 */
const executeLastMvmnts = async (days, todoistToLook) => {
  console.log(`== Sending Last Movements in ${days} days for ${todoistToLook} ==`);
  try {
    const response = await notion.databases.query({  //get all
      database_id: DATABASE_PPL_ID,
      filter: {
        "and": [
          { property: 'status', status: { equals: "active" } },
          { property: 'type', select: { equals: "A" } }
        ]
      }
    });
    let data = response.results;
    const todoistGanador = generaRifa(data);
    const totalFamiliar = data.reduce((acc, item) => acc + (Number(item.properties.current$.formula.number) > 0 ? Number(item.properties.current$.formula.number) : 0), 0);
    console.log("executeLastMvmnts 🔢 = ", response.results.length, todoistToLook, ' 🎉ganador:', todoistGanador,`totalFamiliar=${totalFamiliar}`);
    if (todoistToLook !== 'all') {
      const response2 = await notion.databases.query({  //get specific todoist name
        database_id: DATABASE_PPL_ID,
        filter: {
          "and": [
            { property: 'status', status: { equals: "active" } },
            { property: 'type', select: { equals: "A" } },
            { property: 'todoist', rich_text: { equals: todoistToLook } }
          ]
        }
      });
      data = response2.results;
    }
    data.forEach(async (item) => {
      const notionid = item.id;
      const todoist = item.properties.todoist.rich_text[0].plain_text;
      const mail = item.properties.mail.email;
      const current = item.properties.current$.formula.number;
      const daysOfMvmnts = item.properties.daysOfMvmnts.formula.number;
      const total_movements = item.properties.total_movements.rollup.number;
      const aka = item.properties.Name.title[0].text.content;
      const porcPart = (current * 100) / totalFamiliar;
      const iconUrl = item.icon.external.url;
      const from = new Date();
      from.setDate(from.getDate() - days);
      const from30 = new Date();
      from30.setDate(from30.getDate() - 30);
      const mvmnts = await getMovements(notionid, todoist, from, new Date());
      let sumMovUltimos30Dias = 0;
      let promedioBalance = 0, total = 0;
      let sumIngresos = 0, sumEgresos = 0, sumIntereses = 0;
      let trs = '';
      mvmnts.forEach((movement) => {
        sumMovUltimos30Dias += (new Date(movement.mvmnt_date) >= from30) ? movement.monto : 0;
        promedioBalance += movement.despues;
        total++;
        if (movement.monto < 0) {
          sumEgresos += (new Date(movement.mvmnt_date) >= from30) ? movement.monto : 0;
        } else {
          sumIngresos += !movement.concept.toLowerCase().includes('intereses') && (new Date(movement.mvmnt_date) >= from30) ? movement.monto : 0;
        }
        sumIntereses += movement.concept.toLowerCase().includes('intereses') && (new Date(movement.mvmnt_date) >= from30) ? movement.monto : 0;
        trs += `<tr><td><span style="color: ${movement.color};">${movement.mvmnt_date}</span></td>`
          + `<td><span style="color: ${movement.color};">${formatter.format(movement.monto)}</span></td>`
          + `<td><span style="color: ${movement.color};"><strong>${formatter.format(movement.despues)}</strong></span></td>`
          + `<td><em><span style="color: ${movement.color};">${movement.concept}</span></em></td></tr>`;
      });
      const invInicial = (current - sumIntereses - sumIngresos - sumEgresos);
      const porcIntereses = ((sumIntereses * 12) / invInicial) * 100;
      const [ultimoPago, ultimoPagoDias] = await getUltimoPago(todoist, notionid);
      const emailContent = await templateMail(aka, current, total_movements, daysOfMvmnts, porcPart, sumMovUltimos30Dias, promedioBalance / total, iconUrl, from30, days, sumEgresos, sumIngresos, sumIntereses, trs, porcIntereses, ultimoPago, ultimoPagoDias, from, todoistGanador, todoist);
      //console.log("emailContent---", emailContent);
      await sendFinancialReport(mail, todoist, emailContent, current < 0);
    });
  } catch (error) {
    console.error('Error executeLastMvmnts:', error);
  }
}

/**
 * Retrieves the last payment amount and the number of days since the last payment for a specific todoist.
 * 
 * @param todoistToLook The todoist to search for the last payment.
 * @param notionid The notion ID associated with the todoist.
 * @returns A tuple containing the last payment amount and the number of days since the last payment.
 */
async function getUltimoPago(todoistToLook, notionid) {
  console.log(`== Getting the Last Movements for ${todoistToLook} | ${notionid} ==`);
  let ultimoPago = 0, ultimoPagoDias = 0;  
  try {
    const from365 = new Date();
    from365.setDate(from365.getDate() - 365);  
    const movements =  await getMovements(notionid, from365, new Date());
    let gotIt = false;
    for (const movement of movements) {
      if (!gotIt && movement.monto > 0) {
        ultimoPago = movement.monto;
        ultimoPagoDias = getDaysBetweenDates(new Date(movement.mvmnt_date), new Date());
        gotIt = true;
      }
    }
  } catch (error) {
    console.error('Error getUltimoPago:', error);
  }    
  return [ultimoPago, ultimoPagoDias];
}

const spanishToEnglishMonths = {
    "ene": "Jan", "feb": "Feb", "mar": "Mar", "abr": "Apr", "may": "May", "jun": "Jun",
    "jul": "Jul", "ago": "Aug", "sep": "Sep", "oct": "Oct", "nov": "Nov", "dic": "Dec"
 };

  
function parseSpanishDate(dateString) {
    const [day, month, year] = dateString.split(' ');
    const englishMonth = spanishToEnglishMonths[month.toLowerCase()] || month;
    const parsedDate = new Date(`${day} ${englishMonth} ${year}`);
    return parsedDate.toISOString().split('T')[0];
}

/**
 * Executes a process to handle credit card data.
 * 
 * @param {any} cleanedData - The cleaned credit card data to be processed.
 * @returns {Promise<boolean>} - A promise that resolves to true if records were processed, false otherwise.
 */
const executeCCProcess = async (cleanedData) => {
  console.log(`== executeCCProcess ==`);
  try {
    if (cleanedData.length === 0) {
      console.log("No records to process.");
      return false;
    }

    const fechas = cleanedData.map(row => new Date(row.fecha));
    const maxFecha = new Date(Math.max(...fechas));
    const minFecha = new Date(Math.min(...fechas));

    const maxFechaFormatted = maxFecha.toISOString().slice(0, 10);
    const minFechaFormatted = minFecha.toISOString().slice(0, 10);

    const response = await notion.databases.query({
      database_id: DATABASE_CC_ID,
      filter: {
        "and": [
          { property: 'when', date: { on_or_after: minFechaFormatted } },
          { property: 'when', date: { on_or_before: maxFechaFormatted } }
        ]
      }
    });
    const data = response.results;
    console.log("executeCCProcess 🔢 = ", data.length, `Min Fecha: ${minFechaFormatted}, Max Fecha: ${maxFechaFormatted}`);

    const fromNotion = data.map((item) => {
      const when = item.properties.when.date.start;
      const descriptionTrim = item.properties.description.rich_text[0].plain_text.replace(/ /g, "");
      const monto = item.properties.monto.number;
      const key = when.replace(/-/g, "").concat(descriptionTrim).concat((monto * -1).toString());
      return { key };
    });

    const getNonMatchingKeys = (cleanedArray, fromNotion) => {
      const notionKeys = new Set(fromNotion.map(item => item.key));
      return cleanedArray.filter(item => !notionKeys.has(item.key));
    };
    const nonMatchingRecords = getNonMatchingKeys(cleanedData, fromNotion);
    let recordsProcessed = 0;
    nonMatchingRecords.forEach(async (row) => {
      if (row.compras) {
        const properties = {
          Name: { title: [{ text: { content: 'cc'.concat(':', mainAccount) } }] },
          description: { rich_text: [{ text: { content: 'pagoCC:'.concat(row.fecha, '|', row.description.trim()) } }] },
          mto_to: { number: (row.compras * -1) },
          type: { select: { name: '(mov)imiento' } },
          πpol_to: { multi_select: [{ name: mainAccount }] },
          pending: { checkbox: true }
        }
        await addNotionPageToDatabase(DATABASE_BAK_ID, properties, -1);
        const properties2 = {
          Name: { title: [{ text: { content: getRandomKey('credito', Math.trunc(row.compras)) } }] },
          description: { rich_text: [{ text: { content: row.description.trim() } }] },
          monto: { number: (row.compras * -1) },
          when: { date: { start: row.fecha } }
        };
        await addNotionPageToDatabase(DATABASE_CC_ID, properties2, -1);
        recordsProcessed++;
      }
    });
    return recordsProcessed;
  } catch (error) {
    console.error('Error executeCCProcess:', error);
    return 0; 
  }
};
  

async function linkTheFinalAmount(todoist) {
    console.log(`== Running movement link to the final amount == ${todoist}`);
    let antes = 0;  
    try {
      const from15 = new Date();
      from15.setDate(from15.getDate() - 8);  
      const movements =  await getMovements(null, todoist, from15, new Date());
      for (const movement of movements) {
        const { todoist:todoistMovement, notionid, mvmnt_date, monto:montoMovement } = movement;
        let {antes:antesMovement} = movement;
        if (todoist === todoistMovement) {
          if(antes !== 0 && antesMovement != antes){
            await updateNotionMissmatch(notionid,antes);
            antesMovement = antes;
          }
          antes = antesMovement + montoMovement;
        }
      }
    } catch (error) {
      console.error('Error linkTheFinalAmount:', error);
    }
    return true;
  }




module.exports = { movimiento, mantenimiento, dispersionNomina
    , inversiones, sobrinas, markAsProcessed, executeLastMvmnts
    , executeCCProcess, getRandomKey, getDaysBetweenDates
    , parseSpanishDate, linkTheFinalAmount };