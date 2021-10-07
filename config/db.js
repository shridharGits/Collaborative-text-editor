const mongoose = require('mongoose')
const path = require('path');
require('dotenv').config()

function connectDB(){
    mongoose.connect(process.env.MONGO_CONNECTION_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
        // useCreateIndex: true,        
        // useFindAndModify: true
    })
    const connection = mongoose.connection

    connection.once('open', ()=>{
        // console.log('Database connected');
    }).on("error", function(err){
        console.log(err);
    })
}

module.exports = connectDB