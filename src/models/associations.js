const { Vendor, AdditionalContactInfo } = require("./vendors");
const { Address, BankDetails, AddressType } = require("./address");
const { AuthUser } = require("./users");
const { UserCompany } = require("./register");
const { Customer, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails } = require("./customers");
const { Title, CommonCountry, } = require("./masters");
const { Products, Unit, Inventory, ProductImages, TechnicalDocuments } = require("./products");
const { Category, SubCategory, ProductBrand } = require("./category");
const { Activity, ActivityTypes } = require("./activites");
const { Invoice, InvoiceItem } = require("./invoice");
const { InvoiceTypes, DeliveryTerm, PaymentTerm, Ports, PoforInvoice } = require("./invoice_package");


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


// Invoice
Invoice.belongsTo(CustomerAddress, { foreignKey: "billing_address", targetKey: "id", as: "BillingAddress" });
CustomerAddress.hasMany(Invoice, { foreignKey: "billing_address", sourceKey: "id", as: "BillingInvoices" });

// Invoice belongsTo ShippingAddress
Invoice.belongsTo(CustomerAddress, { foreignKey: "shipping_address", targetKey: "id", as: "ShippingAddress" })
CustomerAddress.hasMany(Invoice, { foreignKey: "shipping_address", sourceKey: "id", as: "ShippingInvoices" });

Invoice.belongsTo(InvoiceTypes, { foreignKey: "invoice_type", as: "InvoiceType", });
InvoiceTypes.hasMany(Invoice, { foreignKey: "id", as: "InvoiceType", });

Invoice.belongsTo(CommonCountry, { foreignKey: "currency", as: "CurrecyDetail", });
CommonCountry.hasMany(Invoice, { foreignKey: "id", as: "CurrecyDetail", });

Invoice.belongsTo(DeliveryTerm, { foreignKey: "delivery_term", as: "DeliveryTerm", });
DeliveryTerm.hasMany(Invoice, { foreignKey: "id", as: "DeliveryTerm", });

Invoice.belongsTo(PaymentTerm, { foreignKey: "payment_term", as: "PaymentTerm", });
PaymentTerm.hasMany(Invoice, { foreignKey: "id", as: "PaymentTerm", });

Invoice.belongsTo(CommonCountry, { foreignKey: "origin_of_goods", as: "OriginofGoods", });
CommonCountry.hasMany(Invoice, { foreignKey: "id", as: "OriginofGoods", });

Invoice.belongsTo(Ports, { foreignKey: "loading_port", as: "LoadingPort", });
Ports.hasMany(Invoice, { foreignKey: "id", as: "LoadingPort", });

Invoice.belongsTo(Ports, { foreignKey: "discharge_port", as: "DischargePort", });
Ports.hasMany(Invoice, { foreignKey: "id", as: "DischargePort", });

Invoice.belongsTo(CommonCountry, { foreignKey: "destination_country", as: "DestinationCountry", });
CommonCountry.hasMany(Invoice, { foreignKey: "id", as: "DestinationCountry", });

Invoice.hasMany(PoforInvoice, { foreignKey: "invoice_id", sourceKey: "invoice_number", as: "POs" });
PoforInvoice.belongsTo(Invoice, { foreignKey: "invoice_id", targetKey: "invoice_number", as: "Invoice" });

Invoice.hasMany(InvoiceItem, { foreignKey: "invoice_number", sourceKey: "invoice_number", as: "InvoiceItems" });
InvoiceItem.belongsTo(Invoice, { foreignKey: "invoice_number", targetKey: "invoice_number", as: "Invoice" });

module.exports = { Vendor, Address, BankDetails, AdditionalContactInfo, AuthUser, UserCompany, Customer, NameofBussiness, LegalStatus, AdditionalCustomersContactInfo, CustomerAddress, customer_BankDetails, AddressType };
