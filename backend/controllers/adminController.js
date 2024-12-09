const bcrypt = require("bcrypt");
const { users, plans, workspaces, apps } = require("../models");
const { Op } = require("sequelize");

exports.getAllUsers = async (req, res) => {
  try {
    const { search, role } = req.query;

    let whereClause = {};

    if (search) {
      whereClause = {
        [Op.or]: [{ email: { [Op.like]: `%${search}%` } }],
      };
    }

    if (role) {
      whereClause.role = role;
    }

    const userList = await users.findAll({
      where: whereClause,
      attributes: { exclude: ["password"] },
    });

    res.json({
      status: "success",
      data: userList,
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.getUserPlans = async (req, res) => {
  try {
    const { id } = req.params;

    const userPlan = await plans.findOne({
      where: { user_id: id, status: "active" },
      order: [["createdAt", "DESC"]], // Get the most recent plan
      include: [
        {
          model: users,
          as: "user",
          attributes: ["email"],
        },
      ],
    });

    if (!userPlan) {
      return res.json({
        status: "success",
        data: {
          planType: "No Active Plan ",
          expiryDate: null,
          workSpaceUsed: 0,
          workSpaceLimit: 0,
          appsUsed: 0,
          appsLimit: 0,
          tasksUsed: 0,
          tasksLimit: 0,
        },
      });
    }

    const expiryDate = new Date(userPlan.updatedAt);
    expiryDate.setMonth(expiryDate.getMonth() + 1);

    const workspace = await workspaces.findAll({
      where: { plan_id: userPlan.id },
    });

    const app = await apps.findAll({
      where: {
        workspace_id: { [Op.in]: workspace.map((w) => w.id) },
        status: "active",
      },
    });

    res.json({
      status: "success",
      data: {
        planType: userPlan.planType,
        expiryDate,
        workSpaceUsed: workspace.length,
        workSpaceLimit: userPlan.workSpaceLimit,
        appsUsed: app.length,
        appsLimit: userPlan.appsLimit,
        tasksUsed: 0,
        tasksLimit: userPlan.tasksLimit,
      },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.createUser = async (req, res) => {
  try {
    const { email, password, role, status } = req.body;

    const duplicate = await users.findOne({ where: { email } });
    if (duplicate) {
      return res.status(400).json({
        status: "error",
        message: "Email already exists",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await users.create({
      email,
      password: hashedPassword,
      role,
      status,
    });

    // Remove password from response
    const userResponse = user.toJSON();
    delete userResponse.password;

    res.status(201).json({
      status: "success",
      data: userResponse,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email, role, status } = req.body;

    const user = await users.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await user.update({
      email,
      role,
      status,
    });

    const userResponse = user.toJSON();
    delete userResponse.password;

    res.json({
      status: "success",
      data: userResponse,
    });
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await users.findByPk(id);
    if (!user) {
      return res.status(404).json({
        status: "error",
        message: "User not found",
      });
    }

    await user.destroy();

    res.status(204).send();
  } catch (error) {
    res.status(400).json({
      status: "error",
      message: error.message,
    });
  }
};
