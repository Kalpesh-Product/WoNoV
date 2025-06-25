import React from "react";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";

const AttendanceCompleted = () => {
  const axios = useAxiosPrivate();
  const { data, isLoading } = useQuery({
    queryKey: ["attendance-requests"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/attendance/get-attendance-requests"
        );
        return response.data;
      } catch (error) {
        console.warn(error.mesage);
      }
    },
  });
  const columns = [
    { field: "srNo", headerName: "SrNo", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "date", headerName: "Date" },
    { field: "startTime", headerName: "Start Time" },
    { field: "endTime", headerName: "End Time" },
    { field: "actions", headerName: "End Time" },
  ];
  return (
    <div className="flex flex-col">
      <PageFrame>
        <YearWiseTable
          columns={columns}
          data={[]}
          tableTitle={"ATTENDANCE REQUESTS"}
        />
      </PageFrame>
    </div>
  );
};

export default AttendanceCompleted;
