import { useEffect, useMemo, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const formatDateTime = (value) =>
  value ? dayjs(value).format("DD-MM-YYYY, hh:mm A") : "-";

const EnergyDailyReadingHistory = () => {
  const { module } = useParams();
  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();
  const [history, setHistory] = useState([]);
  const storageKey = `energyDailyReadingHistory:${module || "unknown"}`;
  const readingId =
    location.state?.readingId ||
    sessionStorage.getItem(storageKey) ||
    new URLSearchParams(location.search).get("readingId");

  useEffect(() => {
    if (readingId) {
      sessionStorage.setItem(storageKey, readingId);
    }

    let active = true;
    axiosPrivate
      .get(`/api/maintenance/energy-daily-history/${module}`, {
        params: { readingId },
      })
      .then(({ data }) => active && setHistory(data.data || []))
      .catch((error) =>
        toast.error(error.response?.data?.message || "Unable to load reading history"),
      );
    return () => {
      active = false;
    };
  }, [axiosPrivate, module, readingId, storageKey]);

  const data = useMemo(
    () =>
      history.map((row, index) => ({
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
    { field: "previousReading", headerName: "Previous Reading", minWidth: 160, flex: 1 },
    { field: "currentReading", headerName: "Current Reading", minWidth: 160, flex: 1 },
    { field: "addedBy", headerName: "Added By", minWidth: 140, flex: 1 },
    { field: "addedAtDisplay", headerName: "Added At", minWidth: 180, flex: 1 },
    { field: "editedBy", headerName: "Edited By", minWidth: 140, flex: 1 },
    { field: "editedAtDisplay", headerName: "Edited At", minWidth: 180, flex: 1 },
  ];

  const selectedUnitName = data[0]?.unitNo || (module?.startsWith("dtc") ? "DTC" : "ST");

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          data={data}
          columns={columns}
          search
          exportData
          hideFilter
          tableTitle={`${selectedUnitName} - ENERGY READING HISTORY`}
        />
      </PageFrame>
    </div>
  );
};

export default EnergyDailyReadingHistory;
