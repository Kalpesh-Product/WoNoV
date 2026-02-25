import { useState } from "react";
import WidgetSection from "../../../components/WidgetSection";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TextField } from "@mui/material";
import Card from "../../../components/Card";
import { PERMISSIONS } from "../../../constants/permissions";

const SalesMixBag = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const routes = [
    {
      title: "Inventory",
      route:
        "/app/dashboard/sales-dashboard/mix-bag/inventory",
      permission: PERMISSIONS.SALES_INVENTORY_MIX_BAG.value,
    },
    {
      title: "Revenue",
      route: "/app/dashboard/sales-dashboard/mix-bag/revenue",
      permission: PERMISSIONS.SALES_REVENUE_MIX_BAG.value,
    },
    {
      title: "Clients",
      route: "/app/dashboard/sales-dashboard/mix-bag/clients",
      permission: PERMISSIONS.SALES_CLIENTS_MIX_BAG.value,
    },
    {
      title: "Desks",
      route: "/app/dashboard/sales-dashboard/mix-bag/inventory",
      permission: PERMISSIONS.SALES_DESKS_MIX_BAG.value,
    },
    {
      title: "Manage Units",
      route: "/app/dashboard/sales-dashboard/mix-bag/manage-units",
      permission: PERMISSIONS.SALES_MANAGE_UNITS_MIX_BAG.value,
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

export default SalesMixBag;
