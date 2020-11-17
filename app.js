const express = require('express')
const { mongoose } = require('./database')
const { response } = require('express')
const jwt = require('jsonwebtoken')

const { User } = require('./models')

const app = express()

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, access-token, _id");
    res.header('Access-Control-Expose-Headers', 'access-token');
    next();
});

app.use(express.json())

const authenticate = (req, res, next) => {
    const accessToken = req.header('access-token')
    jwt.verify(accessToken, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).send(err)
        } else {
            req.user_id = decoded._id
            next()
        }
    })
}

app.get('/', authenticate, (req, res) => {
    res.send(req.user_id)
})

/**
 * POST /users
 * Purpose: Create new user
 */
app.post('/users', async (req, res) => {
    const body = req.body
    const user = new User(body)
    await user.save()
    const accessToken = await user.generateJsonWebToken()
    res.header('access-token', accessToken).send(user)
/*     user.save().then(() => {
        return user.generateJsonWebToken().then((accessToken) => {
            return accessToken
        })
    }).then((accessToken) => {
        res.header('access-token', accessToken)
            .send(user)
    }).catch(err => res.status('400').send({ message: 'no signup' })) */
})

/**
 * POST /users/login
 * Purpose: authenticate a user
 */
app.post('/users/login', (req, res) => {
    const email = req.body.email
    const password = req.body.password
    User.findByCredentials(email, password).then(user => {
        return user.generateJsonWebToken().then(accessToken => {
            return accessToken
        }).then(accessToken => {
            res.header('access-token', accessToken)
                .send(user)
        })
    }).catch(err => res.status('400').send(err))
})

app.listen('3000', console.log("api is up"))