import React from "react";
import AgTable from "../../../../components/AgTable";
import { Chip, Skeleton } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import PageFrame from "../../../../components/Pages/PageFrame";

const HrSettingsDepartments = () => {
  const axios = useAxiosPrivate();

  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments"
      );
      return response.data?.selectedDepartments;
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const { data: fetchedDepartments = [], isPending: departmentLoading } =
    useQuery({
      queryKey: ["fetchedDepartments"],
      queryFn: fetchDepartments,
    });

  const departmentsColumn = [
    { field: "id", headerName: "Sr No" },
    {
      field: "departmentName",
      headerName: "Department Name",
      cellRenderer: (params) => {
        return (
          <div>
            {/* <span className="text-primary cursor-pointer hover:underline"> */}
            <span className="">{params.value}</span>
          </div>
        );
      },
      flex: 1,
    },
    { field: "manager", headerName: "Manager" },
    {
      field: "status",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap["Active"] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={"Active"}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    // {
    //   field: "actions",
    //   headerName: "Actions",
    //   cellRenderer: (params) => (
    //     <>
    //       <div className="p-2 mb-2 flex gap-2">
    //         <span className="text-content text-primary hover:underline cursor-pointer">
    //           Make Inactive
    //         </span>
    //       </div>
    //     </>
    //   ),
    // },
  ];

  return (
    <div className="flex flex-col gap-8">
      <PageFrame>
        <div>
          {!departmentLoading ? (
            <AgTable
              search={true}
              searchColumn={"Department Name"}
              tableTitle={"Department List"}
              data={[
                ...fetchedDepartments.map((item, index) => ({
                  id: index + 1,
                  departmentName: item.department?.name,
                  manager: item?.admin,
                })),
              ]}
              columns={departmentsColumn}
            />
          ) : (
            <div className="flex flex-col gap-2">
              {/* Simulating chart skeleton */}
              <Skeleton variant="text" width={200} height={30} />
              <Skeleton variant="rectangular" width="100%" height={300} />
            </div>
          )}
        </div>
      </PageFrame>
    </div>
  );
};

export default HrSettingsDepartments;
