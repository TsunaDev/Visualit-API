const { Sequelize, DataTypes, Model } = require('sequelize');
const sequelize = new Sequelize(process.env.LOGS_DB, process.env.LOGS_USERNAME, process.env.LOGS_PASSWORD, {
  host: process.env.LOGS_URI,
  dialect: 'mariadb',
  logging: false,
  pool: {
    max: 5,
    idle: 30000,
    acquire: 60000,
  }
});

/**
 * Schéma MongoDB pour le système de logs.
 */
sequelize.define("bedStateEvents", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  bedID: {
    type: DataTypes.UUID,
    allowNull: false
  },
  serviceID: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  userRole: {
    type: DataTypes.STRING,
    allowNull: false
  },
  oldState: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  newState: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  dateBegin: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW,
    allowNull: false
  },
  dateEnd: {
    type: DataTypes.DATE,
    allowNull: true
  },
});

setTimeout(_ => {
  sequelize.sync().then(_ => {
    console.log('Connection has been established successfully.');
  }).catch(e => {
    console.error('Unable to connect to the database:', e);
  });
}, 10000);

const BedState = {
  free: 0,
  busy: 2,
  leaving: 1,
  unknown: -1
};

module.exports = {
  BedState,
  BedStateEvent: sequelize.models.bedStateEvents
};
