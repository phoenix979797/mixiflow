const db = require('../models');
const { workspaces } = db;
const logger = require('../utils/logger');

exports.getWorkspaces = async (req, res) => {
    try {
        const userId = req.user.id;
        const allWorkspaces = await workspaces.findAll({ where: { user_id: userId } });
        res.json(allWorkspaces);
    } catch (error) {
        logger.error('Error fetching workspaces:', error);
        res.status(500).json({ message: 'Error fetching workspaces' });
    }
};

exports.createWorkspace = async (req, res) => {
    const { name, plan_id } = req.body;
    const userId = req.user.id;
    try {
        const newWorkspace = await workspaces.create({ name, plan_id, user_id: userId });
        res.status(201).json(newWorkspace);
    } catch (error) {
        logger.error('Error creating workspace:', error);
        res.status(500).json({ message: 'Error creating workspace' });
    }
};

exports.getWorkspaceById = async (req, res) => {
    const { id } = req.params;
    console.log("id : ", id)
    try {
        const workspace = await workspaces.findByPk(id, {
            include: [
                {
                    model: db.apps,
                    as: 'apps'
                },
                {
                    model: db.plans,
                    as: 'plan',
                    attributes: ['appsLimit']
                }
            ]
        });

        if (!workspace) {
            return res.status(404).json({ message: 'Workspace not found' });
        }

        res.status(200).json(workspace);
    } catch (error) {
        logger.error('Error fetching workspace:', error);
        res.status(500).json({ message: 'Error fetching workspace' });
    }
};