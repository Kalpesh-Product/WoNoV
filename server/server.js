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
const accessRoutes = require("./routes/accessRoutes");
const attendanceRoutes = require("./routes/attendanceRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const techRoutes = require("./routes/techRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const salesRoutes = require("./routes/salesRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const websiteRoutes = require("./routes/websiteTemplatesRoutes");
const getLogs = require("./controllers/logController");
const app = express();
const PORT = process.env.PORT || 5000;


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

app.use("/api/auth", authRoutes);

app.use("/api/access", verifyJwt, accessRoutes);
app.use("/api/company", verifyJwt, companyRoutes);
app.use("/api/budget", verifyJwt, budgetRoutes);
app.use("/api/departments", departmentsRoutes);
app.use("/api/designations", designationRoutes);
app.use("/api/tech", verifyJwt, techRoutes);
app.use("/api/assets", verifyJwt, assetsRoutes);
app.use("/api/meetings", verifyJwt, meetingsRoutes);
app.use("/api/tickets", verifyJwt, ticketsRoutes);
app.use("/api/leaves", verifyJwt, leaveRoutes);
app.use("/api/employee-agreements", employeeAgreementRoutes);
app.use("/api/editor", websiteRoutes);
app.use("/api/users", verifyJwt, userRoutes);
app.use("/api/roles", verifyJwt, roleRoutes);
app.use("/api/vendors", verifyJwt, vendorRoutes);
app.use("/api/events", verifyJwt, eventRoutes);
app.use("/api/payroll", payrollRoutes);
app.use("/api/tasks", verifyJwt, taskRoutes);
app.use("/api/attendance", verifyJwt, attendanceRoutes);
app.use("/api/sales", verifyJwt, salesRoutes);
app.use("/api/visitors", verifyJwt, visitorRoutes);
app.use("/api/logs/:path", verifyJwt, getLogs);
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
