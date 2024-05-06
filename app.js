const express = require('express')
const logger = require('morgan')
const cors = require('cors')

const adminRouter = require('./routes/api/adminRoute')
const contactRouter = require('./routes/api/ordersRoute')
const mongoDBRouter = require('./routes/api/mongoUpdate')

const app = express()

const formatsLogger = app.get('env') === 'development' ? 'dev' : 'short'

app.use(logger(formatsLogger))
app.use(cors())
app.use(express.json())
// app.use(express.static('public'))

app.use('/api/admin', adminRouter)
app.use('/api/orders', contactRouter)
app.use('/api/mongodb',mongoDBRouter)

app.use((req, res) => {
  res.status(404).json({ message: 'Not found' })
})

app.use((err, req, res, next) => {
  const {status = 500, message = 'Server error'} = err
  res.status(status).json({message: message})
})

module.exports = app
