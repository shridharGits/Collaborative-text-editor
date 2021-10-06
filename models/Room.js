const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const roomSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
        unique: true,
        lowercase: true
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(value.length < 5){
                throw new Error('Invalid password')
            }
        }
    },
    adminEmail:{
        type: String,
        required: false,
        trim: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Enter valid email')
            }
        }
    },
    email1:{
        type: String,
        required: false,
        unique: true,
        lowercase: true,
        validate(value){
            if(value){
                if(!validator.isEmail(value)){
                    throw new Error('Invalid Email')
                }
            }
        }
    },
    email2:{
        type: String,
        required: false,
        unique: true,
        lowercase: true,
        validate(value){
            if(value){
                if(!validator.isEmail(value)){
                    throw new Error('Invalid Email')
                }
            }
        }
    }
})

roomSchema.methods.hashedPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}

roomSchema.methods.comparePassword = function(password, hash){
    return bcrypt.compareSync(password, hash)
}

const Room = mongoose.model('Room', roomSchema)

module.exports = Room