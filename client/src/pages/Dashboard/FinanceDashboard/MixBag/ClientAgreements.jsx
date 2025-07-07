import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { CircularProgress } from "@mui/material";
import PageFrame from "../../../../components/Pages/PageFrame";

const ClientAgreements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["clientsData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-clients");
        const data = response.data.filter((item) => item.isActive);
        return data;
      } catch (error) {
        console.error("Error fetching clients data:", error);
      }
    },
  });

  const tableData = Array.isArray(clientsData)
    ? clientsData
        .slice()
        .sort((a, b) =>
          (a?.clientName || "").localeCompare(b?.clientName || "")
        )
        .map((item, index) => {
          const rawName = item?.clientName || "Unnamed";
          const safeName = rawName.replace(/\//g, ""); // Remove all slashes

          return {
            srno: index + 1,
            name: safeName,
            documentCount: Array.isArray(item?.documents)
              ? item.documents.length
              : 0,
            files: item?.documents || [],
            id: item?.id || "",
          };
        })
    : [];

  const columns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() =>
            navigate(
              location.pathname.includes("mix-bag")
                ? `/app/dashboard/finance-dashboard/mix-bag/client-agreements/${params.data.name}`
                : `/app/client-agreements/${params.data.name}`,
              {
                state: {
                  files: params.data.files || [],
                  name: params.data.name || "Unnamed",
                },
              }
            )
          }
          className="text-primary underline cursor-pointer"
        >
          {params.value || "Unnamed"}
        </span>
      ),
    },
    { field: "documentCount", headerName: "No. of Documents", flex: 1 },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        {!isClientsDataPending ? (
          <>
            <AgTable
              columns={columns}
              data={tableData}
              tableTitle="Client Agreements"
              tableHeight={400}
              hideFilter
              search
            />
          </>
        ) : (
          <div className="h-72 place-items-center">
            <CircularProgress />
          </div>
        )}
      </PageFrame>
    </div>
  );
};

export default ClientAgreements;
