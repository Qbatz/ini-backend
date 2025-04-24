require('dotenv').config();
const moment = require('moment-timezone');
const { Title, CommonCountry } = require('../models/masters');
const { AuthUser } = require('../models/users');
const { Activity, ActivityTypes } = require('../models/activites');
const { types } = require('pg');

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

exports.activities = async (req, res) => {

    var user_id = req.user_id;

    var activites = await Activity.findAll({
        where: { is_active: true, user_id },
        include: [
            {
                model: ActivityTypes,
                as: "ActivityTypes",
                attributes: ["activity_name"],
            }
        ],
        order: [['id', 'DESC']]
    });

    var formatedactivites = activites.map(activity => {
        const type = activity.ActivityTypes.activity_name;
        const description = activity.description.toLowerCase();

        let module = "";
        if (description.includes("product")) module = "product";
        else if (description.includes("vendor")) module = "vendor";
        else if (description.includes("client") || description.includes("customer")) module = "client";
        else if (description.includes("category")) module = "category";
        else if (description.includes("sub category")) module = "subcategory";
        else if (description.includes("brand")) module = "brand";

        return {
            id: activity.id,
            type: type,
            description: activity.description,
            datetime: moment(activity.created_on).tz("Asia/Kolkata").format("DD/MM/YYYY hh:mm a"),
            transactionId: activity.transaction_id || "",
            module: module
        };
    });

    return res.status(200).json({ activites: formatedactivites });
}
