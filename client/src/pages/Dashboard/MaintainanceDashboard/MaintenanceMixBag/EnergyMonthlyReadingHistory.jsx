
import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const formatDateTime = (value) =>
  value ? dayjs(value).format("DD-MM-YYYY, hh:mm A") : "-";

const EnergyMonthlyReadingHistory = () => {
  const { module: moduleParam, readingId } = useParams();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [history, setHistory] = useState([]);
  const pathName = location.pathname.toLowerCase();
  const module =
    moduleParam ||
    (pathName.includes("/dtc-energy-monthly-reading/") ? "dtc" : undefined) ||
    (pathName.includes("/st-energy-monthly-reading/") ? "st" : undefined);
  const storageKey = `energyMonthlyReadingHistory:${module || "unknown"}`;
  const resolvedReadingId =
    readingId ||
    location.state?.readingId ||
    sessionStorage.getItem(storageKey) ||
    new URLSearchParams(location.search).get("readingId");

  useEffect(() => {
    if (!module || !resolvedReadingId) {
      return;
    }

    if (resolvedReadingId) {
      sessionStorage.setItem(storageKey, resolvedReadingId);
    }

    let active = true;
    axiosPrivate
      .get(`/api/maintenance/energy-monthly-history/${module}/${resolvedReadingId}`)
      .then(({ data }) => active && setHistory(data.data || []))
      .catch((error) =>
        toast.error(error.response?.data?.message || "Unable to load monthly history"),
      );
    return () => {
      active = false;
    };
  }, [axiosPrivate, module, resolvedReadingId, storageKey]);

  const data = useMemo(
    () => history.map((row, index) => ({
      ...row,
      srNo: index + 1,
      addedAtDisplay: formatDateTime(row.addedAt),
      editedAtDisplay: formatDateTime(row.editedAt),
    })),
    [history],
  );

  const columns = [
    { field: "srNo", headerName: "Sr. No.", minWidth: 90, flex: 0.6 ,sort: "desc",},
    { field: "unitNo", headerName: "Unit No.", minWidth: 130, flex: 1 },
    { field: "meterNo", headerName: "Meter No.", minWidth: 130, flex: 1 },
    { field: "totalConsumption", headerName: "Total Consumption (KWH)", minWidth: 230, flex: 1 },
    { field: "totalBillAmount", headerName: "Total Bill Amount", minWidth: 170, flex: 1 },
    { field: "addedBy", headerName: "Added By", minWidth: 140, flex: 1 },
    { field: "addedAtDisplay", headerName: "Added At", minWidth: 180, flex: 1 },
    { field: "editedBy", headerName: "Modified By", minWidth: 140, flex: 1 },
    { field: "editedAtDisplay", headerName: "Modified At", minWidth: 180, flex: 1 },
  ];

  const selectedUnitName =
    data[0]?.unitNo || (module?.startsWith("dtc") ? "DTC" : "ST");

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          data={data}
          columns={columns}
          search
          exportData
          hideFilter
          tableTitle={`${selectedUnitName} - ENERGY READING BILL HISTORY`}
        />
      </PageFrame>
    </div>
  );
};

export default EnergyMonthlyReadingHistory;
