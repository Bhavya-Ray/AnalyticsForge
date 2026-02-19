const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

const sequelize = require('./config/database');
const RawData = require('./models/RawData');
const ProcessedData = require('./models/ProcessedData');
const SummaryData = require('./models/SummaryData');
const uploadRoutes = require('./routes/uploadRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);

// Basic Route
app.get('/', (req, res) => {
    res.send('AnalyticsForge Backend is running!');
});

// Database Connection and Sync
sequelize.authenticate()
    .then(() => {
        console.log('Database connected...');
        return sequelize.sync({ alter: true }); // Use alter: true to update schema without dropping
    })
    .then(() => {
        console.log('Tables synced');
    })
    .catch(err => console.log('Error: ' + err));

// Start Server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
