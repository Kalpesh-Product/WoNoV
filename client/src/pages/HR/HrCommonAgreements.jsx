import React from "react";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { Chip } from "@mui/material";

const HrCommonAgreements = () => {
  const axios = useAxiosPrivate()
  const agreementColumn = [
    { field: "name", headerName: "Agreement Name", flex:1 },
    {
      field: "status",
      headerName: "Status",
      flex: 1,
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive"; // Map boolean to string status
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };
      
        const { backgroundColor, color } = statusColorMap[status] || {
          backgroundColor: "gray",
          color: "white",
        };
      
        return (
          <Chip
            label={status}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },  
    },
  ];


  const { data: agreements = [] } = useQuery({
    queryKey: ["agreements"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/get-company-documents/agreements");
        return response.data.agreements
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <AgTable
        key={agreements.length}
          search={true}
          tableTitle={"Agreement List"}
          tableHeight={300}
          buttonTitle={"Add Agreement"}
          data={[
            ...agreements.map((agreement, index) => ({
              id: index + 1,  
              name: agreement.name,  
              status: agreement.isActive 
            })),
          ]}
          columns={agreementColumn}
        />
      </div>
    </div>
  );
};

export default HrCommonAgreements;
