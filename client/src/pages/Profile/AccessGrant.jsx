import React, { useState } from "react";
import WidgetSection from "../../components/WidgetSection";

import PrimaryButton from "../../components/PrimaryButton";
import AccessGrantTable from "../../components/Tables/AccessGrantTable";

const AccessGrant = ({ pageTitle }) => {
  const [selectedCard, setSelectedCard] = useState(null);
  const [selectAll, setSelectAll] = useState(false);
  // Define the array of navigation card objects
  const navigationCards = [
    { name: "Frontend", icon: "📊" },
    { name: "HR", icon: "⚙️" },
    { name: "Finance", icon: "👤" },
  ];

  const HrModules = {
    attendance: [
      { name: "Clock In / Clock Out", read: false, write: false },
      { name: "My Timeclock", read: false, write: false },
      { name: "Correction Request", read: false, write: false },
      { name: "Approve Timeclock", read: false, write: false },
    ],
    payroll: [
      { name: "P1", read: false, write: false },
      { name: "P2", read: false, write: false },
    ],
  };

  const FinanceModules = {
    budgets: [
      { name: "Manage Budgets", read: false, write: false },
      { name: "View Expenses", read: false, write: false },
    ],
  };

  const FrontendModules = {
    ui: [
      { name: "UI Updates", read: false, write: false },
      { name: "Frontend Testing", read: false, write: false },
    ],
  };

  const moduleMapping = {
    HR: HrModules,
    Finance: FinanceModules,
    Frontend: FrontendModules,
  };

  const [depModules, setDepModules] = useState([]);

  const handleSelectedCard = (department) => {
    setSelectedCard(department);
    const modules = moduleMapping[department];
    const modulesArray = Object.values(modules);
    setDepModules(modulesArray);

    // Initialize selectAll state for each module array
    const initialSelectAllState = modulesArray.map(() => false);
    setSelectAll(initialSelectAllState);
  };

  const handleSelectAll = (checked, moduleIndex) => {
    setSelectAll((prev) =>
      prev.map((item, index) => (index === moduleIndex ? checked : item))
    );

    setDepModules((prev) =>
      prev.map((module, index) =>
        index === moduleIndex
          ? module.map((perm) => ({ ...perm, read: checked, write: checked }))
          : module
      )
    );
  };

  const handlePermissionChange = (moduleIndex, index, field, checked) => {
    setDepModules((prev) =>
      prev.map((module, modIdx) =>
        modIdx === moduleIndex
          ? module.map((perm, permIdx) =>
              permIdx === index ? { ...perm, [field]: checked } : perm
            )
          : module
      )
    );
  };

  return (
    <div>
      {/* Page Title */}
      <div className="flex items-center justify-between pb-4">
        <span className="text-title font-pmedium text-primary">Access Grant</span>
      </div>

      {/* Grid Layout for Navigation Cards */}
      <div>
        <WidgetSection layout={navigationCards.length} padding={"0rem 0 1rem 0"}>
          {navigationCards.map((card, index) => (
            <div
              key={index}
              className="border text-center rounded-lg p-4 shadow hover:shadow-md transition-shadow duration-200 cursor-pointer bg-white"
              onClick={() => handleSelectedCard(card.name)}
            >
              <div className="text-3xl mb-2">{card.icon}</div>
              <div className="text-lg font-medium">{card.name}</div>
            </div>
          ))}
        </WidgetSection>
      </div>

      <div>
        {selectedCard && (
          <>
            <div className="flex items-center justify-between py-4">
              <span className="text-subtitle font-pregular ">
                Role Permissions
              </span>
              <PrimaryButton title={"Edit"} />
            </div>
            <WidgetSection layout={depModules.length} padding>
              {depModules.map((module, index) => (
                <AccessGrantTable
                  key={index}
                  title={`Module ${index + 1}`}
                  permissions={module}
                  selectAll={selectAll[index]}
                  handleSelectAll={(checked) => handleSelectAll(checked, index)}
                  handlePermissionChange={(permIndex, field, checked) =>
                    handlePermissionChange(index, permIndex, field, checked)
                  }
                />
              ))}
            </WidgetSection>
          </>
        )}
      </div>
    </div>
  );
};

export default AccessGrant;
