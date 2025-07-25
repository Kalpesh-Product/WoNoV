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
import Inventory from "../pages/Dashboard/MaintainanceDashboard/Inventory";
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
import FinanceLayout from "../pages/Dashboard/FinanceDashboard/FinanceLayout";
import MonthlyProfitLoss from "../pages/Dashboard/FinanceDashboard/MonthyProfitLoss/MonthlyProfitLoss";
import AverageProfitLoss from "../pages/Dashboard/FinanceDashboard/AverageProfitLoss/AverageProfitLoss";
import OverallProfitLoss from "../pages/Dashboard/FinanceDashboard/OverallProfitLoss/OverallProfitLoss";
import SqWiseData from "../pages/Dashboard/FinanceDashboard/SqftWiseData/SqWiseData";
import InvoiceCreation from "../pages/Dashboard/FinanceDashboard/Billing/InvoiceCreation";
import VoucherCreation from "../pages/Dashboard/FinanceDashboard/Billing/VoucherCreation";
import PendingApprovals from "../pages/Dashboard/FinanceDashboard/Billing/PendingApprovals";
import BillingsLayout from "../pages/Dashboard/FinanceDashboard/Billing/BillingsLayout";
import FinanceBudgetLayout from "../pages/Dashboard/FinanceDashboard/Finance/FinanceBudgetLayout";
import FinanceBudget from "../pages/Dashboard/FinanceDashboard/Finance/FinanceBudget";
import DeptWiseBudget from "../pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudget";
import PaymentSchedule from "../pages/Dashboard/FinanceDashboard/Finance/PaymentSchedule";
import Collections from "../pages/Dashboard/FinanceDashboard/Finance/Collections";
import StatutoryPayments from "../pages/Dashboard/FinanceDashboard/Finance/StatutoryPayments";
import LandlordPayments from "../pages/Dashboard/FinanceDashboard/Finance/LandlordPayments";
import MonthlyPnl from "../pages/Dashboard/FinanceDashboard/P&L/MonthlyPnl";
import AnnualAveragePnl from "../pages/Dashboard/FinanceDashboard/P&L/AnnualAveragePnl";
import OverallPnl from "../pages/Dashboard/FinanceDashboard/P&L/OverallPnl";
import MonthlyPerSqFtPnl from "../pages/Dashboard/FinanceDashboard/P&L/MonthlyPerSqFtPnl";
import Cashflow from "../pages/Dashboard/FinanceDashboard/Cashflow/Cashflow";
import Projections from "../pages/Dashboard/FinanceDashboard/Cashflow/Projections";
import HistoricalPnl from "../pages/Dashboard/FinanceDashboard/Cashflow/HistoricalPnl";
import FinanceData from "../pages/Dashboard/FinanceDashboard/FinanceData/FinanceData";
import FinanceVendorDatabase from "../pages/Dashboard/FinanceDashboard/FinanceData/FinanceVendorDatabase";
import FinanceAssetList from "../pages/Dashboard/FinanceDashboard/FinanceData/FinanceAssetList";
import FinanceMonthlyInvoices from "../pages/Dashboard/FinanceDashboard/FinanceData/FinanceMonthlyInvoices";
import FinanceMonthlyVouchers from "../pages/Dashboard/FinanceDashboard/FinanceData/FinanceMonthlyVouchers";
import FinanceSettings from "../pages/Dashboard/FinanceDashboard/FinanceSettings/FinanceSettings";
import FinanceBulkUpload from "../pages/Dashboard/FinanceDashboard/FinanceSettings/FinanceBulkUpload";
import FinanceSops from "../pages/Dashboard/FinanceDashboard/FinanceSettings/FinanceSops";
import FinancePolicies from "../pages/Dashboard/FinanceDashboard/FinanceSettings/FinancePolicies";
import MixBag from "../pages/Dashboard/FinanceDashboard/MixBag/MixBag";
import DirectorsCompany from "../pages/Dashboard/FinanceDashboard/MixBag/DirectorsCompany";
import DirectorData from "../pages/Dashboard/FinanceDashboard/MixBag/DirectorData";
import AdminClientLayout from "../pages/Dashboard/AdminDashboard/AdminClientLayout";
import AdminClientsData from "../pages/Dashboard/AdminDashboard/AdminClientsData/AdminClientsData";
import AdminClientOnboard from "../pages/Dashboard/AdminDashboard/AdminClientsData/AdminClientOnboard";
import FinanceViewVoucher from "../pages/Dashboard/FinanceDashboard/FinanceData/FinanceViewVoucher";
import MonthMeetings from "../pages/MonthMeetings";
import DepartmentWiseTickets from "../pages/Tickets/DepartmentWiseTickets";
import CafeLayout from "../pages/Dashboard/CafeDashboard/CafeLayout";
import CafeDashboard from "../pages/Dashboard/CafeDashboard/CafeDashboard";
import DeptWiseBudgetDetails from "../pages/Dashboard/FinanceDashboard/Finance/DeptWiseBudgetDetails";
import LandlordPaymentLocation from "../pages/Dashboard/FinanceDashboard/Finance/LandlordPaymentLocation";
import CollectionsLayout from "../pages/Dashboard/FinanceDashboard/Finance/CollectionsLayout";
import HrAttendance from "../pages/Dashboard/HrDashboard/HrEmployee/HrAttendance";
import HrLeaves from "../pages/Dashboard/HrDashboard/HrEmployee/HrLeaves";
import HrEvents from "../pages/Dashboard/HrDashboard/Complaince/HrEvents";
import HrTasks from "../pages/Dashboard/HrDashboard/HrTasks/HrKPA";
import HrDepartmentTasks from "../pages/Dashboard/HrDashboard/HrTasks/HrDepartmentTasks";
import HrTasksLayout from "../pages/Dashboard/HrDashboard/HrTasks/HrTasksLayout";
import PerformanceLayout from "../pages/Performance/PerformanceLayout";
import PerformanceHome from "../pages/Performance/PerformanceHome";
import DepartmentPerformanceLayout from "../pages/Performance/DepartmentPerformanceLayout";
import PerformanceKra from "../pages/Performance/DepartmentDetails/PerformanceKra";
import PerformanceAnnual from "../pages/Performance/DepartmentDetails/PerformanceAnnual";
import PerformanceMonthly from "../pages/Performance/DepartmentDetails/PerformanceMonthly";
import DepartmentTasksLayout from "../pages/Tasks/DepartmentTasks/DepartmentTasksLayout";
import DepartmentTasks from "../pages/Tasks/DepartmentTasks/DepartmentTasks";
import TasksDepartmentLayout from "../pages/Tasks/DepartmentTasks/TasksDepartmentLayout";
import TasksViewDepartment from "../pages/Tasks/DepartmentTasks/TasksViewDepartment";
import ManageTicketLayout from "../pages/Tickets/Tables/ManageTicketLayout";
import ManageTicketsHome from "../pages/Tickets/ManageTicketsHome";
import Reimbursement from "../components/Pages/Reimbursement";
import AddClient from "../pages/Visitors/Forms/AddClient";
import IncomeDetails from "../pages/Dashboard/FinanceDashboard/IncomeDetails/IncomeDetails";
import ComplianceDocuments from "../pages/Dashboard/FinanceDashboard/MixBag/ComplianceDocuments";
import LandlordAgreements from "../pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreements";
import ClientAgreements from "../pages/Dashboard/FinanceDashboard/MixBag/ClientAgreements";
import ReviewRequest from "../pages/Dashboard/FinanceDashboard/Billing/ReviewRequest";
import ManageVisitorLayout from "../pages/Visitors/ManageVisitorLayout";
import ExternalClients from "../pages/Visitors/ExternalClients";
import ManageMeetingsLayout from "../pages/Meetings/ManageMeetingsLayout";
import ExternalMeetingClients from "../pages/Meetings/ExternalMeetingClients";
import CoWorkingDetails from "../pages/Dashboard/SalesDashboard/CoWorkingSeats/CoWorkingDetails";
import Vendor from "../components/Vendor";
import ViewVendor from "../components/vendor/ViewVendor";
import SalesDataCard from "../pages/Dashboard/SalesDashboard/SalesData/SalesDataCard";
import DepartmentInvoice from "../pages/Dashboard/FinanceDashboard/Billing/DepartmentInvoice";
import MonthlyInvoiceCommon from "../components/Pages/MonthlyInvoiceCommon";
import CompanyHandbook from "../pages/Dashboard/HrDashboard/Complaince/CompanyHandbook";
import UserDetails from "../pages/Profile/UserDetails";
import LandlordAgreementData from "../pages/Dashboard/FinanceDashboard/MixBag/LandlordAgreementData";
import ClientAgreementData from "../pages/Dashboard/FinanceDashboard/MixBag/ClientAgreementData";
import TeamMembersSchedule from "../components/Pages/TeamMembersSchedule";
import MaintenanceMixBag from "../pages/Dashboard/MaintainanceDashboard/MaintenanceMixBag";
import ItMixBag from "../pages/Dashboard/ItDashboard/itMixBag/ItMixBag";
import TeamMemberDetails from "../components/Pages/TeamMemberDetails";
import BudgetPage from "../components/Pages/BudgetPage";
import AnnualExpense from "../components/Pages/AnnualExpense";
import MaintenancOfficesNew from "../pages/Dashboard/MaintainanceDashboard/MaintenanceOffices/MaintenanceOfficesNew";
import PaymentScheduleCommon from "../components/Pages/PaymentScheduleCommon";
import ItOfficesNew from "../pages/Dashboard/ItDashboard/ItOffices/ItOfficessNew";
import AdminOfficesNew from "../pages/Dashboard/AdminDashboard/AdminOffices/AdminOfficesNew";
import PayrollReports from "../pages/Dashboard/HrDashboard/Data/PayrollReports";
import ComplianceData from "../pages/Dashboard/FinanceDashboard/MixBag/ComplianceData";
import HrMixBag from "../pages/Dashboard/HrDashboard/HrMixBag";
import AttendanceRequests from "../pages/Dashboard/HrDashboard/Mixbag/AttendanceRequests";
import AttendanceLayout from "../pages/Dashboard/HrDashboard/Mixbag/AttendanceLayout";
import LeavesLayout from "../pages/Dashboard/HrDashboard/Mixbag/LeavesLayout";
import PendingLeaveRequests from "../pages/Dashboard/HrDashboard/Mixbag/PendingLeaveRequests";
import CompletedLeaveRequests from "../pages/Dashboard/HrDashboard/Mixbag/CompletedLeaveRequests";
import AttendanceCompleted from "../pages/Dashboard/HrDashboard/Mixbag/AttendanceCompleted";
import DepartmentAssetCommon from "../components/Pages/DepartmentAssetCommon";
import DepartmentSOP from "../pages/Dashboard/HrDashboard/Complaince/DepartmentSOP";
import SopUpload from "../components/Pages/SopUpload";
import ManageUnit from "../pages/Dashboard/SalesDashboard/ManageUnit";
import PolicyUpload from "../components/Pages/PolicyUpload";
import MainDashboard from "../pages/Dashboard/MainDashboard/MainDashboard";
import DepartmentWiseBulkUpload from "../components/Pages/BulkUpload";
import HrCommonAttandenceRequests from "../pages/HR/HrCommonAttandenceRequests";
import PastEmployees from "../pages/Dashboard/HrDashboard/OnBoarding/PastEmployees";
import HrCommonHandbook from "../pages/HR/HrCommonHandbook";
import DepartmentPolicies from "../pages/Dashboard/HrDashboard/Complaince/DepartmentPolicies";
import HrCommonDocuments from "../pages/HR/HrCommonDocuments";
import BuildingUnits from "../pages/Dashboard/SalesDashboard/CoWorkingSeats/BuildingUnits";
import HouseKeepingMembersList from "../pages/Dashboard/AdminDashboard/HouseKeepingMembersList";
import HouseKeepingLayout from "../pages/Dashboard/AdminDashboard/HouseKeepingLayout";
import HouseKeepingOnboard from "../pages/Dashboard/AdminDashboard/HouseKeepingOnboard";
import HrKPA from "../pages/Dashboard/HrDashboard/HrTasks/HrKPA";
import HrOverallTasks from "../pages/Dashboard/HrDashboard/HrTasks/HrOverallTasks";
import HrDepartmentKPA from "../pages/Dashboard/HrDashboard/HrTasks/HrDepartmentKPA";
import VendorTable from "../components/Pages/VendorTable";
import AssetsHome from "../pages/Assets/AssetsHome";
import ManageAssetsHome from "../pages/Assets/ManageAssetsHome";
import ViewClientInfo from "../pages/Dashboard/SalesDashboard/ViewClientInfo";
import CoWorkingClients from "../pages/Dashboard/SalesDashboard/ViewClients/CoWorkingClients";
import WorkationClients from "../pages/Dashboard/SalesDashboard/ViewClients/WorkationClients";
import VirtualOfficeClients from "../pages/Dashboard/SalesDashboard/ViewClients/VirtualOfficeClients";
import LogPage from "../pages/LogPage";
import VirtualOfficeForm from "../pages/Dashboard/SalesDashboard/VirtualOfficeForm";
import AccessPages from "../pages/Access/AccessPages";

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
                    path: "",
                    element: <MainDashboard />,
                    index: true,
                  },
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
                        path: "edit-theme/:templateName/:pageName",
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
                            path: "asset-list",
                            element: <DepartmentAssetCommon />,
                          },
                          {
                            path: "website-issue-reports",
                            element: <FrontendWebsiteIssueReports />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <MonthlyInvoiceCommon />,
                          },
                          {
                            path: "vendor",
                            element: <VendorTable />,
                          },
                          {
                            path: "vendor/vendor-onboard",
                            element: <Vendor />,
                          },
                          {
                            path: "vendor/:id",
                            element: <ViewVendor />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <FrontendSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <DepartmentWiseBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <SopUpload />,
                          },
                          {
                            path: "policies",
                            element: <PolicyUpload />,
                          },
                        ],
                      },
                      {
                        path: "finance",
                        element: <FrontendFinLayout />,
                        children: [
                          {
                            path: "budget",
                            element: <BudgetPage />,
                          },
                          {
                            path: "payment-schedule",
                            element: <PaymentScheduleCommon />,
                          },
                          {
                            path: "voucher",
                            element: <Reimbursement />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "finance-dashboard",
                    element: <FinanceLayout />,
                    children: [
                      {
                        path: "",
                        element: <FinanceDashboard />,
                      },
                      {
                        path: "monthly-P&L",
                        element: <MonthlyPnl />,
                      },
                      {
                        path: "annual-average-P&L",
                        element: <AnnualAveragePnl />,
                      },
                      {
                        path: "overall-P&L",
                        element: <OverallPnl />,
                      },
                      {
                        path: "monthly-per-sq-ft-P&L",
                        element: <MonthlyPerSqFtPnl />,
                      },
                      {
                        path: "mix-bag",
                        element: <MixBag />,
                      },
                      {
                        path: "mix-bag/directors-company-KYC",
                        element: <DirectorsCompany />,
                      },
                      {
                        path: "mix-bag/compliance-documents",
                        // element: <ComplianceDocuments />,
                        element: <ComplianceData />,
                      },
                      {
                        path: "mix-bag/compliance-documents/:name",
                        element: <ComplianceData />,
                      },
                      {
                        path: "mix-bag/landlord-agreements",
                        element: <LandlordAgreements />,
                      },
                      {
                        path: "mix-bag/landlord-agreements/:name",
                        element: <LandlordAgreementData />,
                      },
                      {
                        path: "mix-bag/client-agreements",
                        element: <ClientAgreements />,
                      },
                      {
                        path: "mix-bag/client-agreements/:name",
                        element: <ClientAgreementData />,
                      },
                      {
                        path: "directors-company-KYC",
                        element: <DirectorsCompany />,
                      },
                      {
                        path: "mix-bag/directors-company-KYC/:name",
                        element: <DirectorData />,
                      },
                      {
                        path: "directors-company-KYC/:name",
                        element: <DirectorData />,
                      },
                      {
                        path: "cashflow",
                        element: <Cashflow />,
                        children: [
                          {
                            path: "projections",
                            element: <Projections />,
                          },
                          {
                            path: "historical-P&L",
                            element: <HistoricalPnl />,
                          },
                        ],
                      },
                      {
                        path: "data",
                        element: <FinanceData />,
                        children: [
                          {
                            path: "vendor",
                            element: <VendorTable />,
                          },
                          {
                            path: "vendor/vendor-onboard",
                            element: <Vendor />,
                          },
                          {
                            path: "vendor/:id",
                            element: <ViewVendor />,
                          },
                          {
                            path: "asset-list",
                            element: <DepartmentAssetCommon />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <MonthlyInvoiceCommon />,
                          },
                          {
                            path: "finance-monthly-invoices",
                            element: <FinanceMonthlyInvoices />,
                          },
                          {
                            path: "finance-monthly-vouchers",
                            element: <FinanceMonthlyVouchers />,
                          },
                          {
                            path: "finance-monthly-vouchers/:id",
                            element: <FinanceViewVoucher />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <FinanceSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <DepartmentWiseBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <SopUpload />,
                          },
                          {
                            path: "policies",
                            element: <PolicyUpload />,
                          },
                        ],
                      },
                      {
                        path: "monthly-profit-loss",
                        element: <MonthlyProfitLoss />,
                      },
                      {
                        path: "monthly-profit-loss/income-details",
                        element: <IncomeDetails />,
                      },
                      {
                        path: "annual-average-profit-loss",
                        element: <AverageProfitLoss />,
                      },
                      {
                        path: "annual-average-profit-loss/income-details",
                        element: <IncomeDetails />,
                      },
                      {
                        path: "overall-profit-loss",
                        element: <OverallProfitLoss />,
                      },
                      {
                        path: "overall-profit-loss/income-details",
                        element: <IncomeDetails />,
                      },

                      {
                        path: "sqft-wise-data",
                        element: <SqWiseData />,
                      },
                      {
                        path: "sqft-wise-data/income-details",
                        element: <IncomeDetails />,
                      },
                      {
                        path: "billing",
                        element: <BillingsLayout />,
                        children: [
                          {
                            path: "client-invoice",
                            element: <InvoiceCreation />,
                          },
                          {
                            path: "department-invoice",
                            element: <DepartmentInvoice />,
                          },
                          {
                            path: "finance-monthly-vouchers",
                            element: <FinanceMonthlyVouchers />,
                          },
                          {
                            path: "finance-monthly-vouchers/:id",
                            element: <FinanceViewVoucher />,
                          },
                          {
                            path: "voucher-history",
                            element: <VoucherCreation />,
                          },
                          {
                            path: "pending-approvals",
                            element: <PendingApprovals />,
                          },
                          {
                            path: "pending-approvals/review-request",
                            element: <ReviewRequest />,
                          },
                        ],
                      },
                      {
                        path: "finance",
                        element: <FinanceBudgetLayout />,
                        children: [
                          {
                            path: "budget",
                            element: <BudgetPage />,
                          },
                          {
                            path: "voucher",
                            element: <Reimbursement />,
                          },
                          {
                            path: "dept-wise-budget",
                            element: <DeptWiseBudget />,
                          },
                          {
                            path: "dept-wise-budget/:department",
                            element: <DeptWiseBudgetDetails />,
                          },
                          {
                            path: "payment-schedule",
                            element: <PaymentScheduleCommon />,
                          },
                          {
                            path: "collections",
                            element: <Collections />,
                          },
                          {
                            path: "collections/paid",
                            element: <CollectionsLayout />,
                          },
                          {
                            path: "statutory-payments",
                            element: <StatutoryPayments />,
                          },
                          {
                            path: "landlord-payments",
                            element: <LandlordPayments />,
                          },
                          {
                            path: "landlord-payments-unit",
                            element: <LandlordPaymentLocation />,
                          },
                        ],
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
                        element: <AnnualExpense />,
                      },
                      {
                        path: "inventory",
                        element: <Inventory />,
                      },
                      {
                        path: "finance",
                        element: <AdminFinance />,
                        children: [
                          {
                            path: "budget",
                            element: <BudgetPage />,
                          },
                          {
                            path: "payment-schedule",
                            element: <PaymentScheduleCommon />,
                          },
                          {
                            path: "voucher",
                            element: <Reimbursement />,
                          },
                        ],
                      },
                      {
                        path: "mix-bag",
                        element: <AdminMixBag />,
                      },
                      {
                        path: "team-members-schedule",
                        element: <TeamMembersSchedule />,
                      },
                      {
                        path: "mix-bag/team-members-schedule",
                        element: <TeamMembersSchedule />,
                      },
                      {
                        path: "mix-bag/team-members-schedule/:name",
                        element: <TeamMemberDetails />,
                      },
                      {
                        path: "mix-bag/housekeeping-members",
                        element: <HouseKeepingLayout />,
                        children: [
                          {
                            path: "members-list",
                            element: <HouseKeepingMembersList />,
                          },
                          {
                            path: "member-onboard",
                            element: <HouseKeepingOnboard />,
                          },
                          {
                            path: "member-schedule",
                            element: <HousekeepingTeamMembersSchedule />,
                          },
                          {
                            path: "member-schedule/:id",
                            element: <HousekeepingTeamMembersCalendar />,
                          },
                        ],
                      },

                      {
                        path: "holidays-events",
                        element: <AdminHolidaysEvents />,
                      },
                      {
                        path: "mix-bag/client-members",
                        element: <AdminClientLayout />,
                        children: [
                          {
                            path: "client-members-data",
                            element: <AdminClientsData />,
                          },
                          {
                            path: "client-members-onboard",
                            element: <AdminClientOnboard />,
                          },
                          {
                            path: "client-members-data/:clientName",
                            element: <AdminClientMembersLayout />,
                            children: [
                              {
                                path: "client-details",
                                element: <AdminClientDetails />,
                              },
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
                        ],
                      },

                      {
                        path: "data",
                        element: <AdminData />,
                        children: [
                          {
                            path: "asset-list",
                            element: <DepartmentAssetCommon />,
                          },
                          {
                            path: "vendor",
                            element: <VendorTable />,
                          },
                          {
                            path: "vendor/vendor-onboard",
                            element: <Vendor />,
                          },
                          {
                            path: "vendor/:id",
                            element: <ViewVendor />,
                          },
                          {
                            path: "electricity-expenses",
                            element: <AdminElectricityExpenses />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <MonthlyInvoiceCommon />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <AdminSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <DepartmentWiseBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <SopUpload />,
                          },
                          {
                            path: "policies",
                            element: <PolicyUpload />,
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
                        element: <AdminOfficesNew />,
                      },
                      {
                        path: "admin-offices/:client",
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
                        element: <AnnualExpense />,
                        // element: <MaintenanceAnnualExpenses />,
                      },
                      {
                        path: "inventory",
                        element: <Inventory />,
                      },
                      {
                        path: "finance",
                        element: <MaintenanceFinance />,
                        children: [
                          {
                            path: "budget",
                            element: <BudgetPage />,
                          },
                          {
                            path: "payment-schedule",
                            element: <PaymentScheduleCommon />,
                          },
                          {
                            path: "voucher",
                            element: <Reimbursement />,
                          },
                        ],
                      },
                      {
                        path: "mix-bag",
                        element: <MaintenanceMixBag />,
                      },
                      {
                        path: "team-members-schedule",
                        element: <TeamMembersSchedule />,
                      },
                      {
                        path: "mix-bag/team-members-schedule",
                        element: <TeamMembersSchedule />,
                      },
                      {
                        path: "mix-bag/team-members-schedule/:name",
                        element: <TeamMemberDetails />,
                      },
                      {
                        path: "data",
                        element: <MaintenanceData />,
                        children: [
                          {
                            path: "asset-list",
                            element: <DepartmentAssetCommon />,
                          },
                          {
                            path: "vendor",
                            element: <VendorTable />,
                          },
                          {
                            path: "vendor/vendor-onboard",
                            element: <Vendor />,
                          },
                          {
                            path: "vendor/:id",
                            element: <ViewVendor />,
                          },
                          {
                            path: "amc-records",
                            element: <MaintenanceAmcRecords />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <MonthlyInvoiceCommon />,
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
                            element: <DepartmentWiseBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <SopUpload />,
                          },
                          {
                            path: "policies",
                            element: <PolicyUpload />,
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
                        element: <MaintenancOfficesNew />,
                      },
                      {
                        path: "maintenance-offices/:client",
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
                    path: "it-dashboard",
                    element: <ItLayout />,
                    children: [
                      {
                        path: "",
                        element: <ItDashboard />,
                      },
                      {
                        path: "annual-expenses",
                        element: <AnnualExpense />,
                      },
                      {
                        path: "inventory",
                        element: <Inventory />,
                      },
                      {
                        path: "finance",
                        element: <ItFinance />,
                        children: [
                          {
                            path: "budget",
                            element: <BudgetPage />,
                          },
                          {
                            path: "payment-schedule",
                            element: <PaymentScheduleCommon />,
                          },
                          {
                            path: "voucher",
                            element: <Reimbursement />,
                          },
                        ],
                      },
                      {
                        path: "data",
                        element: <ItData />,
                        children: [
                          {
                            path: "asset-list",
                            element: <DepartmentAssetCommon />,
                          },
                          {
                            path: "vendor",
                            element: <VendorTable />,
                          },
                          {
                            path: "vendor/vendor-onboard",
                            element: <Vendor />,
                          },
                          {
                            path: "vendor/:id",
                            element: <ViewVendor />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <MonthlyInvoiceCommon />,
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
                        path: "mix-bag",
                        element: <ItMixBag />,
                      },
                      {
                        path: "team-members-schedule",
                        element: <TeamMembersSchedule />,
                      },
                      {
                        path: "mix-bag/team-members-schedule",
                        element: <TeamMembersSchedule />,
                      },
                      {
                        path: "mix-bag/team-members-schedule/:name",
                        element: <TeamMemberDetails />,
                      },
                      {
                        path: "settings",
                        element: <ItSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <DepartmentWiseBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <SopUpload />,
                          },
                          {
                            path: "policies",
                            element: <PolicyUpload />,
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
                        element: <ItOfficesNew />,
                      },
                      {
                        path: "it-offices/:client",
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
                        element: <ActualBusinessRevenue />,
                      },

                      {
                        path: "unique-leads",
                        element: <UniqueLeads />,
                      },
                      {
                        path: "unique-leads/:client",
                        element: <ViewClientInfo />,
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
                            element: <BudgetPage />,
                          },
                          {
                            path: "payment-schedule",
                            element: <PaymentScheduleCommon />,
                          },
                          {
                            path: "voucher",
                            element: <Reimbursement />,
                          },
                        ],
                      },
                      {
                        path: "mix-bag",
                        element: <SalesMixBag />,
                      },
                      {
                        path: "mix-bag/inventory",
                        // element: <CoWorkingSeats />,
                        element: <CheckAvailability />,
                      },
                      {
                        path: "mix-bag/inventory/:location",
                        element: <BuildingUnits />,
                      },
                      {
                        path: "mix-bag/inventory/:location/:unit",
                        element: <ViewAvailability />,
                      },
                      {
                        path: "inventory",
                        // element: <CoWorkingSeats />,
                        element: <CheckAvailability />,
                      },
                      {
                        path: "inventory/:id",
                        element: <CoWorkingDetails />,
                      },
                      {
                        path: "mix-bag/inventory",
                        element: <CheckAvailability />,
                      },
                      {
                        path: "inventory",
                        element: <CheckAvailability />,
                      },
                      // {
                      //   path: "mix-bag/inventory/check-availability",
                      //   element: <CheckAvailability />,
                      // },
                      // {
                      //   path: "inventory/check-availability",
                      //   element: <CheckAvailability />,
                      // },
                      {
                        path: "mix-bag/inventory/check-availability/view-availability",
                        element: <ViewAvailability />,
                      },
                      {
                        path: "inventory/check-availability/view-availability",
                        element: <ViewAvailability />,
                      },
                      {
                        path: "mix-bag/revenue",
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
                        path: "mix-bag/clients",
                        element: <ViewClients />,
                      },
                      {
                        path: "clients",
                        element: <ViewClients />,
                      },
                      {
                        path: "mix-bag/clients/co-working",
                        element: <CoWorkingClients />,
                      },
                      {
                        path: "mix-bag/clients/workation",
                        element: <WorkationClients />,
                      },
                      {
                        path: "mix-bag/clients/virtual-office",
                        element: <VirtualOfficeClients />,
                      },
                      {
                        path: "mix-bag/clients/co-working/:clientName",
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
                        path: "mix-bag/clients/co-working/client-onboarding",
                        element: <ClientOnboarding />,
                      },
                      {
                        path: "clients/co-working/client-onboarding",
                        element: <ClientOnboarding />,
                      },
                      {
                        path: "mix-bag/clients/virtual-office/client-onboarding",
                        element: <VirtualOfficeForm />,
                      },
                      {
                        path: "clients/virtual-office/client-onboarding",
                        element: <VirtualOfficeForm />,
                      },
                      {
                        path: "mix-bag/manage-units",
                        element: <ManageUnit />,
                      },
                      {
                        path: "data",
                        element: <SalesDataCard />,
                        children: [
                          {
                            path: "asset-list",
                            element: <DepartmentAssetCommon />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <MonthlyInvoiceCommon />,
                          },
                          {
                            path: "vendor",
                            element: <VendorTable />,
                          },
                          {
                            path: "vendor/vendor-onboard",
                            element: <Vendor />,
                          },
                          {
                            path: "vendor/:id",
                            element: <ViewVendor />,
                          },
                        ],
                      },
                      {
                        path: "settings",
                        element: <SalesSettings />,
                        children: [
                          {
                            path: "bulk-upload",
                            element: <DepartmentWiseBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <SopUpload />,
                          },
                          {
                            path: "policies",
                            element: <PolicyUpload />,
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
                        path: "overall-KPA",
                        element: <HrTasksLayout />,
                        children: [
                          {
                            path: "department-KPA",
                            element: <HrKPA />,
                            index: true,
                          },

                          {
                            path: "department-tasks",
                            element: <HrOverallTasks />,
                          },

                          {
                            path: "department-KPA/:department",
                            element: <HrDepartmentKPA />,
                          },
                          {
                            path: "department-tasks/:department",
                            element: <HrDepartmentTasks />,
                          },
                        ],
                      },
                      {
                        path: "mix-bag",
                        element: <HrMixBag />,
                      },
                      {
                        path: "mix-bag/attendance",
                        element: <AttendanceLayout />,
                        children: [
                          {
                            path: "pending-approvals",
                            element: <AttendanceRequests />,
                            index: true,
                          },
                          {
                            path: "completed",
                            element: <AttendanceCompleted />,
                          },
                        ],
                      },
                      {
                        path: "mix-bag/leaves",
                        element: <LeavesLayout />,
                        children: [
                          {
                            path: "pending-approvals",
                            element: <PendingLeaveRequests />,
                            index: true,
                          },
                          {
                            path: "completed-approvals",
                            element: <CompletedLeaveRequests />,
                          },
                        ],
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
                            path: "events",
                            element: <HrEvents />,
                          },
                          {
                            path: "company-handbook",
                            element: <ComapanyHandbook />,
                          },
                          {
                            path: "company-handbook/:department",
                            element: <DepartmentSOP />,
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
                            path: "employee-list",
                            element: <ViewEmployees />,
                            index: true,
                          },
                          {
                            path: "employee-onboarding",

                            element: <EmployeeOnboard />,
                          },
                          {
                            path: "past-employees",
                            element: <PastEmployees />, // 🛠 Make sure this component exists
                          },
                          {
                            path: "attendance",
                            element: <HrAttendance />,
                          },
                          {
                            path: "leaves",
                            element: <HrLeaves />,
                          },

                          {
                            path: "employee-list/:firstName/",
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
                            path: "asset-list",
                            element: <DepartmentAssetCommon />,
                          },

                          {
                            path: "reports",

                            element: <HrReports />,
                          },
                          {
                            path: "vendor",
                            element: <VendorTable />,
                          },
                          {
                            path: "vendor/vendor-onboard",
                            element: <Vendor />,
                          },
                          {
                            path: "vendor/:id",
                            element: <ViewVendor />,
                          },
                          {
                            path: "monthly-invoice-reports",
                            element: <MonthlyInvoiceCommon />,
                          },
                          {
                            path: "payroll-reports",
                            element: <PayrollReports />,
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
                            element: <BudgetPage />,
                          },
                          {
                            path: "payment-schedule",
                            element: <PaymentScheduleCommon />,
                          },
                          {
                            path: "voucher",
                            element: <Reimbursement />,
                          },
                          {
                            path: "payroll",
                            element: <HrPayroll />,
                          },
                          {
                            path: "payroll/:id",
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
                            element: <DepartmentWiseBulkUpload />,
                          },
                          {
                            path: "sops",
                            element: <SopUpload />,
                          },
                          {
                            path: "policies",
                            element: <PolicyUpload />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "cafe-dashboard",
                    element: <CafeLayout />,
                    children: [
                      {
                        path: "",
                        element: <CafeDashboard />,
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
                path: "access/permissions/pages",
                element: <AccessPages />,
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
                    element: <UserDetails />,
                  },
                  {
                    path: "change-password",
                    element: <ChangePassword />,
                  },
                  {
                    path: "permissions",
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
                        path: "attendance-correction-requests",
                        element: <HrCommonAttandenceRequests />,
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
                        path: "company-handbook",
                        element: <HrCommonHandbook />,
                      },
                      {
                        path: "company-handbook/:department",
                        element: <HrCommonDocuments />,
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
                    element: <ManageTicketLayout />,
                    children: [
                      {
                        path: "",
                        element: <ManageTicketsHome />,
                        index: true,
                      },
                      {
                        path: ":department",
                        element: <ManageTickets />,
                      },
                    ],
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
                  {
                    path: "department-wise-tickets",
                    element: <DepartmentWiseTickets />,
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
                    path: ":meetings",
                    element: <MonthMeetings />,
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
                    element: <ManageMeetingsLayout />,
                    children: [
                      {
                        path: "internal-meetings",
                        element: <ManageMeetings />,
                      },
                      {
                        path: "external-clients",
                        element: <ExternalMeetingClients />,
                      },
                    ],
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
                ],
              },
              {
                path: "assets", // Parent path
                element: <AssetsLayout />, // Parent component for tickets
                children: [
                  {
                    path: "",
                    element: <AssetsDashboard />,
                  },
                  {
                    path: "view-assets",
                    element: <AssetsHome />,
                  },
                  {
                    path: "view-assets/:department",
                    element: <AssetsCategoriesLayout />,
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
                    path: "manage-assets",
                    element: <ManageAssetsHome />,
                  },
                  {
                    path: "manage-assets/:department",
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
                path: "performance",
                element: <PerformanceLayout />,
                children: [
                  {
                    path: "",
                    element: <PerformanceHome />,
                    index: true,
                  },
                  {
                    path: ":department",
                    element: <DepartmentPerformanceLayout />,
                    children: [
                      {
                        path: "daily-KRA",
                        element: <PerformanceKra />,
                      },
                      {
                        path: "monthly-KPA",
                        element: <PerformanceMonthly />,
                      },
                      {
                        path: "annual-KPA",
                        element: <PerformanceAnnual />,
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
                    path: "department-tasks",
                    element: <DepartmentTasksLayout />,
                    children: [
                      {
                        path: "",
                        element: <DepartmentTasks />,
                        index: true,
                      },
                      {
                        path: ":department",
                        element: <TasksDepartmentLayout />,
                        children: [
                          {
                            path: "",
                            element: <TasksViewDepartment />,
                            index: true,
                          },
                          {
                            path: "monthly-KPA",
                            element: <PerformanceMonthly />,
                          },
                          {
                            path: "Annual-KRA",
                            element: <PerformanceAnnual />,
                          },
                        ],
                      },
                    ],
                  },
                  {
                    path: "project-list/edit-project",
                    element: <ProjectList />,
                  },
                  {
                    path: "project-list/edit-project/:id",
                    element: <EditProject />,
                  },
                  {
                    path: "my-tasks",
                    element: <MyTaskListLayout />, // This is your first page
                    children: [
                      {
                        path: "",
                        index: true,
                        element: <DailyTasks />,
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
                    path: "add-client", // Page with form to Add a new Visitor
                    element: <AddClient />,
                  },
                  {
                    path: "manage-visitors",
                    element: <ManageVisitorLayout />,
                    children: [
                      {
                        path: "internal-visitors", // Page with table showing a list of all visitors
                        element: <ManageVisitors />,
                        index: true,
                      },
                      {
                        path: "external-clients", // Page with table showing a list of all visitors
                        element: <ExternalClients />,
                        index: true,
                      },
                    ],
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
        path: "secret-logs",
        element: <LogPage />,
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
