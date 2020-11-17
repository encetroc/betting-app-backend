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

UserSchema.methods.generateJsonWebToken = async function() {
    return jwt.sign({_id: this._id.toHexString()}, process.env.SECRET, {expiresIn: "15m"});
/*     return new Promise((resolve, reject) => {
        jwt.sign({_id: user._id.toHexString()}, process.env.SECRET, {expiresIn: "15m"}, (err, token) => {
            if (!err) {
                return resolve(token)
            } else {
                return reject(err)
            }
        })
    }) */
}

UserSchema.statics.findByCredentials = function(email, password) {
    const user = this
    return user.findOne({email}).then(user => {
        if (!user) return Promise.reject()
        return new Promise((resolve, reject) => {
            bcrypt.compare(password, user.password, (err, res) => {
                if (res) resolve(user)
                else reject(err)
            })
        })
    })
}

UserSchema.pre('save', function(next) {
    const user = this
    const costFactor = 10
    if (user.isModified('password')) {
        bcrypt.genSalt(costFactor, (err, salt) => {
            bcrypt.hash(user.password, salt, (err, hash) => {
                user.password = hash
                next()
            })
        })
    } else {
        next()
    }
})

const User = mongoose.model('User', UserSchema)

module.exports = {User}