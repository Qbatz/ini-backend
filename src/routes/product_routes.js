const express = require('express');
const category_routes = require('../controller/category');
const router = express.Router();

router.post('/product/category', category_routes.add_category);

router.get('/product/category', category_routes.get_category);

router.post('/product/subCategory', category_routes.add_subCategory);

router.get('/product/subCategory', category_routes.get_subCategory);

router.post('/product/brand', category_routes.add_brand);

router.get('/product/brand', category_routes.get_brand);

module.exports = router;