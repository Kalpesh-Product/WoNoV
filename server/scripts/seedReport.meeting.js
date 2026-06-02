require('dotenv').config();
const connectDb = require('../config/db');
const Report = require('../models/reports/Report');

(async () => {
  try {
    await connectDb(process.env.DB_URL);
    await Report.updateOne(
      { reportKey: 'meeting' },
      {
        $set: {
          module: 'Meeting',
          reportName: 'Meeting',
          reportKey: 'meeting',
          status: true,
        },
      },
      { upsert: true },
    );

    console.log('Seeded report meeting');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
