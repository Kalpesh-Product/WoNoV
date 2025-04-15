import React, { useEffect } from "react";
import cafeImage from "../../../assets/cafe-dashboard-2.png"; // Import your image file
import { useSidebar } from "../../../context/SideBarContext";

const CafeDashboard = () => {
  const { setIsSidebarOpen } = useSidebar();

  useEffect(() => {
    setIsSidebarOpen(true);
  }, []); // Empty dependency array ensures this runs once on mount

  return (
    // <div className="fixed inset-0 -z-10 overflow-hidden">
    <div className="h-[90vh] p-4 overflow-hidden w-full  rounded-lg">
      <img
        src={cafeImage}
        alt="Cafe Background"
        className="w-full h-full object-cover overflow-hidden rounded-lg"
      />
    </div>
  );
};

export default CafeDashboard;
