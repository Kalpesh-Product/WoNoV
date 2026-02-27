import { useState } from "react";
import WidgetSection from "../../../components/WidgetSection";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TextField } from "@mui/material";
import Card from "../../../components/Card";
import { PERMISSIONS } from "../../../constants/permissions";

const AdminMixBag = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const routes = [
    {
      title: "Team Members Schedule",
      route: "/app/dashboard/admin-dashboard/mix-bag/team-members-schedule",
      permission: PERMISSIONS.ADMIN_TEAM_MEMBERS_SCHEDULE_MIX_BAG.value,
    },
    {
      title: "Housekeeping Members",
      route: "/app/dashboard/admin-dashboard/mix-bag/housekeeping-members",
      permission: PERMISSIONS.ADMIN_HOUSEKEEPING_MEMBERS_MIX_BAG.value,
    },
    {
      title: "Holidays & Events",
      route: "/app/dashboard/admin-dashboard/mix-bag/holidays-events",
      permission: PERMISSIONS.ADMIN_HOLIDAYS_EVENTS_MIX_BAG.value,
    },
    {
      title: "Client Members",
      route: "/app/dashboard/admin-dashboard/mix-bag/client-members",
      permission: PERMISSIONS.ADMIN_CLIENT_MEMBERS_MIX_BAG.value,
    },
  ];

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const filteredRoutes = routes.filter((route) =>
    route.title.toLowerCase().includes(search.toLowerCase())
  );

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
            return (
              <Card
                fullHeight
                key={index}
                title={route.title}
                route={route.route}
              />
            );
          })}
        </WidgetSection>
      </div>
    </div>
  );
};

export default AdminMixBag;
