const router = require("express").Router();

const {
  createCoworkingClient,
  getCoworkingClients,
  bulkInsertCoworkingClients,
  uploadClientOccupancyImage,
  updateCoworkingClient,
} = require("../controllers/salesControllers/coworkingClientControllers");
const {
  createClientService,
  getClientServices,
} = require("../controllers/salesControllers/clientServiceControllers");
const {
  bulkInsertVirtualOfficeClients,
  updateVirtualOfficeClient,
  createVirtualOfficeClient,
  getVirtualOfficeClients,
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
} = require("../controllers/salesControllers/coworkingClientRevenue");

const {
  getAvailableDesks,
  getBookedDesks,
} = require("../controllers/salesControllers/deskController");

const {
  createMeetingRevenue,
  getMeetingRevenue,
  updateMeetingRevenue,
} = require("../controllers/salesControllers/MeetingRevenueController");

const {
  createAlternateRevenue,
  getAlternateRevenues,
} = require("../controllers/salesControllers/alternateRevenuesControllers");
const {
  getMembersByUnit,
} = require("../controllers/salesControllers/coworkingMemberControllers");

//Coworking routes
router.post("/onboard-co-working-client", createCoworkingClient);
router.get("/co-working-clients", getCoworkingClients);
router.patch("/update-co-working-clients", updateCoworkingClient);
router.get("/co-working-members", getMembersByUnit);
router.post(
  "/upload-client-unit-image",
  upload.single("unitImage"),
  uploadClientOccupancyImage
);
router.post(
  "/bulk-insert-co-working-clients",
  upload.single("clients"),
  bulkInsertCoworkingClients
);

//Virtual Office routes
router.post("/onboard-virtual-office-client", createVirtualOfficeClient);
router.get("/virtual-office-clients", getVirtualOfficeClients);
router.patch("/update-virtual-office-clients", updateVirtualOfficeClient);
router.post(
  "/bulk-insert-virtual-office-clients",
  upload.single("virtualoffice"),
  bulkInsertVirtualOfficeClients
);

//Revenues
router.post("/add-revenue", addRevenue);
router.get("/fetch-revenues", getRevenues);
router.get("/get-meeting-revenue", getMeetingRevenue);
router.post("/create-meeting-revenue", createMeetingRevenue);
router.patch("/update-meeting-revenue", updateMeetingRevenue);
router.get("/get-alternate-revenue", getAlternateRevenues);
router.post("/create-alternate-revenue", createAlternateRevenue);

//Service routes
router.post("/create-service", createClientService);
router.get("/services", getClientServices);

//Lead routes
router.post("/create-lead", createLead);
router.get("/leads", getLeads);
router.post("/bulk-insert-leads", upload.single("leads"), bulkInsertLeads);

//Desk routes
router.get("/available-desks/:unitId", getAvailableDesks);
router.get("/booked-desks/:serviceId", getBookedDesks);

module.exports = router;
