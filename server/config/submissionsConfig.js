// Production submissions APIs used by the HR/Sales dashboards.
// Local development overrides these via the git-ignored server/.env file, e.g.:

const PROD_BIZNEST_SUBMISSIONS_URL =
  "https://biznest-liard.vercel.app/api/submissions";
const PROD_MEWO_SUBMISSIONS_URL =
  "https://mewo-gamma.vercel.app/api/submissions";

module.exports = {
  PROD_BIZNEST_SUBMISSIONS_URL,
  PROD_MEWO_SUBMISSIONS_URL,
};
