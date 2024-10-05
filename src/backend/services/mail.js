const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const { addNotionPageToDatabase } = require('../controllers/notion');
dotenv.config();
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY); // Set your SendGrid API key

const formatter = new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  });  

/**
 * Asynchronously generates a template mail content based on the provided parameters.
 * 
 * @param aka The alias or name of the recipient.
 * @param current The current amount.
 * @param total_movements The total number of movements.
 * @param daysOfMvmnts The number of days of movements.
 * @param porcPart The percentage part.
 * @param sumMovUltimos30Dias The sum of movements in the last 30 days.
 * @param promedioBalance The average balance.
 * @param iconUrl The URL for the icon.
 * @param from30 The starting date.
 * @param days The number of days.
 * @param sumEgresos The sum of expenses.
 * @param sumIngresos The sum of incomes.
 * @param sumIntereses The sum of interests.
 * @param trs The transactions.
 * @param porcIntereses The percentage of interests.
 * @param ultimoPago The last payment amount.
 * @param ultimoPagoDias The days since the last payment.
 * @param fromDays The starting date in days.
 * @param todoistGanador The winning Todoist.
 * @param todoist The Todoist.
 * @returns A Promise that resolves to the generated template mail content.
 */
async function templateMail(aka, current, total_movements, daysOfMvmnts, porcPart
    ,sumMovUltimos30Dias, promedioBalance, iconUrl, from30, days
    ,sumEgresos, sumIngresos, sumIntereses, trs, porcIntereses
    ,ultimoPago, ultimoPagoDias, fromDays, todoistGanador, todoist) {
    try {
        const due_date = new Date();
        due_date.setDate(due_date.getDate() + 7);
        const { getRandomKey } = require('./core');

        const __dirname = path.resolve(); // This will give you the current directory
        const templateFile = current < 0
            ? `${__dirname}/docs/templates/prestamos_template.html`
            : `${__dirname}/docs/templates/balance_ahorro_template.html`;
        // Use Node.js fs module to read the template file
        let template = await fs.promises.readFile(templateFile, 'utf-8');
        const it = aka.includes('Don') ? 'he' : 'she';
        const promotionCode = getRandomKey(aka, total_movements);

        // Replace template placeholders with actual values
        template = template
            .replace("{{headerImage}}", getRandomImage())
            .replace("{{quote}}", getRandomQuote())
            .replace("{{aka}}", aka)
            .replace("{{currentYear}}", (new Date()).getFullYear().toString())
            .replace("{{total_movements}}", total_movements.toString())
            .replace("{{daysOfMvmnts}}", daysOfMvmnts.toString())
            .replace("{{from}}", from30.toISOString().slice(0, 10))
            .replace(/{{to}}/g, (new Date()).toISOString().slice(0, 10))
            .replace("{{current}}", formatter.format(current))
            .replace("{{sumMovUltimos30Dias}}", formatter.format(sumMovUltimos30Dias))
            .replace("{{sumEgresos}}", formatter.format(sumEgresos))
            .replace("{{sumIntereses}}", formatter.format(sumIntereses))
            .replace("{{sumIngresos}}", formatter.format(sumIngresos))
            .replace("{{porcentajeAnual}}", new Intl.NumberFormat('en-US', { style: 'decimal', minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(porcIntereses) + '%')
            .replace("{{days}}", days.toString())
            .replace("{{promedioBalance}}", formatter.format(promedioBalance ? promedioBalance : 0))
            .replace("{{transacciones}}", trs)
            .replace("{{iconUrl}}", iconUrl)
            .replace("{{porcPart}}", porcPart.toFixed(2))
            // Information for the template of debts.
            .replace("{{teveo}}", getRandomTeVeo())
            .replace("{{mote}}", getRandomMote(it))
            .replace("{{ultimoPago}}", formatter.format(ultimoPago))
            .replace("{{ultimoPagoDias}}", ultimoPagoDias.toString())
            .replace("{{garantia}}", getRandomGarantia())
            .replace("{{venganza}}", getRandomVenganza())
            .replace("{{from30}}", from30.toISOString().slice(0, 10))
            .replace("{{fromDays}}", fromDays.toISOString().slice(0, 10))
            // Information for the coupon
            .replace("{{coupon}}", await templateCoupon(todoist, todoistGanador, promotionCode, due_date));

        return template;
    } catch (error) {
        console.error("Error templateMail:", error);
        return '';
    }
}


/**
 * Asynchronously generates a coupon template based on the provided parameters.
 * Reads a template file, replaces placeholders with actual data, and creates properties for a Notion page.
 * If the 'todoist' matches 'todoistGanador', logs a message, updates the template, and adds properties to the Notion database.
 * @param todoist The todoist string.
 * @param todoistGanador The winning todoist string.
 * @param promotionCode The promotion code string.
 * @param due_date The due date for the coupon.
 * @returns A Promise that resolves to the generated coupon template.
 */
async function templateCoupon(todoist, todoistGanador, promotionCode, due_date) {
  if (!promotionCode || !(due_date instanceof Date)) {
      throw new Error('Invalid promotion code or due date');
  }
  const __dirname = path.resolve(); // This will give you the current directory
  const templateFile = `${__dirname}/docs/templates/coupon.html`;
  
  if (todoist !== todoistGanador) {
      return ''; // Return empty string if todoist does not match todoistGanador
  }

  console.log("🏷️ -- generando cupon ganador --", promotionCode);

  let template = await fs.promises.readFile(templateFile, 'utf-8');
  template = template
      .replace("{{promotionCode}}", promotionCode)
      .replace("{{dueDate}}", due_date.toISOString().slice(0, 10))
      .replace("{{nombreCuenta}}", todoist);

  const properties = {
      Name: { title: [{ text: { content: promotionCode.toString() } }] },
      description: { rich_text: [{ text: { content: 'Cupón ganador:'.concat(promotionCode) } }] },
      mto_to: { number: Number(process.env.PRICE_AMT) },
      pending: { checkbox: true },
      type: { select: { name: '(mov)imiento' } },
      πpol_to: { multi_select: [{ name: todoistGanador }] },
      πpol_from: { multi_select: [{ name: 'ahorro' }] },
      when_user: { date: { start: due_date.toISOString().slice(0, 10) } }
  };

  if (process.env.DATABASE_BAK_ID) {
    await addNotionPageToDatabase(process.env.DATABASE_BAK_ID, properties, 1);
  } else {
    console.warn('DATABASE_BAK_ID is not defined in the environment variables');
  }

  return template;
}

/**
 * Validates an email address using a regular expression.
 * 
 * @param email The email address to validate.
 * @returns A boolean indicating whether the email address is valid.
 */
function validateEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

  /**
   * Sends a financial report email to a user with the specified details.
   * Constructs the email body according to the SendGrid API format and sends the email via SendGrid API.
   * Logs the email sending process and any errors that occur.
   * 
   * @param userEmail The email address of the recipient.
   * @param nombreDeCuenta The name of the account for the report.
   * @param emailContent The content of the email in HTML format.
   * @param isLoanReport A boolean indicating if the report is for a loan.
   */

async function sendFinancialReport(userEmail, nombreDeCuenta, emailContent, isLoanReport) {
    if (!validateEmail(userEmail)) {
        throw new Error('Invalid email address');
    }
    const currentDate = new Date().toISOString().slice(0, 10); 
    const subject = isLoanReport
      ? `Reporte de movimientos de su préstamo al ${currentDate}`
      : `Reporte Financiero al ${currentDate} referente a su cuenta ${nombreDeCuenta}`;
    const sendgridAPI = 'https://api.sendgrid.com/v3/mail/send';

    try {
        const { getDaysBetweenDates } = require('./core');
        const emailData = {
            personalizations: [
              {
                to: [{ email: userEmail }],
                cc: [{ email: process.env.ADMIN_EMAIL }],
                subject: (getDaysBetweenDates(new Date(), new Date(process.env.DATE_LAST_UPDATE)) <= 100 ? '🆕 ' : 'ℹ️ ').concat(subject),
              },
            ],
            from: { email: process.env.ADMIN_EMAIL, name: 'Banco Lalito' },
            content: [{type: 'text/html',value: emailContent}],
          };
        console.log('📤 Sending mail', userEmail, nombreDeCuenta);
        const response = await fetch(sendgridAPI, {
            method: "POST",
            headers: {
              "Authorization": `Bearer ${process.env.SENDGRID_API_KEY}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(emailData),
          });
    
          if (!response.ok) {
            throw new Error(`Failed to send email: ${response.statusText}`);
          }
          console.log('Email sent successfully');
    } catch (error) {
        console.error('Error sending email:', error);
        throw error;
    }
}
  
/**
 * Returns a random quote from a predefined list of quotes.
 * 
 * @returns {string} A randomly selected quote from the list.
 */
  function getRandomQuote() {
    const quotes = [
       'Escuchar tu canción favorita en la radio al azar es más satisfactorio que ponerla directamente en tu celular.'
      ,'acaso, "Vete a la cama, te sentirás mejor por la mañana" es la versión humana de "¿Ya lo apagaste y lo volviste a encender?".'
      ,'Tal vez las plantas realmente nos estén cultivando, dándonos oxígeno hasta que finalmente muramos y nos convirtamos en composta que ellas pueden consumir.'
      ,'Se espera que las personas altas usen su tamaño para ayudar a las personas más bajas, pero si una persona alta le pidiera a una persona bajita que le pase algo que se le cayó al suelo, sería insultante.'
      ,'Cuando las personas piensan en viajar al pasado, se preocupan por cambiar accidentalmente el presente, pero nadie en el presente piensa realmente que puede cambiar radicalmente el futuro.'
      ,'Si dos personas en lados opuestos del mundo dejan caer cada una de ellas, una rebanada de pan, la Tierra se convierte brevemente en un sándwich.'
      ,'Mientras dormimos, nuestro cerebro inventa historias y luego se asusta de ellas.'
      ,'Levantar el dedo medio 🖕🏼 es la mitad del camino para hacer el signo de la paz ✌🏼.'
      ,'No hay forma de demostrar que todos vemos los mismos colores.'
      ,'Es probable que más del 99 % de los árboles que miras sigan ahí cuando mueras.'
    ];
    return quotes[Math.floor(Math.random() * quotes.length)];
  }
  
/**
 * Returns a random title based on the gender provided.
 * 
 * @param it - The gender ('she' or 'he') to determine the type of title.
 * @returns A randomly selected title based on the gender provided.
 */
  function getRandomMote(it){
    const motes =  (it === 'she')
    ?['Guardiana del Fuego Eterno, La Señora del Alba y la Luz de los Valientes'
      ,'Hija de las Estrellas, Tejedora de Sueños y Portadora de la Sabiduría Ancestral'
      ,'La Intrépida, La Exploradora del Horizonte, Maestra del Viento y del Mar'
      ,'La Sabia, Custodia de los Secretos del Tiempo, Forjadora de Destinos'
      ]
    :['El Indomable, El Escudo de Neza, Defensor de los Hombres Libres'
      ,'Portador del Pendragón, Rey de la Espada Sagrada, Señor de la Mesa Redonda y Faro de Justicia'
      ,'El Cazador de las Sombras, El Guerrero Silente y Heraldo del Renacer'
      ,'Valerio de las Montañas, Corazón de Hierro, Protector de los Pueblos Olvidados'];
    return motes[Math.floor(Math.random() * motes.length)];
  }
  
/**
 * Returns a random greeting phrase related to visual perception.
 */
  function getRandomTeVeo(){
    const greetings = [
      'Te veo'
      ,'Te escucho'
      ,'Te vigilo'
      ,'Te sigo'
      ,'Te soñé'
      ,'Te visualicé'
    ];
    return greetings[Math.floor(Math.random() * greetings.length)];
  }
  
/**
 * Returns a random message related to vengeance.
 */
  function getRandomVenganza(){
    const venganzas = [
      'ser maldecido por el Mal de Ojo'
      ,'quedarse sin papel de baño'
      ,'estornudar y tener diarrea al mismo tiempo'
      ,'no poderse razcar la nariz con comezón'
      ,'heredarle sus genes cuchos a sus hij@s'
    ];
    return venganzas[Math.floor(Math.random() * venganzas.length)];
  }

  /**
 * Returns a random string representing a guarantee, such as 'su alma', 'su tranquilidad', 'su juventud', etc.
 */
  function getRandomGarantia(){
    const garantias = [
      'su alma'
      ,'su tranquilidad'
      ,'su juventud'
      ,'sus ilusiones'
      ,'su certificado de libertad'
      ,'sus sueños'
    ];
    return garantias[Math.floor(Math.random() * garantias.length)];
  }
  
/**
 * Returns a random image URL from a predefined list of image URLs.
 * 
 * @returns {string} A randomly selected image URL.
 */
  function getRandomImage(){
    const images = [
        "https://freesvg.org/img/1579524838brain-silhouette-freesvg.org.png"
        ,"https://cdn.pixabay.com/photo/2012/04/18/20/40/lungs-37825_640.png"
        ,"https://static.vecteezy.com/system/resources/thumbnails/042/569/683/small_2x/ai-generated-antique-human-ear-anatomy-drawing-clipart-png.png"
        ,"https://d29fhpw069ctt2.cloudfront.net/clipart/image/105768/anatomical_heart.png" 
        ,"https://www.thedailygarden.us/uploads/4/5/4/9/45493619/creepy-tree-4567461-1920_orig.png" 
    ];
    return images[Math.floor(Math.random() * images.length)];
  }
  
module.exports = { templateMail, sendFinancialReport };