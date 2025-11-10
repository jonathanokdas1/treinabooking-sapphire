
const nodemailer = require("nodemailer");
const axios = require("axios");
const moment = require("moment");
const config = require('../config');

// const mailer = nodemailer.createTransport({
//   host: config.GOOGLE_SMTP.host,
//   port: config.GOOGLE_SMTP.port,
//   auth: {
//       user: "apikey",
//       pass: config.sendGrid.api_token
//   }
// });

const mailer = nodemailer.createTransport({
  host: config.GOOGLE_SMTP.host,
  port: config.GOOGLE_SMTP.port,
  auth: {
    user: config.GOOGLE_SMTP.email,
    pass: config.GOOGLE_SMTP.pass,
  },
});


module.exports = {

  async sendEmail(mailReqData) {

    if (!mailReqData.to) return "Mail recipients (To) is mandatory field";
    if (!mailReqData.topic) return "Mail topic is mandatory field";

    if (mailReqData.topic === "lowBalance") {
      mailReqData.subject = "TrenaBooking App :: Low Wallet Balance Alert";
      mailReqData.html = `<!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Low Wallet Balance Alert</title>
      </head>
      <body style="font-family: Arial, sans-serif; background-color: #f0f0f0; padding: 20px;">

          <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 20px; border-radius: 10px; box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);">

              <h1 style="color: #333;">Low Account Balance Alert</h1>

              <p>${mailReqData.firstName} ${mailReqData.lastName} hope your are doing well.<br/> your account balance is running low. Please take immediate action to ensure uninterrupted service.</p>

              <p><strong>Account Details:</strong></p>
              <ul>
                  <li><strong>Current Balance:</strong> € ${mailReqData.walletBalance}</li>
              </ul>

              <p>To add funds to your account, Please contact your trainer or contact our support team.</p>

              <p>Thank you for using our services.</p>

              <p style="font-size: 12px; color: #999;">NOTE: This is an automated message. Please do not reply.</p>
          </div>
      </body>
      </html>`;
    }

    let mailOptions = {
      from: config.sendGrid.email_from,
      to: [mailReqData.to, config.sendGrid.email_from],
      subject: mailReqData.subject,
      template: mailReqData.templateName,
      text: mailReqData.subject,
      html: mailReqData.html,
      context: mailReqData.html
    }

    return new Promise((resolve, reject) => {
      mailer.sendMail(mailOptions, (error, info) => {
        if (error) reject(error);
        resolve(info)
      })
    });
  }
}
