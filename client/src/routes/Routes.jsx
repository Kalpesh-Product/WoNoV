import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../layouts/MainLayout";
import AuthLayout from "../layouts/AuthLayout";
import LoginPage from "../pages/LoginPage/LoginPage";
import PersistLogin from "../layouts/PersistLogin";

// Import main pages
import Dashboard from "../pages/Dashboard/Dashboard";
import Reports from "../pages/Reports";
import Calender from "../pages/Calendar";
import Access from "../pages/Access/Access";
import AccessProfile from "../pages/Access/AccessProfile";
import Notifications from "../pages/Notifications";
import Chat from "../pages/Chat";
import Profile from "../pages/Profile/Profile";

// Import tickets pages
import TicketDashboard from "../pages/Tickets/TicketDashboard";
import ManageTickets from "../pages/Tickets/ManageTickets";
import TeamMembers from "../pages/Tickets/TeamMembers";
import TicketReports from "../pages/Tickets/TicketReports";
import RaiseTicket from "../pages/Tickets/RaiseTicket";
import TicketSettingsnew from "../pages/Tickets/TicketSettingsnew";

// Test page
import TestPage from "../pages/Test/TestPage";
import TicketLayout from "../pages/Tickets/TicketLayout";
import Compliances from "../pages/Dashboard/HrDashboard/Complaince/Compliances";
import DashboardLayout from "../pages/Dashboard/DashboardLayout";
import FrontendDashboard from "../pages/Dashboard/FrontendDashboard/FrontendDashboard";
import HrDashboard from "../pages/Dashboard/HrDashboard/HrDashboard";
import HrLayout from "../pages/Dashboard/HrDashboard/HrLayout";
import ViewEmployees from "../pages/Dashboard/HrDashboard/Complaince/ViewEmployees";
import OnBoarding from "../pages/Dashboard/HrDashboard/OnBoarding/OnBoarding";
import EmployeeOnboard from "../pages/Dashboard/HrDashboard/OnBoarding/EmployeeOnboard";
import MemberOnboard from "../pages/Dashboard/HrDashboard/OnBoarding/MemberOnboard";
import VendorOnboard from "../pages/Dashboard/HrDashboard/OnBoarding/VendorOnboard";
import EmployeeDetail from "../pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EmployeeDetails";
import EditDetails from "../pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/EditDetails";
import Attendance from "../pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Attendance";
import Leaves from "../pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Leaves";
import Agreements from "../pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Agreements";
import KPI from "../pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KPI";
import KRA from "../pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/KRA";
import Data from "../pages/Dashboard/HrDashboard/Data/HRData";
import JobApplicationList from "../pages/Dashboard/HrDashboard/Data/JobApplicationList";
import Templates from "../pages/Dashboard/HrDashboard/Data/Templates";
import HrFinance from "../pages/Dashboard/HrDashboard/Finance/HrFinance";
import HrBudget from "../pages/Dashboard/HrDashboard/Finance/HrBudget";
import HrPayment from "../pages/Dashboard/HrDashboard/Finance/HrPayment";
import HrSettings from "../pages/Dashboard/HrDashboard/HrSettings/HrSettings";
import CompanyLogo from "../pages/Dashboard/HrDashboard/HrSettings/CompanyLogo";
import HrSettingsDepartments from "../pages/Dashboard/HrDashboard/HrSettings/HrSettingsDepartments";
import WorkLocations from "../pages/Dashboard/HrDashboard/HrSettings/WorkLocations";
import LeaveType from "../pages/Dashboard/HrDashboard/HrSettings/LeaveType";
import HrSettingsPolicies from "../pages/Dashboard/HrDashboard/HrSettings/HrSettingsPolicies";
import HrSOP from "../pages/Dashboard/HrDashboard/HrSettings/HrSOP";
import EmployeeType from "../pages/Dashboard/HrDashboard/HrSettings/EmployeeType";
import Shifts from "../pages/Dashboard/HrDashboard/HrSettings/Shifts";
import Payslip from "../pages/Dashboard/HrDashboard/Complaince/EmployeeDetail/Payslip";
import HolidaysEvents from "../pages/Dashboard/HrDashboard/Complaince/HoildaysEvents";
import ViewVendors from "../pages/Dashboard/HrDashboard/Complaince/ViewVendors";
import HrPayroll from "../pages/Dashboard/HrDashboard/Finance/HrPayroll";
import ViewPayroll from "../pages/Dashboard/HrDashboard/Finance/ViewPayroll";
import HrReports from "../pages/Dashboard/HrDashboard/Data/Reports";
import BulkUpload from "../pages/Dashboard/HrDashboard/HrSettings/BulkUpload";
import ComapanyHandbook from "../pages/Dashboard/HrDashboard/Complaince/CompanyHandbook";
import MeetingLayout from "../pages/Meetings/MeetingLayout";
import MeetingDashboard from "../pages/Meetings/MeetingDashboard";
import BookMeetings from "../pages/Meetings/BookMeetings";
import ManageMeetings from "../pages/Meetings/ManageMeetings";
import MeetingSettings from "../pages/Meetings/MeetingSettings";
import Reviews from "../pages/Meetings/Reviews";
import MeetingCalendar from "../pages/Meetings/Calendar";
import MeetingReports from "../pages/Meetings/MeetingReports";
import MeetingFormLayout from "../pages/Meetings/MeetingFormLayout";
import FrontendLayout from "../pages/Dashboard/FrontendDashboard/FrontendLayout";
import FrontendData from "../pages/Dashboard/FrontendDashboard/Data/FrontendData";
import FrontendLeads from "../pages/Dashboard/FrontendDashboard/Data/FrontendLeads";
import FrontendWebsiteIssueReports from "../pages/Dashboard/FrontendDashboard/Data/FrontendWebsiteIssueReports";
import FrontendFinLayout from "../pages/Dashboard/FrontendDashboard/FrontendFinance/FrontendFinLayout";
import FrontendBudget from "../pages/Dashboard/FrontendDashboard/FrontendFinance/FrontendBudget";
import FrontendPayment from "../pages/Dashboard/FrontendDashboard/FrontendFinance/FrontendPayment";
import ThemeGrid from "../pages/Dashboard/FrontendDashboard/WebsiteBuilder/ThemeGrid";
import ViewTheme from "../pages/Dashboard/FrontendDashboard/WebsiteBuilder/ViewTheme";
import PageDemo from "../pages/Dashboard/FrontendDashboard/WebsiteBuilder/PageDemo";
import FrontendSettings from "../pages/Dashboard/FrontendDashboard/FrontendSettings/FrontendSettings";
import FrontendBulkUpload from "../pages/Dashboard/FrontendDashboard/FrontendSettings/BulkUpload";
import AssetsLayout from "../pages/Assets/AssetsLayout";
import AssetsDashboard from "../pages/Assets/AssetsDashboard";
import AssignAssets from "../pages/Assets/ManageAssets/AssignAssets";
import ManageAssets from "../pages/Assets/ManageAssets/ManageAssets";
import AssignedAssets from "../pages/Assets/ManageAssets/AssignedAssets";
import Approvals from "../pages/Assets/ManageAssets/Approvals";
import AssetReports from "../pages/Assets/Reports/AssetReports";
import AssetsCategoriesLayout from "../pages/Assets/AssetsCategory/AssetsCategoriesLayout";
import AssetsCategories from "../pages/Assets/AssetsCategory/AssetsCategories";
import AssetsSubCategories from "../pages/Assets/AssetsCategory/AssetsSubCategories";
import ListOfAssets from "../pages/Assets/AssetsCategory/ListOfAssets";
import AssetsSettings from "../pages/Assets/AssetsSettings/AssetsSettings";
import AssetsBulkUpload from "../pages/Assets/AssetsSettings/BulkUpload";
import TasksLayout from "../pages/Tasks/TasksLayout";
import TasksDashboard from "../pages/Tasks/TasksDashboard";
import MyTaskListLayout from "../pages/Tasks/My-Tasklist/MyTaskListLayout";
import DailyTasks from "../pages/Tasks/My-Tasklist/DailyTasks";
import MonthlyTasks from "../pages/Tasks/My-Tasklist/MonthlyTasks";
import AdditionalTasks from "../pages/Tasks/My-Tasklist/AdditionalTasks";
import TeamMember from "../pages/Tasks/TeamMembers/TeamMember";
import ProjectList from "../pages/Tasks/ProjectList/ProjectList";
import EditProject from "../pages/Tasks/ProjectList/EditProject";
import TaskReportLayout from "../pages/Tasks/TaskReports.jsx/TaskReportLayout";
import MyTaskReports from "../pages/Tasks/TaskReports.jsx/MyTaskReports";
import AssignedTaskReports from "../pages/Tasks/TaskReports.jsx/AssignedTaskReports";
import DepartmentTaskReports from "../pages/Tasks/TaskReports.jsx/DepartmentTaskReports";
import SalesDashboardLayout from "../pages/Dashboard/SalesDashboard/SalesDashboardLayout";
import SalesDashboard from "../pages/Dashboard/SalesDashboard/SalesDashboard";
import TotalRevenueLayout from "../pages/Dashboard/SalesDashboard/TotalRevenueLayout";
import TotalRevenue from "../pages/Dashboard/SalesDashboard/TotalRevenue";
import ViewTemplate from "../pages/Dashboard/HrDashboard/Data/ViewTemplate";
import CoWorking from "../pages/Dashboard/SalesDashboard/CoWorking";
import MeetingRevenue from "../pages/Dashboard/SalesDashboard/MeetingRevenue";
import VirtualOffice from "../pages/Dashboard/SalesDashboard/VirtualOffice";
import Workations from "../pages/Dashboard/SalesDashboard/Workations";
import AltRevenues from "../pages/Dashboard/SalesDashboard/AltRevenues";
import ClientsLayout from "../pages/Dashboard/SalesDashboard/ClientsLayout";
import ViewClients from "../pages/Dashboard/SalesDashboard/ViewClients";
import ClientOnboarding from "../pages/Dashboard/SalesDashboard/ClientOnboarding";
import ActualBusinessRevenue from "../pages/Dashboard/SalesDashboard/ActualBusiness/ActualBusinessRevenue";
import RevenueTarget from "../pages/Dashboard/SalesDashboard/RevenueTarget/RevenueTarget";
import ViewClientLayout from "../pages/Dashboard/SalesDashboard/ViewClients/ViewClientLayout";
import ClientDetails from "../pages/Dashboard/SalesDashboard/ViewClients/ClientDetails";
import Desks from "../pages/Dashboard/SalesDashboard/ViewClients/Desks";
import ClientRevenue from "../pages/Dashboard/SalesDashboard/ViewClients/ClientRevenue";
import ClientMembers from "../pages/Dashboard/SalesDashboard/ViewClients/ClientMembers";
import CoWorkingSeats from "../pages/Dashboard/SalesDashboard/CoWorkingSeats/CoWorkingSeats";
import CheckAvailability from "../pages/Dashboard/SalesDashboard/CoWorkingSeats/CheckAvailability";
import ViewAvailability from "../pages/Dashboard/SalesDashboard/CoWorkingSeats/ViewAvailability";
import UniqueLeads from "../pages/Dashboard/SalesDashboard/UniqueLeads";
import SalesFinance from "../pages/Dashboard/SalesDashboard/SalesFinance/SalesFinance";
import SalesBudget from "../pages/Dashboard/SalesDashboard/SalesFinance/SalesBudget";
import SalesPayment from "../pages/Dashboard/SalesDashboard/SalesFinance/SalesPayment";
import UniqueClients from "../pages/Dashboard/SalesDashboard/UniqueClients";
import MemberDetails from "../pages/Dashboard/SalesDashboard/ViewClients/MemberDetails";
import SalesMixBag from "../pages/Dashboard/SalesDashboard/SalesMixBag";
import EarningsLayout from "../pages/Dashboard/SalesDashboard/EarningsLayout";
import FinanceDashboard from "../pages/Dashboard/FinanceDashboard/FinanceDashboard";
import AdminstartionLayout from "../pages/Dashboard/AdminDashboard/AdminstartionLayout";
import AdminDashboard from "../pages/Dashboard/AdminDashboard/AdminDashboard";
import MaintainanceLayout from "../pages/Dashboard/MaintainanceDashboard/MaintainanceLayout";
import MaintainanceDashboard from "../pages/Dashboard/MaintainanceDashboard/MaintainanceDashboard";
import Sops from "../pages/Dashboard/FrontendDashboard/FrontendSettings/Sops";
import Policies from "../pages/Dashboard/FrontendDashboard/FrontendSettings/Policies";
import HrSops from "../pages/Dashboard/HrDashboard/HrSettings/HrSops";
import HrPolicies from "../pages/Dashboard/HrDashboard/HrSettings/HrPolicies";
import SalesSettings from "../pages/Dashboard/SalesDashboard/SalesSettings/SalesSettings";
import SalesSops from "../pages/Dashboard/SalesDashboard/SalesSettings/SalesSops";
import SalesPolicies from "../pages/Dashboard/SalesDashboard/SalesSettings/SalesPolicies";
import BulkUploadSales from "../pages/Dashboard/SalesDashboard/SalesSettings/BulkUploadSales";
import HrCommonLayout from "../pages/HR/HrCommonLayout";
import HrCommonAttendance from "../pages/HR/HrCommonAttendance";
import HrCommonLeaves from "../pages/HR/HrCommonLeaves";
import HrCommonAgreements from "../pages/HR/HrCommonAgreements";
import HrCommonPayslips from "../pages/HR/HrCommonPayslips";
import Unauthorized from "../pages/Unauthorized";
import VisitorLayout from "../pages/Visitors/VisitorLayout";
import VisitorDashboard from "../pages/Visitors/VisitorDashboard";
import AddVisitor from "../pages/Visitors/Forms/AddVisitor";
import ManageVisitors from "../pages/Visitors/ManageVisitors";
import VisitorTeamMembers from "../pages/Visitors/VisitorTeamMembers";
import VisitorReports from "../pages/Visitors/VisitorReports";
import VisitorReviews from "../pages/Visitors/VisitorReviews";
import VisitorSettings from "../pages/Visitors/VisitorSettings/VisitorSettings";
import VisitorBulkUpload from "../pages/Visitors/VisitorSettings/VisitorBulkUpload";
import ProfileLayout from "../pages/Profile/ProfileLayout";
import MyProfile from "../pages/Profile/MyProfile";
import ChangePassword from "../pages/Profile/ChangePassword";
import AccessGrant from "../pages/Profile/AccessGrant";
import MyAssets from "../pages/Profile/MyAssets";
import MeetingRoomCredits from "../pages/Profile/MeetingRoomCredits";
import TicketsHistory from "../pages/Profile/TicketsHistory";
import EditTemplate from "../pages/Dashboard/FrontendDashboard/WebsiteBuilder/EditTemplate";
import ItLayout from "../pages/Dashboard/ItDashboard/ItLayout";
import ItDashboard from "../pages/Dashboard/ItDashboard/ItDashboard";
import AdminAnnualExpenses from "../pages/Dashboard/AdminDashboard/AdminAnnualExpenses";
import AdminInventory from "../pages/Dashboard/AdminDashboard/AdminInventory";
import AdminFinance from "../pages/Dashboard/AdminDashboard/AdminFinance/AdminFinance";
import AdminBudget from "../pages/Dashboard/AdminDashboard/AdminFinance/AdminBudget";
import AdminPayment from "../pages/Dashboard/AdminDashboard/AdminFinance/AdminPayment";
import AdminData from "../pages/Dashboard/AdminDashboard/AdminData/AdminData";
import AdminAssetList from "../pages/Dashboard/AdminDashboard/AdminData/AdminAssetList";
import AdminVendorDatabase from "../pages/Dashboard/AdminDashboard/AdminData/AdminVendorDatabase";
import AdminElectricityExpenses from "../pages/Dashboard/AdminDashboard/AdminData/AdminElectricityExpenses";
import AdminMonthlyInvoiceReports from "../pages/Dashboard/AdminDashboard/AdminData/AdminMonthlyInvoiceReports";
import AdminSettings from "../pages/Dashboard/AdminDashboard/AdminSettings/AdminSettings";
import AdminBulkUpload from "../pages/Dashboard/AdminDashboard/AdminSettings/AdminBulkUpload";
import AdminSops from "../pages/Dashboard/AdminDashboard/AdminSettings/AdminSops";
import AdminPolicies from "../pages/Dashboard/AdminDashboard/AdminSettings/AdminPolicies";
import MaintenanceAnnualExpenses from "../pages/Dashboard/MaintainanceDashboard/MaintenanceAnnualExpenses";
import MaintenanceInventory from "../pages/Dashboard/MaintainanceDashboard/MaintenanceInventory";
import MaintenanceFinance from "../pages/Dashboard/MaintainanceDashboard/MaintenanceFinance/MaintenanceFinance";
import MaintenanceBudget from "../pages/Dashboard/MaintainanceDashboard/MaintenanceFinance/MaintenanceBudget";
import MaintenancePayment from "../pages/Dashboard/MaintainanceDashboard/MaintenanceFinance/MaintenancePayment";
import MaintenanceData from "../pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceData";
import MaintenanceAssetList from "../pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAssetList";
import MaintenanceVendorReports from "../pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceVendorReports";
import MaintenanceAmcRecords from "../pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceAmcRecords";
import MaintenanceMonthlyInvoice from "../pages/Dashboard/MaintainanceDashboard/MaintenanceData/MaintenanceMonthlyInvoice";
import MaintenanceSettings from "../pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenanceSettings";
import MaintenanceBulkUpload from "../pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenanceBulkUpload";
import MaintenanceSops from "../pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenanceSops";
import MaintenancePolicies from "../pages/Dashboard/MaintainanceDashboard/MaintenanceSettings/MaintenancePolicies";
import ItAnnualExpenses from "../pages/Dashboard/ItDashboard/ItAnnualExpenses";
import ItInventory from "../pages/Dashboard/ItDashboard/ItInventory";
import ItFinance from "../pages/Dashboard/ItDashboard/ItFinance/ItFinance";
import ItBudget from "../pages/Dashboard/ItDashboard/ItFinance/ItBudget";
import ItPayment from "../pages/Dashboard/ItDashboard/ItFinance/ItPayment";
import ItData from "../pages/Dashboard/ItDashboard/ItData/ItData";
import ItAssetList from "../pages/Dashboard/ItDashboard/ItData/ItAssetList";
import ItVendorReports from "../pages/Dashboard/ItDashboard/ItData/ItVendorReports";
import ItAmcRecords from "../pages/Dashboard/ItDashboard/ItData/ItAmcRecords";
import ItMonthlyInvoice from "../pages/Dashboard/ItDashboard/ItData/ItMonthlyInvoice";
import ItSettings from "../pages/Dashboard/ItDashboard/ItSettings/ItSettings";
import ItBulkUpload from "../pages/Dashboard/ItDashboard/ItSettings/ItBulkUpload";
import ItSops from "../pages/Dashboard/ItDashboard/ItSettings/ItSops";
import ItPolicies from "../pages/Dashboard/ItDashboard/ItSettings/ItPolicies";
import AdminOffices from "../pages/Dashboard/AdminDashboard/AdminOffices/AdminOffices";
import AdminExpenses from "../pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpenses";
import AdminOfficeLayout from "../pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesLayout";
import AdminOfficesLayout from "../pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesLayout";
import AdminOfficesOccupied from "../pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesOccupied";
import AdminOfficesClear from "../pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesClear";
import AdminExpensesLayout from "../pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpensesLayout";
import AdminExpensesOccupied from "../pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpensesOccupied";
import AdminExpensesClear from "../pages/Dashboard/AdminDashboard/AdminExpenses/AdminExpensesClear";
import MaintenanceOffices from "./../pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOffices";
import MaintenanceOfficesLayout from "./../pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesLayout";
import MaintenanceOfficesOccupied from "./../pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesOccupied";
import MaintenanceOfficesClear from "./../pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesClear";
import MaintenanceExpenses from "./../pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpenses";
import MaintenanceExpensesLayout from "./../pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpensesLayout";
import MaintenanceExpensesOccupied from "./../pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpensesOccupied";
import MaintenanceExpensesClear from "./../pages/Dashboard/MaintainanceDashboard/MaintenanceExpenses/MaintenanceExpensesClear";
import ItOffices from "./../pages/Dashboard/ItDashboard/ItOffices/ItOffices";
import ItOfficesLayout from "./../pages/Dashboard/ItDashboard/ItOffices/ItOfficesLayout";
import ItOfficesOccupied from "./../pages/Dashboard/ItDashboard/ItOffices/ItOfficesOccupied";
import ItOfficesClear from "./../pages/Dashboard/ItDashboard/ItOffices/ItOfficesClear";
import ItExpenses from "./../pages/Dashboard/ItDashboard/ItExpenses/ItExpenses";
import ItExpensesLayout from "./../pages/Dashboard/ItDashboard/ItExpenses/ItExpensesLayout";
import ItExpensesOccupied from "./../pages/Dashboard/ItDashboard/ItExpenses/ItExpensesOccupied";
import ItExpensesClear from "./../pages/Dashboard/ItDashboard/ItExpenses/ItExpensesClear";
import ItPerSqExpense from "../pages/Dashboard/ItDashboard/ItPerSqExpense";
import ItPerSqInternetExpense from "../pages/Dashboard/ItDashboard/ItPerSqInternetExpense";
import AdminPerSqFtExpense from "../pages/Dashboard/AdminDashboard/AdminPerSqFtExpense";
import AdminPerSqFtElectricityExpense from "../pages/Dashboard/AdminDashboard/AdminPerSqFtElectricityExpense";
import AdminExecutiveExpenses from "../pages/Dashboard/AdminDashboard/AdminExecutiveExpenses";
import MaintenancePerSqFtExpense from "../pages/Dashboard/MaintainanceDashboard/MaintenancePerSqFtExpense";
import MaintenanceAssets from "../pages/Dashboard/MaintainanceDashboard/MaintenanceAssets";
import NotFoundPage from "../pages/NotFoundPage";
import AdminMixBag from "../pages/Dashboard/AdminDashboard/AdminMixBag";
import AdminTeamMembersSchedule from "../pages/Dashboard/AdminDashboard/AdminTeamMembersSchedule";
import HousekeepingTeamMembersSchedule from "../pages/Dashboard/AdminDashboard/HousekeepingTeamMembersSchedule";
import AdminHolidaysEvents from "../pages/Dashboard/AdminDashboard/AdminHolidaysEvents";
import AdminClientsList from "../pages/Dashboard/AdminDashboard/AdminClientsList";
import AdminTeamMembersCalendar from "../pages/Dashboard/AdminDashboard/AdminTeamMembersCalendar";
import HousekeepingTeamMembersCalendar from "../pages/Dashboard/AdminDashboard/HousekeepingTeamMembersCalendar";
import AdminClientMembersLayout from "../pages/Dashboard/AdminDashboard/AdminClientMembersLayout";
import AdminClientDetails from "../pages/Dashboard/AdminDashboard/AdminClientDetails";
import AdminClientMembers from "../pages/Dashboard/AdminDashboard/AdminClientMembers";

export const routes = createBrowserRouter([
  {
    path: "/",
    element: <LoginPage />,
  },

  {
    element: <PersistLogin />,
    children: [
      {
        element: <AuthLayout />,
        children: [
          {
            path: "/app",
            element: <MainLayout />,
            children: [
              {
                path: "dashboard",
                element: <DashboardLayout />,
                children: [
                  {
                    path: "frontend-dashboard",
                    element: <FrontendLayout />,
                    children: [
                      {
                        path: "",
                        element: <FrontendDashboard />,
                      },
                      {
                        path: "select-theme",
                        element: <ThemeGrid />,
                      },
                      {
                        path: "view-theme",
                        element: <ViewTheme />,
                      },
                      {
                        path: "live-demo",
                        element: <PageDemo />,
                      },
                      {
                        path: "*",
                        element: <ThemeGrid />,
                      },
                      {
                        path: "select-theme/edit-theme/:templateName/:pageName",
                        element: <EditTemplate />,
                      },
                      {
                        path: "data",
                        element: <FrontendData />,
                        children: [
                          {
                            path: "leads",
                            index: true,
                            element: <FrontendLeads />,
                          },
                          {
                            path: "website-issue-reports",
                            element: <FrontendWebsiteIssueReports />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <FrontendSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <FrontendBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <Sops />,
                          },
                          {
                            path: "policies",
                            element: <Policies />,
                          },
                        ],
                      },
                      {
                        path: "finance",
                        element: <FrontendFinLayout />,
                        children: [
                          {
                            path: "budget",
                            element: <FrontendBudget />,
                          },
                          {
                            path: "payment-schedule",
                            element: <FrontendPayment />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "finance-dashboard",
                    element: <FrontendLayout />,
                    children: [
                      {
                        path: "",
                        element: <FinanceDashboard />,
                      },
                    ],
                  },
                  {
                    path: "admin-dashboard",
                    element: <AdminstartionLayout />,
                    children: [
                      {
                        path: "",
                        element: <AdminDashboard />,
                      },
                      {
                        path: "annual-expenses",
                        element: <AdminAnnualExpenses />,
                      },
                      {
                        path: "inventory",
                        element: <AdminInventory />,
                      },
                      {
                        path: "finance",
                        element: <AdminFinance />,
                        children: [
                          {
                            path: "budget",
                            element: <AdminBudget />,
                          },
                          {
                            path: "payment-schedule",
                            element: <AdminPayment />,
                          },
                        ],
                      },
                      {
                        path: "mix-bag",
                        element: <AdminMixBag />,
                      },
                      {
                        path: "team-members-schedule",
                        element: <AdminTeamMembersSchedule />,
                      },
                      {
                        path: "team-members-calendar/:id",
                        element: <AdminTeamMembersCalendar />,
                      },
                      {
                        path: "housekeeping-members-schedule",
                        element: <HousekeepingTeamMembersSchedule />,
                      },
                      {
                        path: "housekeeping-members-calendar/:id",
                        element: <HousekeepingTeamMembersCalendar />,
                      },
                      {
                        path: "holidays-events",
                        element: <AdminHolidaysEvents />,
                      },
                      {
                        path: "admin-client-list",
                        element: <AdminClientsList />,
                      },
                      {
                        path: "admin-client-list/:clientName",
                        element: <AdminClientMembersLayout />,
                        children: [
                          {
                            path: "client-details",
                            element: <AdminClientDetails />,
                          },
                          // {
                          //   path: "desks",
                          //   element: <Desks />,
                          // },
                          // {
                          //   path: "revenue",
                          //   element: <ClientRevenue />,
                          // },
                          {
                            path: "members",
                            element: <AdminClientMembers />,
                          },
                          {
                            path: "members/view-member/:id",
                            element: <MemberDetails />,
                          },
                        ],
                      },

                      {
                        path: "data",
                        element: <AdminData />,
                        children: [
                          {
                            path: "asset-list",
                            element: <AdminAssetList />,
                          },
                          {
                            path: "vendor-database",
                            element: <AdminVendorDatabase />,
                          },
                          {
                            path: "electricity-expenses",
                            element: <AdminElectricityExpenses />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <AdminMonthlyInvoiceReports />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <AdminSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <AdminBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <AdminSops />,
                          },
                          {
                            path: "policies",
                            element: <AdminPolicies />,
                          },
                        ],
                      },
                      {
                        path: "per-sq-ft-expense",
                        element: <AdminPerSqFtExpense />,
                      },
                      {
                        path: "per-sq-ft-electricity-expense",
                        element: <AdminPerSqFtElectricityExpense />,
                      },
                      {
                        path: "admin-executive-expense",
                        element: <AdminExecutiveExpenses />,
                      },
                      {
                        path: "admin-offices",
                        element: <AdminOffices />,
                      },
                      {
                        path: "admin-offices/admin-offices-layout/:client",
                        element: <AdminOfficesLayout />,
                        children: [
                          {
                            path: "admin-offices-occupied",
                            index: true,
                            element: <AdminOfficesOccupied />,
                          },
                          {
                            path: "admin-offices-clear",
                            element: <AdminOfficesClear />,
                          },
                        ],
                      },
                      {
                        path: "admin-expenses",
                        element: <AdminExpenses />,
                      },
                      {
                        path: "admin-expenses/admin-expenses-layout/:client",
                        element: <AdminExpensesLayout />,
                        children: [
                          {
                            path: "admin-expenses-occupied",
                            index: true,
                            element: <AdminExpensesOccupied />,
                          },
                          {
                            path: "admin-expenses-clear",
                            element: <AdminExpensesClear />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "maintenance-dashboard",
                    element: <MaintainanceLayout />,
                    children: [
                      {
                        path: "",
                        element: <MaintainanceDashboard />,
                      },
                      {
                        path: "annual-expenses",
                        element: <MaintenanceAnnualExpenses />,
                      },
                      {
                        path: "inventory",
                        element: <MaintenanceInventory />,
                      },
                      {
                        path: "finance",
                        element: <MaintenanceFinance />,
                        children: [
                          {
                            path: "budget",
                            element: <MaintenanceBudget />,
                          },
                          {
                            path: "payment-schedule",
                            element: <MaintenancePayment />,
                          },
                        ],
                      },
                      {
                        path: "data",
                        element: <MaintenanceData />,
                        children: [
                          {
                            path: "asset-list",
                            element: <MaintenanceAssetList />,
                          },
                          {
                            path: "vendor-database",
                            element: <MaintenanceVendorReports />,
                          },
                          {
                            path: "amc-records",
                            element: <MaintenanceAmcRecords />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <MaintenanceMonthlyInvoice />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <MaintenanceSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <MaintenanceBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <MaintenanceSops />,
                          },
                          {
                            path: "policies",
                            element: <MaintenancePolicies />,
                          },
                        ],
                      },
                      {
                        path: "per-sq-ft-expense",
                        element: <MaintenancePerSqFtExpense />,
                      },
                      {
                        path: "maintenance-assets",
                        element: <MaintenanceAssets />,
                      },
                      {
                        path: "maintenance-offices",
                        element: <MaintenanceOffices />,
                      },
                      {
                        path: "maintenance-offices/maintenance-offices-layout/:client",
                        element: <MaintenanceOfficesLayout />,
                        children: [
                          {
                            path: "maintenance-offices-occupied",
                            index: true,
                            element: <MaintenanceOfficesOccupied />,
                          },
                          {
                            path: "maintenance-offices-clear",
                            element: <MaintenanceOfficesClear />,
                          },
                        ],
                      },
                      {
                        path: "maintenance-expenses",
                        element: <MaintenanceExpenses />,
                      },
                      {
                        path: "maintenance-expenses/maintenance-expenses-layout/:client",
                        element: <MaintenanceExpensesLayout />,
                        children: [
                          {
                            path: "maintenance-expenses-occupied",
                            index: true,
                            element: <MaintenanceExpensesOccupied />,
                          },
                          {
                            path: "maintenance-expenses-clear",
                            element: <MaintenanceExpensesClear />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "IT-dashboard",
                    element: <ItLayout />,
                    children: [
                      {
                        path: "",
                        element: <ItDashboard />,
                      },
                      {
                        path: "annual-expenses",
                        element: <ItAnnualExpenses />,
                      },
                      {
                        path: "inventory",
                        element: <ItInventory />,
                      },
                      {
                        path: "finance",
                        element: <ItFinance />,
                        children: [
                          {
                            path: "budget",
                            element: <ItBudget />,
                          },
                          {
                            path: "payment-schedule",
                            element: <ItPayment />,
                          },
                        ],
                      },
                      {
                        path: "data",
                        element: <ItData />,
                        children: [
                          {
                            path: "asset-list",
                            element: <ItAssetList />,
                          },
                          {
                            path: "vendor-database",
                            element: <ItVendorReports />,
                          },
                          {
                            path: "amc-records",
                            element: <ItAmcRecords />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <ItMonthlyInvoice />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <ItSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <ItBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <ItSops />,
                          },
                          {
                            path: "policies",
                            element: <ItPolicies />,
                          },
                        ],
                      },
                      {
                        path: "per-sq-ft-expense",
                        element: <ItPerSqExpense />,
                      },
                      {
                        path: "per-sq-ft-internet-expense",
                        element: <ItPerSqInternetExpense />,
                      },
                      {
                        path: "it-offices",
                        element: <ItOffices />,
                      },
                      {
                        path: "it-offices/it-offices-layout/:client",
                        element: <ItOfficesLayout />,
                        children: [
                          {
                            path: "it-offices-occupied",
                            index: true,
                            element: <ItOfficesOccupied />,
                          },
                          {
                            path: "it-offices-clear",
                            element: <ItOfficesClear />,
                          },
                        ],
                      },
                      {
                        path: "it-expenses",
                        element: <ItExpenses />,
                      },
                      {
                        path: "it-expenses/it-expenses-layout/:client",
                        element: <ItExpensesLayout />,
                        children: [
                          {
                            path: "it-expenses-occupied",
                            index: true,
                            element: <ItExpensesOccupied />,
                          },
                          {
                            path: "it-expenses-clear",
                            element: <ItExpensesClear />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "sales-dashboard",
                    element: <SalesDashboardLayout />,
                    children: [
                      {
                        path: "",
                        element: <SalesDashboard />,
                      },
                      {
                        path: "turnover",
                        element: <EarningsLayout />,
                        children: [
                          {
                            path: "actual-business",
                            element: <ActualBusinessRevenue />,
                          },

                          {
                            path: "revenue-target",
                            element: <RevenueTarget />,
                          },
                        ],
                      },

                      {
                        path: "unique-leads",
                        element: <UniqueLeads />,
                      },
                      {
                        path: "unique-clients",
                        element: <UniqueClients />,
                      },
                      {
                        path: "finance",
                        element: <SalesFinance />,
                        children: [
                          {
                            path: "budget",
                            element: <SalesBudget />,
                          },
                          {
                            path: "payment-schedule",
                            element: <SalesPayment />,
                          },
                        ],
                      },
                      {
                        path: "mix-bag",
                        element: <SalesMixBag />,
                      },
                      {
                        path: "co-working-seats",
                        element: <CoWorkingSeats />,
                      },
                      {
                        path: "co-working-seats/check-availability",
                        element: <CheckAvailability />,
                      },
                      {
                        path: "co-working-seats/view-availability",
                        element: <ViewAvailability />,
                      },
                      {
                        path: "revenue",
                        element: <TotalRevenueLayout />,
                        children: [
                          {
                            path: "total-revenue",
                            element: <TotalRevenue />,
                          },
                          {
                            path: "co-working",
                            element: <CoWorking />,
                          },
                          {
                            path: "meetings",
                            element: <MeetingRevenue />,
                          },
                          {
                            path: "virtual-office",
                            element: <VirtualOffice />,
                          },
                          {
                            path: "workation",
                            element: <Workations />,
                          },
                          {
                            path: "alt-revenue",
                            element: <AltRevenues />,
                          },
                        ],
                      },
                      {
                        path: "clients",
                        element: <ClientsLayout />,
                        children: [
                          {
                            path: "view-clients",
                            index: true,
                            element: <ViewClients />,
                          },
                          {
                            path: "view-clients/:clientName",
                            element: <ViewClientLayout />,
                            children: [
                              {
                                path: "client-details",
                                element: <ClientDetails />,
                              },
                              {
                                path: "desks",
                                element: <Desks />,
                              },
                              {
                                path: "revenue",
                                element: <ClientRevenue />,
                              },
                              {
                                path: "members",
                                element: <ClientMembers />,
                              },
                              {
                                path: "members/view-member/:id",
                                element: <MemberDetails />,
                              },
                            ],
                          },
                          {
                            path: "client-onboarding",
                            element: <ClientOnboarding />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <SalesSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <BulkUploadSales />,
                          },
                          {
                            path: "sops",
                            element: <SalesSops />,
                          },
                          {
                            path: "policies",
                            element: <SalesPolicies />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "HR-dashboard",
                    element: <HrLayout />,
                    children: [
                      {
                        path: "",
                        element: <HrDashboard />,
                      },
                      {
                        path: "company",
                        element: <Compliances />,
                        children: [
                          {
                            path: "company-logo",
                            element: <CompanyLogo />,
                          },
                          {
                            path: "departments",
                            element: <HrSettingsDepartments />,
                          },
                          {
                            path: "work-locations",
                            element: <WorkLocations />,
                          },
                          {
                            path: "holidays",
                            element: <HolidaysEvents />,
                          },
                          {
                            path: "company-handbook",
                            element: <ComapanyHandbook />,
                          },
                          {
                            path: "policies",
                            element: <HrSettingsPolicies />,
                          },
                          {
                            path: "sops",
                            element: <HrSOP />,
                          },
                          {
                            path: "employee-type",
                            element: <EmployeeType />,
                          },
                          {
                            path: "shifts",
                            element: <Shifts />,
                          },
                          {
                            path: "vendor-onboarding",
                            element: <VendorOnboard />,
                          },
                          {
                            path: "vendor-onboarding/vendor-details/:id",
                            element: <ViewVendors />,
                          },
                          {
                            path: "templates",
                            element: <Templates />,
                          },
                          {
                            path: "templates/:id",
                            element: <ViewTemplate />,
                          },
                        ],
                      },
                      {
                        path: "employee",
                        element: <OnBoarding />,
                        children: [
                          {
                            path: "employee-onboarding",
                            index: true,
                            element: <EmployeeOnboard />,
                          },
                          {
                            path: "view-employees",
                            element: <ViewEmployees />,
                          },
                          {
                            path: "view-employees/:id", // Move dynamic route to the same level as view-employees
                            element: <EmployeeDetail />,
                            children: [
                              {
                                path: "edit-details",
                                element: <EditDetails />,
                              },
                              {
                                path: "attendance",
                                element: <Attendance />,
                              },
                              {
                                path: "leaves",
                                element: <Leaves />,
                              },
                              {
                                path: "agreements",
                                element: <Agreements />,
                              },
                              {
                                path: "kpi",
                                element: <KPI />,
                              },
                              {
                                path: "kra",
                                element: <KRA />,
                              },
                              {
                                path: "payslip",
                                element: <Payslip />,
                              },
                            ],
                          },

                          {
                            path: "member-onboarding",
                            element: <MemberOnboard />,
                          },
                        ],
                      },
                      {
                        path: "data",
                        element: <Data />,
                        children: [
                          {
                            path: "job-application-list",
                            index: true,
                            element: <JobApplicationList />,
                          },

                          {
                            path: "reports",

                            element: <HrReports />,
                          },
                        ],
                      },
                      {
                        path: "finance",
                        element: <HrFinance />,
                        children: [
                          {
                            path: "budget",
                            index: true,
                            element: <HrBudget />,
                          },
                          {
                            path: "payment-schedule",
                            element: <HrPayment />,
                          },
                          {
                            path: "payroll",
                            element: <HrPayroll />,
                          },
                          {
                            path: "payroll/view-payroll",
                            element: <HrPayroll />,
                          },
                          {
                            path: "payroll/view-payroll/:id",
                            element: <ViewPayroll />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <HrSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <BulkUpload />,
                          },
                          {
                            path: "hr-sops",
                            element: <HrSops />,
                          },
                          {
                            path: "hr-policies",
                            element: <HrPolicies />,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },

              {
                path: "reports",
                element: <Reports />,
              },
              {
                path: "calendar",
                element: <Calender />,
              },
              {
                path: "access",
                element: <Access />,
              },
              {
                path: "access/permissions",
                element: <AccessProfile />,
              },
              {
                path: "notifications",
                element: <Notifications />,
              },
              {
                path: "chat",
                element: <Chat />,
              },
              {
                path: "profile",
                element: <ProfileLayout />,
                children: [
                  {
                    path: "my-profile",
                    element: <MyProfile />,
                  },
                  {
                    path: "change-password",
                    element: <ChangePassword />,
                  },
                  {
                    path: "access-grant",
                    element: <AccessGrant />,
                  },
                  {
                    path: "HR",
                    element: <HrCommonLayout />,
                    children: [
                      {
                        path: "attendance",
                        element: <HrCommonAttendance />,
                      },
                      {
                        path: "leaves",
                        element: <HrCommonLeaves />,
                      },
                      {
                        path: "agreements",
                        element: <HrCommonAgreements />,
                      },
                      {
                        path: "payslips",
                        element: <HrCommonPayslips />,
                      },
                    ],
                  },
                  {
                    path: "my-assets",
                    element: <MyAssets />,
                  },
                  {
                    path: "my-meetings",
                    element: <MeetingRoomCredits />,
                  },
                  {
                    path: "tickets-history",
                    element: <TicketsHistory />,
                  },
                ],
              },
              {
                path: "test",
                element: <TestPage />,
              },

              {
                path: "tickets", // Parent path
                element: <TicketLayout />, // Parent component for tickets
                children: [
                  {
                    path: "", // Default route for /app/tickets
                    element: <TicketDashboard />, // Dashboard is rendered by default
                    index: true,
                  },
                  {
                    path: "raise-ticket",
                    element: <RaiseTicket />,
                  },
                  {
                    path: "manage-tickets",
                    element: <ManageTickets />,
                  },
                  {
                    path: "ticket-settings",
                    element: <TicketSettingsnew />,
                  },
                  {
                    path: "team-members",
                    element: <TeamMembers />,
                  },
                  {
                    path: "reports",
                    element: <TicketReports />,
                  },
                ],
              },
              {
                path: "meetings", // Parent path
                element: <MeetingLayout />, // Parent component for tickets
                children: [
                  {
                    path: "", // Default route for /app/tickets
                    element: <MeetingDashboard />, // Dashboard is rendered by default
                    index: true,
                  },
                  {
                    path: "book-meeting",
                    element: <BookMeetings />, // This is your first page
                  },
                  {
                    path: "book-meeting/schedule-meeting",
                    element: <MeetingFormLayout />, // This is your second page
                  },
                  {
                    path: "manage-meetings",
                    element: <ManageMeetings />,
                  },
                  {
                    path: "settings",
                    element: <MeetingSettings />,
                  },
                  {
                    path: "calendar",
                    element: <MeetingCalendar />,
                  },
                  {
                    path: "reports",
                    element: <MeetingReports />,
                  },
                  {
                    path: "reviews",
                    element: <Reviews />,
                  },
                  {
                    path: "settings",
                    element: <TicketReports />,
                  },
                ],
              },
              {
                path: "assets", // Parent path
                element: <AssetsLayout />, // Parent component for tickets
                children: [
                  {
                    path: "", // Default route for /app/assets
                    element: <AssetsDashboard />, // Dashboard is rendered by default
                    index: true,
                  },
                  {
                    path: "categories",
                    element: <AssetsCategoriesLayout />, // This is your first page
                    children: [
                      {
                        path: "assets-categories",
                        index: true,
                        element: <AssetsCategories />,
                      },
                      {
                        path: "assets-sub-categories",
                        element: <AssetsSubCategories />,
                      },
                      {
                        path: "list-of-assets",
                        element: <ListOfAssets />,
                      },
                    ],
                  },
                  {
                    path: "schedule-meeting",
                    element: <MeetingFormLayout />, // This is your second page
                  },
                  {
                    path: "manage-assets",
                    element: <ManageAssets />,
                    children: [
                      {
                        path: "assign-assets",
                        element: <AssignAssets />,
                      },
                      {
                        path: "assigned-assets",
                        element: <AssignedAssets />,
                      },
                      {
                        path: "approvals",
                        element: <Approvals />,
                      },
                    ],
                  },
                  {
                    path: "calendar",
                    element: <MeetingCalendar />,
                  },
                  {
                    path: "reports",
                    element: <AssetReports />,
                  },
                  {
                    path: "reviews",
                    element: <Reviews />,
                  },
                  {
                    path: "settings",
                    element: <AssetsSettings />,
                    children: [
                      {
                        path: "bulk-upload",
                        element: <AssetsBulkUpload />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "tasks", // Parent path
                element: <TasksLayout />, // Parent component for tasks
                children: [
                  {
                    path: "", // Default route for /app/tasks
                    element: <TasksDashboard />, // Dashboard is rendered by default
                    index: true,
                  },
                  {
                    path: "project-list", // Default route for /app/tasks
                    element: <ProjectList />, // Dashboard is rendered by default
                  },
                  {
                    path: "project-list/edit-project", // Default route for /app/tasks
                    element: <ProjectList />, // Dashboard is rendered by default
                  },
                  {
                    path: "project-list/edit-project/:id", // Default route for /app/tasks
                    element: <EditProject />, // Dashboard is rendered by default
                  },
                  {
                    path: "my-tasklist",
                    element: <MyTaskListLayout />, // This is your first page
                    children: [
                      {
                        path: "daily-tasks",
                        index: true,
                        element: <DailyTasks />,
                      },
                      {
                        path: "monthly-tasks",
                        element: <MonthlyTasks />,
                      },
                      {
                        path: "additional-Tasks",
                        element: <AdditionalTasks />,
                      },
                    ],
                  },
                  {
                    path: "team-members",
                    element: <TeamMember />,
                  },
                  {
                    path: "manage-assets",
                    element: <ManageAssets />,
                    children: [
                      {
                        path: "assign-assets",
                        element: <AssignAssets />,
                      },
                      {
                        path: "assigned-assets",
                        element: <AssignedAssets />,
                      },
                      {
                        path: "approvals",
                        element: <Approvals />,
                      },
                    ],
                  },

                  {
                    path: "calendar",
                    element: <MeetingCalendar />,
                  },
                  {
                    path: "reports",
                    element: <TaskReportLayout />,
                    children: [
                      {
                        path: "my-task-reports",
                        element: <MyTaskReports />,
                      },
                      {
                        path: "assigned-task-reports",
                        element: <AssignedTaskReports />,
                      },
                      {
                        path: "department-task-reports",
                        element: <DepartmentTaskReports />,
                      },
                    ],
                  },
                  {
                    path: "reviews",
                    element: <Reviews />,
                  },
                  {
                    path: "settings",
                    element: <AssetsSettings />,
                    children: [
                      {
                        path: "bulk-upload",
                        element: <AssetsBulkUpload />,
                      },
                    ],
                  },
                ],
              },
              {
                path: "visitors", // Parent path
                element: <VisitorLayout />, // Parent component for Visitors
                children: [
                  {
                    path: "", // Default route for /app/visitors
                    element: <VisitorDashboard />,
                    index: true,
                  },
                  {
                    path: "add-visitor", // Page with form to Add a new Visitor
                    element: <AddVisitor />,
                  },
                  {
                    path: "manage-visitors", // Page with table showing a list of all visitors
                    element: <ManageVisitors />,
                  },
                  {
                    path: "team-members", // Page with table showing a list of all the team members(receptionists)
                    element: <VisitorTeamMembers />,
                  },
                  {
                    path: "reports", // Page with table showing a list of all the visitor reports
                    element: <VisitorReports />,
                  },
                  {
                    path: "reviews", // Page with table showing a list of all the visitor reviews
                    element: <VisitorReviews />,
                  },
                  {
                    path: "settings",
                    element: <VisitorSettings />,
                    children: [
                      {
                        path: "bulk-upload",
                        element: <VisitorBulkUpload />,
                      },
                    ],
                  },
                ],
              },
            ],
          },
        ],
      },
      {
        path: "unauthorized",
        element: <Unauthorized />,
      },
    ],
  },
  {
    path: "*",
    element: <NotFoundPage />,
  },
]);
