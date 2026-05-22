import React, { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";
import useUserPermissions from "../../hooks/useUserPermissions";
import useAuth from "../../hooks/useAuth";

const staticReportModules = [
  {
    title: "TICKETS",
    subtitle: "Ticket Reports",
    route: "../reports-section/ticket",
    permission: PERMISSIONS.REPORTS_TICKETS.value,
  },
  {
    title: "MEETINGS",
    subtitle: "Meeting Reports",
    route: "../reports-section/meeting",
    permission: PERMISSIONS.REPORTS_MEETINGS.value,
  },
  {
    title: "VISITORS",
    subtitle: "Visitor Reports",
    route: "../reports-section/visitor",
    permission: PERMISSIONS.REPORTS_VISITORS.value,
  },
  {
    title: "ASSETS",
    subtitle: "Asset Reports",
    route: "../reports-section/asset",
    permission: PERMISSIONS.REPORTS_ASSETS?.value,
  },
  {
    title: "TASKS",
    subtitle: "Task Reports",
    route: "../reports-section/task",
    permission: PERMISSIONS.REPORTS_TASKS?.value,
  },
  {
    title: "PERFORMANCE",
    subtitle: "Performance Reports",
    route: "../reports-section/performance",
    permission: PERMISSIONS.REPORTS_PERFORMANCE?.value,
  },
];

const ReportsSection = () => {
  const navigate = useNavigate();
  const { permissions } = useUserPermissions();
  const { auth } = useAuth();

  const userDepartments = useMemo(
    () =>
      Array.isArray(auth?.user?.departments)
        ? auth.user.departments.filter((dept) => dept?.name)
        : [],
    [auth?.user?.departments],
  );

  const departmentCards = userDepartments.map((department) => {
    const moduleKey = String(department.name).trim().toLowerCase();

    return {
      title: String(department.name).toUpperCase(),
      subtitle: `${department.name} Reports`,
      route: `../reports-section/${moduleKey}`,
      permission: PERMISSIONS.REPORTS_FINANCE.value,
    };
  });

  const allModules = [...departmentCards, ...staticReportModules];

  const visibleReportModules = allModules.filter(
    (module) => !module.permission || permissions.includes(module.permission),
  );

  return (
    <div className="bg-[#f5f5f5] p-4 min-h-full">
      <div className="py-4 border-b-default border-borderGray mb-8">
        <h1 className="text-title text-primary font-pmedium">Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleReportModules.map((module) => (
          <button
            key={`${module.title}-${module.route}`}
            onClick={() => navigate(module.route)}
            className="text-left p-4 rounded-md shadow-md border border-gray-200 bg-white transition hover:bg-gray-50"
          >
            <p className="text-subtitle font-pmedium">{module.title}</p>
            <p className="text-content mt-3">{module.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportsSection;
