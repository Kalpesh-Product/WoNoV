import { Link, useParams } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import PageFrame from "../../../../components/Pages/PageFrame";
import AgTable from "../../../../components/AgTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useSelector, useDispatch } from "react-redux";
import { setBuildingName } from "../../../../redux/slices/salesSlice";
import { useEffect, useMemo } from "react";
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

  const activeUnits = useMemo(
    () =>
      unitsData.filter(
        (item) =>
          item.isActive &&
          !item.isOnlyBudget &&
          item.building?.buildingName === selectedBuilding,
      ),
    [selectedBuilding, unitsData],
  );

  const occupancyQueryKey = useMemo(
    () => [
      "inventory-co-working-members",
      selectedBuilding,
      activeUnits.map((unit) => unit._id).sort().join("|"),
    ],
    [activeUnits, selectedBuilding],
  );

  const { data: occupancyData = [], isPending: isOccupancyDataPending } =
    useQuery({
      queryKey: occupancyQueryKey,
      queryFn: async () => {
        try {
          const results = await Promise.allSettled(
            activeUnits.map(async (unit) => {
              const response = await axios.get(
                "/api/sales/co-working-members",
                {
                  params: { unitId: unit._id, active: true },
                },
              );

              return {
                unitId: unit._id,
                totalOccupiedDesks:
                  Number(response.data?.totalOccupiedDesks) || 0,
              };
            }),
          );

          return results
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
        } catch (error) {
          console.error("Error fetching co-working occupancy data:", error);
          return [];
        }
      },
      enabled: activeUnits.length > 0,
    });

  const occupiedByUnit = occupancyData.reduce((acc, item) => {
    if (!item?.unitId) return acc;
    acc[item.unitId] = Number(item.totalOccupiedDesks) || 0;
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

   const totalDesksCount = tableData.reduce(
    (sum, item) => sum + (Number(item.totalDesks) || 0),
    0
  );

  const columns = [
    { headerName: "Sr No", field: "srNo", width: 100 },
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
          loading={isUnitsDataPending || isOccupancyDataPending}
           headerActions={
            <span className="font-pmedium text-title text-primary uppercase">
              Total Desks : {totalDesksCount}
            </span>
          }
          exportData

        />
      </PageFrame>
    </div>
  );
}
