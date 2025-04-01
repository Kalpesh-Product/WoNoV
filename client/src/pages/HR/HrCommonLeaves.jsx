import React from "react";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import humanDate from "../../utils/humanDateForamt";
import useAuth from "../../hooks/useAuth";
import { CircularProgress } from "@mui/material";

const HrCommonLeaves = () => {
  const { auth } = useAuth();
  console.log(auth.user._id);
  const axios = useAxiosPrivate();
  const leavesColumn = [
    { field: "fromDate", headerName: "From Date" },
    { field: "toDate", headerName: "To Date" },
    { field: "leaveType", headerName: "Leave Type" },
    { field: "leavePeriod", headerName: "Leave Period" },
    { field: "hours", headerName: "Hours" },
    { field: "description", headerName: "Description" },
    { field: "status", headerName: "Status" },
  ];

  const { data: leaves = [], isLoading } = useQuery({
    queryKey: ["leaves"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/leaves/view-leaves/${auth.user.empId}`
        );
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
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
              key={isLoading ? 1 : leaves.length}
              tableTitle={`Leaves Table`}
              paginationPageSize={20}
              buttonTitle={"Correction Request"}
              tableHeight={300}
              search={true}
              data={
                isLoading
                  ? [
                      {
                        id: "loading",
                        fromDate: "Loading...",
                        toDate: "-",
                        leaveType: "-",
                        leavePeriod: "-",
                        hours: "-",
                        description: "-",
                        status: "-",
                      },
                    ]
                  : leaves.map((leave, index) => ({
                      id: index + 1,
                      fromDate: humanDate(leave.fromDate),
                      toDate: humanDate(leave.toDate),
                      leaveType: leave.leaveType,
                      leavePeriod: leave.leavePeriod,
                      hours: leave.hours,
                      description: leave.description,
                      status: leave.status,
                    }))
              }
              columns={leavesColumn}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default HrCommonLeaves;
