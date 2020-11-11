const express = require('express')
const app = express()
const {mongoose} = require('./database')
const {response} = require('express')
const jwt = require('jsonwebtoken')

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, HEAD, OPTIONS, PUT, PATCH, DELETE");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, x-access-token, x-refresh-token, _id");
    res.header('Access-Control-Expose-Headers', 'x-access-token, x-refresh-token');
    next();
});

app.use(express.json())

const authenticate = (req, res, next) => {
    const accessToken = req.header('x-access-token')
    jwt.verify(accessToken, process.env.SECRET, (err, decoded) => {
        if (err) {
            res.status(401).send(err)
        } else {
            req.user_id = decoded._id
            next()
        }
    })
}