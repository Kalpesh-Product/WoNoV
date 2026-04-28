import { useState } from "react";
import WidgetSection from "../../../../components/WidgetSection";
import { useNavigate } from "react-router-dom";
import { IoIosSearch } from "react-icons/io";
import { TextField } from "@mui/material";
import Card from "../../../../components/Card";
import { PERMISSIONS } from "../../../../constants/permissions";
import useAuth from "../../../../hooks/useAuth";  
const MixBag = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const { auth } = useAuth();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const routes = [
      {
      title: "Manage Meetings",
      route: "/app/dashboard/finance-dashboard/mix-bag/manage-meetings",
      permission: PERMISSIONS.FINANCE_MANAGE_MEETINGS_MIX_BAG.value,
    },
     {
      title: "Department Wise Budget",
      route: "/app/dashboard/finance-dashboard/mix-bag/department-wise-budget",
      permission:
        PERMISSIONS.FINANCE_DEPARTMENT_WISE_BUDGET_MIX_BAG.value,
    },
    {
      title: "Collection & Payments",
      route: "/app/dashboard/finance-dashboard/mix-bag/collection-payments",
      permission: PERMISSIONS.FINANCE_COLLECTION_PAYMENTS_MIX_BAG.value,
    },
    {
      title: "Directors & Company KYC",
      route: "/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC",
      permission: PERMISSIONS.FINANCE_DIRECTORS_COMPANY_KYC_MIX_BAG.value,
    },
    {
      title: "Compliance Documents",
      route: "/app/dashboard/finance-dashboard/mix-bag/compliance-documents",
      permission: PERMISSIONS.FINANCE_COMPLIANCE_DOCUMENTS_MIX_BAG.value,
    },
    {
      title: "Landlord Agreements",
      route: "/app/dashboard/finance-dashboard/mix-bag/landlord-agreements",
      permission: PERMISSIONS.FINANCE_LANDLORD_AGREEMENTS_MIX_BAG.value,
    },
    {
      title: "Client Agreements",
      route: "/app/dashboard/finance-dashboard/mix-bag/client-agreements",
      permission: PERMISSIONS.FINANCE_CLIENT_AGREEMENTS_MIX_BAG.value,
    },
  ];

  const handleSearch = (event) => {
    setSearch(event.target.value);
  };

  // const filteredRoutes = routes.filter((route) =>
    const allowedRoutes = routes.filter(
    (route) => !route.permission || userPermissions.includes(route.permission)
  );

  const filteredRoutes = allowedRoutes.filter((route) =>
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
      {/* <div className="h-[50vh] uppercase">
        <WidgetSection key={filteredRoutes.length} layout={2} padding> */}
        <div className="min-h-[50vh] uppercase pt-2">
        <WidgetSection layout={2} padding>
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

export default MixBag;
