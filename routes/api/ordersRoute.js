const express = require("express");
const { ObjectId } = require('mongodb');
const router = express.Router();
const { Order, orderJoiSchemaOptional, orderJoiSchemaRequired} = require("../../models/order");
const Joi = require("joi");

const { makeError, createToken, getToken, sendEmail } = require('../../helpers/helpers')
const { validateBody, validateHeaders, validateQuery, validateParams, isLoggedInAdmin } = require("../../middlewares/middlewares");

const createCriteria = (payload) => {
    let criteria = {}
    if(payload.firstName){
        criteria['firstName'] = {
            $regex: payload.firstName
        }
    }

    if(payload.lastName){
        criteria['lastName'] = {
            $regex: payload.lastName
        }
    }

    if(payload.phone){
        criteria['phone'] = {
            $regex: payload.phone
        }
    }

    if(payload.email){
        criteria['email'] = {
            $regex: payload.email
        }
    }

    if(payload.city){
        criteria['city'] = {
            $regex: payload.city
        }
    }

    if(payload.state){
        criteria['state'] = {
            $regex: payload.state
        }
    }

    if(payload.zip){
        criteria['zip'] = {
            $regex: payload.zip
        }
    }

    if(payload.companyName){
        criteria['companyName'] = {
            $regex: payload.companyName
        }
    }

    if(payload.homeMeasurements){
        criteria['homeMeasurements'] = payload.homeMeasurements
    }
    
    if(payload.projectPlanning){
        criteria['projectPlanning'] = payload.projectPlanning
    }

    if(payload.projectKind){
        criteria['projectKind'] = {
            $all: payload.projectKind
          }
    }

    if(payload.contactMethods){
        criteria['contactMethods'] = {
            $all: payload.contactMethods
        }
    }
    return criteria
}

// Create order
router.post(
    "/create",
    validateBody(orderJoiSchemaRequired),
    async (req,res,next) => {
        try {
            let payloadData = req.body

            let order = await Order.create(payloadData)

            let returnData = {
                order: order
            }

            res.json({data: returnData}).status(200)
        } catch (error) {
            return next(makeError(500,error))
        }
        
    }
)

// Get all order matching criteria
router.get(
    '/all',
    isLoggedInAdmin,
    // Format some fields of query
    (req,res,next) => {
        if(req.query.projectKind){
            req.query.projectKind = req.query.projectKind.split(',').map(i => i.trim()).filter(i => i)
        }
        if(req.query.contactMethods){
            req.query.contactMethods = req.query.contactMethods.split(',').map(i => i.trim()).filter(i => i)
        }
        next()
    },
    validateQuery(
        orderJoiSchemaOptional,
    ),
    async(req,res,next) => {
        try {
            let payload = req.query || {}
            let sorting = payload.sorting
    
            let sortingCriteria = { $sort: {createdAt: 1}}
            
            let criteria = createCriteria(payload)
    
            if(sorting){
                sortingCriteria.$sort[`${sorting}`] = payload.dir === 'asc' ? 1 : -1
            }

            let countCriteria = [
                {
                    $match: {
                        ...criteria
                    }
                },
                {
                    $count: 'count'
                }
            ]
    
            let getCriteria = [
                {
                    $match: {
                        ...criteria
                    }
                },
                sortingCriteria
            ]
    
            let orders = await Order.aggregate(getCriteria)
            let ordersCount = (await Order.aggregate(countCriteria))[0]
    
            let returnData = {
                orders: orders,
                count: ordersCount
            }
    
            res.json({data: returnData}).status(200)  
        } catch (error) {
            return next(makeError(500,error))
        }
        
    }
)

// Bulk update orders
router.patch(
    '/all',
    isLoggedInAdmin,
    validateBody(
        Joi.object({
            criteria: orderJoiSchemaOptional,
            updateData: orderJoiSchemaOptional
        }).optional()
    ),
    async(req,res,next) => {
        try {
            let payload = req.body.criteria
            let updateData = req.body.updateData

            let criteria = createCriteria(payload)

            let result = await Order.updateMany(criteria,updateData)

            let returnData = {
                success: true,
                count: result.matchedCount
            }

            res.json({ data: returnData }).status(200)
        } catch (error) {
            return next(makeError(500,error))
        }
        
    }
)

// Get one order by id
router.get(
    '/one/:id',
    validateParams(
        Joi.object({
            id: Joi.string().required()
        })
    ),
    async(req,res,next) => {
        try {
            let orderId = req.params.id

            if(!ObjectId.isValid(orderId)){
                return next(makeError(400,'Not MongoDB ID!!!'))
            }

            let order = await Order.findById(orderId).lean()

            if(!order){
                return next(makeError(404,'Quote not found'))
            }

            let returnData = {
                order: order
            }

            res.json({data: returnData}).status(200)
        } catch (error) {
            return next(makeError(500,error))
        }
        
    }
)

// Update one order by id
router.patch(
    '/one/:id',
    isLoggedInAdmin,
    validateParams(
        Joi.object({
            id: Joi.string().required()
        })
    ),
    validateBody(
        orderJoiSchemaOptional
    ),
    async(req,res,next) => {
        try {
            let orderId = req.params.id
            let updateData = req.body

            if(!ObjectId.isValid(orderId)){
                return next(makeError(400,'Not MongoDB ID!!!'))
            }

            let order = await Order.findById(orderId)

            if(!order){
                return next(makeError(404,'Quote not found'))
            }

            let updatedOrder = await Order.findByIdAndUpdate(order,updateData,{lean: true, new: true})

            let returnData = {
                contact: updatedOrder
            }

            res.json({data: returnData}).status(200)
        } catch (error) {
            return next(makeError(500,error))
        }
        
    }
)

// Delete one order by id
router.delete(
    '/:id',
    isLoggedInAdmin,
    validateParams(
        Joi.object({
            id: Joi.string().required()
        })
    ),
    async(req,res,next) => {
        try {
            const orderId = req.params.id

            const order = await Order.findById(orderId)

            if(!ObjectId.isValid(orderId)){
                return next(makeError(400,'Not MongoDB ID!!!'))
            }

            if(!order){
                return next(makeError(404,'Quote not found'))
            }

            await Order.deleteOne({
                _id: orderId
            })

            let returnData = {
                success: true
            }

            res.json({data: returnData}).status(200)
        } catch (error) {
            return next(makeError(500,error))
        }
        
    }
)

module.exports = router