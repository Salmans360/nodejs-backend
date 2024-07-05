const nodemailer = require('nodemailer');
const mandrillTransport = require('nodemailer-mandrill-transport');
const pug = require('pug');
const AWS =require("aws-sdk");
require('dotenv').config();
AWS.config.update({
  region: `${process.env.AWS_REGION}`,
  accessKeyId: `${process.env.AWS_SES_ACCESS}`,
  secretAccessKey: `${process.env.AWS_SES_SECRET}`
});
module.exports = class Email {
  constructor(user, url) {
    this.to = user.email;
    this.url = url;
    this.businessName = user.businessName;
    this.message = user.message;
    this.customerName = user.customerName;
    this.from = `Torque 360 <${process.env.EMAIL_USERNAME}>`;
  }

  newTransport() {

    // Replace 'your-api-key' with your Mandrill API key
    const mandrillOptions = {
      auth: {
        apiKey: `${process.env.MANDRILL_API_KEY}`
      },

    };

    // Create a Nodemailer transporter using the Mandrill transport
    const transporter = nodemailer.createTransport(mandrillTransport(mandrillOptions));
  }

  async send(template, subject) {
    // 1) Render HTML based on a pug template
    try{
    const html = pug.renderFile(`${__dirname}/emails/views/${template}.pug`, {
      name: this.name,
      url: this.url,
      businessName: this.businessName,
      message: this.message,
      customerName: this.customerName,
      userEmail: this.userEmail,
      phone: this.phone,
      subject,
    });
  
    // 2) Define email options
   let transporter = await nodemailer.createTransport({
        service: 'Mandrill',
        auth: {
          user: 'contact@torque360.co',
          pass: `${process.env.MANDRILL_API_KEY}`
        },
        logger: false, // log to console
        debug: false // include SMTP traffic in the logs
      }, {
        from: 'Torque360'
      });

      // Message object
      var message = {
        from: this.from,
        to: this.to,
        cc: this.cc,
        subject,
        html: html,
        attachments: this.attachment
      };

      await transporter.sendMail(message).then(info => {
        console.log('Server responded with "%s"', info.response);
      }).catch(err => {
        console.log('Error occurred');
        console.log(err.message);
      });
      if(this.attachment){
        for (let i = 0; i < this.attachment.length; i++) {
          let fs = require('fs');
          await fs.unlinkSync(this.attachment[i]?.path);
        }
      }
    } catch (err) {
      console.log('email err', err);
      return err;
    }
  
  }

  async sendInvoice(subject) {
    await this.send('sendInvoice', subject);
  }
  async sendPasswordResetEmail() {
    await this.send('resetAccount', 'Account Password Reset Link');
  }

  async sendCustomerSupportEmail(message) {
    // process.env.SUPPORT_EMAIL_URL ||
    const mailOptions = {
      from: 'contact@torque360.co',
      to: process.env.SUPPORT_EMAIL_URL,
      businessName: this.businessName,
      subject: 'Payment Pending',
      html: message,
    };
    let transporter = await nodemailer.createTransport({
      service: 'Mandrill',
      auth: {
        user: 'contact@torque360.co',
        pass: `${process.env.MANDRILL_API_KEY}`
      },
      logger: false, // log to console
      debug: false // include SMTP traffic in the logs
    }, {
      from: 'Torque360'
    });

    // Message object
    

    await transporter.sendMail(mailOptions).then(info => {
      console.log('Server responded with "%s"', info.response);
    }).catch(err => {
      console.log('Error occurred');
      console.log(err.message);
    })
  }
  async sendLeadOfRegisteredUsers(message, onboarding) {
    // process.env.SUPPORT_EMAIL_URL ||
    const mailOptions = {
      from: 'contact@torque360.co',
      to: process.env.NEW_USERS_LEAD_URL,
      businessName: this.businessName,
      subject: onboarding ? 'Payment Successfull' : 'User Registered',
      html: message,
    };
    let transporter = await nodemailer.createTransport({
      service: 'Mandrill',
      auth: {
        user: 'contact@torque360.co',
        pass: `${process.env.MANDRILL_API_KEY}`
      },
      logger: false, // log to console
      debug: false // include SMTP traffic in the logs
    }, {
      from: 'Torque360'
    });

    // Message object
    

    await transporter.sendMail(mailOptions).then(info => {
      console.log('Server responded with "%s"', info.response);
    }).catch(err => {
      console.log('Error occurred');
      console.log(err.message);
    });
  }
};
