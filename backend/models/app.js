module.exports = (sequelize, Sequelize) => {
  const App = sequelize.define(
    "app",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      workspace_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      app_type: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      app_key: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("active", "inactive"),
        allowNull: false,
        defaultValue: "active",
      },
    },
    {
      tableName: "apps",
      freezeTableName: true,
      timestamps: true,
    }
  );
  App.migrate = async () => {
    // await App.destroy({ truncate: true });
  };
  return App;
};
