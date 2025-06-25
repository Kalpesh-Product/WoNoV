import React from "react";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";

const AttendanceRequests = () => {
  const axios = useAxiosPrivate();
  const columns = [
    { field: "srNo", headerName: "SrNo", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "date", headerName: "Date" },
    { field: "startTime", headerName: "Start Time" },
    { field: "endTime", headerName: "End Time" },
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

export default AttendanceRequests;
