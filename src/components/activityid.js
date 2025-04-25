const { Activity } = require('../models/activites')
const { Products } = require('../models/products')

const generateNextActivityId = async () => {
    const last = await Activity.findOne({
        order: [['id', 'DESC']],
        attributes: ['activity_id']
    });

    if (last && last.activity_id) {
        const lastNum = parseInt(last.activity_id.replace('AC', ''), 10);
        const nextNum = lastNum + 1;
        return `AC${String(nextNum).padStart(6, '0')}`;
    } else {
        return 'AC000001';
    }
};

const generateNextProductId = async () => {
    const last = await Products.findOne({
        order: [['id', 'DESC']],
        attributes: ['unique_product_code']
    });

    if (last && last.unique_product_code) {
        const lastNum = parseInt(last.unique_product_code.replace('P', ''), 10);
        const nextNum = lastNum + 1;
        return `P${String(nextNum).padStart(6, '0')}`;
    } else {
        return 'P000001';
    }
};

module.exports = { generateNextActivityId, generateNextProductId }