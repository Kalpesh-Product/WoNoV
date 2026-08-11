import { useEffect, useMemo, useState } from "react";
import { Button } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const formatDateTime = (value) =>
  value ? dayjs(value).format("DD-MM-YYYY, hh:mm A") : "-";

const EnergyDailyReadingHistory = () => {
  const { module, readingId } = useParams();
  const navigate = useNavigate();
  const axiosPrivate = useAxiosPrivate();
  const [history, setHistory] = useState([]);

  useEffect(() => {
    let active = true;
    axiosPrivate
      .get(`/api/maintenance/energy-daily-history/${module}/${readingId}`)
      .then(({ data }) => active && setHistory(data.data || []))
      .catch((error) =>
        toast.error(error.response?.data?.message || "Unable to load reading history"),
      );
    return () => {
      active = false;
    };
  }, [axiosPrivate, module, readingId]);

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
    { field: "srNo", headerName: "Sr. No.", minWidth: 90, flex: 0.5 },
    { field: "unitNo", headerName: "Unit No.", minWidth: 130, flex: 1 },
    { field: "meterNo", headerName: "Meter No.", minWidth: 130, flex: 1 },
    { field: "previousReading", headerName: "Previous Reading", minWidth: 160, flex: 1 },
    { field: "currentReading", headerName: "Current Reading", minWidth: 160, flex: 1 },
    { field: "addedBy", headerName: "Added By", minWidth: 140, flex: 1 },
    { field: "addedAtDisplay", headerName: "Added At", minWidth: 180, flex: 1 },
    { field: "editedBy", headerName: "Edited By", minWidth: 140, flex: 1 },
    { field: "editedAtDisplay", headerName: "Edited At", minWidth: 180, flex: 1 },
  ];

  const moduleName = module === "dtc" ? "DTC" : "ST";

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          data={data}
          columns={columns}
          search
          exportData
          hideFilter
          tableTitle={`${moduleName} ENERGY DAILY READING HISTORY`}
          headerActions={
            <Button variant="outlined" onClick={() => navigate(-1)}>
              Back
            </Button>
          }
        />
      </PageFrame>
    </div>
  );
};

export default EnergyDailyReadingHistory;