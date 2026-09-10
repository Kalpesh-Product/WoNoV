const {
  raiseTicket,
  acceptTicket,
  assignTicket,
  closeTicket,
  escalateTicket,
  getTickets,
  fetchFilteredTickets,
  rejectTicket,
  getSingleUserTickets,
  filterMyTickets,
  filterTodayTickets,
  ticketData,
  getAllTickets,
  getOtherTickets,
  getAllDeptTickets,
  getTeamMemberTickets,
  updateOtherTicket,
  ticketsReports,
} = require("../controllers/ticketsControllers/ticketsControllers");
const { ticketUpload } = require("../config/ticketUploadConfig");

const {
  supportTicket,
} = require("../controllers/ticketsControllers/supportTicketsController");
const {
  addTicketIssue,
  getTicketIssues,
  rejectTicketIssue,
  getNewTicketIssues,
  addDepartmentTicketIssue,
  updateDepartmentTicketIssue,
  deleteDepartmentTicketIssue,
} = require("../controllers/ticketsControllers/ticketIssueController");

const router = require("express").Router();

router.patch("/add-ticket-issue", addTicketIssue);
router.get("/ticket-issues/:department", getTicketIssues);
router.get("/new-ticket-issues/:department", getNewTicketIssues);
router.post("/department-ticket-issues/:departmentId", addDepartmentTicketIssue);
router.patch(
  "/department-ticket-issues/:departmentId/:issueId",
  updateDepartmentTicketIssue,
);
router.delete(
  "/department-ticket-issues/:departmentId/:issueId",
  deleteDepartmentTicketIssue,
);
router.delete("/reject-ticket-issue/:id", rejectTicketIssue);
router.get("/get-tickets/:departmentId", getTickets);
router.get("/get-all-tickets", getAllTickets);
router.get("/get-depts-tickets", getAllDeptTickets);
router.get("/my-tickets", filterMyTickets);
router.get("/today", filterTodayTickets);
router.get("/:id", getSingleUserTickets);
router.post(
  "/raise-ticket",
  ticketUpload.fields([
    { name: "issues", maxCount: 5 },
    { name: "issue", maxCount: 1 },
  ]),
  raiseTicket,
);
router.patch("/update-ticket/", updateOtherTicket);
router.patch("/accept-ticket/:ticketId", acceptTicket);
router.patch("/reject-ticket/:id", rejectTicket);
router.patch("/assign-ticket/:ticketId", assignTicket);
router.patch("/escalate-ticket", escalateTicket);
router.patch("/close-ticket", closeTicket);
router.post("/support-ticket", supportTicket);
router.get("/department-tickets/:departmentId", ticketData);
router.get("/ticket-reports/:departmentId", ticketsReports);
router.get("/ticket-filter/:flag/:dept", fetchFilteredTickets);
router.get("/other-tickets/:department", getOtherTickets);
router.get("/get-team-members/:departmentId", getTeamMemberTickets);

module.exports = router;
