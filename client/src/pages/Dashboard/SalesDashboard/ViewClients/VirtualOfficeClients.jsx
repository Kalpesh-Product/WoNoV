import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import AgTable from "../../../../components/AgTable";
import StatusChip from "../../../../components/StatusChip";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";
import { toast } from "sonner";
import { HiPencilSquare } from "react-icons/hi2";

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

const getCalendarDateInUtc = (value) => {
  const date = new Date(value);
  const dateParts =
    typeof value === "string" && value.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateParts) {
    return Date.UTC(
      Number(dateParts[1]),
      Number(dateParts[2]) - 1,
      Number(dateParts[3]),
    );
  }

  return Date.UTC(date.getFullYear(), date.getMonth(), date.getDate());
};

const calculateAgreementExpiry = (startDate, endDate) => {
  const startDay = getCalendarDateInUtc(startDate);
  const endDay = getCalendarDateInUtc(endDate);

  if (
    !startDate ||
    !endDate ||
    Number.isNaN(startDay) ||
    Number.isNaN(endDay) ||
    endDay < startDay
  ) {
    return "-";
  }

  const today = getCalendarDateInUtc(new Date());
  const totalDays = Math.round((endDay - startDay) / MILLISECONDS_PER_DAY);
  const remainingDays = Math.min(
    totalDays,
    Math.max(0, Math.round((endDay - today) / MILLISECONDS_PER_DAY)),
  );

  return `${remainingDays}/${totalDays} ${totalDays === 1 ? "day" : "days"}`;
};

const VirtualOfficeClients = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const isVerticalClientDetailsRoute = location.pathname.startsWith(
    "/app/dashboard/sales-dashboard/virtual-office/client-details",
  );
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
    : data.virtualOfficeClients
        ?.slice()
        .sort((firstClient, secondClient) => {
          const firstIsActive =
            typeof firstClient?.isActive === "boolean"
              ? firstClient.isActive
              : Boolean(firstClient?.clientStatus);
          const secondIsActive =
            typeof secondClient?.isActive === "boolean"
              ? secondClient.isActive
              : Boolean(secondClient?.clientStatus);

          if (firstIsActive !== secondIsActive) {
            return Number(secondIsActive) - Number(firstIsActive);
          }

          return String(firstClient?.clientName || "").localeCompare(
            String(secondClient?.clientName || ""),
            undefined,
            { sensitivity: "base", numeric: true },
          );
        })
        .map((item, index) => ({
          ...item,
          srNo: index + 1,
          internalLead: item.internalLead || "-",
          clientType: item.billingFrequency || "-",
          totalTerm: item.totalTerm || 0,
          agreementExpiry: calculateAgreementExpiry(
            item.termStartDate || item.startDate,
            item.termEnd || item.endDate,
          ),
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
    const isVerticalClientDetails = location.pathname.startsWith(
      "/app/dashboard/sales-dashboard/virtual-office/client-details",
    );
    dispatch(setSelectedClient(clientData));

    navigate(
      isVerticalClientDetails
        ? `/app/dashboard/sales-dashboard/virtual-office/client/${encodeURIComponent(clientData.clientName)}`
        : isMixBag
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
    { field: "srNo", headerName: "Sr No", width: 150 },
    {
      field: "clientName",
      headerName: "Client Name",
      flex: 0.8,
      cellRenderer: (params) => (
        <span
          onClick={() => handleViewClient(params.data)}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    { field: "clientType", headerName: "Client Type", flex: 0.5 },
    { field: "totalTerm", headerName: "Total Term" ,flex:0.5},
    { field: "agreementExpiry", headerName: "Agreement Expiry",flex:0.5},
    {
      field: "internalLead",
      headerName: "Internal Lead",
      flex: 0.5,
      pinned: "right",
    },
    {
      field: "rentStatus",
      headerName: "Status",
      pinned:"right",
      cellRenderer: (params) => {
        const status = params.data?.isActive ? "Active" : "Inactive";
        return <StatusChip status={status} />;
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned:"right",
      minWidth: 110,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const isActive = Boolean(params.data?.isActive);

        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              onClick={() => handleViewClient(params.data)}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              aria-label={`Edit ${params.data?.clientName || "client"}`}
              title="Edit"
            >
              <HiPencilSquare size={26} />
            </button>
            <button
              type="button"
              onClick={() => handleToggleClientStatus(params.data)}
              disabled={isStatusUpdating}
              className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                isActive ? "bg-green-500" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={isActive}
              aria-label={`${isActive ? "Deactivate" : "Activate"} ${params.data?.clientName || "client"}`}
              title={isActive ? "Mark As Inactive" : "Mark As Active"}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                  isActive ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        );
      },
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
          buttonTitle={isVerticalClientDetailsRoute ? undefined : "Add Client"}
          handleClick={
            isVerticalClientDetailsRoute
              ? undefined
              : () =>
                  navigate(
                    "/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/client-onboarding",
                  )
          }
          search
          exportData
          exportInTitleRow={isVerticalClientDetailsRoute}
        />
      </PageFrame>
    </div>
  );
};

export default VirtualOfficeClients;
