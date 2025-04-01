import React from 'react'
import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import useAxiosPrivate from '../../../../hooks/useAxiosPrivate';
import { useQuery } from '@tanstack/react-query';


const HrSOP = () => {

  const axios = useAxiosPrivate()

  const { data: sops = [] } = useQuery({
    queryKey: ["sops"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/get-company-documents/sop");
        return response.data.sop
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const departmentsColumn = [
          { field:"id" , headerName:"SR NO"},
          { field: "sopname", headerName: "SOP NAME",
            cellRenderer:(params)=>{
              return(
                <div>
                  <span className="text-primary cursor-pointer hover:underline">
                    {params.value}
                  </span>
                </div>
              )
            },flex:1},
          {
            field: "status",
            headerName: "Status",
            cellRenderer: (params) => {
              const status = params.value ? "Active" : "Inactive";
              const statusColorMap = {
                Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
                Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
              };
      
              const { backgroundColor, color } = statusColorMap[status] || {
                backgroundColor: "gray",
                color: "white",
              };
              return (
                <>
                  <Chip
                    label={status}
                    style={{
                      backgroundColor,
                      color,
                    }}
                  />
                </>
              );
            },flex:1
          },
          {
            field: "actions",
            headerName: "Actions",
            cellRenderer: (params) => (
              <>
                <div className="p-2 mb-2 flex gap-2">
                 <span className="text-content text-primary hover:underline cursor-pointer">
                  Make Inactive
                 </span>
                </div>
              </>
            ),
          },
        ];
  
    const rows = [
      {
        srno:"1",
        id: 1,
        policyname: "Biz Nest Leave SOP",
        status: "Active",
      },
      {
        srno:"2",
        id: 2,
        policyname: "Biz Nest Leave SOP",
        status: "Active",
      },
      {
        srno:"3",
        id: 3,
        policyname: "Biz Nest Leave SOP",
        status: "Inactive",
      },
      {
        srno:"4",
        id: 4,
        policyname: "Biz Nest Leave SOP",
        status: "Active",
      },
      
    ];
  return (
    <div>
        <AgTable
         key={sops.length}
          search={true}
          searchColumn={"SOPs"}
          tableTitle={"SOP List"}
          buttonTitle={"Add SOP"}
          data={[...sops.map((sop, index)=>({
            id : index + 1,
            sopname: sop.name,  
            status: sop.isActive 
          }))]}
          columns={departmentsColumn}
        />
      </div>
  )
}

export default HrSOP
