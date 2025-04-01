import { Avatar } from "@mui/material";
import React from "react";
import { Tree, TreeNode } from "react-organizational-chart";
import { useSidebar } from "../context/SideBarContext";
import { useLocation, useNavigate } from "react-router-dom";

// Users array with the specified roles and reporting structure
const users = [
  {
    id: 1,
    name: "Abrar Shaikh",
    role: "Master Admin",
    reports: null,
    avatarColor: "#f44336",
    email: "abrar.shaikh@example.com",
    userSince: "2020-01-01",
    status: "Active",
    department: "Management",
  },
  {
    id: 2,
    name: "Kashif Shaikh",
    role: "Super Admin",
    reports: 1,
    avatarColor: "#2196f3",
    email: "kashif.shaikh@example.com",
    userSince: "2020-03-15",
    status: "Active",
    department: "Operations",
  },
  {
    id: 3,
    name: "Farzeen Qudri",
    role: "Super Admin",
    reports: 1,
    avatarColor: "#2196f3",
    email: "farzeen.qudri@example.com",
    userSince: "2020-05-20",
    status: "Active",
    department: "Operations",
  },
  {
    id: 4,
    name: "Kalpesh Naik",
    role: "Admin",
    reports: 2,
    avatarColor: "#4caf50",
    email: "kalpesh.naik@example.com",
    userSince: "2021-02-10",
    status: "Active",
    department: "Administration",
  },
  {
    id: 5,
    name: "Aiwinraj",
    role: "Employee",
    reports: 4,
    avatarColor: "#4caf50",
    email: "aiwinraj@example.com",
    userSince: "2022-07-18",
    status: "Active",
    department: "Development",
  },
  {
    id: 6,
    name: "Sankalp",
    role: "Employee",
    reports: 4,
    avatarColor: "#4caf50",
    email: "sankalp@example.com",
    userSince: "2022-09-05",
    status: "Active",
    department: "Development",
  },
  {
    id: 7,
    name: "Allan",
    role: "Employee",
    reports: 4,
    avatarColor: "#4caf50",
    email: "allan@example.com",
    userSince: "2022-10-01",
    status: "Active",
    department: "Development",
  },
  {
    id: 8,
    name: "Emily Davis",
    role: "Employee",
    reports: 3,
    avatarColor: "#ff9800",
    email: "emily.davis@example.com",
    userSince: "2023-01-15",
    status: "Active",
    department: "Design",
  },
  {
    id: 9,
    name: "Chris Johnson",
    role: "Employee",
    reports: 3,
    avatarColor: "#9c27b0",
    email: "chris.johnson@example.com",
    userSince: "2023-03-20",
    status: "Active",
    department: "Support",
  },
  {
    id: 10,
    name: "Chris ",
    role: "Employee",
    reports: 3,
    avatarColor: "#9c27b0",
    email: "chris@example.com",
    userSince: "2023-04-12",
    status: "Active",
    department: "Support",
  },
  {
    id: 11,
    name: "Chris Johnson",
    role: "Employee",
    reports: 3,
    avatarColor: "#9c27b0",
    email: "chris.johnson2@example.com",
    userSince: "2023-06-25",
    status: "Active",
    department: "Support",
  },
];

const StyledNode = ({ children }) => {
  return (
    <div className="p-2 px-4 rounded-md bg-white inline-block border-2 border-gray-300 text-start w-[250px]">
      {children}
    </div>
  );
};

const renderTreeNodes = (users, parentId, navigate) => {
  return users
    .filter((user) => user.reports === parentId)
    .map((user) => (
      <TreeNode
        key={user.id}
        label={
          <StyledNode>
            <div className="flex gap-4 items-center">
              <div className="w-10 h-10 rounded-full">
                <Avatar style={{ backgroundColor: user.avatarColor }}>
                  {user.name.charAt(0)}
                </Avatar>
              </div>
              <div
                className="flex flex-col cursor-pointer"
                onClick={() => navigate(`/user/${user.id}`)} // Example navigation
              >
                <span className="text-subtitle font-pmedium">{user.name}</span>
                <span className="text-content text-gray-400">
                  ({user.role})
                </span>
              </div>
            </div>
          </StyledNode>
        }
      >
        {renderTreeNodes(users, user.id, navigate)}
      </TreeNode>
    ));
};

const HierarchyTree = ({height}) => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const navigate = useNavigate(); // Initialize useNavigate once

  return (
    <div className="w-full p-4">
      <div
        className={`${
          isSidebarOpen ? "w-[78vw]" : "w-[85vw]"
        }  overflow-y-auto overflow-x-auto `}

        style={{height:height ? height : '90vh'}}
      >
        <Tree
          lineWidth={"2px"}
          lineColor={"black"}
          lineBorderRadius={"0"}
          label={
            <StyledNode>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full">
                  <Avatar style={{ backgroundColor: users[0].avatarColor }}>
                    {users[0].name.charAt(0)}
                  </Avatar>
                </div>
                <div
                  className="flex flex-col cursor-pointer"
                  onClick={() =>
                    navigate("/app/access/permissions", {
                      state: { user: users[0] },
                    })
                  }
                >
                  <span className="text-subtitle font-pmedium">
                    {users[0].name}
                  </span>
                  <span className="text-content text-gray-400">
                    ({users[0].role})
                  </span>
                </div>
              </div>
            </StyledNode>
          }
        >
          {renderTreeNodes(users, users[0].id, navigate)} {/* Pass navigate */}
        </Tree>
      </div>
    </div>
  );
};

export default HierarchyTree;
