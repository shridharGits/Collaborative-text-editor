const mongoose = require('mongoose')
const validator = require('validator')
const bcrypt = require('bcrypt')
const userSchema = new mongoose.Schema({
    name:{
        type: String,
        trim: true,
        lowercase: true,
        required: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        validate(value){
            if(!validator.isEmail(value)){
                throw new Error('Invalid Email')
            }
        }
    },
    password:{
        type: String,
        required: true,
        validate(value){
            if(value.length < 7){
                throw new Error('Invalid password')
            }
        }
    }
})

userSchema.methods.hashedPassword = function(password){
    return bcrypt.hashSync(password, bcrypt.genSaltSync(8))
}

userSchema.methods.comparePassword = function(password, hash){
    return bcrypt.compareSync(password, hash)
}

const User = mongoose.model('User', userSchema)

module.exports = User