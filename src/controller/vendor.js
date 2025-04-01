const { Vendor, AdditionalContactInfo } = require('../models/vendors')
const { Address, BankDetails } = require('../models/address')
const { Op, fn, col, where } = require("sequelize");

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

    try {
        if (basic_info) {
            var email = basic_info.emailId;
            var businessName = basic_info.businessName;
            var designation = basic_info.designation;
            var contactNumber = basic_info.contactNumber;
            var contactPersonName = basic_info.contactPersonName;
            var gstvat = basic_info.gstvat;
            var country = basic_info.country || "IN";
            var country_code = basic_info.country_code || 91;

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
                        country_code: country_code,
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
                    country_code: contact.country_code || 91,
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
                    address_line4: address.city,
                    postal_code: address.postalCode,
                    landmark: address.landMark,
                    maplink: address.mapLink,
                    created_by_id: created_by_id,
                    updated_by_id: created_by_id
                }));

                await Address.bulkCreate(addressDetails);
            }

            if (bankDetails) {
                var existingBankDetails = await BankDetails.findOne({ where: { user_id: vendor_id } });

                if (existingBankDetails) {
                    await BankDetails.update(
                        {
                            name: bankDetails.name,
                            account_number: bankDetails.accountNo,
                            bank_name: bankDetails.bankName,
                            ifsc_code: bankDetails.ifscCode,
                            address_line1: bankDetails.address1,
                            address_line2: bankDetails.address2,
                            address_line3: bankDetails.address3,
                            country: bankDetails.country || 'IN',
                            routing_bank: bankDetails.routingBank,
                            swift_code: bankDetails.swiftCode,
                            routing_bank_address: bankDetails.routingBankAddress,
                            routing_account_indusind: bankDetails.routingAccountIndusand,
                            updated_by_id: created_by_id
                        },
                        { where: { user_id: vendor_id } }
                    );
                } else {
                    await BankDetails.create({
                        user_id: vendor_id,
                        name: bankDetails.name,
                        account_number: bankDetails.accountNo,
                        bank_name: bankDetails.bankName,
                        ifsc_code: bankDetails.ifscCode,
                        address_line1: bankDetails.address1,
                        address_line2: bankDetails.address2,
                        address_line3: bankDetails.address3,
                        country: bankDetails.country || 'IN',
                        routing_bank: bankDetails.routingBank,
                        swift_code: bankDetails.swiftCode,
                        routing_bank_address: bankDetails.routingBankAddress,
                        routing_account_indusind: bankDetails.routingAccountIndusand,
                        created_by_id: created_by_id,
                        updated_by_id: created_by_id
                    });
                }
            }

            return res.status(200).json({ message: vendor_id ? "Vendor updated successfully" : "Vendor created successfully", vendor_id: vendor_id });

        } else {
            return res.status(400).json({ message: "Vendor details missing" });
        }

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

exports.addBasicInfo = async (req, res) => {

    var { businessName, contactPersonName, contactNumber, emailId, designation, gstvat, country, additionalContactInfo, vendor_id, country_code } = req.body;

    var created_by_id = req.user_id;

    try {

        if (!businessName || !contactPersonName || !contactNumber || !emailId || !designation || !gstvat) {
            return res.status(400).json({ message: "Missing Required Fields" });
        }

        if (additionalContactInfo) {
            if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
                return res.status(400).json({ message: "Invalid Additional Contacts" });
            }

            for (let contact of additionalContactInfo) {
                if (!contact.name || !contact.contactNumber || !contact.contactEmail || !contact.designation) {
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
                country_code: country_code || 91,
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
                    country_code: country_code || 91,
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
                country_code: contact.country_code || 91,
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
            if (!contact.name || !contact.bankName || !contact.accountNo || !contact.ifscCode || !contact.address1 || !contact.swiftCode) {
                return res.status(400).json({ message: "Missing Required Fields in Banking Details" });
            }
        }

        const verify_vendor_id = await Vendor.findOne({ where: { vendorid: vendorId } });

        if (!verify_vendor_id) {
            return res.status(400).json({ message: "Invalid Vendor Id" });
        }

        var newbankDetails = bankDetails[0];

        var existingBankDetails = await BankDetails.findOne({ where: { user_id: vendorId } });

        if (existingBankDetails) {
            await BankDetails.update(
                {
                    name: newbankDetails.name,
                    account_number: newbankDetails.accountNo,
                    bank_name: newbankDetails.bankName,
                    ifsc_code: newbankDetails.ifscCode,
                    address_line1: newbankDetails.address1,
                    address_line2: newbankDetails.address2,
                    address_line3: newbankDetails.address3,
                    country: newbankDetails.country || 'IN',
                    routing_bank: newbankDetails.routingBank,
                    swift_code: newbankDetails.swiftCode,
                    routing_bank_address: newbankDetails.routingBankAddress,
                    routing_account_indusind: newbankDetails.routingAccountIndusand,
                    updated_by_id: created_by_id
                },
                { where: { user_id: vendorId } }
            );

            return res.status(200).json({ message: "Bank Details Updated", vendorId: vendorId });

        } else {
            await BankDetails.create({
                user_id: vendorId,
                name: newbankDetails.name,
                account_number: newbankDetails.accountNo,
                bank_name: newbankDetails.bankName,
                ifsc_code: newbankDetails.ifscCode,
                address_line1: newbankDetails.address1,
                address_line2: newbankDetails.address2,
                address_line3: newbankDetails.address3,
                country: newbankDetails.country || 'IN',
                routing_bank: newbankDetails.routingBank,
                swift_code: newbankDetails.swiftCode,
                routing_bank_address: newbankDetails.routingBankAddress,
                routing_account_indusind: newbankDetails.routingAccountIndusand,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            });

            return res.status(200).json({ message: "Bank Details Added", vendorId: vendorId });

        }
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
                address_line4: address.city,
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

    var { vendor_id, businessName, contactPersonName, contactNumber, emailId, designation, gstvat, country, address, bankDetails, additionalContactInfo } = req.body;

    if (!vendor_id) {
        return res.status(400).json({ message: "Missing Vendor ID" });
    }

    var created_by_id = req.user_id;

    if (!businessName || !contactPersonName || !contactNumber || !emailId || !designation || !gstvat) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    if (additionalContactInfo) {
        if (!Array.isArray(additionalContactInfo) || additionalContactInfo.length === 0) {
            return res.status(400).json({ message: "Invalid Additional Contacts" });
        }

        for (let contact of additionalContactInfo) {
            if (!contact.name || !contact.contactNumber || !contact.contactEmail || !contact.designation) {
                return res.status(400).json({ message: "Missing Required Fields in Additional Contacts" });
            }
        }
    }

    if (!Array.isArray(bankDetails) || bankDetails.length === 0) {
        return res.status(400).json({ message: "Invalid Banking Details" });
    }

    for (let contact of bankDetails) {
        if (!contact.name || !contact.bankName || !contact.accountNo || !contact.ifscCode || !contact.address1 || !contact.swiftCode) {
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

        await Vendor.update(
            {
                business_name: businessName,
                contact_person: contactPersonName,
                contact_number: Number(contactNumber),
                email: emailId,
                designation: designation,
                gst_vat: gstvat,
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
                country: contact.country || 'IN',
                country_code: contact.country_code || 91,
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
                address_line4: addr.city,
                postal_code: addr.postalCode,
                landmark: addr.landMark,
                maplink: addr.mapLink,
                created_by_id: created_by_id,
                updated_by_id: created_by_id
            }));

            await Address.bulkCreate(addressDetails);
        }

        if (bankDetails) {

            var bankDetails = bankDetails[0]

            var existingBankDetails = await BankDetails.findOne({ where: { user_id: vendor_id } });

            if (existingBankDetails) {
                await BankDetails.update(
                    {
                        name: bankDetails.name,
                        account_number: bankDetails.accountNo,
                        bank_name: bankDetails.bankName,
                        ifsc_code: bankDetails.ifscCode,
                        address_line1: bankDetails.address1,
                        address_line2: bankDetails.address2,
                        address_line3: bankDetails.address3,
                        country: bankDetails.country || 'IN',
                        routing_bank: bankDetails.routingBank,
                        swift_code: bankDetails.swiftCode,
                        routing_bank_address: bankDetails.routingBankAddress,
                        routing_account_indusind: bankDetails.routingAccountIndusand,
                        updated_by_id: created_by_id
                    },
                    { where: { user_id: vendor_id } }
                );
            } else {
                await BankDetails.create({
                    user_id: vendor_id,
                    name: bankDetails.name,
                    account_number: bankDetails.accountNo,
                    bank_name: bankDetails.bankName,
                    ifsc_code: bankDetails.ifscCode,
                    address_line1: bankDetails.address1,
                    address_line2: bankDetails.address2,
                    address_line3: bankDetails.address3,
                    country: bankDetails.country || 'IN',
                    routing_bank: bankDetails.routingBank,
                    swift_code: bankDetails.swiftCode,
                    routing_bank_address: bankDetails.routingBankAddress,
                    routing_account_indusind: bankDetails.routingAccountIndusand,
                    created_by_id: created_by_id,
                    updated_by_id: created_by_id
                });
            }
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

        const vendors = await Vendor.findAll({
            where: {
                created_by_id: createdById,
                is_active: true,
                contact_person: where(fn("LOWER", col("contact_person")), {
                    [Op.like]: `%${searchKeyword.toLowerCase()}%`
                })
            },
            include: [
                {
                    model: Address,
                    attributes: ["address_line1", "address_line2", "address_line3", "postal_code", "landmark", "maplink", "address_type"]
                },
                {
                    model: BankDetails,
                    attributes: ["name", "account_number", "bank_name", "ifsc_code", "address_line1", "address_line2", "address_line3", "country", "routing_bank", "swift_code", "routing_bank_address", "routing_account_indusind"]
                },
                {
                    model: AdditionalContactInfo,
                    attributes: ["name", "number", "email", "designation", "country"]
                }
            ]
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
            address: vendor.addresses.map(addr => ({
                doorNo: addr.address_line1,
                street: addr.address_line2 || "",
                locality: addr.address_line3 || "",
                city: addr.address_line4 || "",
                postalCode: addr.postal_code,
                landMark: addr.landmark || "",
                mapLink: addr.map_link || "",
                addressType: addr.address_type || ""
            })),
            bankDetails: vendor.bank_details.map(bank => ({
                name: bank.name,
                accountNo: bank.account_number,
                bankName: bank.bank_name,
                ifscCode: bank.ifsc_code,
                address1: bank.address_line1 || "",
                address2: bank.address_line2 || "",
                address3: bank.address_line3 || "",
                country: bank.country || "",
                routingBank: bank.routing_bank || "",
                swiftCode: bank.swift_code || "",
                routingBankAddress: bank.routing_bank_address || "",
                routingAccountIndusand: bank.routing_account_indusind || ""
            })),
            additionalContactInfo: vendor.additional_contact_infos.map(contact => ({
                name: contact.name,
                contactNumber: contact.number,
                contactEmail: contact.email,
                designation: contact.designation,
                country: contact.country || ""
            }))
        }));

        res.json({ vendors: formattedVendors });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(500).json({ message: "Internal Server Error" });
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
                    attributes: ["address_line1", "address_line2", "address_line3", "postal_code", "landmark", "maplink", "address_type"]
                },
                {
                    model: BankDetails,
                    attributes: ["name", "account_number", "bank_name", "ifsc_code", "address_line1", "address_line2", "address_line3", "country", "routing_bank", "swift_code", "routing_bank_address", "routing_account_indusind"]
                },
                {
                    model: AdditionalContactInfo,
                    attributes: ["name", "number", "email", "designation", "country"]
                }
            ]
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
            address: vendor.addresses.map(addr => ({
                doorNo: addr.address_line1,
                street: addr.address_line2 || "",
                locality: addr.address_line3 || "",
                city: addr.address_line4 || "",
                postalCode: addr.postal_code,
                landMark: addr.landmark || "",
                mapLink: addr.map_link || "",
                addressType: addr.address_type || ""
            })),
            bankDetails: vendor.bank_details.map(bank => ({
                name: bank.name,
                accountNo: bank.account_number,
                bankName: bank.bank_name,
                ifscCode: bank.ifsc_code,
                address1: bank.address_line1 || "",
                address2: bank.address_line2 || "",
                address3: bank.address_line3 || "",
                country: bank.country || "",
                routingBank: bank.routing_bank || "",
                swiftCode: bank.swift_code || "",
                routingBankAddress: bank.routing_bank_address || "",
                routingAccountIndusand: bank.routing_account_indusind || ""
            })),
            additionalContactInfo: vendor.additional_contact_infos.map(contact => ({
                name: contact.name,
                contactNumber: contact.number,
                contactEmail: contact.email,
                designation: contact.designation,
                country: contact.country || ""
            }))
        }));

        res.json({ vendors: formattedVendors });
    } catch (error) {
        console.error("Error fetching vendors:", error);
        res.status(500).json({ message: "Internal Server Error" });
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