const { Vendor, AdditionalContactInfo } = require("./vendors");
const { Address, BankDetails, AddressType } = require("./address");
const { AuthUser } = require("./users");
const { UserCompany } = require("./register");
const { Customer, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails } = require("./customers");
const { Title, CommonCountry, } = require("./masters");
const { Products, Unit, Inventory, ProductImages, TechnicalDocuments } = require("./products");
const { Category, SubCategory, ProductBrand } = require("./category");
const { Activity, ActivityTypes } = require("./activites");


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

// ************* All Customers
CustomerAddress.belongsTo(AddressType, { foreignKey: "address_type", as: "AddressType", });

AddressType.hasMany(CustomerAddress, { foreignKey: "address_type", as: "customer_addresses", });


AdditionalCustomersContactInfo.belongsTo(Title, { foreignKey: "title", as: "title_info", });

Title.hasMany(AdditionalCustomersContactInfo, { foreignKey: "title", as: "title_info", });

Customer.belongsTo(Title, { foreignKey: "title", as: "customer_title_info", });

Title.hasMany(Customer, { foreignKey: "title", as: "customer_title_info", });

// Customer CountryCode
Customer.belongsTo(CommonCountry, { foreignKey: "country_code", targetKey: "id", as: "customer_countrycode", });

CommonCountry.hasMany(Customer, { foreignKey: "country_code", sourceKey: "id", as: "customer_countrycode", });

AdditionalCustomersContactInfo.belongsTo(CommonCountry, { foreignKey: "country_code", targetKey: "id", as: "customer_additional", });

CommonCountry.hasMany(AdditionalCustomersContactInfo, { foreignKey: "country_code", sourceKey: "id", as: "customer_additional", });


// Vendors Get

Address.belongsTo(AddressType, { foreignKey: "address_type", as: "VendorAddressType", });

AddressType.hasMany(Address, { foreignKey: "address_type", as: "vendor_address", });

AdditionalContactInfo.belongsTo(Title, { foreignKey: "title", as: "vendortitle_info", });

Title.hasMany(AdditionalContactInfo, { foreignKey: "title", as: "vendortitle_info", });

Vendor.belongsTo(Title, { foreignKey: "title", as: "vendor_title_info", });

Title.hasMany(Vendor, { foreignKey: "title", as: "vendor_title_info", });

Vendor.belongsTo(CommonCountry, { foreignKey: "country_code", targetKey: "id", as: "vendor_countrycode", });

CommonCountry.hasMany(Vendor, { foreignKey: "country_code", sourceKey: "id", as: "vendor_countrycode", });

AdditionalContactInfo.belongsTo(CommonCountry, { foreignKey: "country_code", targetKey: "id", as: "vendor_additional", });

CommonCountry.hasMany(AdditionalContactInfo, { foreignKey: "country_code", sourceKey: "id", as: "vendor_additional", });

// products

Products.belongsTo(Category, { foreignKey: "category", targetKey: 'category_code', as: "product_category", });

Category.hasMany(Products, { foreignKey: "category", sourceKey: "category_code", as: "product_category", });

Products.belongsTo(SubCategory, { foreignKey: "subcategory", targetKey: 'subcategory_code', as: "product_sub_category", });

SubCategory.hasMany(Products, { foreignKey: "subcategory", sourceKey: "subcategory_code", as: "product_sub_category", });

Products.belongsTo(ProductBrand, { foreignKey: "brand", targetKey: 'brand_code', as: "product_brand", });

ProductBrand.hasMany(Products, { foreignKey: "brand", sourceKey: "brand_code", as: "product_brand", });

ProductImages.belongsTo(Products, { foreignKey: "product_code", targetKey: 'product_code', as: "product_images", });

Products.hasMany(ProductImages, { foreignKey: "product_code", sourceKey: "product_code", as: "product_images", });

TechnicalDocuments.belongsTo(Products, { foreignKey: "product_code", targetKey: 'product_code', as: "product_documents", });

Products.hasMany(TechnicalDocuments, { foreignKey: "product_code", sourceKey: "product_code", as: "product_documents", });

Activity.belongsTo(ActivityTypes, { foreignKey: "activity_type_id", targetKey: "activity_type_id", as: "ActivityTypes" });

ActivityTypes.hasMany(Activity, { foreignKey: "activity_type_id", sourceKey: "activity_type_id", as: "ActivityTypes" });


module.exports = { Vendor, Address, BankDetails, AdditionalContactInfo, AuthUser, UserCompany, Customer, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails, AddressType };
