require('dotenv').config();
const connectDb = require('../config/db');
const Report = require('../models/reports/Report');

(async () => {
  try {
    await connectDb(process.env.DB_URL);
    await Report.updateOne(
      { reportKey: 'performance' },
      {
        $set: {
          module: 'Performance',
          reportName: 'Performance',
          reportKey: 'performance',
          status: true,
        },
      },
      { upsert: true },
    );

    console.log('Seeded report performance');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
