const express = require('express');
const category_routes = require('../controller/category');
const productsroutes = require('../controller/products');
const router = express.Router();
const multer = require('multer');
const upload = multer();

router.post('/product/category', category_routes.add_category);

router.get('/product/category', category_routes.get_category);

router.post('/product/subCategory', category_routes.add_subCategory);

router.get('/product/subCategory', category_routes.get_subCategory);

router.post('/product/brand', category_routes.add_brand);

router.get('/product/brand', category_routes.get_brand);

router.post('/product/product', upload.fields([{ name: 'images', maxCount: 10 }, { name: 'technicaldocs', maxCount: 10 }]), productsroutes.add_product);

router.get('/product/product', productsroutes.get_all_products);

router.patch('/product/product', productsroutes.update_product);

router.delete('/product/product', productsroutes.delete_product);

module.exports = router;