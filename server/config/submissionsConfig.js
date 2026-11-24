// Production submissions APIs used by the HR/Sales dashboards.
// Local development overrides these via the git-ignored server/.env file, e.g.:
//BIZNest
// SUBMISSIONS_API_KEY = yUUhCzgqAperxm3XvGz4AtjYbzf5ZfSWGfXau0PsgZk;
// SUBMISSIONS_WRITE_API_KEY =
//   a6fd3d36b3aff1713c2a67db7c430f799e3877b0689cf1c1d5144467d2fdcc89;

//MeWo
// MEWO_SUBMISSIONS_API_KEY =
//   b8e8ce41eb957f0788f3fe1663d45a85b7cecfb45624ecd55a93651e06a606b1;
// MEWO_SUBMISSIONS_WRITE_API_KEY =
//   c8bb3cc3bdd553d27a24feab9eee26034aad6e63e9612600f2e56fec48d56aba;
//MEWO_SUBMISSIONS_URL=http://localhost:3012/api/submissions

const PROD_BIZNEST_SUBMISSIONS_URL =
  "https://biznest-liard.vercel.app/api/submissions";
const PROD_MEWO_SUBMISSIONS_URL =
  "https://mewo-gamma.vercel.app/api/submissions";

module.exports = {
  PROD_BIZNEST_SUBMISSIONS_URL,
  PROD_MEWO_SUBMISSIONS_URL,
};
