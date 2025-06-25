import React from "react";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";
import humanDate from "../../../../utils/humanDateForamt";

const AttendanceRequests = () => {
  const axios = useAxiosPrivate();
  const { data, isLoading } = useQuery({
    queryKey: ["attendance-requests"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/attendance/get-attendance-requests"
        );
        const filtered = response.data.filter(
          (item) => item.status !== "Approved"
        );
        return filtered;
      } catch (error) {
        console.warn(error.mesage);
      }
    },
  });
  const columns = [
    { field: "srNo", headerName: "SrNo", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "date", headerName: "Date" },
    { field: "inTime", headerName: "Start Time" },
    { field: "outTime", headerName: "End Time" },
    { field: "actions", headerName: "Actions" },
  ];

  const tableData = isLoading
    ? []
    : data.map((item) => ({
        ...item,
        empId: item.user?.empId,
        name: `${item.user?.firstName} ${item.user?.lastName}`,
        date : (item.inTime)
      }));
  return (
    <div className="flex flex-col">
      <PageFrame>
        <YearWiseTable
          dateColumn={"date"}
          columns={columns}
          data={tableData}
          tableTitle={"ATTENDANCE REQUESTS"}
        />
      </PageFrame>
    </div>
  );
};

export default AttendanceRequests;
