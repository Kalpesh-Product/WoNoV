import React from "react";
import { useNavigate } from "react-router-dom";
import { PERMISSIONS } from "../../constants/permissions";
import useUserPermissions from "../../hooks/useUserPermissions";

const reportModules = [
  {
    title: "FINANCE",
    subtitle: "Finance Reports",
    route: "../finance-reports",
    permission: PERMISSIONS.REPORTS_FINANCE.value,
  },
  {
    title: "TICKETS",
    subtitle: "Ticket Reports",
    route: "../ticket-reports",
    permission: PERMISSIONS.REPORTS_TICKETS.value,
  },
  {
    title: "MEETINGS",
    subtitle: "Meeting Reports",
    route: "../meeting-reports",
    permission: PERMISSIONS.REPORTS_MEETINGS.value,
  },
  {
    title: "VISITORS",
    subtitle: "Visitor Reports",
    route: "../visitor-reports",
    permission: PERMISSIONS.REPORTS_VISITORS.value,
  },
];

const ReportsSection = () => {
  const navigate = useNavigate();
  const { permissions } = useUserPermissions();

  const visibleReportModules = reportModules.filter((module) =>
    permissions.includes(module.permission),
  );

  return (
    <div className="bg-[#f5f5f5] p-4 min-h-full">
      <div className="py-4 border-b-default border-borderGray mb-8">
        <h1 className="text-title text-primary font-pmedium">Reports</h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {visibleReportModules.map((module) => (
          <button
            key={module.title}
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