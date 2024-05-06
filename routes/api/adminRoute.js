const express = require("express");
const router = express.Router();
const { Admin, adminJoiSchema} = require("../../models/admin");
const { Contact } = require('../../models/order')
const { AuthToken } = require('../../models/auth')
const bcrypt = require('bcrypt')
const Joi = require("joi");

const { makeError, createToken, getToken, sendEmail } = require('../../helpers/helpers')
const { validateBody, validateHeaders, validateParams, isLoggedInAdmin } = require("../../middlewares/middlewares");


router.post(
    "/create",
    isLoggedInAdmin,
    validateBody(
        adminJoiSchema
    ),
    async (req, res, next) => {
        try {
            const { name, email, phone, password } = req.body;
        
            let user = await Admin.findOne({ email });
            
            if (user) {
                return next(makeError(409, "Admin with this email is already exists!"));
            }
            
            const hashedPassword = await bcrypt.hash(password, 10);
            user = await Admin.create({ email, name, phone, password: hashedPassword });

            delete Admin.password

            let returnData = {
                user: user
             }
     
            res.json({ data: returnData }).status(201)
        } catch (error) {
            return next(makeError(500,error))
        }
})

router.post(
    "/login",
    validateBody(
        Joi.object({
            email: Joi.string().pattern(/^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/)
            .required(),
            password: Joi.string().required()
        })
    ),
    async (req, res, next) => {
        try {
            const { email, password } = req.body

            let admin = await Admin.findOne({ email })
    
            if(!admin){
                return next(makeError(400, "Admin not found!"));
            }
    
            if(!bcrypt.compare(admin.password,password)){
                return next(makeError(400, "Password is not correct!"));
            }
    
            await Admin.findOneAndUpdate({ _id: admin._id },
                {
                    $set: {
                        lastLogin: new Date().toUTCString()
                    }
                }
            )
    
            let authToken = createToken({
                email: admin.email,
                phone: admin.phone,
                name: admin.name
            }, { expiresIn: '1d' })
    
            await AuthToken.create({ accountId: admin._id,accessToken: authToken })
    
            let returnData = {
               accessToken: authToken
            }
    
            res.json({ data: returnData }).status(200)
        } catch (error) {
            return next(makeError(500,error))
        }

    }
)

router.post(
    "/loginViaAccessToken",
    validateHeaders(
        Joi.object({
            'authorization': Joi.string().required()
        }).unknown()
    ),
    async (req, res, next) => {
        try {
            let accessToken = getToken(req)

             let auth = await AuthToken.findOne({ accessToken })

            if(!auth){
                return next(makeError(401,'Bad token'))
            }

            let admin = await Admin.findById(auth.accountId)

            if(!admin){
                return next(makeError(400,'User with this access token is not found'))
            }

            await Admin.findOneAndUpdate({ _id: admin._id },
                {
                    $set: {
                        lastLogin: new Date().toUTCString()
                    }
                }
            )

            delete admin.password

            let returnData = {
                user: admin
            }

            res.json({ data: returnData }).status(200)
        } catch (error) {
            return next(makeError(500,error))
        }
        
    }
)

router.post(
    "/logout",
    validateHeaders(
        Joi.object({
            'authorization': Joi.string().required()
        }).unknown()
    ),
    async (req, res, next) => {
        try {
            let accessToken = getToken(req)
        
            let auth = await AuthToken.findOne({ accessToken })

            if(!auth){
                return next(makeError(401,'Bad token'))
            }

            await AuthToken.findByIdAndDelete(auth._id)

            let returnData = {
                success: true
            }

            res.json({ data: returnData }).status(200)
        } catch (error) {
            return next(makeError(500,error))
        }
        
    }
)

router.post(
    '/scan/:id',
    isLoggedInAdmin,
    validateParams(
        Joi.object({
            id: Joi.string().required()
        })
    ),
    async(req,res,next) => {
        try {
            const id = req.params.id
            let contact = await Contact.findById(id).lean()
    
            if(!contact){
                return next(makeError(404,'Contact not found!'))
            }
    
            if(contact.location.needLiving){
                await sendEmail({
                    email: contact.email,
                    type: 'scan',
                    contact: contact
                })
            }
            
            let updatedContact = await Contact.findByIdAndUpdate(contact._id,{
                arrived: true
            }, {new: true, lean: true})
    
            let returnData = {
                contact: updatedContact
            }
    
            res.json({ data: returnData}).status(200) 
        } catch (error) {
            return next(makeError(500,error))
        }
        
    }
)

module.exports = router;
