const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const ProcessedData = sequelize.define('ProcessedData', {
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
    cleaned_json: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    source_file_id: {
        type: DataTypes.INTEGER,
        allowNull: true
    }
}, {
    tableName: 'processed_data',
    timestamps: true
});

module.exports = ProcessedData;
