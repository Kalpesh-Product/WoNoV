import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { Chip, CircularProgress } from "@mui/material";
import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import WidgetSection from "../../../../components/WidgetSection";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import humanDate from "../../../../utils/humanDateForamt";
import humanTime from "../../../../utils/humanTime";

const normalize = (value) =>
  (value || "").toString().replace(/\s+/g, " ").trim().toLowerCase();

const getMemberCandidates = (item) => [
  item?.completedById,
  item?.completedByName,
  item?.completedBy,
];

const HrCompletedMemberKpaDetails = ({ kpaType, title }) => {
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
    queryKey: ["hrKpaDepartments"],
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
    queryKey: ["hrCompletedMemberKpa", departmentId, kpaType],
    enabled: !!departmentId,
    queryFn: async () => {
      if (kpaType === "INDIVIDUALKPA") {
        const [individualResponse, teamResponse] = await Promise.all([
          axios.get(
            `/api/performance/get-completed-tasks?dept=${departmentId}&type=INDIVIDUALKPA`,
          ),
          axios.get(
            `/api/performance/get-completed-tasks?dept=${departmentId}&type=TEAMKPA`,
          ),
        ]);

        return [
          ...(Array.isArray(individualResponse.data)
            ? individualResponse.data
            : []),
          ...(Array.isArray(teamResponse.data) ? teamResponse.data : []),
        ];
      }

      const response = await axios.get(
        `/api/performance/get-completed-tasks?dept=${departmentId}&type=${kpaType}`,
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
    const shouldShowAllTeamCompletedRows =
      kpaType === "TEAMKPA" && isSelectedMemberManager;
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
        hasSelectedMember &&
        !shouldShowAllTeamCompletedRows &&
        !getMemberCandidates(item).some(matchesSelectedMember)
      ) {
        return;
      }

      const key =
        item?.id?.toString?.() ||
        item?._id?.toString?.() ||
        `${item?.taskName || "kpa"}-${item?.completionDate || "no-date"}-${index}`;
      if (!uniqueRows.has(key)) uniqueRows.set(key, item);
    });

    return Array.from(uniqueRows.values()).map((item, index) => ({
      srno: index + 1,
      taskName: item?.taskName || item?.kpaName || item?.task || "-",
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
  }, [completedEntries, kpaType, selectedMember]);

  const columns = [
    { headerName: "Sr No", field: "srno", width: 100 },
    { headerName: "KPA List", field: "taskName", flex: 1 },
    { headerName: "Assigned Date", field: "assignedDate", flex: 1 },
    { headerName: "Completion Date", field: "completionDate", flex: 1 },
    { headerName: "Completion Time", field: "completionTime", flex: 1 },
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
    { headerName: "Completed By", field: "completedBy", flex: 1 },
  ];

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
          exportData
          checkAll={false}
        />
      </WidgetSection>
    </PageFrame>
  );
};

export default HrCompletedMemberKpaDetails;
