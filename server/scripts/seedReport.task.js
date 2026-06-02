require('dotenv').config();
const connectDb = require('../config/db');
const Report = require('../models/reports/Report');

(async () => {
  try {
    await connectDb(process.env.DB_URL);
    await Report.updateOne(
      { reportKey: 'task' },
      {
        $set: {
          module: 'Task',
          reportName: 'Task Report',
          reportKey: 'task',
          status: true,
        },
      },
      { upsert: true },
    );

    console.log('Seeded report task');
    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
})();
