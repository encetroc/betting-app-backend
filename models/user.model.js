const mongoose = require('mongoose')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
const crypto = require('crypto')
const bcrypt = require('bcryptjs')

const UserSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        minlength: 1,
        trim: true,
        unique: true
    },
    password: {
        type: String,
        required: true,
        minlength: 8
    }
})

UserSchema.methods.toJSON = function() {
    const user = this
    const userObject = user.toObject()
    return _.omit(userObject, ['password'])
}

UserSchema.methods.generateJsonWebToken = function() {
    const user = this
    return new Promise((resolve, reject) => {
        jwt.sign({_id: user._id.toHexString()}, process.env.SECRET, {expiresIn: "15m"}, (err, token) => {
            if (!err) {
                return resolve(token)
            } else {
                return reject(err)
            }
        })
    })
}

const User = mongoose.model('User', UserSchema)

module.exports = {User}