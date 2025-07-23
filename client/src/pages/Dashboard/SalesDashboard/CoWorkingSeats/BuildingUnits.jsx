import { Link, useLocation, useNavigate } from "react-router-dom";
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
  const location = useLocation();
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const buildingName = useSelector((state) => state.sales.buildingName);
  useEffect(() => {
    if (location?.state && location.state !== buildingName?.title) {
      dispatch(setBuildingName({ title: location.state }));
    }
  }, [location?.state, buildingName?.title, dispatch]);
  const { data: unitsData = [], isPending: isUnitsDataPending } = useQuery({
    queryKey: ["inventory-units-data"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/fetch-units");
        const data = response.data
          .filter((item) => item.isActive)
          .filter((item) => !item.isOnlyBudget)
          .filter((item) => item.building.buildingName === location.state);
        return data;
      } catch (error) {
        console.error("Error fetching units data:", error);
        return [];
      }
    },
  });

  const tableData = unitsData.map((item, index) => ({
    srNo: index + 1,
    unitId: item._id,
    unitNo: item.unitNo,
    unitName: item.unitName,
    sqft: item.sqft || 0,
    openDesks: item.openDesks || 0,
    cabinDesks: item.cabinDesks || 0 ,
    totalDesks: (item.openDesks || 0) + (item.cabinDesks || 0),
    buildingName: item.building?.buildingName || "-",
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
              location.state
            )}/${params.data.unitNo}`}
            state={{
              unitId: params.data?.unitId,
              unitNo: params.data?.unitNo,
              building: params.data?.buildingName,
            }}
          >
            {params.data.unitNo}
          </Link>
        );
      },
    },
    { headerName: "Unit Name", field: "unitName", flex: 1 },
    { headerName: "Building", field: "buildingName", flex: 1 },
    { headerName: "Sqft", field: "sqft", flex: 1 , cellRenderer: (params) => inrFormat(params.value),},
    { headerName: "Open Desks", field: "openDesks", flex: 1 },
    { headerName: "Cabin Desks", field: "cabinDesks", flex: 1 },
    {
      headerName: "Total Desks",
      field: "totalDesks",
      flex: 1,
      cellRenderer: (params) => inrFormat(params.value),
    }, // 👈 New column
  ];

  return (
    <div className="p-4 flex flex-col gap-4">
      <PageFrame>
        <AgTable
          data={tableData}
          columns={columns}
          search
          tableTitle={`${
            !location?.state ? buildingName?.title : location.state
          } units`}
          loading={isUnitsDataPending}
        />
      </PageFrame>
    </div>
  );
}
