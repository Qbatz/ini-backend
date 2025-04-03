const { Customer, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails } = require('../models/customers')
const { Op, fn, col, where } = require("sequelize");

exports.add_customersall = async (req, res) => {

    var created_by_id = req.user_id;
    const { businessName, contactPerson, contactNumber, emailId, designation, gstVat, CIN, PAN, TAN, statusOfFirm, natureOfBusiness, address, country, country_code, bankDetails, additionalContactInfo } = req.body;

    if (!businessName || !contactPerson || !contactNumber || !emailId || !designation || !gstVat || !CIN || !PAN || !TAN || !statusOfFirm || !natureOfBusiness) {
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
            if (!banks.currency || !banks.accountNo || !banks.bankName || !banks.ifscCode || !banks.address1 || !banks.swiftCode) {
                return res.status(400).json({ message: "Missing Required Fields in Bank Details" });
            }
        }
    }

    if (additionalContactInfo) {
        if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
            return res.status(400).json({ message: "Invalid Address Details" });
        }

        for (let adds_detail of additionalContactInfo) {
            if (!adds_detail.name || !adds_detail.contactNumber || !adds_detail.contactEmail || !adds_detail.designation) {
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
            cin: CIN,
            pan: PAN,
            tan: TAN,
            statusoffirm: statusOfFirm,
            natureof_business: natureOfBusiness,
            country_code: country_code || 91,
            created_by_id: created_by_id,
            updated_by_id: created_by_id
        });

        if (additionalContactInfo && Array.isArray(additionalContactInfo) && additionalContactInfo.length > 0) {

            var additionalContacts = additionalContactInfo.map(contact => ({
                customerid: customerid,
                name: contact.name,
                number: contact.contactNumber,
                email: contact.contactEmail,
                designation: contact.designation,
                country: contact.country || 'IN',
                country_code: contact.country_code || 91,
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
                address_line4: address.city,
                postal_code: address.postalCode,
                landmark: address.landMark,
                maplink: address.mapLink,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            }));

            await CustomerAddress.bulkCreate(addressDetails);
        }


        if (bankDetails && Array.isArray(bankDetails) && bankDetails.length > 0) {

            var new_bankDetails = bankDetails[0]

            await customer_BankDetails.create({
                user_id: customerid,
                name: new_bankDetails.name || ' ',
                currency: new_bankDetails.currency,
                account_number: new_bankDetails.accountNo,
                bank_name: new_bankDetails.bankName,
                ifsc_code: new_bankDetails.ifscCode,
                address_line1: new_bankDetails.address1,
                address_line2: new_bankDetails.address2,
                address_line3: new_bankDetails.address3,
                country: new_bankDetails.country || 'IN',
                routing_bank: new_bankDetails.routingBank,
                swift_code: new_bankDetails.swiftCode,
                routing_bank_address: new_bankDetails.routingBankAddress,
                routing_account_indusind: new_bankDetails.routingAccountIndusand,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            });
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
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "postal_code", "landmark", "maplink", "address_type"]
                },
                {
                    model: customer_BankDetails,
                    attributes: ["name", "account_number", "bank_name", "ifsc_code", "address_line1", "address_line2", "address_line3", "country", "routing_bank", "swift_code", "routing_bank_address", "routing_account_indusind"]
                },
                {
                    model: AdditionalCustomersContactInfo,
                    attributes: ["name", "number", "email", "designation", "country"]
                },
            ],
            order: [['id', 'DESC']]
        });

        // Format response safely
        const formattedCustomers = customers.map(customer => ({
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
            statusOfFirm: customer.statusoffirm || "",
            natureOfBusiness: customer.natureof_business || "",
            address: (customer.customer_addresses || []).map(addr => ({
                doorNo: addr.address_line1 || "",
                street: addr.address_line2 || "",
                locality: addr.address_line3 || "",
                city: addr.address_line4 || "",
                postalCode: addr.postal_code || "",
                landMark: addr.landmark || "",
                mapLink: addr.maplink || "",
                addressType: addr.address_type || ""
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
                routingBankAddress: bank.routing_bank_address || "",
                routingAccountIndusand: bank.routing_account_indusind || ""
            })),
            additionalContactInfo: (customer.additional_customers_contact_infos || []).map(contact => ({
                name: contact.name || "",
                contactNumber: contact.number || "",
                contactEmail: contact.email || "",
                designation: contact.designation || "",
                country: contact.country || ""
            }))
        }));

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
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "postal_code", "landmark", "maplink", "address_type"]
                },
                {
                    model: customer_BankDetails,
                    attributes: ["name", "account_number", "bank_name", "ifsc_code", "address_line1", "address_line2", "address_line3", "country", "routing_bank", "swift_code", "routing_bank_address", "routing_account_indusind"]
                },
                {
                    model: AdditionalCustomersContactInfo,
                    attributes: ["name", "number", "email", "designation", "country"]
                },
            ]
        });

        // Format response safely
        const formattedCustomers = customers.map(customer => ({
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
            statusOfFirm: customer.LegalStatus?.type || "",
            natureOfBusiness: customer.NameofBussiness?.type || "",
            address: (customer.customer_addresses || []).map(addr => ({
                doorNo: addr.address_line1 || "",
                street: addr.address_line2 || "",
                locality: addr.address_line3 || "",
                city: addr.address_line4 || "",
                postalCode: addr.postal_code || "",
                landMark: addr.landmark || "",
                mapLink: addr.maplink || "",
                addressType: addr.address_type || ""
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
                routingBankAddress: bank.routing_bank_address || "",
                routingAccountIndusand: bank.routing_account_indusind || ""
            })),
            additionalContactInfo: (customer.additional_customers_contact_infos || []).map(contact => ({
                name: contact.name || "",
                contactNumber: contact.number || "",
                contactEmail: contact.email || "",
                designation: contact.designation || "",
                country: contact.country || ""
            }))
        }));

        res.json({ customers: formattedCustomers });
    } catch (error) {
        console.error("Error fetching customers:", error);
        res.status(400).json({ message: error.message });
    }

}

exports.updatecustomer = async (req, res) => {
    try {
        const { clientId, businessName, contactPerson, contactNumber, emailId, designation, gstVat, CIN, PAN, TAN, statusOfFirm, natureOfBusiness, address, bankDetails, additionalContactInfo } = req.body;
        var updated_by_id = req.user_id;

        if (!businessName || !contactPerson || !contactNumber || !emailId || !designation || !gstVat || !CIN || !PAN || !TAN || !statusOfFirm || !natureOfBusiness) {
            return res.status(400).json({ message: "Missing Required Fields" });
        }

        if (!clientId) {
            return res.status(400).json({ message: "Client ID is required" });
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
                if (!banks.currency || !banks.accountNo || !banks.bankName || !banks.ifscCode || !banks.address1 || !banks.swiftCode) {
                    return res.status(400).json({ message: "Missing Required Fields in Bank Details" });
                }
            }
        }

        if (additionalContactInfo) {
            if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
                return res.status(400).json({ message: "Invalid Address Details" });
            }

            for (let adds_detail of additionalContactInfo) {
                if (!adds_detail.name || !adds_detail.contactNumber || !adds_detail.contactEmail || !adds_detail.designation) {
                    return res.status(400).json({ message: "Missing Required Fields in Additional Contact Info" });
                }
            }
        }

        let customer = await Customer.findOne({ where: { customerid: clientId } });

        if (!customer) {
            return res.status(404).json({ message: "Customer not found" });
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
            statusoffirm: statusOfFirm,
            natureof_business: natureOfBusiness,
            updated_by_id: updated_by_id
        });

        if (additionalContactInfo && Array.isArray(additionalContactInfo)) {
            await AdditionalCustomersContactInfo.destroy({ where: { customerid: clientId } });
            const additionalContacts = additionalContactInfo.map(contact => ({
                customerid: clientId,
                name: contact.name,
                number: contact.contactNumber,
                email: contact.contactEmail,
                designation: contact.designation,
                country: contact.country || 'IN',
                country_code: contact.country_code || 91,
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
                address_line4: addr.city,
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
            const newBank = bankDetails[0];
            await customer_BankDetails.create({
                user_id: clientId,
                name: newBank.name || ' ',
                currency: newBank.currency,
                account_number: newBank.accountNo,
                bank_name: newBank.bankName,
                ifsc_code: newBank.ifscCode,
                address_line1: newBank.address1,
                address_line2: newBank.address2,
                address_line3: newBank.address3,
                country: newBank.country || 'IN',
                routing_bank: newBank.routingBank,
                swift_code: newBank.swiftCode,
                routing_bank_address: newBank.routingBankAddress,
                routing_account_indusind: newBank.routingAccountIndusand,
                created_by_id: updated_by_id,
                updated_by_id: updated_by_id
            });
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