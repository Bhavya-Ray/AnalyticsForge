require('dotenv').config();
const SummaryData = require('./models/SummaryData');
const sequelize = require('./config/database');

async function check() {
    try {
        await sequelize.authenticate();
        console.log('Database connected.');
        const count = await SummaryData.count();
        console.log(`Total records in SummaryData: ${count}`);

        const latest = await SummaryData.findOne({ order: [['createdAt', 'DESC']] });
        if (latest) {
            console.log('LATEST RECORD:');
            console.log(JSON.stringify({
                id: latest.id,
                project: latest.project_type,
                createdAt: latest.createdAt,
                hasSummary: !!latest.summary_json,
                hasCategory: !!latest.category_json,
                hasScatter: !!latest.scatter_json
            }, null, 2));

            if (latest.summary_json) console.log('Summary Data Sample:', latest.summary_json.slice(0, 2));
        }
        process.exit(0);
    } catch (err) {
        console.error('ERROR during check:');
        console.error(err);
        process.exit(1);
    }
}

check();
