import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, CircularProgress } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";
import dayjs from "dayjs";

import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import WidgetSection from "../../../../components/WidgetSection";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import humanDate from "../../../../utils/humanDateForamt";
import humanTime from "../../../../utils/humanTime";
import { downloadCsv } from "../../../../utils/downloadCsv";

const normalize = (value) =>
  (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

const getMemberCandidates = (item) => [
  item?.assignToId,
  item?.assignedToId,
  item?.createdById,
  item?.managerId,
  item?.ownerId,
  item?.assignedTo,
  item?.assignTo,
  item?.createdBy,
  item?.createdByName,
  item?.managerName,
  item?.ownerName,
  item?.completedById,
  item?.completedByName,
  item?.completedBy,
];

const HrCompletedMemberKraDetails = ({ kraType, title }) => {
  const axios = useAxiosPrivate();
  const location = useLocation();
  const { department } = useParams();
  const selectedDepartment = useSelector(
    (state) => state.performance.selectedDepartment,
  );
  const selectedMemberFromStore = useSelector(
    (state) => state.performance.selectedMember,
  );
  const selectedMember = location.state?.selectedMember || selectedMemberFromStore;

  const { data: fetchedDepartments = [] } = useQuery({
    queryKey: ["hrKraDepartments"],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-depts-tasks");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const departmentId = useMemo(() => {
    const matchedDepartment = fetchedDepartments.find(
      (item) => item?.department?.name === department,
    );
    return matchedDepartment?.department?._id || selectedDepartment || "";
  }, [department, fetchedDepartments, selectedDepartment]);

  const { data: completedEntries = [], isLoading } = useQuery({
    queryKey: ["hrCompletedMemberKra", departmentId, kraType],
    enabled: !!departmentId,
    queryFn: async () => {
      const response = await axios.get(
        `/api/performance/get-completed-tasks?dept=${departmentId}&type=${kraType}`,
      );
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const completedRows = useMemo(() => {
    const selectedMemberId = normalize(selectedMember?.memberId);
    const selectedMemberName = normalize(selectedMember?.memberName);
    const hasSelectedMember = !!selectedMemberId || !!selectedMemberName;
    const isSelectedMemberManager = normalize(selectedMember?.memberRole).includes(
      "manager",
    );
    const matchesSelectedMember = (value) => {
      const candidate = normalize(value);
      return (
        !!candidate &&
        (candidate === selectedMemberId || candidate === selectedMemberName)
      );
    };

    const uniqueRows = new Map();
    completedEntries.forEach((item, index) => {
      if (
        kraType !== "KRA" &&
        hasSelectedMember &&
        !(kraType === "TEAMKRA" && isSelectedMemberManager) &&
        !getMemberCandidates(item).some(matchesSelectedMember)
      ) {
        return;
      }

      const key =
        item?.id?.toString?.() ||
        item?._id?.toString?.() ||
        `${item?.taskName || "kra"}-${item?.completionDate || "no-date"}-${index}`;
      if (!uniqueRows.has(key)) uniqueRows.set(key, item);
    });

    return Array.from(uniqueRows.values()).map((item, index) => ({
      srno: index + 1,
      taskName: item?.taskName || item?.kraName || item?.task || "-",
      assignedDate: item?.assignedDate,
      completionDateRaw:
        item?.completedDate || item?.completionDate || item?.dueDate,
      completionDate: humanDate(
        item?.completedDate || item?.completionDate || item?.dueDate,
      ),
      completionTime: humanTime(
        item?.completedDate ||
          item?.completionTime ||
          item?.completionDate ||
          item?.dueDate,
      ),
      status: item?.status || "Completed",
      completedBy: item?.completedByName || item?.completedBy || "-",
    }));
  }, [completedEntries, kraType, selectedMember]);

  const columns = [
    { headerName: "Sr No", field: "srno", width: 100 },
    { headerName: "KRA List", field: "taskName", flex: 1 },
    { headerName: "Assigned Date", field: "assignedDate", flex: 1 },
    { headerName: "Completion Date", field: "completionDate", flex: 1 },
    { headerName: "Completion Time", field: "completionTime", flex: 1 },
    { headerName: "Completed By", field: "completedBy", flex: 1 },
    {
      headerName: "Status",
      field: "status",
      flex: 1,
      cellRenderer: (params) => (
        <Chip
          label={params.value || "Completed"}
          style={{ backgroundColor: "#90EE90", color: "#006400" }}
        />
      ),
    },
  ];

  const handleDailyExport = () => {
    const todayRows = completedRows.filter((row) => {
      const completionDate = row?.completionDateRaw;
      if (!completionDate) return false;
      return dayjs(completionDate).isSame(dayjs(), "day");
    });

    const exportRows = todayRows
      .filter((row) => (row?.status || "").toString().toLowerCase() === "completed")
      .map((row, index) => ({
        "Sr No": index + 1,
        "KRA List": row?.taskName || "-",
        "Assigned Date": row?.assignedDate || "-",
        "Completion Date": row?.completionDate || "-",
        "Completion Time": row?.completionTime || "-",
        "Completed By": row?.completedBy || "-",
        Status: row?.status || "Completed",
      }));

    if (!exportRows.length) return;

    downloadCsv({
      data: exportRows,
      fileName: `daily-completed-kra-${dayjs().format("DD-MM-YYYY")}`,
    });
  };

  if (isLoading) {
    return (
      <div className="h-72 flex items-center justify-center">
        <CircularProgress />
      </div>
    );
  }

  return (
    <PageFrame>
      <WidgetSection padding>
        <YearWiseTable
          formatTime
          tableTitle={`COMPLETED - ${title} - ${selectedMember?.memberName || "Member"}`}
          data={completedRows}
          dateColumn="completionDateRaw"
          columns={columns}
          customExportTitle="Daily Export"
          handleCustomExport={handleDailyExport}
          exportButtonTitle="Monthly Export"
          exportData
          checkAll={false}
        />
      </WidgetSection>
    </PageFrame>
  );
};

export default HrCompletedMemberKraDetails;
