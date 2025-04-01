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
              key={index}
              onClick={() => {
                navigate(route.route);
              }}
              className="grid grid-cols-4 shadow-md p-4 rounded-md cursor-pointer">
              <span className="text-primary text-subtitle col-span-2 hover:underline">
                {route.title}
              </span>
              {/* <span className="col-span-2 place-items-center place-content-center  text-center"><FaExternalLinkAlt/></span> */}
            </div>
          );
        })}
      </WidgetSection>
    </div>
  );
};

export default SalesMixBag;
