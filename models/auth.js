const { Schema, model } = require('mongoose')
const Joi = require('joi')
const { onSaveErrors } = require('../helpers/helpers')

const mongoose = require('mongoose');

const authSchema = new Schema({
    accessToken: {
        type: String,
        required: true,
        unique: true
    },
    accountId: {
        type: Schema.ObjectId,
        ref: 'accounts'
    }
  }, {versionKey: false, timestamps: true})

  authSchema.post("save", onSaveErrors);

const AuthToken = model('auths', authSchema)

module.exports = {
    AuthToken,
    // schemas
}