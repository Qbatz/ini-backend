const { InvoiceTypes, Ports, PaymentTerm, DeliveryTerm } = require('../models/invoice_package')
// const activityid = require('../components/activityid');
// const { Activity } = require('../models/activites');


exports.invoice_type = async (req, res) => {

    var invoice_types = await InvoiceTypes.findAll({
        attributes: [['id', 'typeId'], ['type', 'typeName']],
        where: { is_active: true }
    });

    return res.status(200).json(invoice_types)
}

exports.all_ports = async (req, res) => {

    var all_ports = await Ports.findAll({
        attributes: [['id', 'portId'], ['port_code', 'portCode'], 'city', 'state', 'country'],
        where: { is_active: true }
    });

    return res.status(200).json(all_ports)

}

exports.add_port = async (req, res) => {

    var { code, country, city, state, name, type, mode } = req.body;

    if (!code || !country || !mode) {
        return res.status(400).json({ message: "Missing Mandatory Fields" })
    }

    try {
        var new_port = await Ports.create({
            port_code: code,
            name,
            country,
            city,
            state,
            type,
            mode,
            is_active: true
        })

        // const activity_id = await activityid.generateNextActivityId();

        // await Activity.create({
        //     activity_id,
        //     activity_type_id: "ACT025",
        //     user_id: updated_by_id,
        //     transaction_id: code,
        //     description: 'Added new Port ' + code + '',
        //     created_by_id: updated_by_id
        // });

        return res.status(200).json({ message: "Added Successfully" })

    } catch (error) {
        console.error("Add Port Error:", error);
        return res.status(400).json({ message: "Error to Add Port Details", reason: error.message })
    }
}

exports.allpayment_terms = async (req, res) => {

    var all_paymnet_terms = await PaymentTerm.findAll({
        attributes: ['id', 'type'],
        where: { is_active: true }
    });

    return res.status(200).json(all_paymnet_terms)

}

exports.delivery_terms = async (req, res) => {

    var all_delivery = await DeliveryTerm.findAll({
        attributes: ['id', 'type'],
        where: { is_active: true }
    });

    return res.status(200).json(all_delivery)
}