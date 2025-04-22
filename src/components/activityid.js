const { Activity } = require('../models/activites')

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

module.exports = { generateNextActivityId }