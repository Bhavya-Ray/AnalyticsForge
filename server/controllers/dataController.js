const RawData = require('../models/RawData');
const ProcessedData = require('../models/ProcessedData');
const SummaryData = require('../models/SummaryData');
const csv = require('csv-parser');
const fs = require('fs');
const axios = require('axios');
const sequelize = require('../config/database');

const PYTHON_ENGINE_URL = process.env.PYTHON_ENGINE_URL || 'http://127.0.0.1:8000';

exports.uploadFile = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const projectType = req.body.projectType || 'general';
        const projectName = req.body.projectName || null;
        const results = [];

        // Reading the uploaded CSV file
        fs.createReadStream(req.file.path)
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                // Store raw data
                const rawEntry = await RawData.create({
                    project_type: projectType,
                    project_name: projectName,
                    json_data: results,
                    filename: req.file.originalname
                });

                // Trigger processing (async or sync)
                // For now, let's do it synchronously to return immediate feedback
                const processed = processData(results);
                console.log(`[DEBUG] Processed ${processed.length} rows`);

                const processedEntry = await ProcessedData.create({
                    project_type: projectType,
                    project_name: projectName,
                    cleaned_json: processed,
                    source_file_id: rawEntry.id
                });

                // Call Python Analytics Engine for dynamic chart calculation
                let dynamicAnalytics = null;
                try {
                    console.log(`[DEBUG] Sending data to Python Engine at ${PYTHON_ENGINE_URL}/analyze`);
                    const pythonResponse = await axios.post(`${PYTHON_ENGINE_URL}/analyze`, {
                        data: processed,
                        projectType: projectType
                    });
                    dynamicAnalytics = pythonResponse.data;
                    console.log(`[DEBUG] Python Engine Response: charts=${dynamicAnalytics.charts?.length}, kpis=${dynamicAnalytics.kpis?.length}`);
                } catch (pythonError) {
                    console.error('[ERROR] Python Engine failed!');
                    if (pythonError.response) {
                        console.error(`- Status: ${pythonError.response.status}`);
                        console.error(`- Data:`, pythonError.response.data);
                    } else {
                        console.error(`- Message: ${pythonError.message}`);
                    }
                    // Fallback to manual aggregation if Python fails
                }

                // Aggregate (Manual fallback for legacy compatibility or if Python fails)
                const summary = aggregateData(processed);

                const summaryRecord = await SummaryData.create({
                    project_type: projectType,
                    project_name: projectName,
                    summary_json: summary.monthly,
                    category_json: summary.category,
                    gender_json: summary.gender,
                    scatter_json: summary.scatter,
                    kpi_json: dynamicAnalytics && dynamicAnalytics.kpis ? dynamicAnalytics.kpis : summary.kpi,
                    charts_json: dynamicAnalytics && dynamicAnalytics.charts && dynamicAnalytics.charts.length > 0 ? dynamicAnalytics.charts : null
                });
                console.log(`[DEBUG] Data saved for project: ${projectType}, ID: ${summaryRecord.id}`);

                // Cleanup uploaded file
                fs.unlinkSync(req.file.path);

                res.status(200).json({
                    message: 'File uploaded and processed successfully',
                    rowsProcessed: processed.length,
                    summary: summary,
                    summary_id: summaryRecord.id, // Return the ID explicitly
                    project_type: projectType,
                    trend_json: summary.monthly,
                    dynamicAnalytics: dynamicAnalytics
                });
            });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Server Error' });
    }
};

// Helper functions
function processData(data) {
    if (!data || data.length === 0) return [];

    const headers = Object.keys(data[0]);

    return data.map(row => {
        const newRow = {};
        for (const key of headers) {
            let value = row[key];
            if (value === null || value === undefined) {
                newRow[key] = null;
                continue;
            }
            // Trim string
            if (typeof value === 'string') {
                value = value.trim();

                // Try to convert to number by removing currency symbols and commas
                const cleanedValue = value.replace(/[$,]/g, '');
                if (cleanedValue !== '' && !isNaN(cleanedValue)) {
                    newRow[key] = Number(cleanedValue);
                    continue;
                }
            }

            // Direct number check for non-string values
            if (!isNaN(value) && value !== '') {
                newRow[key] = Number(value);
            } else {
                newRow[key] = value;
            }
        }

        // Add Month column if Date exists
        const dateKey = headers.find(h => h.toLowerCase().includes('date') || h.toLowerCase().includes('time'));
        if (dateKey && newRow[dateKey]) {
            const dateObj = new Date(newRow[dateKey]);
            if (!isNaN(dateObj)) {
                newRow['Month'] = dateObj.toLocaleString('default', { month: 'short' });
                newRow['Year'] = dateObj.getFullYear();
            }
        }

        return newRow;
    }).filter(row => {
        // Remove rows that are completely empty or have nulls in critical fields?
        // For now, remove if all values are empty
        return Object.values(row).some(val => val !== null && val !== '');
    });
}

function aggregateData(data) {
    if (!data || data.length === 0) return { monthly: [], kpi: {} };

    // Find numeric columns for aggregation
    const headers = Object.keys(data[0]);
    const numericKeys = headers.filter(h => typeof data[0][h] === 'number');
    const stringKeys = headers.filter(h => typeof data[0][h] === 'string'); // Added for categorical aggregation
    const revenueKey = numericKeys.find(key => key.toLowerCase().includes('revenue') || key.toLowerCase().includes('sales') || key.toLowerCase().includes('amount')) || numericKeys[0];


    // Monthly Aggregation
    const monthlyData = {};
    const totalMetrics = {};

    numericKeys.forEach(key => totalMetrics[key] = 0);

    data.forEach(row => {
        const month = row['Month'] || row['month'] || row['Date'] || row['date'] || 'Total';
        if (!monthlyData[month]) {
            monthlyData[month] = {};
            numericKeys.forEach(k => monthlyData[month][k] = 0);
        }
        numericKeys.forEach(k => {
            monthlyData[month][k] += (row[k] || 0);
        });
    });

    const monthlyResult = Object.keys(monthlyData).map(monthKey => ({
        month: monthKey,
        value: Math.round(monthlyData[monthKey][revenueKey] || 0)
    }));

    // --- Categorical Aggregation ---
    // Prioritize product-related columns over demographic fields
    const productKeywords = ['product', 'item', 'category', 'type', 'name', 'sku'];
    const excludeKeywords = ['gender', 'sex', 'id', 'transaction', 'date', 'time', 'month', 'year', 'filename'];

    console.log('[CATEGORY DEBUG] All string columns:', stringKeys);

    // Filter out excluded columns
    const candidateKeys = stringKeys.filter(key =>
        !excludeKeywords.some(exclude => key.toLowerCase().includes(exclude))
    );

    console.log('[CATEGORY DEBUG] Candidate columns (after exclusions):', candidateKeys);

    // First, try to find a product-related column
    let startCategoryKey = candidateKeys.find(key => {
        const lowerKey = key.toLowerCase();
        const hasProductKeyword = productKeywords.some(keyword => lowerKey.includes(keyword));
        const uniqueValues = new Set(data.map(r => r[key])).size;
        console.log(`[CATEGORY DEBUG] Checking "${key}": hasProductKeyword=${hasProductKeyword}, uniqueValues=${uniqueValues}`);
        return hasProductKeyword && uniqueValues > 1 && uniqueValues < 50;
    });

    console.log('[CATEGORY DEBUG] Product column found:', startCategoryKey);

    // If no product column found, use any suitable categorical column
    if (!startCategoryKey) {
        startCategoryKey = candidateKeys.find(key => {
            const uniqueValues = new Set(data.map(r => r[key])).size;
            return uniqueValues > 1 && uniqueValues < 50;
        });
        console.log('[CATEGORY DEBUG] Fallback column found:', startCategoryKey);
    }

    // Last resort: use first string column
    if (!startCategoryKey) {
        startCategoryKey = stringKeys[0];
        console.log('[CATEGORY DEBUG] Using first string column:', startCategoryKey);
    }

    console.log('[CATEGORY DEBUG] FINAL SELECTED COLUMN:', startCategoryKey);

    let categoryResult = [];
    if (startCategoryKey) {
        const catData = {};
        data.forEach(row => {
            const cat = String(row[startCategoryKey] || 'Unknown').slice(0, 30); // Increased from 20 to 30 for product names
            if (!catData[cat]) {
                catData[cat] = { name: cat, value: 0 };
            }
            catData[cat].value += (row[revenueKey] || 0);
        });

        categoryResult = Object.values(catData)
            .sort((a, b) => b.value - a.value)
            .slice(0, 8); // Top 8

        console.log('[CATEGORY DEBUG] Top categories:', categoryResult.map(c => c.name));
    }

    // --- Gender Aggregation (Separate from Products) ---
    const genderKey = stringKeys.find(key =>
        key.toLowerCase().includes('gender') || key.toLowerCase().includes('sex')
    );

    let genderResult = [];
    if (genderKey) {
        const genderData = {};
        data.forEach(row => {
            const gender = String(row[genderKey] || 'Unknown');
            if (!genderData[gender]) {
                genderData[gender] = { name: gender, value: 0 };
            }
            genderData[gender].value += (row[revenueKey] || 0);
        });

        genderResult = Object.values(genderData)
            .sort((a, b) => b.value - a.value);

        console.log('[GENDER DEBUG] Gender distribution:', genderResult.map(g => `${g.name}: ${g.value}`));
    }

    // --- Scatter Plot Aggregation ---
    let scatterResult = [];
    if (numericKeys.length >= 2) {
        const xKey = numericKeys[0];
        const yKey = numericKeys[1];
        scatterResult = data.slice(0, 100).map(row => ({
            x: row[xKey] || 0,
            y: row[yKey] || 0,
            name: String(row[startCategoryKey] || 'Point')
        }));
    }

    const totalRevenue = data.reduce((acc, curr) => acc + (curr[revenueKey] || 0), 0);

    const kpi = {
        totalRevenue: Math.round(totalRevenue),
        growth: 12.4, // Mock growth for now
        primaryMetric: revenueKey || 'Value',
        categoryMetric: startCategoryKey || 'Category',
        scatterKeys: numericKeys.slice(0, 2)
    };

    return {
        monthly: monthlyResult,
        category: categoryResult,
        gender: genderResult,
        scatter: scatterResult,
        kpi: kpi
    };
}

exports.getAnalyticsById = async (req, res) => {
    const { id } = req.params;
    try {
        const summary = await SummaryData.findByPk(id);

        if (!summary) return res.status(404).json({ message: 'No data found' });

        res.json({
            id: summary.id,
            project_type: summary.project_type,
            project_name: summary.project_name,
            summary_json: summary.summary_json,
            category_json: summary.category_json,
            gender_json: summary.gender_json,
            scatter_json: summary.scatter_json,
            kpi_json: summary.kpi_json,
            charts_json: summary.charts_json,
            createdAt: summary.createdAt,
            updatedAt: summary.updatedAt
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getAnalytics = async (req, res) => {
    const { projectType } = req.params;
    try {
        const summary = await SummaryData.findOne({
            where: { project_type: projectType },
            order: [['createdAt', 'DESC']]
        });

        if (!summary) return res.status(404).json({ message: 'No data found' });

        // Auto-heal legacy dashboards where Python recommended a boxPlot
        // but didn't populate chart.data (causes blank chart renders).
        const charts = summary.charts_json;
        const needsBoxPlotFix =
            Array.isArray(charts) &&
            charts.some(c => c && c.type === 'boxPlot' && (!Array.isArray(c.data) || c.data.length === 0));

        if (needsBoxPlotFix) {
            try {
                const latestProcessed = await ProcessedData.findOne({
                    where: { project_type: projectType },
                    order: [['createdAt', 'DESC']]
                });

                if (latestProcessed?.cleaned_json) {
                    const pythonResponse = await axios.post(`${PYTHON_ENGINE_URL}/analyze`, {
                        data: latestProcessed.cleaned_json,
                        projectType: projectType
                    });

                    const dynamicAnalytics = pythonResponse?.data;
                    if (dynamicAnalytics?.charts && Array.isArray(dynamicAnalytics.charts) && dynamicAnalytics.charts.length > 0) {
                        await summary.update({
                            charts_json: dynamicAnalytics.charts,
                            kpi_json: dynamicAnalytics.kpis || summary.kpi_json
                        });
                    }
                }
            } catch (err) {
                console.warn('[WARN] BoxPlot auto-fix failed:', err?.message || err);
                // Do not fail the request; return whatever we have.
            }
        }

        // Return properly formatted response with all JSON fields
        res.json({
            id: summary.id,
            project_type: summary.project_type,
            project_name: summary.project_name,
            summary_json: summary.summary_json,
            category_json: summary.category_json,
            gender_json: summary.gender_json,
            scatter_json: summary.scatter_json,
            kpi_json: summary.kpi_json,
            charts_json: summary.charts_json,
            createdAt: summary.createdAt,
            updatedAt: summary.updatedAt
        });
    } catch (error) {
        console.error('Analytics fetch error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

exports.getProcessingStatus = async (req, res) => {
    // TODO: Implement status check if we move to async processing
    res.json({ status: 'completed' });
};

exports.getAllDashboards = async (req, res) => {
    try {
        const dashboards = await SummaryData.findAll({
            attributes: [
                'project_type',
                'project_name',
                [sequelize.fn('MAX', sequelize.col('createdAt')), 'latestCreatedAt'],
                [sequelize.fn('MAX', sequelize.col('id')), 'latest_id'] // Use distinct alias
            ],
            group: ['project_type', 'project_name'],
            order: [[sequelize.fn('MAX', sequelize.col('createdAt')), 'DESC']],
            raw: true // Get raw data to avoid model mapping issues with aliased ID
        });

        res.json(dashboards);
    } catch (error) {
        console.error('Fetch dashboards error:', error);
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};
