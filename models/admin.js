const {Schema, model} = require('mongoose')
const Joi = require('joi')
const { onSaveErrors } = require('../helpers/helpers')

const adminSchema = new Schema({
    email: {
      type: String,
      required: true
    },
    password: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: false
    },
    phone: {
      type: String,
      required: false
    },
    lastLogin: {
      type: Date,
      default: new Date().toUTCString()
    }
  }, {versionKey: false, timestamps: true})

  adminSchema.post("save", onSaveErrors);

const Admin = model('admins', adminSchema)

const adminJoiSchema = Joi.object({
  email: Joi.string().pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required(),
  password: Joi.string().required(),
  name: Joi.string().optional(),
  phone: Joi.string().optional()
})

module.exports = {
    Admin,
    adminJoiSchema
}