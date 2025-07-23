import { useQuery } from "@tanstack/react-query";
import React from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import YearWiseTable from "../components/Tables/YearWiseTable";
import humanDate from "../utils/humanDateForamt";

const LogPage = () => {
  const axios = useAxiosPrivate();
  const { data, isLoading } = useQuery({
    queryKey: ["log"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/logs/get-logs");
        return response.data;
      } catch (error) {
        console.error(error.response.data.message);
      }
    },
  });
  const columns = [
    {
      headerName: "Sr No",
      field: "srNo",
      width: 80,
    },
    {
      headerName: "Action",
      field: "action",
      flex: 1,
    },
    {
      headerName: "User",
      field: "user",
      flex: 1,
    },
    {
      headerName: "Path",
      field: "path",
      flex: 1,
    },
    {
      headerName: "Date",
      field: "createdAt",
      flex: 1,
      cellRenderer : (params)=>(humanDate(params.value))
    },
  ];
  const tableData = isLoading ? [] : data.map((item)=>({
    ...item,
    user : `${item.performedBy?.firstName} ${item.performedBy?.lastName}`,
    createdAt : (item.createdAt),
  }))

  return (
<div className="p-4">
      <YearWiseTable
        data={tableData || []}
        columns={columns}
        dateColumn="createdAt"
  
        tableHeight={400}
        tableTitle="Logs Table"
        exportData={true}
        search={true}
      />
    </div>
  );
};

export default LogPage;
