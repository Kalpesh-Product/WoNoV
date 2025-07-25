import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import AgTable from "../../../../components/AgTable";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import StatusChip from "../../../../components/StatusChip";
import MuiModal from "../../../../components/MuiModal";
import { useState } from "react";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import humanDate from "../../../../utils/humanDateForamt";
import { useNavigate } from "react-router-dom";

const VirtualOfficeClients = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate()
  const [openModal, setOpenModal] = useState(false);
  const [selectedClient, setSelectedClient] = useState([]);
  const [modalMode, setModalMode] = useState("");

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
      })) || [];

  //-------------------------API-----------------------------//
  //-------------------------Event Handlers-----------------------------//
  const handleViewClient = (data) => {
    setModalMode("view");
    setSelectedClient(data);
    setOpenModal(true);
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
        const status = params.value === "Active" ? "Active" : "Inactive";
        return <StatusChip status={status} />;
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
          buttonTitle="Add Client"
          handleClick={()=>navigate("/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/client-onboarding")}
          search
        />
      </PageFrame>
      <MuiModal
        title={modalMode === "view" ? "View Client" : ""}
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        {modalMode === "view" && (
          <div className="grid grid-cols-1 gap-4">
            <DetalisFormatted
              title={"Client Name"}
              detail={selectedClient?.clientName}
            />
            <DetalisFormatted
              title={"Rent Date"}
              detail={humanDate(selectedClient?.rentDate)}
            />
            <DetalisFormatted
              title={"Term End"}
              detail={humanDate(selectedClient?.termEnd)}
            />
            <DetalisFormatted
              title={"Next Increment Date"}
              detail={humanDate(selectedClient?.nextIncrementDate)}
            />
             <DetalisFormatted
              title={"Rent Status"}
              detail={selectedClient?.rentStatus}
            />
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default VirtualOfficeClients;
