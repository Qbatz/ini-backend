const express = require('express')
var cors = require('cors');
require('dotenv').config();
const app = express()

var corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors());

app.use(express.json())
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Accept");
    next();
})

// app.use(middleware);
const authGroup = require('./src/sync/auth_group');
// const dbQuery = require('./db_query');

app.use(require('./src/routes/routes'));

app.listen(process.env.PORT, function () {
    console.log("node is started at : " + process.env.PORT + "")
})