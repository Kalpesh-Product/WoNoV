import { useMutation, useQuery } from "@tanstack/react-query";
import React from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import StatusChip from "../../../../components/StatusChip";
import PageFrame from "../../../../components/Pages/PageFrame";
import { toast } from "sonner";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import { queryClient } from "../../../../main";
import { useNavigate } from "react-router-dom";

const InActiveWebsites = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate()
  const { data = [], isPending } = useQuery({
    queryKey: ["inactive-websites"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/editor/get-inactive-websites");
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
  const { mutate: markAsActive, isPending: isActivePending } = useMutation({
    mutationKey: ["activateWebsite"],
    mutationFn: async (data) => {
      console.log("data from label", data);
      const response = await axios.patch("/api/editor/activate-website", {
        searchKey: data,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "UPDATED STATUS");
      queryClient.invalidateQueries({ queryKey: ["inactive-websites"] });
    },
    onError: (error) => {
      console.error(error);
    },
  });
  const tableData = isPending
    ? []
    : data.map((item) => ({
        ...item,
      }));

  const tableColumns = [
    { headerName: "SrNo", field: "srNo", flex: 1 },
    { headerName: "Company Name", field: "companyName", flex: 1 },
    {
      headerName: "Website Status",
      field: "isActive",
      flex: 1,
      cellRenderer: (params) => {
        console.log("params : ", params.value);
        return <StatusChip status={params.value ? "Active" : "InActive"} />;
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      flex: 1,
      cellRenderer: (params) => {
        return (
          <ThreeDotMenu
            rowId={params.data.id}
            menuItems={[
              {
                label: "Mark As Active",
                onClick: () => {
                  markAsActive(params.data.searchKey);
                },
              },
              {
                label: "Edit",
                onClick: () => {
                  navigate(
                      `/app/dashboard/frontend-dashboard/websites/inactive/${params?.data?.companyName}`,
                      {
                        state: {
                          website: params.data,
                          isLoading: isPending,
                        },
                      }
                    )
                },
              },
            ]}
          />
        );
      },
    },
  ];

  return (
    <PageFrame>
      <YearWiseTable
        data={tableData}
        columns={tableColumns}
        dateColumn={"createdAt"}
        tableTitle={"Inactive Websites"}
      />
    </PageFrame>
  );
};

export default InActiveWebsites;
