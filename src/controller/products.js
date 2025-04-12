const path = require('path')
const { Products, Unit, Inventory, ProductImages, TechnicalDocuments } = require('../models/products')
const uploadImage = require('../utils/upload_image')

exports.add_product = async (req, res) => {

    var { productCode, productName, description, quantity, unit, price, currency, weight, discount, hsnCode, gst, serialNo, category, subCategory, make, countryOfOrigin, manufaturingYearAndMonth, State, district, additional_fields, brand } = req.body;

    var created_by_id = req.user_id;

    if (!productCode || !productName || !description || !unit || !category) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    const imageFiles = req.files['images'];
    const technicaldocsFiles = req.files['technicaldocs'];

    if (quantity) {
        if (Array.isArray(serialNo) && serialNo.length > 0) {
            return res.status(400).json({ message: "Missing Serial Number Details" });
        }

        var serialNo = JSON.parse(serialNo);


        if (serialNo.length != quantity) {
            return res.status(400).json({ message: `Serial number count (${serialNo.length}) does not match quantity (${quantity})` });
        }
    }

    let additionalFieldsParsed = [];

    if (additional_fields) {
        if (typeof additional_fields === 'string') {
            try {
                additionalFieldsParsed = JSON.parse(additional_fields);
            } catch (err) {
                return res.status(400).json({ message: "Invalid JSON in additional_fields" });
            }
        }
    }

    try {
        var check_productcode = await Products.findOne({
            where: {
                product_code: productCode
            }
        })

        if (check_productcode) {
            return res.status(400).json({ message: "Product Code Already Exists" })
        }

        var check_productcode = await Products.create({
            product_code: productCode,
            product_name: productName,
            description: description,
            quantity: quantity,
            unit: unit,
            price: price || 0,
            currency: currency,
            weight: weight,
            discount: discount,
            hsn_code: hsnCode,
            gst: gst,
            serialNo: JSON.stringify(serialNo),
            category: category,
            brand: brand,
            subcategory: subCategory,
            make: make,
            origin_country: countryOfOrigin,
            manufaturing_year: manufaturingYearAndMonth,
            district: district,
            state: State,
            additional_fields: additionalFieldsParsed,
            created_by_id: created_by_id
        })

        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
            for (const file of imageFiles) {
                const ext = path.extname(file.originalname);
                const uniqueName = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;

                const s3Url = await uploadImage.uploadToS3('images/', uniqueName, file);

                await ProductImages.create({
                    image_url: s3Url,
                    product_code: productCode,
                    category_code: category,
                    subcategory_code: subCategory,
                    created_by_id: created_by_id
                });
            }
        }

        if (Array.isArray(technicaldocsFiles) && technicaldocsFiles.length > 0) {
            for (const file of technicaldocsFiles) {
                const ext = path.extname(file.originalname);
                const uniqueName = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;

                const docu_url = await uploadImage.uploadToS3('technical_documents/', uniqueName, file);

                await TechnicalDocuments.create({
                    document_url: docu_url,
                    product_code: productCode,
                    category_code: category,
                    subcategory_code: subCategory,
                    created_by_id: created_by_id
                });
            }
        }

        var find_product = await Inventory.findOne({
            where: {
                product_code: productCode,
                category_code: category,
                subcategory_code: subCategory,
                is_active: true
            }
        })

        if (find_product) {

            const newQuantity = find_product.count + parseInt(quantity);

            await Inventory.update(
                { count: newQuantity },
                {
                    where: {
                        id: find_product.id
                    }
                }
            );

            console.log("Inventory updated.");

        } else {

            let inventory_code;
            let isUnique = false;

            while (!isUnique) {
                const randomNumber = Math.floor(100000 + Math.random() * 900000);
                inventory_code = `INVEN-${randomNumber}`;

                const existingBrandCode = await Inventory.findOne({ where: { inventory_code: inventory_code } });

                if (!existingBrandCode) {
                    isUnique = true;
                }
            }

            await Inventory.create({
                inventory_code: inventory_code,
                product_code: productCode,
                category_code: category,
                subcategory_code: subCategory,
                count: quantity,
                created_by_id: created_by_id
            });

            console.log("Inventory added.");
        }

        return res.status(200).json({ message: "Product Added Successfully" })

    } catch (error) {
        return res.status(400).json({ message: "Error to Add Product Details", reason: error.message });
    }
}