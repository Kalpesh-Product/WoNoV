const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { corsConfig } = require("./config/corsConfig");
const connectDb = require("./config/db");
const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth/authRoutes");
const verifyJwt = require("./middlewares/verifyJwt");
const credentials = require("./middlewares/credentials");
const ticketsRoutes = require("./routes/ticketRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const employeeAgreementRoutes = require("./routes/employeeAgreementRoutes");
const meetingsRoutes = require("./routes/meetingRoutes");
const assetsRoutes = require("./routes/assetsRoutes");
const departmentsRoutes = require("./routes/departmentRoutes");
const companyRoutes = require("./routes/companyRoutes");
const userRoutes = require("./routes/userRoutes");
const designationRoutes = require("./routes/designationRoutes");
const roleRoutes = require("./routes/roleRoutes");
const eventRoutes = require("./routes/eventsRoutes");
const taskRoutes = require("./routes/tasksRoutes");
const performanceRoutes = require("./routes/performanceRoutes");
const accessRoutes = require("./routes/accessRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const techRoutes = require("./routes/techRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const payslipRoutes = require("./routes/payslipRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const salesRoutes = require("./routes/salesRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const websiteRoutes = require("./routes/websiteTemplatesRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const administrationRoutes = require("./routes/administrationRoutes");
const financeRoutes = require("./routes/financeRoutes");
const weeklyUnitRoutes = require("./routes/weeklyUnitRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const agreementRoutes = require("./routes/agreementRoutes");
const logRoutes = require("./routes/logRoutes");
const auditLogger = require("./middlewares/auditLogger");
require("./listeners/logEventListener");
const app = express();
const PORT = process.env.PORT || 5000;
app.set("trust proxy", true);

connectDb(process.env.DB_URL);

app.use(credentials);
app.use(cors(corsConfig));
app.use(cookieParser());
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
  if (req.accepts("html")) {
    res.status(200).sendFile(path.join(__dirname, "views", "index.html"));
  } else if (req.accepts("json")) {
    res.status(200).json({ message: "Welcome to the client API" });
  } else {
    res.type("text").status(200).send("Welcome to the client API");
  }
});

app.use("/api/auth", auditLogger, authRoutes);

app.use("/api/access", verifyJwt, auditLogger, accessRoutes);
app.use("/api/company", verifyJwt, auditLogger, companyRoutes);
app.use("/api/budget", verifyJwt, auditLogger, budgetRoutes);
app.use("/api/departments", verifyJwt, auditLogger, departmentsRoutes);
app.use("/api/designations", verifyJwt, auditLogger, designationRoutes);
app.use("/api/tech", verifyJwt, auditLogger, techRoutes);
app.use("/api/assets", verifyJwt, auditLogger, assetsRoutes);
app.use("/api/meetings", verifyJwt, auditLogger, meetingsRoutes);
app.use("/api/tickets", verifyJwt, auditLogger, ticketsRoutes);
app.use("/api/leaves", verifyJwt, auditLogger, leaveRoutes);
app.use(
  "/api/employee-agreements",
  verifyJwt,
  auditLogger,
  employeeAgreementRoutes
);
app.use("/api/notifications", verifyJwt, notificationRoutes);
app.use("/api/editor", websiteRoutes);
app.use("/api/users", verifyJwt, auditLogger, userRoutes);
app.use("/api/agreement", verifyJwt, auditLogger, agreementRoutes);
app.use("/api/roles", verifyJwt, auditLogger, roleRoutes);
app.use("/api/vendors", verifyJwt, auditLogger, vendorRoutes);
app.use("/api/events", verifyJwt, auditLogger, eventRoutes);
app.use("/api/payroll", verifyJwt, auditLogger, payrollRoutes);
app.use("/api/payslip", verifyJwt, auditLogger, payslipRoutes);
app.use("/api/tasks", verifyJwt, auditLogger, taskRoutes);
app.use("/api/performance", verifyJwt, auditLogger, performanceRoutes);
app.use("/api/attendance", verifyJwt, auditLogger, attendanceRoutes);
app.use("/api/sales", verifyJwt, auditLogger, salesRoutes);
app.use("/api/visitors", verifyJwt, auditLogger, visitorRoutes);
app.use("/api/inventory", verifyJwt, auditLogger, inventoryRoutes);
app.use("/api/administration", verifyJwt, auditLogger, administrationRoutes);
app.use("/api/finance", verifyJwt, auditLogger, financeRoutes);
app.use("/api/weekly-unit", verifyJwt, auditLogger, weeklyUnitRoutes);
app.use("/api/logs", verifyJwt, logRoutes);

app.all("*", (req, res) => {
  if (req.accepts("html")) {
    res.status(404).sendFile(path.join(__dirname, "views", "404.html"));
  } else if (req.accepts("json")) {
    res.status(404).json({ message: "404 Not found" });
  } else {
    res.type("text").status(404).send("404 Not found");
  }
});

app.use(errorHandler);

mongoose.connection.once("open", () => {
  app.listen(PORT);
});
