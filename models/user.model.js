const mongoose = require('mongoose')
const _ = require('lodash')
const jwt = require('jsonwebtoken')
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
    const userObject = this.toObject()
    return _.omit(userObject, ['password'])
}

UserSchema.methods.generateJsonWebToken = async function() {
    return jwt.sign({_id: this._id.toHexString()}, process.env.SECRET, {expiresIn: "15m"});
}

UserSchema.statics.findByCredentials = async function(email, password) {
    try {
        const user = await this.findOne({email})
        const isPasswordCorrect = await bcrypt.compare(password, user.password)
        if (isPasswordCorrect) return user
        else throw new Error('password incorrect')
    } catch (error) {
        throw new Error('user not found');
    }
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