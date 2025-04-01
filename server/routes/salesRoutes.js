const router = require("express").Router();

const {
  createCoworkingClient,
  getCoworkingClients,
  bulkInsertCoworkingClients,
  uploadClientOccupancyImage,
} = require("../controllers/salesControllers/coworkingClientControllers");
const {
  createClientService,
  getClientServices,
} = require("../controllers/salesControllers/clientServiceControllers");
const {
  bulkInsertVirtualOfficeClients,
} = require("../controllers/salesControllers/virtualOfficeClientControllers");
const {
  createLead,
  getLeads,
  bulkInsertLeads,
} = require("../controllers/salesControllers/leadsControllers");
const upload = require("../config/multerConfig");

const {
  addRevenue,
  getRevenues,
} = require("../controllers/salesControllers/revenueController");

const {
  getAvailableDesks,
  getBookedDesks,
} = require("../controllers/salesControllers/deskController");

router.post("/onboard-co-working-client", createCoworkingClient);
router.get("/co-working-clients", getCoworkingClients);
router.post(
  "/upload-client-unit-image",
  upload.single("unitImage"),
  uploadClientOccupancyImage
);
router.post("/create-service", createClientService);
router.get("/services", getClientServices);
router.post("/create-lead", createLead);
router.get("/leads", getLeads);
router.get("/available-desks/:unitId", getAvailableDesks);
router.get("/booked-desks/:serviceId", getBookedDesks);
router.post("/bulk-insert-leads", upload.single("leads"), bulkInsertLeads);
router.post("/add-revenue", addRevenue);
router.get("/fetch-revenues", getRevenues);
router.post(
  "/bulk-insert-co-working-clients",
  upload.single("clients"),
  bulkInsertCoworkingClients
);
router.post(
  "/bulk-insert-virtual-office-clients",
  upload.single("virtualoffice"),
  bulkInsertVirtualOfficeClients
);

module.exports = router;
