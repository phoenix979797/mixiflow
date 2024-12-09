module.exports = (sequelize, Sequelize) => {
  const Workspace = sequelize.define(
    "workspace",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      plan_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
    },
    {
      tableName: "workspaces",
      freezeTableName: true,
      timestamps: true,
    }
  );

  Workspace.associate = (models) => {
    Workspace.belongsTo(models.plans, {
      foreignKey: "plan_id",
      as: "plan",
    });

    Workspace.hasMany(models.apps, {
      foreignKey: "workspace_id",
      as: "apps",
    });
  };

  Workspace.migrate = async () => {
    // await Workspace.destroy({ truncate: true });
  };
  return Workspace;
};
