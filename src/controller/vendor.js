const { Vendor, AdditionalContactInfo } = require('../models/vendors')
const { Address, AddressType, BankDetails } = require('../models/address')
const { Op, fn, col, where } = require("sequelize");
const { Title, CommonCountry } = require('../models/masters');


exports.basic_info = async (req, res) => {

    var { vendor_details, vendor_id } = req.body;

    if (!vendor_details) {
        return res.status(400).json({ message: "Missing Vendor Details" });
    }

    var basic_info = vendor_details?.basic_info || 0;
    var address_info = vendor_details?.address_info || 0;
    var bankDetails = vendor_details?.bankDetails || 0;
    var additionalContactInfo = vendor_details?.additionalContactInfo || 0;

    if (basic_info == 0 && address_info == 0 && bankDetails == 0 && additionalContactInfo == 0) {
        return res.status(400).json({ message: "Missing Mandatory Details" });
    }

    var created_by_id = req.user_id;

    if (basic_info) {

        const { businessName, contactPersonName, contactNumber, emailId, designation, gstvat, country, title, country_code } = basic_info;

        if (!businessName || !contactPersonName || !contactNumber || !emailId || !designation || !gstvat || !title || !country_code) {
            return res.status(400).json({ message: "Missing Required Fields" });
        }
    }

    if (additionalContactInfo) {
        if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
            return res.status(400).json({ message: "Invalid Additional Contacts" });
        }

        for (let contact of additionalContactInfo) {
            if (!contact.name || !contact.contactNumber || !contact.contactEmail || !contact.designation || !contact.title || !contact.country_code) {
                return res.status(400).json({ message: "Missing Required Fields in Additional Contacts" });
            }
        }
    }

    if (bankDetails) {
        if (!Array.isArray(bankDetails) || bankDetails.length === 0) {
            return res.status(400).json({ message: "Invalid Banking Details" });
        }

        for (let bank of bankDetails) {
            if (!bank.bankName || !bank.accountNo || !bank.ifscCode || !bank.address1) {
                return res.status(400).json({ message: "Missing Required Fields in Banking Details" });
            }
        }
    }

    if (address_info) {
        if (!Array.isArray(address_info) || address_info.length === 0) {
            return res.status(400).json({ message: "Invalid Address Details" });
        }

        for (let addr of address_info) {
            if (!addr.doorNo || !addr.postalCode || !addr.addressType) {
                return res.status(400).json({ message: "Missing Required Fields in Address Details" });
            }
        }
    }

    try {
        if (basic_info) {
            var email = basic_info.emailId;
            var businessName = basic_info.businessName;
            var designation = basic_info.designation;
            var contactNumber = basic_info.contactNumber;
            var contactPersonName = basic_info.contactPersonName;
            var gstvat = basic_info.gstvat;
            var country = basic_info.country || "IN";
            var country_code = basic_info.country_code || 1;
            var title = basic_info.title || 1;

            if (!vendor_id) {

                const email_verify = await Vendor.findOne({ where: { email } });

                if (email_verify) {
                    return res.status(400).json({ message: "Email Already registered with us" });
                }

                const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
                var vendor_id = `VEN-${randomNumber}`;

                var new_vendor = await Vendor.create({
                    business_name: businessName,
                    contact_person: contactPersonName,
                    contact_number: Number(contactNumber),
                    email: email,
                    vendorid: vendor_id,
                    designation: designation,
                    gst_vat: gstvat,
                    country: country,
                    title: title,
                    country_code: country_code,
                    created_by_id: created_by_id,
                    updated_by_id: created_by_id
                });

            } else {

                const verify_vendor_id = await Vendor.findOne({ where: { vendorid: vendor_id } });

                if (!verify_vendor_id) {
                    return res.status(400).json({ message: "Invalid Vendor Id" });
                }

                await Vendor.update(
                    {
                        business_name: businessName,
                        contact_person: contactPersonName,
                        contact_number: Number(contactNumber),
                        email: email,
                        designation: designation,
                        gst_vat: gstvat,
                        country: country,
                        title: title,
                        country_code: country_code || 1,
                        updated_by_id: created_by_id
                    },
                    { where: { vendorid: vendor_id } }
                );
            }

            if (additionalContactInfo && Array.isArray(additionalContactInfo) && additionalContactInfo.length > 0) {

                await AdditionalContactInfo.destroy({ where: { vendorid: vendor_id } });

                var additionalContacts = additionalContactInfo.map(contact => ({
                    vendorid: vendor_id,
                    name: contact.name,
                    number: contact.contactNumber,
                    email: contact.contactEmail,
                    designation: contact.designation,
                    country: contact.country || 'IN',
                    title: contact.title || 1,
                    country_code: contact.country_code || 1,
                    created_by_id: created_by_id,
                    updated_by_id: created_by_id
                }));

                await AdditionalContactInfo.bulkCreate(additionalContacts);
            }

            if (address_info && Array.isArray(address_info) && address_info.length > 0) {

                await Address.destroy({ where: { user_id: vendor_id } });

                var addressDetails = address_info.map(address => ({
                    user_id: vendor_id,
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

                await Address.bulkCreate(addressDetails);
            }

            if (bankDetails && Array.isArray(bankDetails) && bankDetails.length > 0) {

                await BankDetails.destroy({ where: { user_id: vendor_id } });

                var bank_details = bankDetails.map(banks => ({
                    user_id: vendor_id,
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

                await BankDetails.bulkCreate(bank_details);
            }

            // if (bankDetails) {
            //     var existingBankDetails = await BankDetails.findOne({ where: { user_id: vendor_id } });

            //     if (existingBankDetails) {
            //         await BankDetails.update(
            //             {
            //                 name: bankDetails.name,
            //                 account_number: bankDetails.accountNo,
            //                 bank_name: bankDetails.bankName,
            //                 ifsc_code: bankDetails.ifscCode,
            //                 address_line1: bankDetails.address1,
            //                 address_line2: bankDetails.address2,
            //                 address_line3: bankDetails.address3,
            //                 country: bankDetails.country || 'IN',
            //                 routing_bank: bankDetails.routingBank,
            //                 swift_code: bankDetails.swiftCode,
            //                 currency: bankDetails.currency || 1,
            //                 routing_bank_address: bankDetails.routingBankAddress,
            //                 routing_account_indusind: bankDetails.routingAccountIndusand,
            //                 updated_by_id: created_by_id
            //             },
            //             { where: { user_id: vendor_id } }
            //         );
            //     } else {
            //         await BankDetails.create({
            //             user_id: vendor_id,
            //             name: bankDetails.name,
            //             account_number: bankDetails.accountNo,
            //             bank_name: bankDetails.bankName,
            //             ifsc_code: bankDetails.ifscCode,
            //             address_line1: bankDetails.address1,
            //             address_line2: bankDetails.address2,
            //             address_line3: bankDetails.address3,
            //             country: bankDetails.country || 'IN',
            //             routing_bank: bankDetails.routingBank,
            //             swift_code: bankDetails.swiftCode,
            //             currency: bankDetails.currency || 1,
            //             routing_bank_address: bankDetails.routingBankAddress,
            //             routing_account_indusind: bankDetails.routingAccountIndusand,
            //             created_by_id: created_by_id,
            //             updated_by_id: created_by_id
            //         });
            //     }
            // }

            return res.status(200).json({ message: req.body.vendor_id ? "Vendor updated successfully" : "Vendor created successfully", vendor_id: vendor_id });

        } else {
            return res.status(400).json({ message: "Vendor details missing" });
        }

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

exports.addBasicInfo = async (req, res) => {

    var { businessName, contactPersonName, contactNumber, emailId, designation, gstvat, country, additionalContactInfo, vendor_id, country_code, title } = req.body;

    var created_by_id = req.user_id;

    try {

        if (!businessName || !contactPersonName || !contactNumber || !emailId || !designation || !gstvat || !title || !country_code) {
            return res.status(400).json({ message: "Missing Required Fields" });
        }

        if (additionalContactInfo) {
            if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
                return res.status(400).json({ message: "Invalid Additional Contacts" });
            }

            for (let contact of additionalContactInfo) {
                if (!contact.name || !contact.contactNumber || !contact.contactEmail || !contact.designation || !contact.title || !contact.country_code) {
                    return res.status(400).json({ message: "Missing Required Fields in Additional Contacts" });
                }
            }
        }

        if (!vendor_id) {

            const email_verify = await Vendor.findOne({ where: { email: emailId } });

            if (email_verify) {
                return res.status(400).json({ message: "Email Already registered with us" });
            }

            let uniqueVendorId;
            let isUnique = false;

            // Generate a unique vendor_id
            while (!isUnique) {
                const randomNumber = Math.floor(10000000 + Math.random() * 90000000);
                uniqueVendorId = `VEN-${randomNumber}`;

                const existingVendor = await Vendor.findOne({ where: { vendorid: uniqueVendorId } });

                if (!existingVendor) {
                    isUnique = true;
                }
            }

            vendor_id = uniqueVendorId;

            await Vendor.create({
                business_name: businessName,
                contact_person: contactPersonName,
                contact_number: Number(contactNumber),
                email: emailId,
                vendorid: vendor_id,
                designation: designation,
                gst_vat: gstvat,
                country: country || "IN",
                title: title,
                country_code: country_code || 1,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            });

        } else {

            const verify_vendor_id = await Vendor.findOne({ where: { vendorid: vendor_id } });

            if (!verify_vendor_id) {
                return res.status(400).json({ message: "Invalid Vendor Id" });
            }

            await Vendor.update(
                {
                    business_name: businessName,
                    contact_person: contactPersonName,
                    contact_number: Number(contactNumber),
                    email: emailId,
                    designation: designation,
                    gst_vat: gstvat,
                    country: country || "IN",
                    title: title,
                    country_code: country_code || 1,
                    created_by_id: created_by_id,
                    updated_by_id: created_by_id
                },
                { where: { vendorid: vendor_id } }
            );
        }

        if (additionalContactInfo && Array.isArray(additionalContactInfo) && additionalContactInfo.length > 0) {

            await AdditionalContactInfo.destroy({ where: { vendorid: vendor_id } });

            var additionalContacts = additionalContactInfo.map(contact => ({
                vendorid: vendor_id,
                name: contact.name,
                number: contact.contactNumber,
                email: contact.contactEmail,
                designation: contact.designation,
                country: contact.country || 'IN',
                title: contact.title,
                country_code: contact.country_code || 1,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            }));
            await AdditionalContactInfo.bulkCreate(additionalContacts);

        }

        if (req.body.vendor_id) {
            return res.status(200).json({ message: "Vendor Updated successfully", vendorId: vendor_id });
        } else {
            return res.status(200).json({ message: "Vendor added successfully", vendorId: vendor_id });
        }

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

exports.addBankDetails = async (req, res) => {

    var { vendorId, bankDetails } = req.body;

    if (!vendorId) {
        return res.status(400).json({ message: "Missing Vendor Id" });
    }

    var created_by_id = req.user_id;

    try {

        if (!Array.isArray(bankDetails) || bankDetails.length === 0) {
            return res.status(400).json({ message: "Invalid Banking Details" });
        }

        for (let contact of bankDetails) {
            if (!contact.bankName || !contact.accountNo || !contact.ifscCode || !contact.address1 || !contact.swiftCode) {
                return res.status(400).json({ message: "Missing Required Fields in Banking Details" });
            }
        }

        const verify_vendor_id = await Vendor.findOne({ where: { vendorid: vendorId } });

        if (!verify_vendor_id) {
            return res.status(400).json({ message: "Invalid Vendor Id" });
        }

        if (bankDetails && Array.isArray(bankDetails) && bankDetails.length > 0) {

            await BankDetails.destroy({ where: { user_id: vendorId } });

            var bank_details = bankDetails.map(banks => ({
                user_id: vendorId,
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

            await BankDetails.bulkCreate(bank_details);
        }

        return res.status(200).json({ message: "Bank Details Updated", vendorId: vendorId });

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.addAddressInfo = async (req, res) => {

    var { vendorId, address } = req.body;

    if (!vendorId) {
        return res.status(400).json({ message: "Missing Vendor Id" });
    }

    var created_by_id = req.user_id;

    try {

        var addressDetails = address;

        if (!Array.isArray(addressDetails) || addressDetails.length === 0) {
            return res.status(400).json({ message: "Invalid Address Details" });
        }

        for (let contact of addressDetails) {
            if (!contact.doorNo || !contact.postalCode || !contact.addressType) {
                return res.status(400).json({ message: "Missing Required Fields in Address Details" });
            }
        }

        const verify_vendor_id = await Vendor.findOne({ where: { vendorid: vendorId } });

        if (!verify_vendor_id) {
            return res.status(400).json({ message: "Invalid Vendor Id" });
        }

        if (addressDetails && Array.isArray(addressDetails) && addressDetails.length > 0) {

            await Address.destroy({ where: { user_id: vendorId } });

            var addressDetails = addressDetails.map(address => ({
                user_id: vendorId,
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

            await Address.bulkCreate(addressDetails);
        }

        return res.status(200).json({ message: "Address Details added", vendorId: vendorId })

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
}

exports.updatevendor_id = async (req, res) => {

    var vendor_id = req.params.vendor_id || req.body.vendor_id;

    var { businessName, contactPersonName, contactNumber, emailId, designation, gstvat, country, address, bankDetails, additionalContactInfo, title, country_code } = req.body;

    if (!vendor_id) {
        return res.status(400).json({ message: "Missing Vendor ID" });
    }

    var created_by_id = req.user_id;

    if (!businessName || !contactPersonName || !contactNumber || !emailId || !designation || !gstvat || !title || !country_code) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    if (additionalContactInfo) {
        if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
            return res.status(400).json({ message: "Invalid Additional Contacts" });
        }

        for (let contact of additionalContactInfo) {
            if (!contact.name || !contact.contactNumber || !contact.contactEmail || !contact.designation || !contact.title || !contact.country_code) {
                return res.status(400).json({ message: "Missing Required Fields in Additional Contacts" });
            }
        }
    }

    if (!Array.isArray(bankDetails) || bankDetails.length === 0) {
        return res.status(400).json({ message: "Invalid Banking Details" });
    }

    for (let contact of bankDetails) {
        if (!contact.bankName || !contact.accountNo || !contact.ifscCode || !contact.address1) {
            return res.status(400).json({ message: "Missing Required Fields in Banking Details" });
        }
    }

    if (!Array.isArray(address) || address.length === 0) {
        return res.status(400).json({ message: "Invalid Address Details" });
    }

    for (let contact of address) {
        if (!contact.doorNo || !contact.postalCode || !contact.addressType) {
            return res.status(400).json({ message: "Missing Required Fields in Address Details" });
        }
    }

    try {
        const verify_vendor = await Vendor.findOne({ where: { vendorid: vendor_id } });

        if (!verify_vendor) {
            return res.status(400).json({ message: "Invalid Vendor ID" });
        }

        const verify_customer = await Vendor.findOne({
            where: {
                email: emailId,
                vendorid: { [Op.ne]: vendor_id }
            }
        });

        if (verify_customer) {
            return res.status(400).json({ message: "Mail Id Already Registered Us" });
        }

        await Vendor.update(
            {
                business_name: businessName,
                contact_person: contactPersonName,
                contact_number: Number(contactNumber),
                email: emailId,
                designation: designation,
                gst_vat: gstvat,
                title: title,
                country_code: country_code || 1,
                country: country || 'IN',
                updated_by_id: created_by_id
            },
            { where: { vendorid: vendor_id } }
        );

        if (additionalContactInfo && Array.isArray(additionalContactInfo) && additionalContactInfo.length > 0) {
            await AdditionalContactInfo.destroy({ where: { vendorid: vendor_id } });

            var additionalContacts = additionalContactInfo.map(contact => ({
                vendorid: vendor_id,
                name: contact.name,
                number: contact.contactNumber,
                email: contact.contactEmail,
                designation: contact.designation,
                title: contact.title,
                country: contact.country || 'IN',
                country_code: contact.country_code || 1,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            }));

            await AdditionalContactInfo.bulkCreate(additionalContacts);
        }

        if (address && Array.isArray(address) && address.length > 0) {
            await Address.destroy({ where: { user_id: vendor_id } });

            var addressDetails = address.map(addr => ({
                user_id: vendor_id,
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
                maplink: addr.mapLink,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            }));

            await Address.bulkCreate(addressDetails);
        }

        if (bankDetails && Array.isArray(bankDetails) && bankDetails.length > 0) {

            await BankDetails.destroy({ where: { user_id: vendor_id } });

            var bank_details = bankDetails.map(banks => ({
                user_id: vendor_id,
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

            await BankDetails.bulkCreate(bank_details);
        }

        return res.status(200).json({ message: "Vendor updated successfully", vendor_id: vendor_id });
    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

exports.get_allvendors = async (req, res) => {
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

        const vendors = await Vendor.findAll({
            where: whereCondition,
            include: [
                {
                    model: Address,
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "postal_code", "landmark", "maplink", "address_type", "city", "state", "country"],
                    include: [
                        {
                            model: AddressType,
                            as: "VendorAddressType",
                            attributes: ["type"],
                        },
                    ],
                },
                {
                    model: BankDetails,
                    attributes: ["name", "account_number", "bank_name", "ifsc_code", "address_line1", "address_line2", "address_line3", "country", "routing_bank", "swift_code", "routing_bank_address", "routing_account_indusind", "currency", "isPrimary", "intermediary_swift_code", "iban"],
                    order: [["isPrimary", "DESC"]]
                },
                {
                    model: AdditionalContactInfo,
                    attributes: ["name", "number", "email", "designation", "country", "title", "country_code"],
                    include: [
                        {
                            model: Title,
                            as: "vendortitle_info",
                            attributes: ["title"],
                        },
                        {
                            model: CommonCountry,
                            as: "vendor_additional",
                            attributes: ["id", "name", "code", "phone"],
                        },
                    ],
                },
                {
                    model: Title,
                    as: "vendor_title_info",
                    attributes: ["title"],
                },
                {
                    model: CommonCountry,
                    as: "vendor_countrycode",
                    attributes: ["id", "name", "code", "phone"],
                }
            ],
            order: [['id', 'DESC']]
        });

        // Format the response
        const formattedVendors = vendors.map(vendor => ({
            vendorId: vendor.vendorid,
            businessName: vendor.business_name,
            contactPersonName: vendor.contact_person,
            contactNumber: vendor.contact_number,
            emailId: vendor.email,
            designation: vendor.designation,
            gstvat: vendor.gst_vat,
            country: vendor.country || null,
            title_id: vendor.title || "",
            title: vendor.vendor_title_info ? vendor.vendor_title_info.title : "",
            country_code_id: vendor.country_code || "",
            country_code: vendor.vendor_countrycode ? vendor.vendor_countrycode.phone : "",
            address: (vendor.addresses || []).map(addr => ({
                doorNo: addr.address_line1,
                street: addr.address_line2 || "",
                locality: addr.address_line3 || "",
                address4: addr.address_line4 || "",
                city: addr.city || "",
                state: addr.state || "",
                country: addr.country || "",
                postalCode: addr.postal_code,
                landMark: addr.landmark || "",
                mapLink: addr.map_link || "",
                addressType: addr.VendorAddressType ? addr.VendorAddressType.type : "",
            })),
            bankDetails: (vendor.bank_details || []).map(bank => ({
                name: bank.name || ' ',
                accountNo: bank.account_number,
                bankName: bank.bank_name,
                ifscCode: bank.ifsc_code,
                address1: bank.address_line1 || "",
                address2: bank.address_line2 || "",
                address3: bank.address_line3 || "",
                country: bank.country || "",
                currency: bank.currency || 1,
                routingBank: bank.routing_bank || "",
                swiftCode: bank.swift_code || "",
                isPrimary: bank.isPrimary || false,
                routingBankAddress: bank.routing_bank_address || "",
                routingAccountIndusand: bank.routing_account_indusind || "",
                iban: bank.iban || "",
                intermediary_swift_code: bank.intermediary_swift_code || ""
            })),
            additionalContactInfo: (vendor.additional_contact_infos || []).map(contact => ({
                name: contact.name,
                contactNumber: contact.number,
                contactEmail: contact.email,
                designation: contact.designation,
                country: contact.country || "",
                title_id: contact.title || "",
                title: contact.vendortitle_info ? contact.vendortitle_info.title : "",
                country_codeid: contact.country_code || "",
                country_code: contact.vendor_additional ? contact.vendor_additional.phone : ""
            }))
        }));

        res.json({ vendors: formattedVendors });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(400).json({ message: "Internal Server Error" });
    }
};

exports.particularvendor_details = async (req, res) => {
    try {
        const vendor_id = req.params.vendor_id;

        if (!vendor_id) {
            return res.status(400).json({ message: "Missing Vendor Id" });
        }

        const vendors = await Vendor.findAll({
            where: {
                vendorid: vendor_id,
            },
            include: [
                {
                    model: Address,
                    attributes: ["address_line1", "address_line2", "address_line3", "address_line4", "postal_code", "landmark", "maplink", "address_type", "city", "state", "country"],
                    include: [
                        {
                            model: AddressType,
                            as: "VendorAddressType",
                            attributes: ["type"],
                        },
                    ],
                },
                {
                    model: BankDetails,
                    attributes: ["name", "account_number", "bank_name", "ifsc_code", "address_line1", "address_line2", "address_line3", "country", "routing_bank", "swift_code", "routing_bank_address", "routing_account_indusind", "currency", "isPrimary", "intermediary_swift_code", "iban"],
                    order: [["isPrimary", "DESC"]]
                },
                {
                    model: AdditionalContactInfo,
                    attributes: ["name", "number", "email", "designation", "country", "title", "country_code"],
                    include: [
                        {
                            model: Title,
                            as: "vendortitle_info",
                            attributes: ["title"],
                        },
                        {
                            model: CommonCountry,
                            as: "vendor_additional",
                            attributes: ["id", "name", "code", "phone"],
                        },
                    ],
                },
                {
                    model: Title,
                    as: "vendor_title_info",
                    attributes: ["title"],
                },
                {
                    model: CommonCountry,
                    as: "vendor_countrycode",
                    attributes: ["id", "name", "code", "phone"],
                }
            ],
            order: [[BankDetails, "isPrimary", "DESC"]]
        });

        // Format the response
        const formattedVendors = vendors.map(vendor => ({
            vendorId: vendor.vendorid,
            businessName: vendor.business_name,
            contactPersonName: vendor.contact_person,
            contactNumber: vendor.contact_number,
            emailId: vendor.email,
            designation: vendor.designation,
            gstvat: vendor.gst_vat,
            country: vendor.country || null,
            title_id: vendor.title || "",
            title: vendor.vendor_title_info ? vendor.vendor_title_info.title : "",
            country_code_id: vendor.country_code || "",
            country_code: vendor.vendor_countrycode ? vendor.vendor_countrycode.phone : "",
            address: (vendor.addresses || []).map(addr => ({
                doorNo: addr.address_line1,
                street: addr.address_line2 || "",
                locality: addr.address_line3 || "",
                address4: addr.address_line4 || "",
                city: addr.city || "",
                state: addr.state || "",
                country: addr.country || "",
                postalCode: addr.postal_code,
                landMark: addr.landmark || "",
                mapLink: addr.map_link || "",
                addressType: addr.VendorAddressType ? addr.VendorAddressType.type : "",
            })),
            bankDetails: (vendor.bank_details || []).map(bank => ({
                name: bank.name || ' ',
                accountNo: bank.account_number,
                bankName: bank.bank_name,
                ifscCode: bank.ifsc_code,
                address1: bank.address_line1 || "",
                address2: bank.address_line2 || "",
                address3: bank.address_line3 || "",
                country: bank.country || "",
                currency: bank.currency || 1,
                routingBank: bank.routing_bank || "",
                swiftCode: bank.swift_code || "",
                isPrimary: bank.isPrimary || false,
                routingBankAddress: bank.routing_bank_address || "",
                routingAccountIndusand: bank.routing_account_indusind || "",
                iban: bank.iban || "",
                intermediary_swift_code: bank.intermediary_swift_code || ""
            })),
            additionalContactInfo: (vendor.additional_contact_infos || []).map(contact => ({
                name: contact.name,
                contactNumber: contact.number,
                contactEmail: contact.email,
                designation: contact.designation,
                country: contact.country || "",
                title_id: contact.title || "",
                title: contact.vendortitle_info ? contact.vendortitle_info.title : "",
                country_codeid: contact.country_code || "",
                country_code: contact.vendor_additional ? contact.vendor_additional.phone : ""
            }))
        }));

        // res.json({ vendors: formattedVendors });
        res.json(formattedVendors[0] || {});

    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(400).json({ message: "Internal Server Error" });
    }
};

exports.remove_vendor = async (req, res) => {

    var vendor_id = req.params.vendor_id;

    if (!vendor_id) {
        return res.status(400).json({ message: "Missing Vendor Details" })
    }

    try {

        var check_vendorid = await Vendor.findOne({ where: { vendorid: vendor_id } });

        if (check_vendorid) {

            await Vendor.update(
                {
                    is_active: false
                },
                { where: { vendorid: vendor_id } }
            );

            return res.status(200).json({ message: "Vendor Deleted Successfully" })

        } else {
            return res.status(400).json({ message: "Invalid Vendor Details" })
        }
    } catch (error) {
        return res.status(400).json({ message: error.message })
    }
}