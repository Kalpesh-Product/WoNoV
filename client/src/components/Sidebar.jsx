import React, { useState } from "react";
import {
  FaAngleDown,
  FaChevronUp,
  FaLaptopMedical,
  FaBoxesStacked,
} from "react-icons/fa6";
import {
  FaRegCalendarAlt,
  FaTasks,
  FaChartLine,
  FaUserShield,
  FaLaptopCode,
} from "react-icons/fa";
import { TbReportSearch } from "react-icons/tb";
import { IoMdNotifications } from "react-icons/io";
import { SiAuthelia } from "react-icons/si";
import { HiOutlineChatAlt2 } from "react-icons/hi";
import { useNavigate, useLocation } from "react-router-dom";
import { useSidebar } from "../context/SideBarContext";
import { MdHome } from "react-icons/md";
import { RiAdminFill} from "react-icons/ri";
import { TbCashRegister } from "react-icons/tb";
import { FaUserTie } from "react-icons/fa6";
import { MdMeetingRoom } from "react-icons/md";
import { GiAutoRepair } from "react-icons/gi";
import { GrCafeteria } from "react-icons/gr";
import { TiTicket } from "react-icons/ti";
import SeperatorUnderline from "./SeperatorUnderline";
import { VscPersonAdd } from "react-icons/vsc";

const Sidebar = () => {
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const [expandedModule, setExpandedModule] = useState(0);

  // Menu items array (without DASHBOARD)
  const menuItems = [
    {
      name: "Tickets",
      icon: <TiTicket />,
      route: "tickets",
    },
    {
      name: "Meetings",
      icon: <MdMeetingRoom />,
      route: "meetings",
    },
    {
      name: "Assets",
      icon: <FaBoxesStacked />,
      route: "assets",
    },
    {
      name: "Tasks",
      icon: <FaTasks />,
      route: "tasks",
    },
    {
      name: "Visitors",
      icon: <VscPersonAdd />,
      route: "visitors",
    },
  ];
  const generalItems = [
    {
      name: "Reports",
      icon: <TbReportSearch />,
      route: "#",
    },

    { name: "Calendar", icon: <FaRegCalendarAlt />, route: "calendar" },
    { name: "Chat", icon: <HiOutlineChatAlt2 />, route: "chat" },
    { name: "Access", icon: <SiAuthelia />, route: "access" },

    {
      name: "Notifications",
      icon: <IoMdNotifications />,
      route: "notifications",
    },
    {
      name: "Profile",
      icon: <FaUserTie />,
      route: "profile",
    },
  ];

  const defaultModules = [
    {
      id: 1,
      icon: <MdHome />,
      title: "Dashboard",
      submenus: [
        {
          id: 2,
          title: "Frontend Dashboard",
          icon: <FaLaptopCode />,
          route: "/app/dashboard/frontend-dashboard",
        },
        {
          id: 3,
          title: "HR Dashboard",
          icon: <RiAdminFill />,
          route: "/app/dashboard/HR-dashboard",
        },
        {
          id: 4,
          title: "Finance Dashboard",
          route: "/app/dashboard/finance-dashboard",
          icon: <TbCashRegister />,
        },
        {
          id: 5,
          title: "Sales Dashboard",
          icon: <FaChartLine />,
          route: "/app/dashboard/sales-dashboard",
        },
        {
          id: 6,
          title: "Admin Dashboard",
          route: "/app/dashboard/admin-dashboard",
          icon: <FaUserShield />,
        },
        {
          id: 7,
          title: "Maintenance Dashboard",
          route: "/app/dashboard/maintenance-dashboard",
          icon: <GiAutoRepair />,
        },
        {
          id: 8,
          title: "Cafe Dashboard",
          icon: <GrCafeteria />,
        },
        {
          id: 9,
          title: "IT Dashboard",
          route: "/app/dashboard/IT-dashboard",
          icon: <FaLaptopMedical />,
        },
      ],
    },
  ];

  const handleMenuOpen = (item) => {
    navigate(item.route);
  };

  const toggleModule = (index) => {
    setExpandedModule((prev) => (prev === index ? null : index));
  };

  const isActive = (path) => location.pathname.startsWith(`${path}`);
  const isAppsActive = (path) => location.pathname.startsWith(`/app/${path}`);

  return (
    <div className={`flex flex-col px-2  bg-gray`}>
      <div
        className={`${
          isSidebarOpen ? "w-60" : "w-16"
        } bg-white  text-black flex flex-shrink-0 h-[90vh] hideScrollBar overflow-y-auto transition-all duration-100 z-[1]`}
      >
        <div className="flex relative w-full">
          <div className="p-0 flex flex-col gap-2 w-full">
            <div
              className={`rounded-md  ${
                expandedModule === 0 ? "bg-gray-200" : "bg-white"
              }`}
            >
              {defaultModules.map((module, index) => (
                <div key={index} className="">
                  <div
                    className={`cursor-pointer text-gray-500  flex ${
                      expandedModule === null && isSidebarOpen
                        ? "justify-between pr-2"
                        : expandedModule === 0 && isSidebarOpen
                        ? "justify-between text-[#1E3D73] pr-2"
                        : "justify-center pr-0"
                    } items-center   ${
                      expandedModule === 0 &&
                      "bg-gray-200 rounded-t-md text-black"
                    }  ${
                      isActive(module.route)
                        ? "text-primary border-r-4 transition-all duration-100 rounded-tl-md rounded-bl-md "
                        : ""
                    }`}
                    onClick={() => {
                      module.submenus && toggleModule(index);
                    }}
                  >
                    <div className="flex justify-start items-center">
                      <div
                        className={`flex items-center justify-center text-sm h-9 w-9 ${
                          expandedModule === 0
                            ? "bg-primary text-white rounded-md"
                            : ""
                        }`}
                      >
                        {module.icon}
                      </div>
                      {isSidebarOpen && (
                        <span className="pl-5 text-sm ">{module.title}</span>
                      )}
                    </div>
                    {isSidebarOpen && module.submenus && (
                      <span
                        className={`transition-transform duration-300 ease-in-out ${
                          expandedModule === index ? "rotate-180" : "rotate-0"
                        }`}
                      >
                        {expandedModule === index ? (
                          <FaChevronUp />
                        ) : (
                          <FaAngleDown />
                        )}
                      </span>
                    )}
                  </div>
                  <div
                    className={`overflow-hidden transition-[max-height] duration-300 ease-in-out ${
                      expandedModule === index ? "max-h-[500px]" : "max-h-0"
                    }`}
                  >
                    {module.submenus && (
                      <div>
                        {module.submenus.map((submenu, idx) => (
                          <div
                            key={idx}
                            className={`cursor-pointer  hover:text-[#1E3D73] transition-all duration-100 ${
                              isActive(submenu.route)
                                ? "text-[#1E3D73]"
                                : "text-gray-500"
                            }  py-3`}
                            onClick={() => navigate(submenu.route)}
                          >
                            <div
                              className={`flex items-center ${
                                isSidebarOpen
                                  ? "justify-start"
                                  : "justify-center"
                              }`}
                            >
                              <div
                                className={`flex justify-center  items-center w-8 ${
                                  isSidebarOpen ? "text-sm" : "text-sm"
                                }`}
                              >
                                {submenu.icon}
                              </div>
                              {isSidebarOpen && (
                                <span className="pl-4 text-sm">
                                  {submenu.title}
                                </span>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
            {/* menuitems */}
            <div className="pt-2  flex flex-col gap-2 w-full">
              <SeperatorUnderline title={"Apps"} />
              {menuItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleMenuOpen(item)}
                  className={`cursor-pointer hover:text-primary transition-all duration-100 ${
                    isAppsActive(item.route)
                      ? "text-primary bg-gray-200 rounded-md"
                      : "text-gray-500"
                  } flex ${
                    isSidebarOpen ? "" : "justify-center"
                  } items-center py-0 `}
                >
                  <div
                    className={`flex justify-center items-center w-9 h-9 ${
                      isAppsActive(item.route)
                        ? "bg-primary text-white rounded-md"
                        : ""
                    } text-sm`}
                  >
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <span className="pl-5 text-sm">{item.name}</span>
                  )}
                </div>
              ))}
            </div>
            {/* general */}
            <div className="pt-2  flex flex-col gap-2 w-full">
              <SeperatorUnderline title={"General"} />
              {generalItems.map((item, index) => (
                <div
                  key={index}
                  onClick={() => handleMenuOpen(item)}
                  className={`cursor-pointer hover:text-primary transition-all duration-100 ${
                    isAppsActive(item.route)
                      ? "text-primary bg-gray-200 rounded-md"
                      : "text-gray-500"
                  } flex ${
                    isSidebarOpen ? "" : "justify-center"
                  } items-center py-0 `}
                >
                  <div
                    className={`flex justify-center items-center w-9 h-9 ${
                      isAppsActive(item.route)
                        ? "bg-primary text-white rounded-md"
                        : ""
                    } text-sm`}
                  >
                    {item.icon}
                  </div>
                  {isSidebarOpen && (
                    <span className="pl-5 text-sm">{item.name}</span>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Sidebar;
