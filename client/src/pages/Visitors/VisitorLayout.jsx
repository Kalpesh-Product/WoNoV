import React from "react";
import { Outlet } from "react-router-dom";

const VisitorLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default VisitorLayout;
