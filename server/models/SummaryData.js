const { DataTypes } = require('sequelize');
const sequelize = require('../config/database');

const SummaryData = sequelize.define('SummaryData', {
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
    summary_json: {
        type: DataTypes.JSONB,
        allowNull: false
    },
    category_json: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    gender_json: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    scatter_json: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    kpi_json: {
        type: DataTypes.JSONB,
        allowNull: true
    },
    charts_json: {
        type: DataTypes.JSONB,
        allowNull: true
    }
}, {
    tableName: 'summary_data',
    timestamps: true
});

module.exports = SummaryData;
