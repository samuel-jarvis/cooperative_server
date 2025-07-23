const nodemailer = require('nodemailer')
const Handlebars = require('handlebars')
const { readFileSync } = require('node:fs')

const { resolve } = require('node:path')

exports.sendEmail = async (email, subject, html, copy) => {
  try {
    const transporter = nodemailer.createTransport({
      host: 'mail.privateemail.com',
      port: 587,
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD
      }
    })

    const message = {
      from: 'support@apexglobalunion.com',
      to: email,
      subject,
      html
    }

    // if (copy) {
    //   message.cc = 'EMAIL'
    // }

    await transporter.sendMail(message)
  } catch (error) {
    console.log(error)
  }
}

// send email confirmation otp
exports.sendWelcomeEmail = async (user) => {
  const subject = 'Welcome to Cooperative Union Bank'

  try {
    const templateParams = {
      fullName: user.firstName
    }
    const htmlTemplate = readFileSync(resolve(__dirname, '../emailTemplates/WelcomeEmail.html'), 'utf8')
    const template = Handlebars.compile(htmlTemplate)
    const html = template(templateParams)

    await this.sendEmail(user.email, subject, html, true)
  } catch (error) {
    console.log(error)
  }
}

exports.sendOtpEmail = async (user, otp) => {
  const subject = 'OTP for Cooperative Union Bank'

  try {
    const templateParams = {
      fullName: user.firstName,
      otp
    }

    const htmlTemplate = readFileSync(resolve(__dirname, '../emailTemplates/OtpEmail.html'), 'utf8')
    const template = Handlebars.compile(htmlTemplate)
    const html = template(templateParams)

    await this.sendEmail(user.email, subject, html)
  } catch (error) {
    console.log(error)
  }
}
