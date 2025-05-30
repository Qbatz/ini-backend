const express = require('express')
var cors = require('cors');
require('dotenv').config();
const middleware = require('./middleware');
const associations = require('./src/models/associations');
const invoiceRoutes = require('./src/routes/invoice_routes');

const app = express()

var corsOptions = {
    origin: '*',
    credentials: true,
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));
app.options('*', cors());

// app.use(express.json())

app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ limit: '100mb', extended: true }));

app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,Accept");
    next();
})

app.use(middleware);

const authGroup = require('./src/sync/auth_group');
// const dbQuery = require('./db_query');

app.use(require('./src/routes/routes'));
app.use(require('./src/routes/product_routes'));
app.use(require('./src/routes/invoice_routes'));

app.listen(process.env.PORT, function () {
    console.log("node is started at : " + process.env.PORT + "")
    console.log("Host Name : " + process.env.DB_HOST + "");
    console.log("Host Password : " + process.env.DB_PASSWORD + "");
    console.log("Host User : " + process.env.DB_USER + "");
})