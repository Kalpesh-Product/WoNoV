import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import AgTable from "../../../../components/AgTable";
import StatusChip from "../../../../components/StatusChip";
import { useLocation, useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setSelectedClient } from "../../../../redux/slices/clientSlice";

const VirtualOfficeClients = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

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
  const handleViewClient = (clientData) => {
    const isMixBag = location.pathname.includes("mix-bag");
    dispatch(setSelectedClient(clientData));

    navigate(
      isMixBag
        ? `/app/dashboard/sales-dashboard/mix-bag/clients/virtual-office/${encodeURIComponent(clientData.clientName)}?virtualofficeclientid=${clientData._id}`
        : `/app/dashboard/sales-dashboard/clients/virtual-office/${encodeURIComponent(clientData.clientName)}?virtualofficeclientid=${clientData._id}`,
    );
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
