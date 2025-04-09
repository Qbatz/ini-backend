const { Customer, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails } = require('../models/customers')
const { AddressType } = require('../models/address');
const { Op, fn, col, where } = require("sequelize");
const { Title, CommonCountry } = require('../models/masters');
const sequelize = require('../config/db');

exports.add_customersall = async (req, res) => {

    var created_by_id = req.user_id;
    const { businessName, contactPerson, contactNumber, emailId, designation, gstVat, CIN, PAN, TAN, statusOfFirm, natureOfBusiness, address, country, country_code, bankDetails, additionalContactInfo, title } = req.body;

    if (!businessName || !contactPerson || !contactNumber || !emailId || !designation || !gstVat || !PAN || !statusOfFirm || !natureOfBusiness || !title || !country_code) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    if (address) {
        if (!Array.isArray(address) || address.length === 0) {
            return res.status(400).json({ message: "Invalid Address Details" });
        }

        for (let addre of address) {
            if (!addre.doorNo || !addre.postalCode || !addre.addressType) {
                return res.status(400).json({ message: "Missing Required Fields in Address Details" });
            }
        }
    }

    if (bankDetails) {
        if (!Array.isArray(bankDetails) || bankDetails.length === 0) {
            return res.status(400).json({ message: "Invalid Address Details" });
        }

        for (let banks of bankDetails) {
            if (!banks.name || !banks.currency || !banks.accountNo || !banks.ifscCode) {
                return res.status(400).json({ message: "Missing Required Fields in Bank Details" });
            }
        }
    }

    if (additionalContactInfo) {
        if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
            return res.status(400).json({ message: "Invalid Address Details" });
        }

        for (let adds_detail of additionalContactInfo) {
            if (!adds_detail.title || !adds_detail.name || !adds_detail.contactNumber || !adds_detail.contactEmail || !adds_detail.designation) {
                return res.status(400).json({ message: "Missing Required Fields in Additional Contact Info" });
            }
        }
    }

    try {
        const verify_customer = await Customer.findOne({ where: { email: emailId } });

        if (verify_customer) {
            return res.status(400).json({ message: "Mail Id Already Registered Us" });
        }

        let customerid;
        let isUnique = false;

        while (!isUnique) {
            const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
            customerid = `CUS-${randomNumber}`;

            const existingCustomer = await Customer.findOne({ where: { email: emailId } });

            if (!existingCustomer) {
                isUnique = true;
            }
        }

        var new_customer = await Customer.create({
            business_name: businessName,
            contact_person: contactPerson,
            contact_number: Number(contactNumber),
            email: emailId,
            customerid: customerid,
            designation: designation,
            gst_vat: gstVat,
            country: country || 'IN',
            cin: CIN || 0,
            pan: PAN,
            tan: TAN || 0,
            statusoffirm: statusOfFirm,
            natureof_business: Array.isArray(natureOfBusiness) ? natureOfBusiness.join(',') : natureOfBusiness,
            country_code: country_code || 1,
            title: title,
            created_by_id: created_by_id,
            updated_by_id: created_by_id
        });

        if (additionalContactInfo && Array.isArray(additionalContactInfo) && additionalContactInfo.length > 0) {

            var additionalContacts = additionalContactInfo.map(contact => ({
                customerid: customerid,
                name: contact.name,
                title: contact.title,
                number: contact.contactNumber,
                email: contact.contactEmail,
                designation: contact.designation,
                country: contact.country || 'IN',
                country_code: contact.country_code || 1,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            }));
            await AdditionalCustomersContactInfo.bulkCreate(additionalContacts);

        }

        if (address && Array.isArray(address) && address.length > 0) {

            var addressDetails = address.map(address => ({
                user_id: customerid,
                address_type: address.addressType,
                address_line1: address.doorNo,
                address_line2: address.street,
                address_line3: address.locality,
                address_line4: address.address4,
                city: address.city,
                state: address.state,
                country: address.country,
                postal_code: address.postalCode,
                landmark: address.landMark,
                maplink: address.mapLink,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            }));

            await CustomerAddress.bulkCreate(addressDetails);
        }

        if (bankDetails && Array.isArray(bankDetails) && bankDetails.length > 0) {

            await customer_BankDetails.destroy({ where: { user_id: customerid } });

            var bank_details = bankDetails.map(banks => ({
                user_id: customerid,
                name: banks.name,
                account_number: banks.accountNo,
                bank_name: banks.bankName,
                ifsc_code: banks.ifscCode,
                address_line1: banks.address1,
                address_line2: banks.address2,
                address_line3: banks.address3,
                country: banks.country || 'IN',
                routing_bank: banks.routingBank,
                swift_code: banks.swiftCode || " ",
                currency: banks.currency || 1,
                isPrimary: banks.isPrimary || false,
                routing_bank_address: banks.routingBankAddress,
                routing_account_indusind: banks.routingAccountIndusand,
                iban: banks.iban,
                intermediary_swift_code: banks.intermediary_swift_code,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            }));

            await customer_BankDetails.bulkCreate(bank_details);
        }

        return res.status(200).json({ message: "Client added successfully", clientId: customerid });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.all_customers = async (req, res) => {
    try {
        const createdById = req.user_id;
        const searchKeyword = req.query.searchKeyword || "";
        const startDate = req.query.startDate || "";
        const endDate = req.query.endDate || "";

        let whereCondition = {
            created_by_id: createdById,
            is_active: true,
            contact_person: {
                [Op.like]: `%${searchKeyword.toLowerCase()}%`
            }
        };

        if (startDate && endDate) {
            whereCondition.created_on = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        } else if (startDate) {
            whereCondition.created_on = {
                [Op.gte]: new Date(startDate) // Greater than or equal to startDate
            };
        } else if (endDate) {
            whereCondition.created_on = {
                [Op.lte]: new Date(endDate) // Less than or equal to endDate
            };
        }

        const customers = await Customer.findAll({
            where: whereCondition,
            include: [
                {
                    model: CustomerAddress,
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "city", "state", "country", "postal_code", "landmark", "maplink", "address_type"],
                    include: [
                        {
                            model: AddressType,
                            as: "AddressType",
                            attributes: ["type"],
                        },
                    ],
                },
                {
                    model: customer_BankDetails,
                    attributes: ["name", "account_number", "bank_name", "ifsc_code", "address_line1", "address_line2", "address_line3", "country", "routing_bank", "swift_code", "routing_bank_address", "routing_account_indusind", "isPrimary", "intermediary_swift_code", "iban", "currency"],
                    order: [["isPrimary", "DESC"]]
                },
                {
                    model: AdditionalCustomersContactInfo,
                    attributes: ["name", "number", "email", "designation", "country", "title", "country_code"],
                    include: [
                        {
                            model: Title,
                            as: "title_info",
                            attributes: ["title"],
                        },
                        {
                            model: CommonCountry,
                            as: "customer_additional",
                            attributes: ["id", "name", "code", "phone"],
                        },
                    ],
                },
                {
                    model: Title,
                    as: "customer_title_info",
                    attributes: ["title"],
                },
                {
                    model: CommonCountry,
                    as: "customer_countrycode",
                    attributes: ["id", "name", "code", "phone"],
                }
            ],
            order: [['id', 'DESC']]
        });

        const allBusinessTypes = await NameofBussiness.findAll({ raw: true });

        const formattedCustomers = customers.map(customer => {
            const businessIds = customer.natureof_business
                ? customer.natureof_business.split(',').map(id => parseInt(id.trim()))
                : [];

            const matchedBusinesses = allBusinessTypes.filter(biz =>
                businessIds.includes(parseInt(biz.id))
            );

            return {
                clientId: customer.customerid || "",
                businessName: customer.business_name || "",
                contactPerson: customer.contact_person || "",
                contactNumber: customer.contact_number || "",
                emailId: customer.email || "",
                designation: customer.designation || "",
                gstVat: customer.gst_vat || "",
                CIN: customer.cin || "",
                PAN: customer.pan || "",
                TAN: customer.tan || "",
                title_id: customer.title || "",
                title: customer.customer_title_info ? customer.customer_title_info.title : "",
                country_code_id: customer.country_code || "",
                country_code: customer.customer_countrycode ? customer.customer_countrycode.phone : "",
                statusOfFirm: customer.statusoffirm || "",
                natureOfBusiness: businessIds || "",
                natureOfBusinessNames: matchedBusinesses.map(b => b.type),
                address: (customer.customer_addresses || []).map(addr => ({
                    doorNo: addr.address_line1 || "",
                    street: addr.address_line2 || "",
                    locality: addr.address_line3 || "",
                    address4: addr.address_line4 || "",
                    city: addr.city || "",
                    state: addr.state || "",
                    country: addr.country || "",
                    postalCode: addr.postal_code || "",
                    landMark: addr.landmark || "",
                    mapLink: addr.maplink || "",
                    addressType: addr.AddressType ? addr.AddressType.type : "",
                })),
                bankDetails: (customer.customer_bank_details || []).map(bank => ({
                    name: bank.name || "",
                    accountNo: bank.account_number || "",
                    bankName: bank.bank_name || "",
                    ifscCode: bank.ifsc_code || "",
                    address1: bank.address_line1 || "",
                    address2: bank.address_line2 || "",
                    address3: bank.address_line3 || "",
                    country: bank.country || "",
                    routingBank: bank.routing_bank || "",
                    swiftCode: bank.swift_code || "",
                    isPrimary: bank.isPrimary || false,
                    routingBankAddress: bank.routing_bank_address || "",
                    routingAccountIndusand: bank.routing_account_indusind || "",
                    iban: bank.iban || "",
                    currency: bank.currency || "",
                    intermediary_swift_code: bank.intermediary_swift_code || ""
                })),
                additionalContactInfo: (customer.additional_customers_contact_infos || []).map(contact => ({
                    name: contact.name || "",
                    contactNumber: contact.number || "",
                    contactEmail: contact.email || "",
                    designation: contact.designation || "",
                    country: contact.country || "",
                    title_id: contact.title || "",
                    title: contact.title_info ? contact.title_info.title : "",
                    country_codeid: contact.country_code || "",
                    country_code: contact.customer_additional ? contact.customer_additional.phone : ""
                }))
            };
        });


        // Format response safely
        // const formattedCustomers = customers.map(customer => ({
        //     clientId: customer.customerid || "",
        //     businessName: customer.business_name || "",
        //     contactPerson: customer.contact_person || "",
        //     contactNumber: customer.contact_number || "",
        //     emailId: customer.email || "",
        //     designation: customer.designation || "",
        //     gstVat: customer.gst_vat || "",
        //     CIN: customer.cin || "",
        //     PAN: customer.pan || "",
        //     TAN: customer.tan || "",
        //     title_id: customer.title || "",
        //     title: customer.customer_title_info ? customer.customer_title_info.title : "",
        //     country_code_id: customer.country_code || "",
        //     country_code: customer.customer_countrycode ? customer.customer_countrycode.phone : "",
        //     statusOfFirm: customer.statusoffirm || "",
        //     natureOfBusiness: customer.natureof_business || "",
        //     natureOfBusinessNames: (customer.nature_of_business_names || []).map(b => b.type).join(", "),
        //     address: (customer.customer_addresses || []).map(addr => ({
        //         doorNo: addr.address_line1 || "",
        //         street: addr.address_line2 || "",
        //         locality: addr.address_line3 || "",
        //         address4: addr.address_line4 || "",
        //         city: addr.city || "",
        //         state: addr.state || "",
        //         country: addr.country || "",
        //         postalCode: addr.postal_code || "",
        //         landMark: addr.landmark || "",
        //         mapLink: addr.maplink || "",
        //         addressType: addr.AddressType ? addr.AddressType.type : "",
        //     })),
        //     bankDetails: (customer.customer_bank_details || []).map(bank => ({
        //         name: bank.name || "",
        //         accountNo: bank.account_number || "",
        //         bankName: bank.bank_name || "",
        //         ifscCode: bank.ifsc_code || "",
        //         address1: bank.address_line1 || "",
        //         address2: bank.address_line2 || "",
        //         address3: bank.address_line3 || "",
        //         country: bank.country || "",
        //         routingBank: bank.routing_bank || "",
        //         swiftCode: bank.swift_code || "",
        //         isPrimary: bank.isPrimary || false,
        //         routingBankAddress: bank.routing_bank_address || "",
        //         routingAccountIndusand: bank.routing_account_indusind || "",
        //         iban: bank.iban || "",
        //         currency: bank.currency || "",
        //         intermediary_swift_code: bank.intermediary_swift_code || ""
        //     })),
        //     additionalContactInfo: (customer.additional_customers_contact_infos || []).map(contact => ({
        //         name: contact.name || "",
        //         contactNumber: contact.number || "",
        //         contactEmail: contact.email || "",
        //         designation: contact.designation || "",
        //         country: contact.country || "",
        //         title_id: contact.title || "",
        //         title: contact.title_info ? contact.title_info.title : "",
        //         country_codeid: contact.country_code || "",
        //         country_code: contact.customer_additional ? contact.customer_additional.phone : ""
        //     }))
        // }));

        res.json({ customers: formattedCustomers });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(400).json({ message: error.message });
    }
};

exports.one_customer = async (req, res) => {

    const customer_id = req.params.customer_id;

    if (!customer_id) {
        return res.status(400).json({ message: "Missing Customer Id" });
    }
    try {
        const customers = await Customer.findAll({
            where: {
                customerid: customer_id,
            },
            include: [
                {
                    model: CustomerAddress,
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "city", "state", "country", "postal_code", "landmark", "maplink", "address_type"],
                    include: [
                        {
                            model: AddressType,
                            as: "AddressType",
                            attributes: ["type"],
                        },
                    ],
                },
                {
                    model: customer_BankDetails,
                    attributes: ["name", "account_number", "bank_name", "ifsc_code", "address_line1", "address_line2", "address_line3", "country", "routing_bank", "swift_code", "routing_bank_address", "routing_account_indusind", "isPrimary", "intermediary_swift_code", "iban", "currency"],
                    order: [["isPrimary", "DESC"]]
                },
                {
                    model: AdditionalCustomersContactInfo,
                    attributes: ["name", "number", "email", "designation", "country", "title", "country_code"],
                    include: [
                        {
                            model: Title,
                            as: "title_info",
                            attributes: ["title"],
                        },
                        {
                            model: CommonCountry,
                            as: "customer_additional",
                            attributes: ["id", "name", "code", "phone"],
                        },
                    ],
                },
                {
                    model: Title,
                    as: "customer_title_info",
                    attributes: ["title"],
                },
                {
                    model: CommonCountry,
                    as: "customer_countrycode",
                    attributes: ["id", "name", "code", "phone"],
                },
            ],
            order: [[customer_BankDetails, "isPrimary", "DESC"]]
        });

        const allBusinessTypes = await NameofBussiness.findAll({ raw: true });

        // Format response safely
        // const formattedCustomers = customers.map(customer => ({

        //     clientId: customer.customerid || "",
        //     businessName: customer.business_name || "",
        //     contactPerson: customer.contact_person || "",
        //     contactNumber: customer.contact_number || "",
        //     emailId: customer.email || "",
        //     designation: customer.designation || "",
        //     gstVat: customer.gst_vat || "",
        //     CIN: customer.cin || "",
        //     PAN: customer.pan || "",
        //     TAN: customer.tan || "",
        //     title_id: customer.title || "",
        //     title: customer.customer_title_info ? customer.customer_title_info.title : "",
        //     country_code_id: customer.country_code || "",
        //     country_code: customer.customer_countrycode ? customer.customer_countrycode.phone : "",
        //     statusOfFirm: customer.statusoffirm || "",
        //     natureOfBusiness: customer.natureof_business || "",
        //     address: (customer.customer_addresses || []).map(addr => ({
        //         doorNo: addr.address_line1 || "",
        //         street: addr.address_line2 || "",
        //         locality: addr.address_line3 || "",
        //         address4: addr.address_line4 || "",
        //         city: addr.city || "",
        //         state: addr.state || "",
        //         country: addr.country || "",
        //         postalCode: addr.postal_code || "",
        //         landMark: addr.landmark || "",
        //         mapLink: addr.maplink || "",
        //         addressType: addr.AddressType ? addr.AddressType.type : ""
        //     })),
        //     bankDetails: (customer.customer_bank_details || []).map(bank => ({
        //         name: bank.name || "",
        //         accountNo: bank.account_number || "",
        //         bankName: bank.bank_name || "",
        //         ifscCode: bank.ifsc_code || "",
        //         address1: bank.address_line1 || "",
        //         address2: bank.address_line2 || "",
        //         address3: bank.address_line3 || "",
        //         country: bank.country || "",
        //         routingBank: bank.routing_bank || "",
        //         swiftCode: bank.swift_code || "",
        //         isPrimary: bank.isPrimary || false,
        //         routingBankAddress: bank.routing_bank_address || "",
        //         routingAccountIndusand: bank.routing_account_indusind || "",
        //         iban: bank.iban || "",
        //         currency: bank.currency || "",
        //         intermediary_swift_code: bank.intermediary_swift_code || ""
        //     })),
        //     additionalContactInfo: (customer.additional_customers_contact_infos || []).map(contact => ({
        //         name: contact.name || "",
        //         contactNumber: contact.number || "",
        //         contactEmail: contact.email || "",
        //         designation: contact.designation || "",
        //         country: contact.country || "",
        //         title_id: contact.title || "",
        //         title: contact.title_info ? contact.title_info.title : "",
        //         country_codeid: contact.country_code || "",
        //         country_code: contact.customer_additional ? contact.customer_additional.phone : ""
        //     }))
        // }));

        const formattedCustomers = customers.map(customer => {
            const businessIds = customer.natureof_business
                ? customer.natureof_business.split(',').map(id => parseInt(id.trim()))
                : [];

            const matchedBusinesses = allBusinessTypes.filter(biz =>
                businessIds.includes(parseInt(biz.id))
            );

            return {
                clientId: customer.customerid || "",
                businessName: customer.business_name || "",
                contactPerson: customer.contact_person || "",
                contactNumber: customer.contact_number || "",
                emailId: customer.email || "",
                designation: customer.designation || "",
                gstVat: customer.gst_vat || "",
                CIN: customer.cin || "",
                PAN: customer.pan || "",
                TAN: customer.tan || "",
                title_id: customer.title || "",
                title: customer.customer_title_info ? customer.customer_title_info.title : "",
                country_code_id: customer.country_code || "",
                country_code: customer.customer_countrycode ? customer.customer_countrycode.phone : "",
                statusOfFirm: customer.statusoffirm || "",
                natureOfBusiness: businessIds || "",
                natureOfBusinessNames: matchedBusinesses.map(b => b.type),
                address: (customer.customer_addresses || []).map(addr => ({
                    doorNo: addr.address_line1 || "",
                    street: addr.address_line2 || "",
                    locality: addr.address_line3 || "",
                    address4: addr.address_line4 || "",
                    city: addr.city || "",
                    state: addr.state || "",
                    country: addr.country || "",
                    postalCode: addr.postal_code || "",
                    landMark: addr.landmark || "",
                    mapLink: addr.maplink || "",
                    addressType: addr.AddressType ? addr.AddressType.type : "",
                })),
                bankDetails: (customer.customer_bank_details || []).map(bank => ({
                    name: bank.name || "",
                    accountNo: bank.account_number || "",
                    bankName: bank.bank_name || "",
                    ifscCode: bank.ifsc_code || "",
                    address1: bank.address_line1 || "",
                    address2: bank.address_line2 || "",
                    address3: bank.address_line3 || "",
                    country: bank.country || "",
                    routingBank: bank.routing_bank || "",
                    swiftCode: bank.swift_code || "",
                    isPrimary: bank.isPrimary || false,
                    routingBankAddress: bank.routing_bank_address || "",
                    routingAccountIndusand: bank.routing_account_indusind || "",
                    iban: bank.iban || "",
                    currency: bank.currency || "",
                    intermediary_swift_code: bank.intermediary_swift_code || ""
                })),
                additionalContactInfo: (customer.additional_customers_contact_infos || []).map(contact => ({
                    name: contact.name || "",
                    contactNumber: contact.number || "",
                    contactEmail: contact.email || "",
                    designation: contact.designation || "",
                    country: contact.country || "",
                    title_id: contact.title || "",
                    title: contact.title_info ? contact.title_info.title : "",
                    country_codeid: contact.country_code || "",
                    country_code: contact.customer_additional ? contact.customer_additional.phone : ""
                }))
            };
        });

        res.json(formattedCustomers[0] || {});
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(400).json({ message: error.message });
    }

}

exports.updatecustomer = async (req, res) => {

    try {

        var clientId = req.params.customer_id || req.body.clientId

        const { businessName, contactPerson, contactNumber, emailId, designation, gstVat, CIN, PAN, TAN, statusOfFirm, natureOfBusiness, address, bankDetails, additionalContactInfo, title, country_code } = req.body;
        var updated_by_id = req.user_id;

        if (!title || !country_code || !businessName || !contactPerson || !contactNumber || !emailId || !designation || !gstVat || !PAN || !statusOfFirm || !natureOfBusiness) {
            return res.status(400).json({ message: "Missing Required Fields" });
        }

        if (!clientId) {
            return res.status(400).json({ message: "Client ID is required" });
        }

        console.log(address);

        if (address) {
            if (!Array.isArray(address) || address.length === 0) {
                return res.status(400).json({ message: "Invalid Address Details" });
            }

            for (let addre of address) {
                if (!addre.doorNo || !addre.postalCode || !addre.addressType) {
                    return res.status(400).json({ message: "Missing Required Fields in Address Details" });
                }
            }
        }

        if (bankDetails) {
            if (!Array.isArray(bankDetails) || bankDetails.length === 0) {
                return res.status(400).json({ message: "Invalid Bank Details" });
            }

            for (let banks of bankDetails) {
                if (!banks.name || !banks.currency || !banks.accountNo || !banks.ifscCode) {
                    return res.status(400).json({ message: "Missing Required Fields in Bank Details" });
                }
            }
        }

        if (additionalContactInfo) {
            if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
                return res.status(400).json({ message: "Invalid Address Details" });
            }

            for (let adds_detail of additionalContactInfo) {
                if (!adds_detail.title || !adds_detail.name || !adds_detail.contactNumber || !adds_detail.contactEmail || !adds_detail.designation) {
                    return res.status(400).json({ message: "Missing Required Fields in Additional Contact Info" });
                }
            }
        }

        let customer = await Customer.findOne({ where: { customerid: clientId } });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
        }

        const verify_customer = await Customer.findOne({
            where: {
                email: emailId,
                customerid: { [Op.ne]: clientId }
            }
        });

        if (verify_customer) {
            return res.status(400).json({ message: "Mail Id Already Registered Us" });
        }

        await customer.update({
            business_name: businessName,
            contact_person: contactPerson,
            contact_number: Number(contactNumber),
            email: emailId,
            designation: designation,
            gst_vat: gstVat,
            cin: CIN,
            pan: PAN,
            tan: TAN,
            title: title,
            country_code: country_code,
            statusoffirm: statusOfFirm,
            natureof_business: Array.isArray(natureOfBusiness) ? natureOfBusiness.join(',') : natureOfBusiness,
            updated_by_id: updated_by_id
        });

        if (additionalContactInfo && Array.isArray(additionalContactInfo)) {
            await AdditionalCustomersContactInfo.destroy({ where: { customerid: clientId } });
            const additionalContacts = additionalContactInfo.map(contact => ({
                customerid: clientId,
                name: contact.name,
                title: contact.title,
                number: contact.contactNumber,
                email: contact.contactEmail,
                designation: contact.designation,
                country: contact.country || 'IN',
                country_code: contact.country_code || 1,
                created_by_id: updated_by_id,
                updated_by_id: updated_by_id
            }));
            await AdditionalCustomersContactInfo.bulkCreate(additionalContacts);
        }

        if (address && Array.isArray(address)) {
            await CustomerAddress.destroy({ where: { user_id: clientId } });
            const addressDetails = address.map(addr => ({
                user_id: clientId,
                address_type: addr.addressType,
                address_line1: addr.doorNo,
                address_line2: addr.street,
                address_line3: addr.locality,
                address_line4: addr.address4,
                city: addr.city,
                state: addr.state,
                country: addr.country,
                postal_code: addr.postalCode,
                landmark: addr.landMark,
                maplink: addr.mapLink || null,
                created_by_id: updated_by_id,
                updated_by_id: updated_by_id
            }));
            await CustomerAddress.bulkCreate(addressDetails);
        }

        if (bankDetails && Array.isArray(bankDetails) && bankDetails.length > 0) {

            await customer_BankDetails.destroy({ where: { user_id: clientId } });

            var bank_details = bankDetails.map(banks => ({
                user_id: clientId,
                name: banks.name || ' ',
                currency: banks.currency,
                account_number: banks.accountNo,
                bank_name: banks.bankName,
                ifsc_code: banks.ifscCode,
                address_line1: banks.address1,
                address_line2: banks.address2,
                address_line3: banks.address3,
                country: banks.country || 'IN',
                routing_bank: banks.routingBank,
                swift_code: banks.swiftCode || " ",
                isPrimary: banks.isPrimary || false,
                routing_bank_address: banks.routingBankAddress,
                routing_account_indusind: banks.routingAccountIndusand,
                iban: banks.iban,
                intermediary_swift_code: banks.intermediary_swift_code,
                created_by_id: updated_by_id,
                updated_by_id: updated_by_id
            }));

            await customer_BankDetails.bulkCreate(bank_details);
        }

        return res.status(200).json({ message: "Customer updated successfully", clientId: clientId });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

exports.delete_customer = async (req, res) => {

    var customer_id = req.params.customer_id;

    if (!customer_id) {
        return res.status(400).json({ message: "Missing Client Details" })
    }

    try {
        var check_customer = await Customer.findOne({ where: { customerid: customer_id } });

        if (check_customer) {

            await Customer.update(
                {
                    is_active: false
                },
                { where: { customerid: customer_id } }
            );

            return res.status(200).json({ message: "Customer Deleted Successfully" })

        } else {
            return res.status(400).json({ message: "Invalid Customer Details" })
        }
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }

}

exports.addBasicInfo = async (req, res) => {

    const { customer_id, businessName, contactPerson, contactNumber, emailId, designation, gstVat, CIN, PAN, TAN, statusOfFirm, natureOfBusiness, additionalContactInfo, country_code, country, title } = req.body;

    if (!title || !country_code || !businessName || !contactPerson || !contactNumber || !emailId || !designation || !gstVat || !PAN || !statusOfFirm || !natureOfBusiness) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    if (additionalContactInfo) {
        if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
            return res.status(400).json({ message: "Invalid Address Details" });
        }

        for (let adds_detail of additionalContactInfo) {
            if (!adds_detail.title || !adds_detail.name || !adds_detail.contactNumber || !adds_detail.contactEmail || !adds_detail.designation) {
                return res.status(400).json({ message: "Missing Required Fields in Additional Contact Info" });
            }
        }
    }

    var updated_by_id = req.user_id;

    try {
        if (!customer_id) {

            const verify_customer = await Customer.findOne({ where: { email: emailId } });

            if (verify_customer) {
                return res.status(400).json({ message: "Mail Id Already Registered Us" });
            }

            let customerid;
            let isUnique = false;

            while (!isUnique) {
                const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
                customerid = `CUS-${randomNumber}`;

                const existingCustomer = await Customer.findOne({ where: { email: emailId } });

                if (!existingCustomer) {
                    isUnique = true;
                }
            }

            var new_customer = await Customer.create({
                business_name: businessName,
                contact_person: contactPerson,
                contact_number: Number(contactNumber),
                email: emailId,
                customerid: customerid,
                designation: designation,
                gst_vat: gstVat,
                country: country || 'IN',
                cin: CIN || 0,
                pan: PAN || 0,
                tan: TAN || 0,
                title: title,
                statusoffirm: statusOfFirm,
                natureof_business: Array.isArray(natureOfBusiness) ? natureOfBusiness.join(',') : natureOfBusiness,
                country_code: country_code || 1,
                created_by_id: updated_by_id,
                updated_by_id: updated_by_id
            });

            if (additionalContactInfo && Array.isArray(additionalContactInfo) && additionalContactInfo.length > 0) {

                await AdditionalCustomersContactInfo.destroy({ where: { customerid: customer_id } });

                var additionalContacts = additionalContactInfo.map(contact => ({
                    customerid: customer_id,
                    name: contact.name,
                    title: contact.title,
                    number: contact.contactNumber,
                    email: contact.contactEmail,
                    designation: contact.designation,
                    country: contact.country || 'IN',
                    country_code: contact.country_code || 1,
                    created_by_id: updated_by_id,
                    updated_by_id: updated_by_id
                }));
                await AdditionalCustomersContactInfo.bulkCreate(additionalContacts);

            }

            return res.status(200).json({ message: "Client added successfully", clientId: customerid });

        } else {

            let customer = await Customer.findOne({ where: { customerid: customer_id } });

            if (!customer) {
                return res.status(404).json({ message: "Customer not found" });
            }

            const verify_customer = await Customer.findOne({
                where: {
                    email: emailId,
                    customerid: { [Op.ne]: customer_id }
                }
            });

            if (verify_customer) {
                return res.status(400).json({ message: "Mail Id Already Registered Us" });
            }

            await customer.update({
                business_name: businessName,
                contact_person: contactPerson,
                contact_number: Number(contactNumber),
                email: emailId,
                designation: designation,
                gst_vat: gstVat,
                cin: CIN,
                pan: PAN,
                tan: TAN,
                title: title,
                country_code: country_code || 1,
                statusoffirm: statusOfFirm,
                natureof_business: natureOfBusiness,
                updated_by_id: updated_by_id
            },
                { where: { customerid: customer_id } }
            );

            if (additionalContactInfo && Array.isArray(additionalContactInfo) && additionalContactInfo.length > 0) {

                await AdditionalCustomersContactInfo.destroy({ where: { customerid: customer_id } });

                var additionalContacts = additionalContactInfo.map(contact => ({
                    customerid: customer_id,
                    name: contact.name,
                    title: title,
                    number: contact.contactNumber,
                    email: contact.contactEmail,
                    designation: contact.designation,
                    country: contact.country || 'IN',
                    country_code: contact.country_code || 1,
                    created_by_id: updated_by_id,
                    updated_by_id: updated_by_id
                }));
                await AdditionalCustomersContactInfo.bulkCreate(additionalContacts);

            }

            return res.status(200).json({ message: "Client Updated successfully", clientId: customer_id });
        }
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.addBankDetails = async (req, res) => {

    var { clientId, bankDetails } = req.body;

    var updated_by_id = req.user_id;

    if (!clientId) {
        return res.status(400).json({ message: "Client ID is required" });
    }

    if (!bankDetails) {
        return res.status(400).json({ message: "Missing Bank Details" });
    }

    if (bankDetails) {
        if (!Array.isArray(bankDetails) || bankDetails.length === 0) {
            return res.status(400).json({ message: "Invalid Address Details" });
        }

        for (let banks of bankDetails) {
            if (!banks.currency || !banks.accountNo || !banks.bankName || !banks.ifscCode || !banks.address1) {
                return res.status(400).json({ message: "Missing Required Fields in Bank Details" });
            }
        }
    }

    let customer = await Customer.findOne({ where: { customerid: clientId } });

    if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
    }

    try {

        if (bankDetails && Array.isArray(bankDetails) && bankDetails.length > 0) {

            await customer_BankDetails.destroy({ where: { user_id: clientId } });

            var bank_details = bankDetails.map(banks => ({
                user_id: clientId,
                name: banks.name || ' ',
                currency: banks.currency,
                account_number: banks.accountNo,
                bank_name: banks.bankName,
                ifsc_code: banks.ifscCode,
                address_line1: banks.address1,
                address_line2: banks.address2,
                address_line3: banks.address3,
                country: banks.country || 'IN',
                routing_bank: banks.routingBank,
                swift_code: banks.swiftCode || " ",
                isPrimary: banks.isPrimary || false,
                routing_bank_address: banks.routingBankAddress,
                routing_account_indusind: banks.routingAccountIndusand,
                created_by_id: updated_by_id,
                updated_by_id: updated_by_id
            }));

            await customer_BankDetails.bulkCreate(bank_details);
        }

        return res.status(200).json({ message: "Bank Details added", clientId: clientId });

    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
}

exports.addAddressInfo = async (req, res) => {

    var { clientId, address } = req.body;
    var updated_by_id = req.user_id;

    if (!clientId) {
        return res.status(400).json({ message: "Client ID is required" });
    }

    if (!address) {
        return res.status(400).json({ message: "Missing Address Details" });
    }

    console.log(address);

    if (address) {
        if (!Array.isArray(address) || address.length === 0) {
            return res.status(400).json({ message: "Invalid Address Details" });
        }

        for (let addre of address) {
            if (!addre.doorNo || !addre.postalCode || !addre.addressType) {
                return res.status(400).json({ message: "Missing Required Fields in Address Details" });
            }
        }
    }

    let customer = await Customer.findOne({ where: { customerid: clientId } });

    if (!customer) {
        return res.status(404).json({ message: "Customer not found" });
    }

    try {

        await CustomerAddress.destroy({ where: { user_id: clientId } });
        const addressDetails = address.map(addr => ({
            user_id: clientId,
            address_type: addr.addressType,
            address_line1: addr.doorNo,
            address_line2: addr.street,
            address_line3: addr.locality,
            address_line4: addr.address4,
            city: addr.city,
            state: addr.state,
            country: addr.country,
            postal_code: addr.postalCode,
            landmark: addr.landMark,
            maplink: addr.mapLink || null,
            created_by_id: updated_by_id,
            updated_by_id: updated_by_id
        }));
        await CustomerAddress.bulkCreate(addressDetails);

        return res.status(200).json({ message: "Addresses Added", clientId: clientId });

    } catch (error) {
        return res.status(404).json({ message: error.message });
    }
}