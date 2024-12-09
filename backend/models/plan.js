module.exports = (sequelize, Sequelize) => {
  const Plan = sequelize.define(
    "plan",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      workSpaceLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      appsLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      tasksLimit: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      amount: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      planType: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      paymentIntentId: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      tableName: "plans",
      freezeTableName: true,
      timestamps: true,
    }
  );

  Plan.associate = (models) => {
    Plan.belongsTo(models.users, {
      foreignKey: "user_id",
      as: "user",
    });

    Plan.hasMany(models.workspaces, {
      foreignKey: "plan_id",
      as: "workspaces",
    });
  };

  Plan.migrate = async () => {
    // await Plan.destroy({ truncate: true });
  };
  return Plan;
};
