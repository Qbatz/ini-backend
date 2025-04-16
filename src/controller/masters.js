require('dotenv').config();
const moment = require('moment');
const { Title, CommonCountry } = require('../models/masters');
const { AuthUser } = require('../models/users');

exports.master_details = async (req, res) => {

    var titles = await Title.findAll({
        attributes: ['id', ['title', 'name']]
    });

    var country = await CommonCountry.findAll({
        attributes: ['id', 'name', ['code', 'countryCode'], 'phone', 'flag', 'currency_code']
    });

    return res.status(200).json({ titles, country })

}

exports.user_info = async (req, res) => {

    var user_id = req.user_id;

    try {

        var user_details = await AuthUser.findOne({
            where: { id: user_id }
        })

        if (!user_details) {
            return res.status(400).json({ message: "Invalid User Details" })
        }

        var new_user = {
            firstName: user_details.first_name,
            lastName: user_details.last_name,
            email: user_details.email,
            role: user_details.is_superuser == true ? 1 : 2,
            userId: user_details.id,
            lastLogin: moment(user_details.last_login).format("DD/MM/YYYY hh:mm a"),
            userName: user_details.username,
            joined: moment(user_details.date_joined).format("DD/MM/YYYY")
        }
        return res.status(200).json(new_user)
    } catch (error) {
        return res.status(400).json({ message: "Error to Get User Details", reason: error.message })
    }

}