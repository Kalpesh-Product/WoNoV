import { useState } from "react";
import WidgetSection from "../../../components/WidgetSection";
import { FaExternalLinkAlt } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TextField } from "@mui/material";

const SalesMixBag = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const routes = [
    {
      title: "Actual Occupancy",
      route:
        "/app/dashboard/sales-dashboard/co-working-seats/check-availability",
    },
    {
      title: "Total revenue",
      route: "/app/dashboard/sales-dashboard/revenue",
    },
    {
      title: "Unique Clients",
      route: "/app/dashboard/sales-dashboard/clients",
    },
    {
      title: "Co-Working Seats",
      route: "/app/dashboard/sales-dashboard/co-working-seats",
    },
    {
      title: "Booked",
      route:
        "/app/dashboard/sales-dashboard/co-working-seats/check-availability",
    },
    {
      title: "Free",
      route:
        "/app/dashboard/sales-dashboard/co-working-seats/check-availability",
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

export default SalesMixBag;
