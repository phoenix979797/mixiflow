require("dotenv").config();
const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    dialect: "mysql",
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

db.users = require("./user")(sequelize, Sequelize);
db.plans = require("./plan")(sequelize, Sequelize);
db.workspaces = require("./workspace")(sequelize, Sequelize);
db.apps = require("./app")(sequelize, Sequelize);
db.sync = async () => {
  await sequelize.sync();

  Object.keys(db).forEach((key) => {
    if (db[key].migrate) {
      db[key].migrate();
    }
    if (db[key].associate) {
      db[key].associate(db);
    }
  });
};

module.exports = db;
