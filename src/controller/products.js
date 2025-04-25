const path = require('path')
const { Products, Unit, Inventory, ProductImages, TechnicalDocuments } = require('../models/products')
const uploadImage = require('../utils/upload_image')
const { Op, fn, col, where } = require("sequelize");
const { Category, SubCategory, ProductBrand } = require('../models/category');
const { Activity } = require('../models/activites');
const activityid = require('../components/activityid');

exports.add_product = async (req, res) => {

    var { productCode, productName, description, quantity, unit, price, currency, weight, discount, hsnCode, gst, serialNo, category, subCategory, make, countryOfOrigin, manufaturingYearAndMonth, State, district, additional_fields, brand, categoryName, subCategoryName, brandName, model } = req.body;

    var created_by_id = req.user_id;

    if (!productCode || !productName || !description || !unit) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    console.log(req.body);

    const imageFiles = req.files['images'];
    const technicaldocsFiles = req.files['technicaldocs'];

    try {

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

        var check_productcode = await Products.findOne({
            where: {
                product_code: productCode
            }
        })

        if (check_productcode) {
            return res.status(400).json({ message: "Product Code Already Exists" })
        }

        let finalCategoryId = category;
        if (!finalCategoryId && categoryName) {
            const existingCat = await Category.findOne({
                where: {
                    [Op.and]: [
                        where(fn('LOWER', col('category_name')), categoryName.toLowerCase()),
                        { is_active: true }
                    ]
                }
            });

            if (existingCat) {
                finalCategoryId = String(existingCat.category_code);
            } else {

                let category_code;
                let isUnique = false;

                while (!isUnique) {
                    const randomNumber = Math.floor(100000 + Math.random() * 900000);
                    category_code = `${randomNumber}`;

                    const existingCategoryCode = await Category.findOne({ where: { category_code: category_code } });

                    if (!existingCategoryCode) {
                        isUnique = true;
                    }
                }
                const newCat = await Category.create({
                    category_code: category_code,
                    category_name: categoryName,
                    created_by_id: created_by_id
                });
                finalCategoryId = String(newCat.category_code);
            }

        }

        console.log("finalCategoryId", finalCategoryId);


        let finalSubCategoryId = subCategory;
        if (!finalSubCategoryId && subCategoryName) {
            const existingSubCat = await SubCategory.findOne({
                where: {
                    [Op.and]: [
                        where(fn('LOWER', col('subcategory_name')), subCategoryName.toLowerCase()),
                        { category_code: finalCategoryId, is_active: true }
                    ]
                }
            });

            if (existingSubCat) {
                finalSubCategoryId = String(existingSubCat.subcategory_code);
            } else {

                let subcategory_code;
                let isUnique = false;

                while (!isUnique) {
                    const randomNumber = Math.floor(100000 + Math.random() * 900000);
                    subcategory_code = `${randomNumber}`;

                    const existingSubCategoryCode = await SubCategory.findOne({ where: { subcategory_code: subcategory_code } });

                    if (!existingSubCategoryCode) {
                        isUnique = true;
                    }
                }

                const newSubCat = await SubCategory.create({
                    subcategory_code: subcategory_code,
                    subcategory_name: subCategoryName,
                    category_code: finalCategoryId,
                    created_by_id: created_by_id
                });
                finalSubCategoryId = String(newSubCat.subcategory_code);
            }
        }

        let finalBrandId = brand;
        if (!finalBrandId && brandName) {
            const existingBrand = await ProductBrand.findOne({
                where: {
                    [Op.and]: [
                        where(fn('LOWER', col('brand_name')), brandName.toLowerCase()),
                        { is_active: true }
                    ]
                }
            });

            if (existingBrand) {
                finalBrandId = String(existingBrand.brand_code);
            } else {

                let brand_code;
                let isUnique = false;

                while (!isUnique) {
                    const randomNumber = Math.floor(100000 + Math.random() * 900000);
                    brand_code = `${randomNumber}`;

                    const existingBrandCode = await ProductBrand.findOne({ where: { brand_code: brand_code } });

                    if (!existingBrandCode) {
                        isUnique = true;
                    }
                }

                const newBrand = await ProductBrand.create({
                    brand_code: brand_code,
                    brand_name: brandName,
                    created_by_id: created_by_id,
                    updated_by_id: created_by_id
                });
                finalBrandId = String(newBrand.brand_code);
            }
        }

        var unique_product_code = await activityid.generateNextProductId();

        var check_productcode = await Products.create({
            product_code: productCode,
            unique_product_code: unique_product_code,
            model: model || "",
            product_name: productName,
            description: description,
            quantity: quantity || 0,
            unit: unit,
            price: price || 0,
            currency: currency,
            weight: weight || 0,
            discount: discount || 0,
            hsn_code: hsnCode,
            gst: gst || 0,
            serialNo: JSON.stringify(serialNo) || [],
            category: finalCategoryId,
            brand: finalBrandId,
            subcategory: finalSubCategoryId || 0,
            make: make,
            origin_country: countryOfOrigin,
            manufacturing_year: manufaturingYearAndMonth || null,
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
                    subcategory_code: subCategory || 0,
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
                    subcategory_code: subCategory || 0,
                    created_by_id: created_by_id
                });
            }
        }

        var find_product = await Inventory.findOne({
            where: {
                product_code: unique_product_code,
                category_code: finalCategoryId,
                subcategory_code: finalSubCategoryId,
                is_active: true
            }
        })

        if (find_product) {

            // const newQuantity = find_product.count + parseInt(quantity);

            await Inventory.update(
                { count: quantity || 0 },
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
                product_code: unique_product_code,
                category_code: finalCategoryId,
                subcategory_code: finalSubCategoryId || 0,
                count: quantity || 0,
                created_by_id: created_by_id
            });

            console.log("Inventory added.");
        }

        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT011",
            user_id: created_by_id,
            transaction_id: unique_product_code,
            description: 'Added product ' + productName,
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Product Added Successfully" })

    } catch (error) {
        console.log(error);
        return res.status(400).json({ message: "Error to Add Product Details", reason: error.message });
    }
}

exports.get_all_products = async (req, res) => {

    try {
        const createdById = req.user_id;
        const searchKeyword = req.query.searchKeyword || "";
        const startDate = req.query.startDate || "";
        const endDate = req.query.endDate || "";

        let whereCondition = {
            created_by_id: createdById,
            is_active: true,
            product_name: {
                [Op.iLike]: `%${searchKeyword.toLowerCase()}%`
            }
        };

        if (startDate && endDate) {
            whereCondition.created_on = {
                [Op.between]: [new Date(startDate), new Date(endDate)]
            };
        } else if (startDate) {
            whereCondition.created_on = {
                [Op.gte]: new Date(startDate)
            };
        } else if (endDate) {
            whereCondition.created_on = {
                [Op.lte]: new Date(endDate)
            };
        }

        const products = await Products.findAll({
            where: whereCondition,
            include: [
                {
                    model: Category,
                    as: 'product_category',
                    attributes: ["category_name"],
                }, {
                    model: SubCategory,
                    as: 'product_sub_category',
                    attributes: ["subcategory_name"],
                }, {
                    model: ProductBrand,
                    as: 'product_brand',
                    attributes: ["brand_name"],
                },
                {
                    model: ProductImages,
                    as: 'product_images',
                    attributes: ["id", "image_url", "product_code"],
                    where: { is_active: true },
                    required: false,
                },
                {
                    model: TechnicalDocuments,
                    as: 'product_documents',
                    attributes: ["id", "document_url", "product_code"],
                    where: { is_active: true },
                    required: false,
                }
            ],
            order: [['id', 'DESC'],
            [{ model: ProductImages, as: 'product_images' }, 'id', 'ASC'],
            [{ model: TechnicalDocuments, as: 'product_documents' }, 'id', 'ASC']]
        });

        const formattedProducts = products.map(product => ({
            productCode: product.product_code,
            uniqueProductCode: product.unique_product_code,
            productName: product.product_name,
            model: product.model,
            description: product.description,
            quantity: product.quantity,
            unit: product.unit,
            price: product.price,
            currency: product.currency || "",
            weight: product.weight || "",
            discount: product.discount || "",
            hsnCode: product.hsn_code || "",
            gst: product.gst || "",
            serialNo: jsonparsefunc(product.serialNo) || [],
            categoryId: product.category || "",
            categoryName: product.product_category ? product.product_category.category_name : "",
            subCategoryId: product.subcategory || "",
            subCategoryName: product.product_sub_category ? product.product_sub_category.subcategory_name : "",
            brandId: product.brand || "",
            brandName: product.product_brand ? product.product_brand.brand_name : "",
            make: product.make || "",
            countryOfOrigin: product.origin_country || "",
            manufaturingYearAndMonth: product.manufacturing_year || "",
            State: product.state || "",
            district: product.district || "",
            additional_fields: jsonparsefunc(product.additional_fields) || "",
            images: (product.product_images || []).map(img => ({
                id: img.id,
                url: img.image_url || "",
                product_code: img.product_code || ""
            })),
            technicaldocs: (product.product_documents || []).map(doc => ({
                id: doc.id,
                url: doc.document_url || "",
                product_code: doc.product_code || ""
            })),
        }));

        res.json({ products: formattedProducts });


    } catch (error) {
        return res.status(400).json({ message: "Error to Get Product Details", reason: error.message });
    }
}

function jsonparsefunc(value, defaultValue = []) {
    try {
        return JSON.parse(value);
    } catch (err) {
        return defaultValue;
    }
}

exports.update_product = async (req, res) => {

    var { productCode, productName, description, quantity, unit, price, currency, weight, discount, hsnCode, gst, serialNo, category, subCategory, make, countryOfOrigin, manufaturingYearAndMonth, State, district, additional_fields, brand } = req.body;

    var created_by_id = req.user_id;

    // var productCode = req.params.product_id

    if (!productCode || !productName || !description || !unit || !category) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    // if (quantity) {
    //     if (!Array.isArray(serialNo) || serialNo.length === 0) {
    //         return res.status(400).json({ message: "Missing Serial Number Details" });
    //     }

    //     if (serialNo.length != quantity) {
    //         return res.status(400).json({ message: `Serial number count (${serialNo.length}) does not match quantity (${quantity})` });
    //     }
    // }

    try {
        var check_productcode = await Products.findOne({
            where: {
                unique_product_code: productCode,
                is_active: true
            }
        })

        if (!check_productcode) {
            return res.status(400).json({ message: "Invalid or Inactive Product Code" })
        }

        await Products.update({
            product_name: productName,
            description: description,
            quantity: quantity || 0,
            unit: unit,
            price: price || 0,
            currency: currency,
            weight: weight || 0,
            discount: discount || 0,
            hsn_code: hsnCode,
            gst: gst || 0,
            serialNo: JSON.stringify(serialNo) || [],
            category: category,
            brand: brand,
            subcategory: subCategory || 0,
            make: make,
            origin_country: countryOfOrigin,
            manufacturing_year: manufaturingYearAndMonth || null,
            district: district,
            state: State,
            additional_fields: additional_fields,
        }, {
            where: { unique_product_code: productCode }
        })

        var find_product = await Inventory.findOne({
            where: {
                product_code: String(productCode),
                category_code: String(category),
                subcategory_code: String(subCategory),
                is_active: true
            }
        })

        if (find_product) {

            // const newQuantity = parseInt(find_product.count) + parseInt(quantity);

            await Inventory.update(
                { count: quantity || 0 },
                {
                    where: {
                        id: find_product.id
                    }
                }
            );
            console.log("Inventory updated.");
        }

        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT021",
            user_id: created_by_id,
            transaction_id: productCode,
            description: 'Updated Product ' + productName,
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Product Updated Successfully" })

    } catch (error) {
        return res.status(400).json({ message: "Error to Update Product Details", reason: error.message });
    }
}

exports.delete_product = async (req, res) => {

    var { product_code } = req.body;

    var created_by_id = req.user_id;

    if (!product_code) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    try {
        var check_productcode = await Products.findOne({
            where: {
                unique_product_code: product_code,
                is_active: true
            }
        })

        if (!check_productcode) {
            return res.status(400).json({ message: "Invalid or Inactive Product Code" })
        }

        await Products.update({
            is_active: false
        }, {
            where: { product_code: product_code }
        })

        await Inventory.update({
            is_active: false,
        }, {
            where: { product_code: product_code }
        })

        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT014",
            user_id: created_by_id,
            transaction_id: product_code,
            description: 'Delete Product ' + check_productcode.product_name,
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Deleted Successfully" })

    } catch (error) {
        return res.status(400).json({ message: "Error to Delete Product Details", reason: error.message });
    }
}

exports.add_image = async (req, res) => {

    const image = req.files?.['image'];
    var productCode = req.body.productCode;

    var created_by_id = req.user_id;

    if (!image || !productCode) {
        return res.status(400).json({ message: "Missing Mandatory Fields" })
    }

    try {
        var check_productcode = await Products.findOne({
            where: {
                product_code: productCode,
                is_active: true
            }
        })

        if (!check_productcode) {
            return res.status(400).json({ message: "Invalid or Inactive Product Code" })
        }

        var image_count = await ProductImages.count({
            where: {
                product_code: productCode,
                is_active: true
            }
        })

        if (image_count >= 10) {
            return res.status(400).json({ message: "Maximum 10 images are allowed for a product" });
        }

        var file = image[0];

        const ext = path.extname(file.originalname);
        const uniqueName = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;

        const s3Url = await uploadImage.uploadToS3('images/', uniqueName, file);

        await ProductImages.create({
            image_url: s3Url,
            product_code: productCode,
            category_code: check_productcode.category,
            subcategory_code: check_productcode.subcategory || 0,
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Image Added Successfully" });

    } catch (error) {
        return res.status(400).json({ message: "Error to Add Product Images", reason: error.message });
    }
}

exports.add_docs = async (req, res) => {

    const document = req.files?.['technicaldoc'];
    var productCode = req.body.productCode;

    var created_by_id = req.user_id;

    if (!document || !productCode) {
        return res.status(400).json({ message: "Missing Mandatory Fields" })
    }

    try {
        var check_productcode = await Products.findOne({
            where: {
                product_code: productCode,
                is_active: true
            }
        })

        if (!check_productcode) {
            return res.status(400).json({ message: "Invalid or Inactive Product Code" })
        }

        var docs_count = await TechnicalDocuments.count({
            where: {
                product_code: productCode,
                is_active: true
            }
        })

        if (docs_count >= 10) {
            return res.status(400).json({ message: "Maximum 10 Documents are allowed for a product" });
        }

        var file = document[0];

        const ext = path.extname(file.originalname);
        const uniqueName = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;

        const docu_url = await uploadImage.uploadToS3('technical_documents/', uniqueName, file);

        await TechnicalDocuments.create({
            document_url: docu_url,
            product_code: productCode,
            category_code: check_productcode.category,
            subcategory_code: check_productcode.subcategory || 0,
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Document Added Successfully" });

    } catch (error) {
        return res.status(400).json({ message: "Error to Add Product Documents", reason: error.message });
    }
}

exports.delete_image = async (req, res) => {

    var id = req.body.id;

    if (!id) {
        return res.status(400).json({ message: "Missing Mandatory Fields" })
    }

    try {
        var check_image = await ProductImages.findOne({
            where: { id, is_active: true }
        })

        console.log(check_image);

        if (!check_image) {
            return res.status(400).json({ message: "Image not found or already deleted" })
        }

        await ProductImages.update(
            { is_active: false }, {
            where: { id }
        })

        return res.status(200).json({ message: "Image Deleted successfully" });

    } catch (error) {
        return res.status(400).json({ message: "Error to Delete Product Image", reason: error.message });
    }
}

exports.delete_docs = async (req, res) => {

    var id = req.body.id;

    if (!id) {
        return res.status(400).json({ message: "Missing Mandatory Fields" })
    }

    try {
        var check_docs = await TechnicalDocuments.findOne({
            where: { id, is_active: true }
        })

        if (!check_docs) {
            return res.status(400).json({ message: "Document not found or already deleted" })
        }

        await TechnicalDocuments.update(
            { is_active: false }, {
            where: { id }
        })

        return res.status(200).json({ message: "Document Deleted successfully" });

    } catch (error) {
        return res.status(400).json({ message: "Error to Delete Product Document", reason: error.message });
    }
}

exports.change_image = async (req, res) => {

    const image = req.files?.['image'];
    const productCode = req.body.productCode;
    const id = req.body.id;
    const created_by_id = req.user_id;

    if (!image || !productCode || !id) {
        return res.status(400).json({ message: "Missing Mandatory Fields" });
    }

    try {
        const check_productcode = await Products.findOne({
            where: {
                product_code: productCode,
                is_active: true
            }
        });

        if (!check_productcode) {
            return res.status(400).json({ message: "Invalid or Inactive Product Code" });
        }

        const check_id = await ProductImages.findOne({
            where: {
                product_code: productCode,
                is_active: true,
                id: id
            }
        });

        if (!check_id) {
            return res.status(400).json({ message: "Invalid or Inactive Id" });
        }

        const image_count = await ProductImages.count({
            where: {
                product_code: productCode,
                is_active: true
            }
        });

        if (image_count >= 10) {
            return res.status(400).json({ message: "Maximum 10 images are allowed for a product" });
        }

        const file = Array.isArray(image) ? image[0] : image;
        const ext = path.extname(file.originalname);
        const uniqueName = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
        const s3Url = await uploadImage.uploadToS3('images/', uniqueName, file);

        await ProductImages.update({
            image_url: s3Url,
            product_code: productCode,
            created_by_id: created_by_id
        }, {
            where: { id }
        });

        return res.status(200).json({ message: "Image Added Successfully" });

    } catch (error) {
        return res.status(400).json({ message: "Error to Add Product Images", reason: error.message });
    }
};

exports.change_docs = async (req, res) => {

    const docs = req.files?.['technicaldoc'];
    const productCode = req.body.productCode;
    const id = req.body.id;
    const created_by_id = req.user_id;

    if (!docs || !productCode || !id) {
        return res.status(400).json({ message: "Missing Mandatory Fields" });
    }

    try {
        const check_productcode = await Products.findOne({
            where: {
                product_code: productCode,
                is_active: true
            }
        });

        if (!check_productcode) {
            return res.status(400).json({ message: "Invalid or Inactive Product Code" });
        }

        const check_id = await TechnicalDocuments.findOne({
            where: {
                product_code: productCode,
                is_active: true,
                id: id
            }
        });

        if (!check_id) {
            return res.status(400).json({ message: "Invalid or Inactive Id" });
        }

        const doc_count = await TechnicalDocuments.count({
            where: {
                product_code: productCode,
                is_active: true
            }
        });

        if (doc_count >= 10) {
            return res.status(400).json({ message: "Maximum 10 Documents are allowed for a product" });
        }

        const file = Array.isArray(docs) ? docs[0] : docs;
        const ext = path.extname(file.originalname);
        const uniqueName = `product-${Date.now()}-${Math.floor(Math.random() * 10000)}${ext}`;
        const docu_url = await uploadImage.uploadToS3('technical_documents/', uniqueName, file);

        await TechnicalDocuments.update({
            document_url: docu_url,
            product_code: productCode,
            created_by_id: created_by_id
        }, {
            where: { id }
        });

        return res.status(200).json({ message: "Document Added Successfully" });

    } catch (error) {
        return res.status(400).json({ message: "Error to Add Document Images", reason: error.message });
    }
};

exports.get_singleproduct = async (req, res) => {

    try {

        const product_id = req.params.product_id;

        if (!product_id) {
            return res.status(400).json({ message: "Missing Product Id" });
        }

        const products = await Products.findAll({
            where: { unique_product_code: product_id },
            include: [
                {
                    model: Category,
                    as: 'product_category',
                    attributes: ["category_name"],
                }, {
                    model: SubCategory,
                    as: 'product_sub_category',
                    attributes: ["subcategory_name"],
                }, {
                    model: ProductBrand,
                    as: 'product_brand',
                    attributes: ["brand_name"],
                },
                {
                    model: ProductImages,
                    as: 'product_images',
                    attributes: ["id", "image_url", "product_code"],
                    where: { is_active: true },
                    required: false,
                },
                {
                    model: TechnicalDocuments,
                    as: 'product_documents',
                    attributes: ["id", "document_url", "product_code"],
                    where: { is_active: true },
                    required: false,
                }
            ],
            order: [['id', 'DESC'],
            [{ model: ProductImages, as: 'product_images' }, 'id', 'ASC'],
            [{ model: TechnicalDocuments, as: 'product_documents' }, 'id', 'ASC']]
        });

        const formattedProducts = products.map(product => ({
            productCode: product.product_code,
            productName: product.product_name,
            uniqueProductCode: product.unique_product_code,
            productName: product.product_name,
            description: product.description,
            quantity: product.quantity,
            unit: product.unit,
            price: product.price,
            currency: product.currency || "",
            weight: product.weight || "",
            discount: product.discount || "",
            hsnCode: product.hsn_code || "",
            gst: product.gst || "",
            serialNo: jsonparsefunc(product.serialNo) || [],
            categoryId: product.category || "",
            categoryName: product.product_category ? product.product_category.category_name : "",
            subCategoryId: product.subcategory || "",
            subCategoryName: product.product_sub_category ? product.product_sub_category.subcategory_name : "",
            brandId: product.brand || "",
            brandName: product.product_brand ? product.product_brand.brand_name : "",
            make: product.make || "",
            countryOfOrigin: product.origin_country || "",
            manufaturingYearAndMonth: product.manufacturing_year || "",
            State: product.state || "",
            district: product.district || "",
            additional_fields: jsonparsefunc(product.additional_fields) || "",
            images: (product.product_images || []).map(img => ({
                id: img.id,
                url: img.image_url || "",
                product_code: img.product_code || ""
            })),
            technicaldocs: (product.product_documents || []).map(doc => ({
                id: doc.id,
                url: doc.document_url || "",
                product_code: doc.product_code || ""
            })),
        }));

        return res.json(formattedProducts[0] || {});

    } catch (error) {
        return res.status(400).json({ message: "Error to Get Product Details", reason: error.message });
    }
}

exports.update_single_product = async (req, res) => {

    var product_id = String(req.params.product_id);
    var { field, value } = req.body;

    var created_by_id = req.user_id;

    if (!product_id || !field || !value) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    const allowedFields = ['product_name', 'description', 'quantity', 'price', 'discount', 'hsn_code', 'origin_country', 'state', 'manufacturing_year'];

    if (!allowedFields.includes(field)) {
        return res.status(400).json({ message: "Invalid field to update" });
    }

    try {

        var check_productcode = await Products.findOne({
            where: {
                unique_product_code: product_id,
            }
        })

        if (!check_productcode) {
            return res.status(400).json({ message: "Invalid Product Code" })
        }

        const updated = await Products.update(
            { [field]: value },
            {
                where: {
                    unique_product_code: product_id
                }
            }
        );

        if (field == 'quantity') {

            var find_product = await Inventory.findOne({
                where: {
                    product_code: String(product_id),
                    is_active: true
                }
            })

            if (find_product) {

                await Inventory.update(
                    { count: value || 0 },
                    {
                        where: {
                            id: find_product.id
                        }
                    }
                );
                console.log("Inventory updated.");
            }

        }
        
        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT021",
            user_id: created_by_id,
            transaction_id: product_id,
            description: 'Updated Product ' + check_productcode.product_name + ' ' + field,
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Updated successfully" });


    } catch (error) {
        return res.status(400).json({ message: "Error to Update Product Details", reason: error.message });
    }
}