import { useState } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TextField } from "@mui/material";
import Card from "../../../../components/Card";
import useAuth from "../../../../hooks/useAuth";
import { PERMISSIONS } from "../../../../constants/permissions";

const ItMixBag = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const routes = [
    {
      title: "Team Members Schedule",
      route: "/app/dashboard/it-dashboard/mix-bag/team-members-schedule",
      permission: PERMISSIONS.IT_TEAM_MEMBERS_SCHEDULE_MIX_BAG.value,
    },
    {
      title: "Biometric Access",
      route: "/app/dashboard/IT-dashboard/mix-bag/biometric-access",
      permission: PERMISSIONS.IT_BIOMETRIC_ACCESS_MIX_BAG.value,
    },

  ];

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  const filteredRoutes = routes.filter((route) => {
    const hasPermission = !route.permission || userPermissions.includes(route.permission);
    const matchesSearch = route.title.toLowerCase().includes(search.toLowerCase());
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

export default ItMixBag;
