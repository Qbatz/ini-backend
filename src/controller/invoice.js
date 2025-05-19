const moment = require('moment');

const { InvoiceTypes, Ports, PaymentTerm, DeliveryTerm, PoforInvoice } = require('../models/invoice_package')
const activityid = require('../components/activityid');
const { Activity } = require('../models/activites');
const { Customer } = require('../models/customers');
const { Invoice, InvoiceItem } = require('../models/invoice');
const { Products } = require('../models/products');
const { Op, fn, col, where } = require("sequelize");
const { CustomerAddress } = require('../models/customers');
const { CommonCountry } = require('../models/masters');



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

const generate_invoicenumber = async () => {
    const PREFIX = "INAI";

    // Generate 4-digit random number
    const randomNumber = Math.floor(1000 + Math.random() * 9000); // 1000 to 9999

    // Get the last invoice
    const last = await Invoice.findOne({
        order: [['invoice_id', 'DESC']],
        attributes: ['invoice_number']
    });

    let suffix = 1;

    if (last && last.invoice_number) {
        const parts = last.invoice_number.split('-');
        if (parts.length === 3) {
            const lastSuffix = parseInt(parts[2], 10);
            if (!isNaN(lastSuffix)) {
                suffix = lastSuffix + 1;
            }
        }
    }

    const paddedSuffix = String(suffix).padStart(3, '0'); // 001, 002, etc.
    const invoiceNumber = `${PREFIX}-${randomNumber}-${paddedSuffix}`;

    return invoiceNumber;
};

exports.add_invoice = async (req, res) => {

    var { customerId, shippingAddress, billingAddress, invoiceType, invoiceNo, currencyId, invoiceDate, orginOfGoods, loadingPort, dischargePort, destination, deliveryTerm, deliveryPlace, paymentTerm, shippingBillNo, shippingBillDate, paymentReferenceNo, ladingBill, laddingBillDate, netWeight, grossWeight, freight, inssuranceAmount, poDetails, InvoiceItems } = req.body;

    if (!customerId || !shippingAddress || !billingAddress || !invoiceType || !currencyId || !invoiceDate || !orginOfGoods || !loadingPort || !dischargePort || !destination || !deliveryTerm || !paymentTerm || !paymentReferenceNo || !freight || !inssuranceAmount) {
        return res.status(400).json({ message: "Missing Customer Details" })
    }

    var created_by_id = req.user_id;

    if (Array.isArray(poDetails) && poDetails.length > 0) {
        for (let podetail of poDetails) {
            if (!podetail.poNumber || !podetail.poDate) {
                return res.status(400).json({ message: "Missing Required Fields in Po Details" });
            }
        }
    }

    if (Array.isArray(InvoiceItems) && InvoiceItems.length > 0) {
        for (let invoice of InvoiceItems) {
            if (!invoice.productId || !invoice.hsnCode || !invoice.quantity || !invoice.price) {
                return res.status(400).json({ message: "Missing Required Fields Invoice Details" });
            }
        }
    }

    try {
        const check_customer = await Customer.findOne({
            where: { customerid: customerId }
        });

        if (!check_customer) {
            return res.status(400).json({ message: "Invalid Customer Details" });
        }

        const invoice_number = await generate_invoicenumber();

        const new_invoice = await Invoice.create({
            customer_id: customerId,
            billing_address: billingAddress,
            shipping_address: shippingAddress,
            invoice_type: invoiceType,
            invoice_number: invoice_number,
            currency: currencyId,
            invoice_date: invoiceDate,
            delivery_term: deliveryTerm,
            delivery_place: deliveryPlace,
            payment_term: paymentTerm,
            origin_of_goods: orginOfGoods,
            loading_port: loadingPort,
            discharge_port: dischargePort,
            destination_country: destination,
            shipping_bill_no: shippingBillNo,
            shipping_bill_date: shippingBillDate,
            payment_reference_no: paymentReferenceNo,
            bill_of_lading: ladingBill,
            bill_of_lading_date: laddingBillDate,
            freight_amount: freight,
            insurance_amount: inssuranceAmount,
            is_active: true,
            created_by_id: created_by_id
        });

        if (poDetails && Array.isArray(poDetails) && poDetails.length > 0) {
            await PoforInvoice.destroy({ where: { invoice_id: invoice_number } });

            const podetails = poDetails.map(podetail => ({
                invoice_id: invoice_number,
                po_id: podetail.poNumber,
                po_date: podetail.poDate
            }));

            await PoforInvoice.bulkCreate(podetails);
        }

        if (InvoiceItems && Array.isArray(InvoiceItems) && InvoiceItems.length > 0) {
            const padNumber = (num, size) => {
                let s = "000" + num;
                return s.substr(s.length - size);
            };

            await InvoiceItem.destroy({ where: { invoice_number: invoice_number } });

            const lastItem = await InvoiceItem.findOne({
                order: [['id', 'DESC']],
                attributes: ['invoice_item_code']
            });

            let lastCode = lastItem?.invoice_item_code || "INV-ITEM-000";
            let lastNumber = parseInt(lastCode.split("-")[2]) || 0;

            const invoice_items = [];

            for (let index = 0; index < InvoiceItems.length; index++) {
                const invoice = InvoiceItems[index];
                const nextNumber = lastNumber + index + 1;
                const invoice_item_code = `INV-ITEM-${padNumber(nextNumber, 3)}`;

                const quantity = invoice.quantity || 0;
                const amount = invoice.price || 0;
                const total_amount = quantity * amount;

                const product = await Products.findOne({
                    where: { unique_product_code: invoice.productId },
                    attributes: ['product_name']
                });

                if (!product) {
                    return res.status(400).json({
                        message: `Invalid product_id: ${invoice.productId} at index ${index}`
                    });
                }

                invoice_items.push({
                    invoice_item_code,
                    invoice_number: invoice_number,
                    item_id: invoice.productId,
                    item_name: product.product_name,
                    hsn_code: invoice.hsn_code,
                    quantity: quantity,
                    amount_per_unit: amount,
                    total_amount: total_amount,
                    package_no: invoice.package_no || null,
                    created_by_id
                });
            }

            await InvoiceItem.bulkCreate(invoice_items);
        }

        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT026",
            user_id: created_by_id,
            transaction_id: invoice_number,
            description: 'Added new Invoice ' + invoice_number + '',
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Added Successfully" });

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error to Add Invoice Details", reason: error.message });
    }
}

exports.get_all_invoices = async (req, res) => {

    try {
        const createdById = req.user_id;
        const searchKeyword = req.query.searchKeyword || "";
        const startDate = req.query.startDate || "";
        const endDate = req.query.endDate || "";

        let whereCondition = {
            created_by_id: createdById,
            is_active: true,
        };

        if (startDate && endDate) {
            const start = new Date(startDate);
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);

            whereCondition.created_on = {
                [Op.between]: [start, end]
            };
        } else if (startDate) {
            const start = new Date(startDate);
            whereCondition.created_on = {
                [Op.gte]: start
            };
        } else if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            whereCondition.created_on = {
                [Op.lte]: end
            };
        }

        const invoices = await Invoice.findAll({
            where: whereCondition,
            include: [
                {
                    model: Customer,
                    attributes: ["business_name", "contact_person", "contact_number", "email", "designation"],
                    as: 'CustomerDetails'
                },
                {
                    model: CustomerAddress,
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "city", "state", "country", "postal_code", "landmark", "maplink", "address_type"],
                    as: 'BillingAddress'
                },
                {
                    model: CustomerAddress,
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "city", "state", "country", "postal_code", "landmark", "maplink", "address_type"],
                    as: 'ShippingAddress'
                },
                {
                    model: InvoiceTypes,
                    attributes: ['type'],
                    as: 'InvoiceType'
                },
                {
                    model: CommonCountry,
                    attributes: ['currency_code'],
                    as: 'CurrecyDetail'
                },
                {
                    model: DeliveryTerm,
                    attributes: ['type'],
                    as: 'DeliveryTerm'
                },
                {
                    model: PaymentTerm,
                    attributes: ['type'],
                    as: 'PaymentTerm'
                },
                {
                    model: CommonCountry,
                    attributes: ['code'],
                    as: 'OriginofGoods'
                },
                {
                    model: Ports,
                    attributes: ['port_code'],
                    as: 'LoadingPort'
                },
                {
                    model: Ports,
                    attributes: ['port_code'],
                    as: 'DischargePort'
                },
                {
                    model: CommonCountry,
                    attributes: ['code'],
                    as: 'DestinationCountry'
                },
                {
                    model: PoforInvoice,
                    attributes: ['id', 'po_id', 'po_date'],
                    as: "POs",
                },
                {
                    model: InvoiceItem,
                    attributes: ['id', 'invoice_item_code', 'item_name', 'hsn_code', 'quantity', 'amount_per_unit', 'total_amount', 'package_no'],
                    as: "InvoiceItems" // must match the alias from hasMany
                }
            ]
        });

        const formattedInvoices = invoices.map(inv => ({
            customerId: inv.customer_id,
            customerDetails: inv.CustomerDetails ? {
                business_name: inv.CustomerDetails.business_name,
                contact_person: inv.CustomerDetails.contact_person,
                contact_number: inv.CustomerDetails.contact_number,
                email: inv.CustomerDetails.email,
                designation: inv.CustomerDetails.designation,
            } : null,
            shippingAddress: inv.ShippingAddress ? {
                id: inv.ShippingAddress.id,
                address_line1: inv.ShippingAddress.address_line1,
                address_line2: inv.ShippingAddress.address_line2,
                address_line3: inv.ShippingAddress.address_line3,
                address_line4: inv.ShippingAddress.address_line4,
                city: inv.ShippingAddress.city,
                state: inv.ShippingAddress.state,
                country: inv.ShippingAddress.country,
                postal_code: inv.ShippingAddress.postal_code,
                landmark: inv.ShippingAddress.landmark,
                maplink: inv.ShippingAddress.maplink,
            } : null,
            billingAddress: inv.BillingAddress ? {
                id: inv.BillingAddress.id,
                address_line1: inv.BillingAddress.address_line1,
                address_line2: inv.BillingAddress.address_line2,
                address_line3: inv.BillingAddress.address_line3,
                address_line4: inv.BillingAddress.address_line4,
                city: inv.BillingAddress.city,
                state: inv.BillingAddress.state,
                country: inv.BillingAddress.country,
                postal_code: inv.BillingAddress.postal_code,
                landmark: inv.BillingAddress.landmark,
                maplink: inv.BillingAddress.maplink,
            } : null,
            invoiceType: inv.InvoiceType ? inv.InvoiceType.type : null,
            invoiceTypeId: inv.invoice_type,
            invoiceNo: inv.invoice_number,
            currencyId: inv.currency || null,
            currency: inv.CurrecyDetail ? inv.CurrecyDetail.currency_code : null,
            invoiceDate: inv.invoice_date ? moment(inv.invoice_date).format('DD-MM-YYYY') : null,
            originOfGoods: inv.OriginofGoods ? {
                text: inv.OriginofGoods.code,
                id: inv.origin_of_goods
            } : null,
            loadingPort: inv.LoadingPort ? inv.LoadingPort.port_code : null,
            loadingPortId: inv.loading_port || null,
            dischargePort: inv.DischargePort ? inv.DischargePort.port_code : null,
            dischargePortId: inv.discharge_port || null,
            destinationId: inv.destination_country,
            destination: inv.DestinationCountry ? inv.DestinationCountry.code : null,
            deliveryTerm: inv.DeliveryTerm ? inv.DeliveryTerm.type : null,
            deliveryTermId: inv.delivery_term,
            deliveryPlace: inv.delivery_place || null,
            paymentTermId: inv.payment_term || null,
            paymentTerm: inv.PaymentTerm ? inv.PaymentTerm.type : null,
            shippingBillNo: inv.shipping_bill_no,
            shippingBillDate: inv.shipping_bill_date ? moment(inv.shipping_bill_date).format('DD-MM-YYYY') : null,
            paymentReferenceNo: inv.payment_reference_no,
            ladingBill: inv.bill_of_lading,
            ladingBillDate: inv.bill_of_lading_date ? moment(inv.bill_of_lading_date).format('DD-MM-YYYY') : null,
            noOfPackage: null,
            netWeight: null,
            grossWeight: null,
            freight: inv.freight_amount,
            insuranceAmount: inv.insurance_amount,
            pos: inv.POs ? inv.POs.map(po => ({
                poNumber: po.po_id,
                poDate: po.po_date ? moment(po.po_date).format('DD-MM-YYYY') : null,
            })) : [],
            products: inv.InvoiceItems ? inv.InvoiceItems.map(item => ({
                productId: item.invoice_item_code,
                hsnCode: item.hsn_code,
                quantity: item.quantity,
                price: item.amount_per_unit,
                packageNo: item.package_no
            })) : []
        }));

        return res.json(formattedInvoices);
    } catch (error) {
        return res.status(400).json({ message: "Error to Get Invoice Details", reason: error.message });
    }
}

exports.get_single_invoices = async (req, res) => {

    try {
        var invoice_number = req.params.invoice_number;

        const invoices = await Invoice.findAll({
            where: { invoice_number: invoice_number },
            include: [
                {
                    model: Customer,
                    attributes: ["business_name", "contact_person", "contact_number", "email", "designation"],
                    as: 'CustomerDetails'
                },
                {
                    model: CustomerAddress,
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "city", "state", "country", "postal_code", "landmark", "maplink", "address_type"],
                    as: 'BillingAddress'
                },
                {
                    model: CustomerAddress,
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "city", "state", "country", "postal_code", "landmark", "maplink", "address_type"],
                    as: 'ShippingAddress'
                },
                {
                    model: InvoiceTypes,
                    attributes: ['type'],
                    as: 'InvoiceType'
                },
                {
                    model: CommonCountry,
                    attributes: ['currency_code'],
                    as: 'CurrecyDetail'
                },
                {
                    model: DeliveryTerm,
                    attributes: ['type'],
                    as: 'DeliveryTerm'
                },
                {
                    model: PaymentTerm,
                    attributes: ['type'],
                    as: 'PaymentTerm'
                },
                {
                    model: CommonCountry,
                    attributes: ['code'],
                    as: 'OriginofGoods'
                },
                {
                    model: Ports,
                    attributes: ['port_code'],
                    as: 'LoadingPort'
                },
                {
                    model: Ports,
                    attributes: ['port_code'],
                    as: 'DischargePort'
                },
                {
                    model: CommonCountry,
                    attributes: ['code'],
                    as: 'DestinationCountry'
                },
                {
                    model: PoforInvoice,
                    attributes: ['id', 'po_id', 'po_date'],
                    as: "POs",
                },
                {
                    model: InvoiceItem,
                    attributes: ['id', 'invoice_item_code', 'item_name', 'hsn_code', 'quantity', 'amount_per_unit', 'total_amount', 'package_no'],
                    as: "InvoiceItems" // must match the alias from hasMany
                }
            ]
        });

        const formattedInvoices = invoices.map(inv => ({
            customerId: inv.customer_id,
            customerDetails: inv.CustomerDetails ? {
                business_name: inv.CustomerDetails.business_name,
                contact_person: inv.CustomerDetails.contact_person,
                contact_number: inv.CustomerDetails.contact_number,
                email: inv.CustomerDetails.email,
                designation: inv.CustomerDetails.designation,
            } : null,
            shippingAddress: inv.ShippingAddress ? {
                id: inv.ShippingAddress.id,
                address_line1: inv.ShippingAddress.address_line1,
                address_line2: inv.ShippingAddress.address_line2,
                address_line3: inv.ShippingAddress.address_line3,
                address_line4: inv.ShippingAddress.address_line4,
                city: inv.ShippingAddress.city,
                state: inv.ShippingAddress.state,
                country: inv.ShippingAddress.country,
                postal_code: inv.ShippingAddress.postal_code,
                landmark: inv.ShippingAddress.landmark,
                maplink: inv.ShippingAddress.maplink,
            } : null,
            billingAddress: inv.BillingAddress ? {
                id: inv.BillingAddress.id,
                address_line1: inv.BillingAddress.address_line1,
                address_line2: inv.BillingAddress.address_line2,
                address_line3: inv.BillingAddress.address_line3,
                address_line4: inv.BillingAddress.address_line4,
                city: inv.BillingAddress.city,
                state: inv.BillingAddress.state,
                country: inv.BillingAddress.country,
                postal_code: inv.BillingAddress.postal_code,
                landmark: inv.BillingAddress.landmark,
                maplink: inv.BillingAddress.maplink,
            } : null,
            invoiceType: inv.InvoiceType ? inv.InvoiceType.type : null,
            invoiceTypeId: inv.invoice_type,
            invoiceNo: inv.invoice_number,
            currencyId: inv.currency || null,
            currency: inv.CurrecyDetail ? inv.CurrecyDetail.currency_code : null,
            invoiceDate: inv.invoice_date ? moment(inv.invoice_date).format('DD-MM-YYYY') : null,
            originOfGoods: inv.OriginofGoods ? {
                text: inv.OriginofGoods.code,
                id: inv.origin_of_goods
            } : null,
            loadingPort: inv.LoadingPort ? inv.LoadingPort.port_code : null,
            loadingPortId: inv.loading_port || null,
            dischargePort: inv.DischargePort ? inv.DischargePort.port_code : null,
            dischargePortId: inv.discharge_port || null,
            destinationId: inv.destination_country,
            destination: inv.DestinationCountry ? inv.DestinationCountry.code : null,
            deliveryTerm: inv.DeliveryTerm ? inv.DeliveryTerm.type : null,
            deliveryTermId: inv.delivery_term,
            deliveryPlace: inv.delivery_place || null,
            paymentTermId: inv.payment_term || null,
            paymentTerm: inv.PaymentTerm ? inv.PaymentTerm.type : null,
            shippingBillNo: inv.shipping_bill_no,
            shippingBillDate: inv.shipping_bill_date ? moment(inv.shipping_bill_date).format('DD-MM-YYYY') : null,
            paymentReferenceNo: inv.payment_reference_no,
            ladingBill: inv.bill_of_lading,
            ladingBillDate: inv.bill_of_lading_date ? moment(inv.bill_of_lading_date).format('DD-MM-YYYY') : null,
            noOfPackage: null,
            netWeight: null,
            grossWeight: null,
            freight: inv.freight_amount,
            insuranceAmount: inv.insurance_amount,
            pos: inv.POs ? inv.POs.map(po => ({
                poNumber: po.po_id,
                poDate: po.po_date ? moment(po.po_date).format('DD-MM-YYYY') : null,
            })) : [],
            products: inv.InvoiceItems ? inv.InvoiceItems.map(item => ({
                productId: item.invoice_item_code,
                hsnCode: item.hsn_code,
                quantity: item.quantity,
                price: item.amount_per_unit,
                packageNo: item.package_no
            })) : []
        }));

        return res.json(formattedInvoices[0] || {});
    } catch (error) {
        return res.status(400).json({ message: "Error to Get Invoice Details", reason: error.message });
    }
}