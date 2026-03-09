import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageFrame from "../../../../components/Pages/PageFrame";
import AgTable from "../../../../components/AgTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useSelector, useDispatch } from "react-redux";
import { setBuildingName } from "../../../../redux/slices/salesSlice";
import { useEffect } from "react";
import { inrFormat } from "../../../../utils/currencyFormat";

export default function BuildingUnits() {
  const dispatch = useDispatch();
  const axios = useAxiosPrivate();
  const { location: encodedLocation } = useParams();
  const selectedBuilding = decodeURIComponent(encodedLocation || "");
  const buildingName = useSelector((state) => state.sales.buildingName);
  useEffect(() => {
    if (selectedBuilding && selectedBuilding !== buildingName?.title) {
      dispatch(setBuildingName({ title: selectedBuilding }));
    }
  }, [selectedBuilding, buildingName?.title, dispatch]);
  const { data: unitsData = [], isPending: isUnitsDataPending } = useQuery({
    queryKey: ["inventory-units-data", selectedBuilding],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        const data = response.data
          .filter((item) => item.isActive)
          .filter((item) => !item.isOnlyBudget)
          .filter((item) => item.building?.buildingName === selectedBuilding);
        return data;
      } catch (error) {
        console.error("Error fetching units data:", error);
        return [];
      }
    },
    enabled: Boolean(selectedBuilding),
  });

  const { data: clientsData = [] } = useQuery({
    queryKey: ["inventory-clients-data"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-clients");
        return response.data || [];
      } catch (error) {
        console.error("Error fetching clients data:", error);
        return [];
      }
    },
  });

  const occupiedByUnit = clientsData.reduce((acc, client) => {
    const unitId = client?.unit?._id;
    if (!unitId) return acc;

    const occupiedDesks = Number(client?.totalDesks) || 0;
    acc[unitId] = (acc[unitId] || 0) + occupiedDesks;
    return acc;
  }, {});

  const tableData = unitsData.map((item, index) => ({
    srNo: index + 1,
    unitId: item._id,
    unitNo: item.unitNo,
    unitName: item.unitName,
    sqft: item.sqft || 0,
    totalDesks: (item.openDesks || 0) + (item.cabinDesks || 0),
    openDesks: item.openDesks || 0,
    cabinDesks: item.cabinDesks || 0,
    occupiedDesks: occupiedByUnit[item._id] || 0,
    freeDesks: Math.max(
      (item.openDesks || 0) + (item.cabinDesks || 0) -
      (occupiedByUnit[item._id] || 0),
      0
    ),
    fullData: item, // store full unit for edit
  }));

  const columns = [
    { headerName: "SR NO", field: "srNo", width: 100 },
    {
      headerName: "Unit No",
      field: "unitNo",
      flex: 1,
      cellRenderer: (params) => {
        return (
          <Link
            className="underline text-primary"
            to={`/app/dashboard/sales-dashboard/mix-bag/inventory/${encodeURI(
              selectedBuilding
            )}/${params.data.unitNo}`}
            state={{
              unitId: params.data?.unitId,
              unitNo: params.data?.unitNo,
              building: selectedBuilding,
            }}
          >
            {params.data.unitNo}
          </Link>
        );
      },
    },
    { headerName: "Unit Name", field: "unitName", flex: 1 },
    {
      headerName: "Sqft",
      field: "sqft",
      flex: 1,
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      headerName: "Total Desks",
      field: "totalDesks",
      flex: 1,
      cellRenderer: (params) => inrFormat(params.value),
    },
    { headerName: "Open Desks", field: "openDesks", flex: 1 },
    { headerName: "Cabin Desks", field: "cabinDesks", flex: 1 },
    { headerName: "Occupied Desks", field: "occupiedDesks", flex: 1 },
    { headerName: "Free Desks", field: "freeDesks", flex: 1 },
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <PageFrame>
        <AgTable
          data={tableData}
          columns={columns}
          search
          tableTitle={`${selectedBuilding || buildingName?.title || ""
            } units`}
          loading={isUnitsDataPending}
        />
      </PageFrame>
    </div>
  );
}