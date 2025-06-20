import React from "react";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";
import AgTable from "../../../../components/AgTable";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../../../components/Pages/PageFrame";

const MaintenancOfficesNew = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

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

  // Group by Unit Number
  const groupedByUnits = clientsData.reduce((acc, item) => {
    const unitNo = item.unit?.unitNo || "-";

    if (!acc[unitNo]) {
      acc[unitNo] = {
        unitNo,
        unitName: item.unit?.unitName || "-",
        unitId: item.unit?._id,
        clients: [],
        buildingName: item.unit?.building?.buildingName,
      };
    }

    acc[unitNo].clients.push(item);

    return acc;
  }, {});

  const tableData = Object.values(groupedByUnits)
    .sort((a, b) =>
      a.unitNo.localeCompare(b.unitNo, undefined, { numeric: true })
    )
    .map((group, index) => ({
      srNo: index + 1,
      unitId: group.unitId,
      unitNo: group.unitNo,
      unitName: group.unitName,
      buildingName: group.buildingName,
      clientsCount: group.clients.length,
      rawClients: group.clients,
    }));

  // Define columns
  const columns = [
    { headerName: "SR NO", field: "srNo", width: 100 },
    {
      headerName: "Unit No",
      field: "unitNo",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => {
            navigate(
              `/app/dashboard/maintenance-dashboard/maintenance-offices/${params.value}`,
              { state: { unitId: params.data.unitId, unitName : params.value } }
            );
          }}
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    { headerName: "Building", field: "buildingName", flex: 1 },
    { headerName: "Clients Count", field: "clientsCount" },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          data={tableData}
          columns={columns}
          search
          tableTitle="Maintenance Offices"
        />
      </PageFrame>
    </div>
  );
};

export default MaintenancOfficesNew;
