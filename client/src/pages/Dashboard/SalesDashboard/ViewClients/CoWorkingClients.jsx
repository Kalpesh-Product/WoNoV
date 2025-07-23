import { useEffect } from "react";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { setClientData, } from "../../../../redux/slices/salesSlice";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";


const CoWorkingClients = () => {
  const navigate = useNavigate();
  const clientsData = useSelector((state) => state.sales.clientsData);
  const location = useLocation();
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  useEffect(() => {
    const fetchSourceIfEmpty = async () => {
      if (clientsData.length === 0) {
        try {
          const response = await axios.get("/api/sales/co-working-clients");
          dispatch(setClientData(response.data));
        } catch (error) {
          console.error("Failed to fetch leads", error);
        }
      }
    };

    fetchSourceIfEmpty();
  }, [clientsData, dispatch]);
   const handleClickRow = (clientData) => {
    dispatch(setSelectedClient(clientData));
    const isMixBag = location.pathname.includes("mix-bag");
    const isRevenueBasePath =
      location.pathname.endsWith("/co-working") ||
      location.pathname.endsWith("/co-working/");

    if (isMixBag && isRevenueBasePath) {
      navigate(
        `/app/dashboard/sales-dashboard/mix-bag/clients/co-working/${clientData.clientName}`,
        { replace: true }
      );
    } else if (!isMixBag && isRevenueBasePath) {
      navigate(
        `/app/dashboard/sales-dashboard/clients/co-working/${clientData.clientName}`
      );
    }
  };
  const viewEmployeeColumns = [
    { field: "id", headerName: "Sr No" },
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
    { field: "desks", headerName: "Desks" },
    {
      field: "occupancy",
      headerName: "Occupancy (%)",
      cellRenderer: (params) => `${params.value}%`,
    },
  ];

  const sortedClients = [...clientsData].sort((a, b) => {
    const desksA = Number(a.openDesks || 0) + Number(a.cabinDesks || 0);
    const desksB = Number(b.openDesks || 0) + Number(b.cabinDesks || 0);
    return desksB - desksA; // Descending
  });
  const tableData = sortedClients.map((item, index) => ({
    id: index + 1,
    _id: item._id,
    company: item.company,
    clientName: item.clientName,
    serviceName: item.service?.serviceName,
    serviceDescription: item.service?.description,
    sector: item.sector,
    hoCity: item.hoCity,
    bookingType: item.bookingType,
    hoState: item.hoState,
    unitName: item.unit?.unitName,
    unitNo: item.unit?.unitNo,
    buildingName: item.unit?.building?.buildingName,
    buildingAddress: item.unit?.building?.fullAddress,
    cabinDesks: item.cabinDesks || 0,
    openDesks: item.openDesks,
    totalDesks: item.totalDesks,
    desks: Number(item.openDesks || 0) + Number(item.cabinDesks),
    occupancy: (
      ((Number(item.openDesks || 0) + Number(item.cabinDesks)) / 589) *
      100
    ).toFixed(1),
    ratePerOpenDesk: item.ratePerOpenDesk,
    ratePerCabinDesk: item.ratePerCabinDesk,
    annualIncrement: item.annualIncrement,
    perDeskMeetingCredits: item.perDeskMeetingCredits,
    totalMeetingCredits: item.totalMeetingCredits,
    startDate: item.startDate,
    endDate: item.endDate,
    lockinPeriod: item.lockinPeriod,
    rentDate: item.rentDate,
    nextIncrement: item.nextIncrement,
    localPocName: item.localPoc?.name,
    localPocEmail: item.localPoc?.email,
    localPocPhone: item.localPoc?.phone,
    hoPocName: item.hOPoc?.name,
    hoPocEmail: item.hOPoc?.email || "",
    hoPocPhone: item.hOPoc?.phone,
    isActive: item.isActive,
    createdAt: item.createdAt,
    updatedAt: item.updatedAt,
    occupiedImage: item.occupiedImage?.imageUrl,
    members: item.members || [],
  }));

 

  return (
    <div className="p-4">
      <div className="w-full">
        <PageFrame>
          <AgTable
            search={true}
            tableTitle={"CO-WORKING CLIENT DETAILS"}
            buttonTitle={"Add Client"}
            handleClick={() => navigate("client-onboarding")}
            data={tableData}
            columns={viewEmployeeColumns}
          />
        </PageFrame>
      </div>{" "}
    </div>
  );
};

export default CoWorkingClients;
