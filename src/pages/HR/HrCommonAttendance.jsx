import React from "react";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanDate from "../../utils/humanDateForamt";
import useAuth from "../../hooks/useAuth";
import { CircularProgress } from "@mui/material";

const HrCommonAttendance = () => {
  const { auth } = useAuth();
  console.log(auth.user._id);
  const axios = useAxiosPrivate();
  const attendanceColumns = [
    { field: "date", headerName: "Date", width: 200 },
    { field: "inTime", headerName: "In Time" },
    { field: "outTime", headerName: "Out Time" },
    { field: "workHours", headerName: "Work Hours" },
    { field: "breakHours", headerName: "Break Hours" },

    { field: "totalHours", headerName: "Total Hours" },
    { field: "entryType", headerName: "Entry Type" },
  ];

  const fetchAttendance = async () => {
    try {
      const response = await axios.get(
        `/api/attendance/get-attendance/${auth.user.empId}`
      );
      return response.data;
    } catch (error) {
      throw new Error(error.response.data.message);
    }
  };

  const { data: attendance, isLoading } = useQuery({
    queryKey: ["attendance"],
    queryFn: fetchAttendance,
  });

  return (
    <div className="flex flex-col gap-8">
      <div>
        <div>
          {isLoading ? (
            <div className="flex justify-center items-center">
              <CircularProgress color="#1E3D73" />
            </div>
          ) : (
            <AgTable
              key={isLoading ? 1 : attendance.length}
              tableTitle={`Attendance Table`}
              paginationPageSize={20}
              buttonTitle={"Correction Request"}
              tableHeight={300}
              search={true}
              searchColumn={"Date"}
              data={
                isLoading
                  ? [
                      {
                        id: "loading",
                        date: "Loading...",
                        inTime: "-",
                        outTime: "-",
                        workHours: "-",
                        breakHours: "-",
                        totalHours: "-",
                        entryType: "-",
                      },
                    ]
                  : attendance.map((record, index) => ({
                      id: index + 1,
                      date: humanDate(record.date),
                      inTime: record.inTime,
                      outTime: record.outTime,
                      workHours: record.workHours,
                      breakHours: record.breakHours,
                      totalHours: record.totalHours,
                      entryType: record.entryType,
                    }))
              }
              columns={attendanceColumns}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HrCommonAttendance;
