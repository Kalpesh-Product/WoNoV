import { useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { setClientData } from "../../../../redux/slices/salesSlice";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";
import { Chip } from "@mui/material";
import { HiPencilSquare } from "react-icons/hi2";
import { toast } from "sonner";

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

const CoWorkingClients = () => {
  const navigate = useNavigate();
  const clientsData = useSelector((state) => state.sales.clientsData);
  const location = useLocation();
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  useEffect(() => {
    const fetchClients = async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        dispatch(setClientData(response.data));
      } catch (error) {
        console.error("Failed to fetch leads", error);
      }
    };

    fetchClients();
  }, [axios, dispatch]);

  const {
    mutate: updateClientStatus,
    isPending: isStatusUpdating,
    variables: statusVariables,
  } = useMutation({
    mutationFn: async ({ id, isActive }) => {
      const response = await axios.patch(
        `/api/sales/co-working-client/${id}/status`,
        { isActive },
      );
      return response.data;
    },
    onMutate: ({ id, isActive }) => {
      const previousClients = clientsData;
      dispatch(
        setClientData(
          clientsData.map((client) =>
            String(client?._id) === String(id)
              ? { ...client, isActive }
              : client,
          ),
        ),
      );
      return { previousClients };
    },
    onSuccess: (response) => {
      toast.success(response?.message || "Client status updated successfully");
    },
    onError: (error, _variables, context) => {
      if (context?.previousClients) {
        dispatch(setClientData(context.previousClients));
      }
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update client status",
      );
    },
  });

  const handleClickRow = (clientData) => {
    dispatch(setSelectedClient(clientData));
    const isMixBag = location.pathname.includes("mix-bag");
    const isRevenueBasePath =
      location.pathname.endsWith("/co-working") ||
      location.pathname.endsWith("/co-working/");
    const isCoworkingSummaryPath = location.pathname.endsWith(
      "/co-working/client-details",
    );

    if ((isMixBag && isRevenueBasePath) || isCoworkingSummaryPath) {
      navigate(
        `/app/dashboard/sales-dashboard/mix-bag/clients/co-working/${clientData.clientName}`,
        { replace: true },
      );
    } else if (!isMixBag && isRevenueBasePath) {
      navigate(
        `/app/dashboard/sales-dashboard/clients/co-working/${clientData.clientName}`,
      );
    }
  };

  const handleToggleClientStatus = (clientData) => {
    if (!clientData?._id) {
      toast.error("Unable to find selected client");
      return;
    }

    updateClientStatus({
      id: clientData._id,
      isActive: !clientData.isActive,
    });
  };
  const viewEmployeeColumns = [
    { field: "id", headerName: "Sr No",width:150 },
    {
      field: "clientName",
      headerName: "Client Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          style={{
            color: "#1E3D73",
            textDecoration: "underline",
            cursor: "pointer",
          }}
          onClick={() => handleClickRow(params.data)}
        >
          {params.value}
        </span>
      ),
    },
    { field: "desks", headerName: "Desks", flex:0.5},
    { field: "clientType", headerName: "Client Type", flex: 0.5, minWidth: 170 },
    {
      field: "occupancy",
      headerName: "Occupancy (%)",
      flex: 0.5,
      cellRenderer: (params) => `${params.value}%`,
    },
    { field: "agreementExpiry", headerName: "Agreement Expiry", flex: 0.5,},
     {
      field: "status",
      headerName: "Status",
      flex: 1,
      pinned:"right",
      cellRenderer: (params) => {
        const status = params.value ? "Active" : "Inactive";
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" },
          Active: { backgroundColor: "#90EE90", color: "#006400" },
        };

        const { backgroundColor, color } = statusColorMap[status];

        return (
          <Chip
            label={status}
            style={{
              backgroundColor,
              color,
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      minWidth: 110,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const isActive = Boolean(params.data?.isActive);
        const isThisStatusUpdating =
          isStatusUpdating &&
          String(statusVariables?.id) === String(params.data?._id);

        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              onClick={() => handleClickRow(params.data)}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
              aria-label={`Edit ${params.data?.clientName || "client"}`}
              title="Edit"
            >
              <HiPencilSquare size={26} />
            </button>
            <button
              type="button"
              onClick={() => handleToggleClientStatus(params.data)}
              disabled={isThisStatusUpdating}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-wait disabled:opacity-80 ${
                isActive ? "bg-green-500" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={isActive}
              aria-busy={isThisStatusUpdating}
              aria-label={`${isActive ? "Deactivate" : "Activate"} ${params.data?.clientName || "client"}`}
              title={isActive ? "Mark As Inactive" : "Mark As Active"}
            >
              <span
                aria-hidden="true"
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform duration-200 ease-in-out ${
                  isActive ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>
        );
      },
    },
  ];

  const sortedClients = [...clientsData].sort((firstClient, secondClient) =>
    String(firstClient?.clientName || "").localeCompare(
      String(secondClient?.clientName || ""),
      undefined,
      { sensitivity: "base", numeric: true },
    ),
  );
  const tableData = sortedClients.map((item, index) => ({
    ...item,
    id: index + 1,
    // _id: item._id,
    // company: item.company,
    // clientName: item.clientName,
    status: item.isActive,
    serviceName: item.service?.serviceName,
    serviceDescription: item.service?.description,
    // sector: item.sector,
    // hoCity: item.hoCity,
    // bookingType: item.bookingType,
    // hoState: item.hoState,
    unitName: item.unit?.unitName,
    unitNo: item.unit?.unitNo,
    buildingName: item.unit?.building?.buildingName,
    buildingAddress: item.unit?.building?.fullAddress,
    cabinDesks: item.cabinDesks || 0,
    // openDesks: item.openDesks,
    // totalDesks: item.totalDesks,
    desks: Number(item.openDesks || 0) + Number(item.cabinDesks),
    clientType:
      String(item.clientType || "").trim() ||
      (item.billingFrequency === "Monthly"
        ? "Flexy Desk Client"
        : "Annual Client"),
    occupancy: (
      ((Number(item.openDesks || 0) + Number(item.cabinDesks)) / 589) *
      100
    ).toFixed(1),
    agreementExpiry: calculateAgreementExpiry(item.startDate, item.endDate),
    // ratePerOpenDesk: item.ratePerOpenDesk,
    // ratePerCabinDesk: item.ratePerCabinDesk,
    // annualIncrement: item.annualIncrement,
    // perDeskMeetingCredits: item.perDeskMeetingCredits,
    // totalMeetingCredits: item.totalMeetingCredits,
    // startDate: item.startDate,
    // endDate: item.endDate,
    // lockinPeriod: item.lockinPeriod,
    // rentDate: item.rentDate,
    // nextIncrement: item.nextIncrement,
    localPocName: item.localPoc?.name,
    localPocEmail: item.localPoc?.email,
    localPocPhone: item.localPoc?.phone,
    hoPocName: item.hOPoc?.name,
    hoPocEmail: item.hOPoc?.email || "",
    hoPocPhone: item.hOPoc?.phone,
    // isActive: item.isActive,
    // createdAt: item.createdAt,
    // updatedAt: item.updatedAt,
    occupiedImage: item.occupiedImage?.imageUrl,
    members: item.members || [],
  }));
  const totalClientCount = tableData.length;
  const activeClientCount = tableData.filter((client) => client.isActive).length;
  const inactiveClientCount = totalClientCount - activeClientCount;

  return (
    <div className="p-4">
      <div className="w-full">
        <PageFrame>
          <AgTable
            search={true}
            tableTitle={"CO-WORKING CLIENT DETAILS"}
            titleRightContent={
              <div className="flex flex-wrap items-center justify-end gap-1.5">
                <div className="flex items-center justify-center gap-1 rounded-lg border border-[#aec6fb] bg-[#dbe4ff] px-3 py-1.5 text-sm font-pmedium uppercase text-[#274784]">
                  <div>Total :</div>
                  <div>{totalClientCount}</div>
                </div>
                <div className="flex items-center justify-center gap-1 rounded-lg border border-[#a9ddba] bg-[#d8f0df] px-3 py-1.5 text-sm font-pmedium uppercase text-[#16784d]">
                  <div>Active :</div>
                  <div>{activeClientCount}</div>
                </div>
                <div className="flex items-center justify-center gap-1 rounded-lg border border-[#f3b7a8] bg-[#fce8e3] px-3 py-1.5 text-sm font-pmedium uppercase text-[#d96b4f]">
                  <div>Inactive :</div>
                  <div>{inactiveClientCount}</div>
                </div>
              </div>
            }
            buttonTitle={"Add Client"}
            handleClick={() =>
              navigate(
                "/app/dashboard/sales-dashboard/mix-bag/clients/co-working/client-onboarding",
              )
            }
            data={tableData}
            columns={viewEmployeeColumns}
            exportData
          />
        </PageFrame>
      </div>{" "}
    </div>
  );
};

export default CoWorkingClients;
