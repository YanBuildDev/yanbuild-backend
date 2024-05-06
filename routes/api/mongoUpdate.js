const express = require("express");
const { validateParams, isLoggedInAdmin } = require("../../middlewares/middlewares");
const { makeError } = require("../../helpers/helpers");
const Joi = require("joi");
const router = express.Router();

router.post(
    "/:id",
    isLoggedInAdmin,
    validateParams(
        Joi.object({
            id: Joi.string().required()
        })
    ),
    async(req,res,next) => {
        const id = req.params.id
        const updateFunction = require(`../../MongoUpdates/${id}`)
        if(!updateFunction){
            next(makeError(404,'File not found'))
        }

        let result = await updateFunction.updateFunction()

        res.json(result).status(200)
    }
)


module.exports = router