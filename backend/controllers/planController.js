const { plans, workspaces } = require('../models');
const logger = require('../utils/logger');

exports.getPlans = async (req, res) => {
    try {
        const userId = req.user.id;
        const allPlans = await plans.findAll({
            where: { user_id: userId, status: 'active' },
            include: [{
                model: workspaces,
                as: 'workspaces'
            }]
        });
        res.json(allPlans);
    } catch (error) {
        logger.error('Error fetching plans:', error);
        res.status(500).json({ message: 'Error fetching plans' });
    }
};

exports.createPlan = async (req, res) => {
    const { workSpaceLimit, appsLimit, tasksLimit } = req.body;
    const userId = req.user.id;
    try {
        const newPlan = await plans.create({ workSpaceLimit, appsLimit, tasksLimit, user_id: userId });
        res.status(201).json(newPlan);
    } catch (error) {
        logger.error('Error creating plan:', error);
        res.status(500).json({ message: 'Error creating plan' });
    }
};
