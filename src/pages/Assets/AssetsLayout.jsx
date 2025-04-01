import React from "react";
import { Outlet } from "react-router-dom";

const AssetsLayout = () => {
  return (
    <div>
      <Outlet />
    </div>
  );
};

export default AssetsLayout;
