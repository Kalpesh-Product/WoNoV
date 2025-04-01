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
                    element: <Dashboard />,
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
                element: <Profile />,
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
                    path: "schedule-meeting",
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
                    children:[
                      {
                        path:'assign-assets',
                        element:<AssignAssets />
                      },
                      {
                        path:'assigned-assets',
                        element:<AssignedAssets />
                      },
                      {
                        path:'approvals',
                        element:<Approvals />
                      },
                    ]
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
                    children:[
                      {
                        path:'assign-assets',
                        element:<AssignAssets />
                      },
                      {
                        path:'assigned-assets',
                        element:<AssignedAssets />
                      },
                      {
                        path:'approvals',
                        element:<Approvals />
                      },
                    ]
                  },
                  {
                    path: "calendar",
                    element: <MeetingCalendar />,
                  },
                  {
                    path: "reports",
                    element: <TaskReportLayout />,
                    children:[
                      {
                        path:'my-task-reports',
                        element:<MyTaskReports />
                      },
                      {
                        path:'assigned-task-reports',
                        element:<AssignedTaskReports />
                      },
                      {
                        path:'department-task-reports',
                        element:<DepartmentTaskReports />
                      },
                    ]
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
            ],
          },
        ],
      },
    ],
  },
]);
