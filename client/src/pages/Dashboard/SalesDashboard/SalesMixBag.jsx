import { useState } from "react";
import WidgetSection from "../../../components/WidgetSection";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TextField } from "@mui/material";
import Card from "../../../components/Card";

const SalesMixBag = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const routes = [
    {
      title: "Inventory",
      route:
        "/app/dashboard/sales-dashboard/mix-bag/inventory",
    },
    {
      title: "Revenue",
      route: "/app/dashboard/sales-dashboard/mix-bag/revenue",
    },
    {
      title: "Clients",
      route: "/app/dashboard/sales-dashboard/mix-bag/clients",
    },
    {
      title: "Desks",
      route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
    },
    {
      title:"Manage Units",
      route:"/app/dashboard/sales-dashboard/mix-bag/manage-units"
    }
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

export default SalesMixBag;
