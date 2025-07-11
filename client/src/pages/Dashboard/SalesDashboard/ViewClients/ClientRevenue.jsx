import AgTable from "../../../../components/AgTable";
import { Chip } from "@mui/material";
import { inrFormat } from "../../../../utils/currencyFormat";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import { useSelector } from "react-redux";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import { useState } from "react";
import MuiModal from "../../../../components/MuiModal";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import humanDate from "../../../../utils/humanDateForamt";

const ClientRevenue = () => {
  const selectedClient = useSelector((state) => state?.client?.selectedClient);
  const [openModal, setOpenModal] = useState(false);
  const [clientDetails, setClientDetails] = useState(null);
  const axios = useAxiosPrivate();

  const { data: revenueDetails = [], isPending: isRevenuePending } = useQuery({
    queryKey: ["clientRevenue", selectedClient?._id],
    enabled: !!selectedClient?._id, // Only run query if client is selected
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/sales/coworking-client-revenue/${selectedClient?._id}`
        );
        return response?.data || [];
      } catch (error) {
        console.error("Error fetching revenue data:", error.message);
        return [];
      }
    },
  });

  const viewEmployeeColumns = [
    { field: "srNo", headerName: "SR No", width: 100 },
    {
      field: "clientName",
      flex: 1,
      headerName: "Client Name",
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => {
            if (params?.data) {
              setClientDetails(params.data);
              setOpenModal(true);
            }
          }}
          className="text-primary underline cursor-pointer"
        >
          {params?.value || "N/A"}
        </span>
      ),
    },
    {
      field: "revenue",
      headerName: "Revenue",
      cellRenderer: (params) => inrFormat(params?.value) || "₹0",
    },
    {
      field: "noOfDesks",
      headerName: "No. Of Desks",
      flex: 1,
      valueGetter: (params) => params?.data?.noOfDesks || "N/A",
    },
    {
      field: "totalTerm",
      headerName: "Total Term (Months)",
      flex: 1,
      valueGetter: (params) => params?.data?.totalTerm || "N/A",
    },
    {
      field: "rentStatus",
      headerName: "Status",
      cellRenderer: (params) => {
        const statusColorMap = {
          Paid: { backgroundColor: "#90EE90", color: "#006400" },
          Unpaid: { backgroundColor: "#D3D3D3", color: "#696969" },
        };

        const { backgroundColor, color } = statusColorMap[params?.value] || {
          backgroundColor: "gray",
          color: "white",
        };

        return (
          <Chip
            label={params?.value || "N/A"}
            style={{ backgroundColor, color }}
          />
        );
      },
    },
  ];

  const tableData = isRevenuePending
    ? []
    : Array.isArray(revenueDetails)
    ? revenueDetails.map((item, index) => ({
        ...item,
        srNo: index + 1,
      }))
    : [];

  return (
    <div className="w-full">
      <PageFrame>
        <YearWiseTable
          dateColumn="rentDate"
          tableTitle={`${selectedClient?.clientName || "Unknown"} Revenue Details`}
          search={true}
          searchColumn="clientName"
          data={tableData}
          columns={viewEmployeeColumns}
        />
      </PageFrame>

      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={clientDetails?.clientName || "N/A"}
      >
        <div className="grid grid-cols-1 gap-6">
          {/* Section: Client Info */}
          <div>
            <span className="text-subtitle font-pmedium mb-4">Client Info</span>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <DetalisFormatted
                title="Client Name"
                detail={clientDetails?.clientName || "N/A"}
              />
              <DetalisFormatted
                title="Channel"
                detail={clientDetails?.channel || "N/A"}
              />
            </div>
          </div>
          <hr className="my-2" />

          {/* Section: Financials */}
          <div>
            <span className="text-subtitle font-pmedium mb-4">Financials</span>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <DetalisFormatted
                title="No. Of Desks"
                detail={clientDetails?.noOfDesks || "N/A"}
              />
              <DetalisFormatted
                title="Revenue"
                detail={inrFormat(clientDetails?.revenue) || "₹0"}
              />
              <DetalisFormatted
                title="Desk Rate"
                detail={inrFormat(clientDetails?.deskRate) || "₹0"}
              />
              <DetalisFormatted
                title="Annual Increment"
                detail={`${clientDetails?.annualIncrement || 0}%`}
              />
            </div>
          </div>
          <hr className="my-2" />

          {/* Section: Rental Terms */}
          <div>
            <span className="text-subtitle font-pmedium mb-4">
              Rental Terms
            </span>
            <div className="grid grid-cols-1 gap-2 mt-2">
              <DetalisFormatted
                title="Rent Date"
                detail={humanDate(clientDetails?.rentDate) || "N/A"}
              />
              <DetalisFormatted
                title="Rent Status"
                detail={clientDetails?.rentStatus || "N/A"}
              />
              <DetalisFormatted
                title="Total Term (Months)"
                detail={clientDetails?.totalTerm || "N/A"}
              />
              <DetalisFormatted
                title="Next Increment Date"
                detail={humanDate(clientDetails?.nextIncrementDate) || "N/A"}
              />
              <DetalisFormatted
                title="Past Due Date"
                detail={humanDate(clientDetails?.pastDueDate) || "N/A"}
              />
            </div>
          </div>
        </div>
      </MuiModal>
    </div>
  );
};

export default ClientRevenue;
