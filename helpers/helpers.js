require('dotenv').config()

const jwt = require('jsonwebtoken')
const dotenv = require("dotenv");
dotenv.config();
const nodemailer = require('nodemailer')
const Handlebars = require('handlebars')

const { SECRET_KEY } = process.env;

const messages = {
    400: "Bad Request",
    401: "Unauthorized",
    403: "Forbbiden",
    404: "Not found",
    409: "Conflict"
}

const compileTemplate = function (templateData, variablesData) {
    return Handlebars.compile(templateData)(variablesData)
}

const makeError = (status, message = messages[status]) => {
    const error = new Error(message)
    error.status = status
    return error
}

const onSaveErrors = (error, data, next)=> {
    const {name, code} = error;
    error.status = (name === "MongoServerError" && code === 11000) ? 409 : 400;
    next()
}

const createToken = (tokenData,options) => {
    return jwt.sign(tokenData,SECRET_KEY,options)
}

const sendEmail = async({email, order }) => {
    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: 'yanbuildinc@outlook.com',
          pass: 'vfvneakvapkavhza'
        }
    });

    let html,subject;

    const layout = require('../email templates/create')
        subject = 'Order #' + order.orderNumber + ' was created'
        html  = compileTemplate(layout, { 
        order: order
    })
            

    let to = email
    if(!to){
        throw 'Add email for testing on backend!!! helpers:71:1'
    }

    const mailOptions = {
        from: "profoundconf@gmail.com",
        to: to,
        subject,
        html,
    }

    transporter.sendMail(mailOptions, function(error, info){
        if (error) {
          console.log(error);
          throw makeError(501,'Email was not send')
        } else {
          console.log('Email sent: ' + info.response);
        }
    });
}

const getToken = req => {
    let token = req.headers['authorization']?.split(' ')[1] || null
    return token
}

module.exports = {
    // ctrlWrapper,
    makeError: makeError,
    onSaveErrors: onSaveErrors,
    sendEmail: sendEmail,
    createToken: createToken,
    getToken: getToken
}