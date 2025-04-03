const { Vendor, AdditionalContactInfo } = require("./vendors");
const { Address, BankDetails, AddressType } = require("./address");
const { AuthUser } = require("./users");
const { UserCompany } = require("./register");
const { Customer, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails } = require("./customers");

AuthUser.hasOne(UserCompany, { foreignKey: "user_id", sourceKey: "id" });
UserCompany.belongsTo(AuthUser, { foreignKey: "user_id", targetKey: "id" });

Vendor.hasMany(Address, { foreignKey: "user_id", sourceKey: "vendorid" });
Address.belongsTo(Vendor, { foreignKey: "user_id", targetKey: "vendorid" });

Vendor.hasMany(BankDetails, { foreignKey: "user_id", sourceKey: "vendorid" });
BankDetails.belongsTo(Vendor, { foreignKey: "user_id", targetKey: "vendorid" });

Vendor.hasMany(AdditionalContactInfo, { foreignKey: "vendorid", sourceKey: "vendorid" });
AdditionalContactInfo.belongsTo(Vendor, { foreignKey: "vendorid", targetKey: "vendorid" });

// Customers

Customer.hasMany(CustomerAddress, { foreignKey: "user_id", sourceKey: "customerid" });
CustomerAddress.belongsTo(Customer, { foreignKey: "user_id", targetKey: "customerid" });

Customer.hasMany(customer_BankDetails, { foreignKey: "user_id", sourceKey: "customerid" });
customer_BankDetails.belongsTo(Customer, { foreignKey: "user_id", targetKey: "customerid" });

Customer.hasMany(AdditionalCustomersContactInfo, { foreignKey: "customerid", sourceKey: "customerid" });
AdditionalCustomersContactInfo.belongsTo(Customer, { foreignKey: "customerid", targetKey: "customerid" });

CustomerAddress.belongsTo(AddressType, {
    foreignKey: "address_type",
    as: "AddressType", // Alias must match the query include
});

AddressType.hasMany(CustomerAddress, {
    foreignKey: "address_type",
    as: "customer_addresses",
});


module.exports = { Vendor, Address, BankDetails, AdditionalContactInfo, AuthUser, UserCompany, Customer, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails, AddressType };
