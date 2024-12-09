module.exports = (sequelize, Sequelize) => {
  const User = sequelize.define(
    "user",
    {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      email: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      password: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      status: {
        type: Sequelize.ENUM("allow", "block"),
        allowNull: false,
        defaultValue: "allow",
      },
      reason: {
        type: Sequelize.STRING,
        allowNull: true,
      },
      lastLogin: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      role: {
        type: Sequelize.ENUM("admin", "user"),
        allowNull: false,
        defaultValue: "user",
      },
    },
    {
      tableName: "users",
      freezeTableName: true,
      timestamps: true,
    }
  );

  User.associate = (models) => {
    User.hasMany(models.plans, {
      foreignKey: "user_id",
      as: "plans",
    });
  };

  User.migrate = async () => {
    // await User.destroy({ truncate: true });
    // await User.create({
    //     email: "admin@gmail.com",
    //     password: "admin",
    //     role: "admin"
    // });
  };
  return User;
};
