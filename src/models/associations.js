const { Vendor, AdditionalContactInfo } = require("./vendors");
const { Address, BankDetails } = require("./address");
const { AuthUser } = require("./users");
const { UserCompany } = require("./register");

AuthUser.hasOne(UserCompany, { foreignKey: "user_id", sourceKey: "id" });
UserCompany.belongsTo(AuthUser, { foreignKey: "user_id", targetKey: "id" });

Vendor.hasMany(Address, { foreignKey: "user_id", sourceKey: "vendorid" });
Address.belongsTo(Vendor, { foreignKey: "user_id", targetKey: "vendorid" });

Vendor.hasMany(BankDetails, { foreignKey: "user_id", sourceKey: "vendorid" });
BankDetails.belongsTo(Vendor, { foreignKey: "user_id", targetKey: "vendorid" });

Vendor.hasMany(AdditionalContactInfo, { foreignKey: "vendorid", sourceKey: "vendorid" });
AdditionalContactInfo.belongsTo(Vendor, { foreignKey: "vendorid", targetKey: "vendorid" });


module.exports = { Vendor, Address, BankDetails, AdditionalContactInfo, AuthUser, UserCompany };
