import React from "react";

import { Outlet } from "react-router-dom";

const TicketLayout = () => {
  return (
    <div>

      {/* Render child routes */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

export default TicketLayout;
