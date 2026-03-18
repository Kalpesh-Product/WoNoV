import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import AgTable from "../../../../components/AgTable";
import StatusChip from "../../../../components/StatusChip";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import { toast } from "sonner";

const VirtualOfficeClients = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const queryClient = useQueryClient();

  //-------------------------API-----------------------------//
  const { data = [], isLoading } = useQuery({
    queryKey: ["clientDetails"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/consolidated-clients");
        return response.data;
      } catch (error) {
        console.error(error.response.data.message);
      }
    },
  });
  const verticalData = isLoading
    ? []
    : data.virtualOfficeClients?.map((item, index) => ({
      ...item,
      srNo: index + 1,
      totalTerm: item.totalTerm || 0,
      isActive:
        typeof item?.isActive === "boolean"
          ? item.isActive
          : Boolean(item?.clientStatus),
    })) || [];

  const { mutate: updateClientStatus, isPending: isStatusUpdating } = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const response = await axios.patch(`/api/sales/virtual-office/${id}/status`, {
        isActive,
      });
      return response.data;
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Client status updated successfully");
      queryClient.invalidateQueries({ queryKey: ["clientDetails"] });
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
        error?.message ||
        "Failed to update client status",
      );
    },
  });


  //-------------------------API-----------------------------//
  //-------------------------Event Handlers-----------------------------//
  const handleViewClient = (clientData) => {
    const isMixBag = location.pathname.includes("mix-bag");
    dispatch(setSelectedClient(clientData));

    navigate(
      isMixBag
        ? `/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/${encodeURIComponent(clientData.clientName)}`
        : `/app/dashboard/sales-dashboard/clients/virtual-office/${encodeURIComponent(clientData.clientName)}`,
    );
  };

  const handleToggleClientStatus = (clientData) => {
    if (!clientData?._id) {
      toast.error("Unable to find selected client");
      return;
    }

    const currentStatus =
      typeof clientData?.isActive === "boolean"
        ? clientData.isActive
        : Boolean(clientData?.clientStatus);

    updateClientStatus({ id: clientData._id, isActive: !currentStatus });
  };

  //-------------------------Event Handlers-----------------------------//
  //-------------------------Table Data-----------------------------//
  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "clientName",
      headerName: "Client Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          onClick={() => handleViewClient(params.data)}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    { field: "totalTerm", headerName: "Total Term" },
    {
      field: "rentStatus",
      headerName: "Status",
      cellRenderer: (params) => {
        const status = params.data?.isActive ? "Active" : "Inactive";
        return <StatusChip status={status} />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data._id || params.data.srNo}
          menuItems={[
            {
              label: "Edit Client Details",
              onClick: () => handleViewClient(params.data),
            },
            {
              label: params.data?.isActive ? "Mark As Inactive" : "Mark As Active",
              onClick: () => handleToggleClientStatus(params.data),
              disabled: isStatusUpdating,
            },
          ]}
        />
      ),
    },
  ];
  //-------------------------Table Data-----------------------------//

  return (
    <div className="flex flex-col gap-4 p-4">
      <PageFrame>
        <AgTable
          data={verticalData}
          columns={columns}
          tableTitle={"Virtual Office Clients"}
          buttonTitle="Add Client"
          handleClick={() =>
            navigate(
              "/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/client-onboarding",
            )
          }
          search
        />
      </PageFrame>
    </div>
  );
};

export default VirtualOfficeClients;