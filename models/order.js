const {Schema, model} = require('mongoose')
const Joi = require('joi')
const orderConstants = require('../constants/orderConstants')

const orderSchema = new Schema({
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true
    },
    zip: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    companyName: {
        type: String,
        required: true
    },
    projectKind: {
        type: [{
            type: String,
            enum: orderConstants.projectKindEnum
        }],
        required: true
    },
    projectPlanning: {
        type: String,
        enum: orderConstants.projectPlanningEnum,
        required: true
    },
    homeMeasurements: {
        type: String,
        enum: orderConstants.homeMeasurementsEnum,
        required: true
    },
    contactMethods: {
        type: [{
            type: String,
            enum: orderConstants.contactMethodsEnum
        }],
        required: true
    },
    contactTime: {
        type: String,
        required: true
    },
    hearAboutUs: {
        type: String,
        required: true
    },
    projectDesc: {
        type: String,
        required: true
    }
}, {versionKey: false, timestamps: true})

// contactSchema.post("save", onSaveErrors);

const Order = model('orders', orderSchema)

const orderJoiSchemaOptional = Joi.object({
    email: Joi.string().pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    phone: Joi.string().optional(),
    city: Joi.string().optional(),
    zip: Joi.string().optional(),
    state: Joi.string().optional(),
    companyName: Joi.string().optional(),
    projectKind: Joi.array().items(Joi.string().valid(...orderConstants.projectKindEnum)).optional(),
    projectPlanning: Joi.string().valid(...orderConstants.projectPlanningEnum).optional(),
    homeMeasurements: Joi.string().valid(...orderConstants.homeMeasurementsEnum).optional(),
    contactMethods: Joi.array().items(Joi.string().valid(...orderConstants.contactMethodsEnum)).optional(),
    contactTime: Joi.string().optional(),
    hearAboutUs: Joi.string().optional(),
    projectDesc: Joi.string().optional(),
    // For sorting
    sorting: Joi.string().optional(),
    dir: Joi.string().valid('asc','desc').optional()
})

// For order create
const orderJoiSchemaRequired = Joi.object({
    email: Joi.string().pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/).required(),
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    phone: Joi.string().required(),
    city: Joi.string().required(),
    zip: Joi.string().required(),
    state: Joi.string().required(),
    companyName: Joi.string().required(),
    projectKind: Joi.array().items(Joi.string().valid(...orderConstants.projectKindEnum)).required(),
    projectPlanning: Joi.string().valid(...orderConstants.projectPlanningEnum).required(),
    homeMeasurements: Joi.string().valid(...orderConstants.homeMeasurementsEnum).required(),
    contactMethods: Joi.array().items(Joi.string().valid(...orderConstants.contactMethodsEnum)).required(),
    contactTime: Joi.string().required(),
    hearAboutUs: Joi.string().required(),
    projectDesc: Joi.string().required(),
  })

module.exports = {
    Order,
    orderJoiSchemaOptional,
    orderJoiSchemaRequired
}