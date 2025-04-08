require('dotenv').config();
const { Title, CommonCountry } = require('../models/masters');

exports.master_details = async (req, res) => {

    var titles = await Title.findAll({
        attributes: ['id', ['title', 'name']]
    });

    var country = await CommonCountry.findAll({
        attributes: ['id', 'name', ['code', 'countryCode'], 'phone', 'flag', 'currency_code']
    });

    return res.status(200).json({ titles, country })

}