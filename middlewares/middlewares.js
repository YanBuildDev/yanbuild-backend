const { makeError, getToken } = require('../helpers/helpers')
const {Admin} = require('../models/admin')
const { AuthToken } = require('../models/auth')

const validateBody = schema => {
    const func = async(req,res,next) => {
        const {error} = schema.validate(req.body)
        if(error){
            const valError = makeError(400, error.message)
            next(valError)
        }
        next()
    }
    return func;
}

const validateHeaders = schema => {
    const func = async(req,res,next) => {
        const {error} = schema.validate(req.headers)
        if(error){
            const valError = makeError(400, error.message)
            next(valError)
        }
        next()
    }
    return func;
}

const validateParams = schema => {
    const func = async(req,res,next) => {
        const {error} = schema.validate(req.params)
        if(error){
            const valError = makeError(400, error.message)
            next(valError)
        }
        next()
    }
    return func;
}

const validateQuery = schema => {
    const func = async(req,res,next) => {
        const {error} = schema.validate(req.query)
        if(error){
            const valError = makeError(400,error.message)
            next(valError)
        }
        next()
    }
    return func;
}

const isLoggedInAdmin = async(req,res,next) => {
    let accessToken = getToken(req)

    if(!accessToken){
        return next(makeError(401,'You are not logged in'))
    }

    let auth = await AuthToken.findOne({accessToken})

    if(!auth){
        return next(makeError(401,'Bad token'))
    }

    let admin = await Admin.findById(auth.accountId)

    if(!admin){
        return next(makeError(401,'Bad token'))
    }

    next()
}


module.exports = {
    validateBody: validateBody,
    validateHeaders: validateHeaders,
    validateParams: validateParams,
    isLoggedInAdmin: isLoggedInAdmin,
    validateQuery: validateQuery
}