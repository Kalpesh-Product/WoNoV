import { useState } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TextField } from "@mui/material";
import Card from "../../../../components/Card";

const MixBag = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const routes = [
    {
      title: "Directors & Company KYC",
      route: "/app/dashboard/finance-dashboard/directors-company-KYC",
    },
    {
      title: "Compliance Documents",
      route: "/app/dashboard/sales-dashboard/revenue",
    },
    {
      title: "Landlord Agreements",
      route: "/app/dashboard/sales-dashboard/clients",
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
          return <Card key={index} title={route.title} route={route.route} />;
        })}
      </WidgetSection>
    </div>
  );
};

export default MixBag;
