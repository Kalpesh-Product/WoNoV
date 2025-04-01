import { Avatar, Chip } from "@mui/material";
import { useState } from "react";
import { useLocation } from "react-router-dom";
import WidgetSection from "../../components/WidgetSection";
import PrimaryButton from "../../components/PrimaryButton";
import AccessGrantTable from "../../components/Tables/AccessGrantTable";

const AccessProfile = () => {
  const location = useLocation();
  const { user } = location.state || {}; // Retrieve the user object from state
  const [selectedCard, setSelectedCard] = useState(null);

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

  const [selectAll, setSelectAll] = useState(false);
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

  if (!user) {
    return <div>No user data available</div>;
  }

  return (
    <div className="bg-white p-4">
      <div className="flex items-center gap-8 w-full border-2 border-gray-200 p-4 rounded-md">
        <div className="flex gap-6 items-center">
          <div className="w-40 h-40">
            <Avatar
              style={{
                backgroundColor: user.avatarColor,
                width: "100%",
                height: "100%",
                fontSize: "5rem",
              }}
            >
              {user.name.charAt(0)}
            </Avatar>
          </div>
          <div className="flex flex-col gap-6">
            <span className="text-title flex items-center gap-3">
              {user.name}{" "}
              <Chip
                label={user.status}
                sx={{
                  backgroundColor: user.status === "Active" ? "green" : "grey",
                  color: "white",
                }}
              />
            </span>
            <span className="text-subtitle">
              {user.role} - {user.department}
            </span>
          </div>
        </div>
        <div className="flex flex-col gap-4 flex-1">
          <div className="flex justify-between ">
            <div className="flex flex-col gap-4 justify-start flex-1 text-gray-600">
              <span className=" capitalize">User Name</span>
              <span className=" capitalize">Email</span>
              <span className=" capitalize">Role</span>
              <span className=" capitalize">User Since</span>
              <span className=" capitalize">Status</span>
            </div>
            <div className="flex flex-col gap-4 justify-start flex-1 text-gray-500">
              <span>{user.name}</span>
              <span>{user.email}</span>
              <span>{user.role}</span>
              <span>{user.userSince}</span>
              <span>{user.status}</span>
            </div>
          </div>
        </div>
      </div>

      <div>
        <WidgetSection layout={navigationCards.length}>
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
            <div className="flex items-center justify-between ">
              <span className="text-subtitle font-pregular ">
                Role Permissions
              </span>
              <PrimaryButton title={"Edit"} />
            </div>
            <WidgetSection layout={depModules.length}>
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

export default AccessProfile;
