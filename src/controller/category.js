const { Category, SubCategory, ProductBrand } = require('../models/category')
const { Activity } = require('../models/activites');
const activityid = require('../components/activityid');
const { Op, fn, col, where } = require('sequelize');

exports.add_category = async (req, res) => {

    var { name } = req.body;

    var created_by_id = req.user_id;

    try {

        if (!name) {
            return res.status(400).json({ message: "Missing Category Name" });
        }

        // var check_name = await Category.findOne({ where: { category_name: name, is_active: true } });

        const check_name = await Category.findOne({
            where: {
                [Op.and]: [
                    where(fn('LOWER', col('category_name')), name.toLowerCase()),
                    { is_active: true }
                ]
            }
        });

        if (check_name) {
            return res.status(400).json({ message: "Category Name Already Exists" });
        }

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

        await Category.create({
            category_code: category_code,
            category_name: name,
            created_by_id: created_by_id
        })

        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT022",
            user_id: created_by_id,
            transaction_id: category_code,
            description: 'Added Category ' + name,
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Added successfully" })

    } catch (error) {
        return res.status(400).json({ message: "Error to Add Category", reason: error.message })
    }
}

exports.get_category = async (req, res) => {

    var created_by_id = req.user_id;

    try {

        var get_all_category = await Category.findAll({
            attributes: [['category_code', 'id'], ['category_name', 'name']],
            where: { is_active: true }
        })

        return res.status(200).json(get_all_category)

    } catch (error) {
        return res.status(400).json({ message: "Error to Get Category", reason: error.message })
    }
}

exports.add_subCategory = async (req, res) => {

    var { catId, name } = req.body;

    if (!catId || !name) {
        return res.status(400).json({ message: "Missing Required Fields" });
    }

    var created_by_id = req.user_id;

    try {

        var check_catId = await Category.findOne({ where: { category_code: catId, is_active: true } });

        if (!check_catId) {
            return res.status(400).json({ message: "Invalid Or Inactive Category Id" });
        }

        // var check_subname = await SubCategory.findOne({ where: { subcategory_name: name, category_code: catId, is_active: true } })

        const check_subname = await SubCategory.findOne({
            where: {
                [Op.and]: [
                    where(fn('LOWER', col('subcategory_name')), name.toLowerCase()),
                    { category_code: catId },
                    { is_active: true }
                ]
            }
        });

        if (check_subname) {
            return res.status(400).json({ message: "SubCategory Name Already Exists" });
        }

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

        await SubCategory.create({
            subcategory_code: subcategory_code,
            category_code: catId,
            subcategory_name: name,
            created_by_id: created_by_id
        })

        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT023",
            user_id: created_by_id,
            transaction_id: subcategory_code,
            description: 'Added Sub Category ' + name,
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Added successfully" })
    } catch (error) {
        return res.status(400).json({ message: "Error to Add Sub Category", reason: error.message })
    }
}

exports.get_subCategory = async (req, res) => {

    var catId = req.query.catId;

    if (!catId) {
        return res.status(400).json({ message: "Missing Category Id" });
    }

    var created_by_id = req.user_id;

    try {

        var check_catId = await Category.findOne({ where: { category_code: catId, is_active: true } });

        if (!check_catId) {
            return res.status(400).json({ message: "Invalid Or Inactive Category Id" });
        }

        var get_sub_category = await SubCategory.findAll({
            attributes: [['subcategory_code', 'id'], ['subcategory_name', 'name']],
            where: { category_code: catId, is_active: true }
        })

        return res.status(200).json(get_sub_category)

    } catch (error) {
        return res.status(400).json({ message: "Error to Get Category", reason: error.message })
    }

}

exports.add_brand = async (req, res) => {

    var { name } = req.body;

    var created_by_id = req.user_id;

    try {

        if (!name) {
            return res.status(400).json({ message: "Missing Brandஃஃ Name" });
        }

        // var check_name = await ProductBrand.findOne({ where: { brand_name: name, is_active: true } });

        const check_name = await ProductBrand.findOne({
            where: {
                [Op.and]: [
                    where(fn('LOWER', col('brand_name')), name.toLowerCase()),
                    { is_active: true }
                ]
            }
        });

        if (check_name) {
            return res.status(400).json({ message: "Brand Name Already Exists" });
        }

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

        await ProductBrand.create({
            brand_code: brand_code,
            brand_name: name,
            created_by_id: created_by_id,
            updated_by_id: 0
        })

        const activity_id = await activityid.generateNextActivityId();

        await Activity.create({
            activity_id,
            activity_type_id: "ACT024",
            user_id: created_by_id,
            transaction_id: brand_code,
            description: 'Added New Brand ' + name,
            created_by_id: created_by_id
        });

        return res.status(200).json({ message: "Added successfully" })

    } catch (error) {
        return res.status(400).json({ message: "Error to Add Brand", reason: error.message })
    }

}

exports.get_brand = async (req, res) => {

    var created_by_id = req.user_id;

    try {

        var get_all_brand = await ProductBrand.findAll({
            attributes: [['brand_code', 'id'], ['brand_name', 'name']],
            where: { is_active: true },
        })

        return res.status(200).json(get_all_brand)

    } catch (error) {
        return res.status(400).json({ message: "Error to Get Brand", reason: error.message })
    }
}