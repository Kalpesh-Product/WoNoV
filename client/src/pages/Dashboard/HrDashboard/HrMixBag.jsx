import { useState } from "react";
import WidgetSection from "../../../components/WidgetSection";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TextField } from "@mui/material";
import Card from "../../../components/Card";
import { PERMISSIONS } from "../../../constants/permissions";
import useAuth from "../../../hooks/useAuth";

const HrMixBag = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const routes = [
    {
      title: "Attendance Requests",
      route:
        "/app/dashboard/HR-dashboard/mix-bag/attendance",
      permission: PERMISSIONS.HR_ATTENDANCE_REQUESTS_MIX_BAG.value,
    },
    {
      title: "Leave Requests",
      route: "/app/dashboard/HR-dashboard/mix-bag/leaves/pending-approvals",
      permission: PERMISSIONS.HR_LEAVE_REQUESTS_MIX_BAG.value,
    },

      {
      title: "Department KPA",
      route: "/app/dashboard/HR-dashboard/mix-bag/overall-KPA/department-KPA",
      permission: PERMISSIONS.HR_DEPARTMENT_KPA_MIX_BAG.value,
    },
    {
      title: "Department Task",
      route:
        "/app/dashboard/HR-dashboard/mix-bag/overall-KPA/department-task",
      permission: PERMISSIONS.HR_DEPARTMENT_TASK_MIX_BAG.value,
    },

  ];

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  // const filteredRoutes = routes.filter((route) =>
  //   route.title.toLowerCase().includes(search.toLowerCase())
  // );

   const filteredRoutes = routes.filter((route) => {
    const hasPermission =
      !route.permission || userPermissions.includes(route.permission);
    const matchesSearch = route.title
      .toLowerCase()
      .includes(search.toLowerCase());
    return hasPermission && matchesSearch;
  });

  return (
    <div className="p-4 flex flex-col gap-4">
      {/* <div>
        <TextField
          label="Search"
          name="search"
          variant="outlined"
          size="small"
          value={search}
          onChange={handleSearch}
          placeholder="Search"
          InputProps={{
            startAdornment: (
              <IoIosSearch size={20} style={{ marginRight: 8 }} />
            ),
          }}
        />
      </div> */}
      <div className="h-[50vh] uppercase">
        <WidgetSection key={filteredRoutes.length} layout={2} padding>
          {filteredRoutes.map((route, index) => {
            return <Card fullHeight key={index} title={route.title} route={route.route} />;
          })}
        </WidgetSection>
      </div>
    </div>
  );
};

export default HrMixBag;
