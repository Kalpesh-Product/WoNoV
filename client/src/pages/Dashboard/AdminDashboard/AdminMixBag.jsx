import { useState } from "react";
import WidgetSection from "../../../components/WidgetSection";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TextField } from "@mui/material";

const AdminMixBag = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const routes = [
    {
      title: "Team Members Schedule",
      route: "/app/dashboard/admin-dashboard/team-members-schedule",
    },
    {
      title: "Housekeeping Members Schedule",
      route: "/app/dashboard/admin-dashboard/housekeeping-members-schedule",
    },
    {
      title: "Holidays & Events",
      route: "/app/dashboard/admin-dashboard/holidays-events",
    },
    {
      title: "Client Members",
      route: "/app/dashboard/admin-dashboard/admin-client-list",
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
      <div>
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
      </div>
      <WidgetSection key={filteredRoutes.length} layout={3} padding>
        {filteredRoutes.map((route, index) => {
          return (
            <div
              className=" shadow-md p-4 rounded-md cursor-pointer"
              key={index}
              onClick={() => {
                navigate(route.route);
              }}
            >
              <div>
                <span className="text-primary text-content hover:underline w-full">
                  {route.title}
                </span>
              </div>
            </div>
          );
        })}
      </WidgetSection>
    </div>
  );
};

export default AdminMixBag;
