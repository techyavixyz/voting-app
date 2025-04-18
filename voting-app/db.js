const mongoose  = require('mongoose');
require('dotenv').config();


const mongoURL = process.env.MONGODB_URL
console.log('Mongo URL:', mongoURL);

//setup mongoDB connection

mongoose.connect(mongoURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})

const db = mongoose.connection;


db.on('connected', () => {
    console.log('Connetced to mongoDB Server')
})


db.on('error', (err) => {
    console.error('mongodb connection error:', err)
})


db.on('disconnected', () => {
    console.log('MongoDB disconnected')
})


module.exports = db;