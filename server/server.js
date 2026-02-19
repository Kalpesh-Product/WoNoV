const express = require("express");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const { corsConfig } = require("./config/corsConfig");
const connectDb = require("./config/db");
const { hashPassword } = require("./config/passwordGen");

const errorHandler = require("./middlewares/errorHandler");
const authRoutes = require("./routes/auth/authRoutes");
const verifyJwt = require("./middlewares/verifyJwt");
const credentials = require("./middlewares/credentials");
const ticketsRoutes = require("./routes/ticketRoutes");
const leaveRoutes = require("./routes/leaveRoutes");
const employeeAgreementRoutes = require("./routes/employeeAgreementRoutes");
const meetingsRoutes = require("./routes/meetingRoutes");
const assetsRoutes = require("./routes/assetsRoutes");
const categoryRoutes = require("./routes/categoryRoutes");
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
const amcRoutes = require("./routes/amcRoutes");
const vendorRoutes = require("./routes/vendorRoutes");
const techRoutes = require("./routes/techRoutes");
const budgetRoutes = require("./routes/budgetRoutes");
const payslipRoutes = require("./routes/payslipRoutes");
const payrollRoutes = require("./routes/payrollRoutes");
const salesRoutes = require("./routes/salesRoutes");
const visitorRoutes = require("./routes/visitorRoutes");
const websiteRoutes = require("./routes/websiteTemplatesRoutes");
const websiteTemplateRoutes = require("./routes/websiteTemplateRoutes");
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
const PORT = process.env.PORT || 5009;
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
app.use("/api/category", verifyJwt, auditLogger, categoryRoutes);
app.use("/api/assets", verifyJwt, auditLogger, assetsRoutes);
app.use("/api/meetings", verifyJwt, auditLogger, meetingsRoutes);
app.use("/api/tickets", verifyJwt, auditLogger, ticketsRoutes);
app.use("/api/amc", verifyJwt, auditLogger, amcRoutes);
app.use("/api/leaves", verifyJwt, auditLogger, leaveRoutes);
app.use(
  "/api/employee-agreements",
  verifyJwt,
  auditLogger,
  employeeAgreementRoutes,
);
app.use("/api/notifications", verifyJwt, notificationRoutes);
// app.use("/api/editor", websiteRoutes);
app.use("/api/editor", websiteTemplateRoutes);
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
// test

mongoose.connection.once("open", () => {
  console.log("Connected to MongoDB");
  app.listen(PORT);
  console.log(`Server running on port ${PORT}`);
});

// For Generating hashed password for testing
// (async () => {
//   const hashed = await hashPassword("Abrar@007");
//   console.log(hashed);
// })();

// (async () => {
//   const passwords = [
//     "Aarif@4827",
//     "Abrar@9154",
//     "Allan@3076",
//     "Arjunkumar@6892",
//     "Arpita@1548",
//     "Dasmon@7731",
//     "Faizan@2609",
//     "Gourish@9483",
//     "Hema@5217",
//     "Irfan@8364",
//     "Jisha@4025",
//     "Kabir@7198",
//     "Kalpesh@6432",
//     "Kashif@8906",
//     "Kiran@2754",
//     "Machindranath@9341",
//     "Mehak@5087",
//     "Muskan@7613",
//     "Myra@2196",
//     "Narshiva@8459",
//     "Nasreen@3904",
//     "Praktan@6725",
//     "Rahul@1589",
//     "Rajesh@9042",
//     "Rehana@3178",
//     "Roshan@7860",
//     "Samiksha@5293",
//     "Sarhan@8617",
//     "Savita@2445",
//     "Shawn@9931",
//     "Siddhi@4068",
//     "Utkarsha@7314",
//     "Varsha@5820",
//     "Vishal@1673",
//   ];

// const emailArray = [
//   "aarif.biznest@gmail.com",
//   "abrar@biznest.co.in",
//   "allan.wono@gmail.com",
//   "arjunkumar.biznest@gmail.com",
//   "arpita.biznest@gmail.com",
//   "dasmon.biznest@gmail.com",
//   "faizanbiznest@gmail.com",
//   "gourish.wono@gmail.com",
//   "accounts@biznest.co.in",
//   "irfan.biznest@gmail.com",
//   "people@biznest.co.in",
//   "sales@biznest.co.in",
//   "kalpeshbiznest@gmail.com",
//   "kashif@biznest.co.in",
//   "kiran.biznest@gmail.com",
//   "parkar@biznest.co.in",
//   "mehak.wono@gmail.com",
//   "muskan.wono@gmail.com",
//   "myra.biznest@gmail.com",
//   "financeops@biznest.co.in",
//   "nasreen@biznest.co.in",
//   "madkaikarpraktan@gmail.com",
//   "rahul.sharma@company.com",
//   "service@biznest.co.in",
//   "rehana.commonform@gmail.com",
//   "roshan.sharma@company.com",
//   "samiksha.biznest@gmail.com",
//   "sarhan.biznest@gmail.com",
//   "savita.wono@gmail.com",
//   "shawnsilveria.wono@gmail.com",
//   "finance.biznest07@gmail.com",
//   "utkarsha.biznest@gmail.com",
//   "varshakolkar20@gmail.com",
//   "vishal.wono@gmail.com",
// ];

//   const results = await Promise.all(
//     passwords.map(async (rawPassword, i) => {
//       const hashed = await hashPassword(rawPassword);
//        return {
//         rawPassword,
//         email: emailArray[i],
//         hashedPassword: hashed,
//       };
//     }),
//   );

//   console.table(results);
// })();
