const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const RawData = sequelize.define('RawData', {
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    project_type: {
        type: DataTypes.STRING,
        allowNull: false
    },
    project_name: {
        type: DataTypes.STRING,
        allowNull: true
    },
    json_data: {
        type: DataTypes.JSONB, // Using JSONB for flexibility
        allowNull: false
    },
    filename: {
        type: DataTypes.STRING
    }
}, {
    tableName: 'raw_data',
    timestamps: true,
    createdAt: 'uploaded_at',
    updatedAt: false
});

module.exports = RawData;
