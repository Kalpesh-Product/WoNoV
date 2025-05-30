import { useEffect, useState } from "react";
import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { Tabs } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const MyTaskListLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();


  return (
    <div className="p-4">

      <div className="py-4">
        <Outlet />
      </div>
    </div>
  );
};

export default MyTaskListLayout;
