import React from "react";
import { useNavigate } from "react-router-dom";

const reportModules = [
  { title: "FINANCE", subtitle: "Finance Reports", route: "finance-reports" },
  { title: "TICKETS", subtitle: "Ticket Reports", route: "ticket-reports" },
  { title: "MEETINGS", subtitle: "Meeting Reports", route: "meeting-reports" },
  { title: "VISITORS", subtitle: "Visitor Reports", route: "visitor-reports" },
];

const ReportsDashboard = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white p-4 min-h-full">
      <div className="py-4 border-b-default border-borderGray mb-8">
        <h1 className="text-title text-primary font-pmedium">Reports</h1>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {reportModules.map((module) => (
          <button
            key={module.title}
            onClick={() => navigate(module.route)}
            className="text-left p-4 rounded-md shadow-md border border-gray-200 hover:bg-gray-50 transition"
          >
            <p className="text-subtitle font-pmedium">{module.title}</p>
            <p className="text-content mt-3">{module.subtitle}</p>
          </button>
        ))}
      </div>
    </div>
  );
};

export default ReportsDashboard;
