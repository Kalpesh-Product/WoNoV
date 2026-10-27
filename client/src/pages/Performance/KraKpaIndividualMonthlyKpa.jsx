import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Chip,
  CircularProgress,
  MenuItem,
  Popover,
  TextField,
} from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { DateRangePicker } from "react-date-range";
import {
  MdCalendarToday,
  MdChevronLeft,
  MdChevronRight,
  MdClose,
  MdDeleteForever,
  MdHistory,
} from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import { toast } from "sonner";
import dayjs from "dayjs";
import { getKraKpaEditHistory } from "../../utils/kraKpaEditHistory";
import { getPerformanceRowId } from "../../utils/performanceRowSelection";
import AgTable from "../../components/AgTable";
import PageFrame from "../../components/Pages/PageFrame";
import MuiModal from "../../components/MuiModal";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import ConfirmationModal from "../../components/ConfirmationModal";
import DetalisFormatted from "../../components/DetalisFormatted";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
  getCurrentFiscalYear,
  getFiscalMonthKey,
} from "./kraKpaIndividualKpaAdapter";

const currentMonth = () => dayjs().format("YYYY-MM");
const initialMonth = (selectedMonth, fiscalYear) =>
  getFiscalMonthKey(selectedMonth, fiscalYear) || currentMonth();
const monthRange = (month) => ({
  startDate: dayjs(`${month}-01`).toDate(),
  endDate: dayjs(`${month}-01`).endOf("month").toDate(),
  key: "selection",
});
const formatDate = (date) =>
  date && dayjs(date).isValid() ? dayjs(date).format("DD-MM-YYYY") : "-";
const formatDateTime = (date) =>
  date && dayjs(date).isValid()
    ? dayjs(date).format("DD-MM-YYYY, hh:mm A")
    : "-";
const formatUserName = (user) =>
  user && typeof user === "object"
    ? [user.firstName, user.middleName, user.lastName]
        .filter(Boolean)
        .join(" ") || "-"
    : "-";
const formatHistoryValue = (field, value) => {
  if (value === null || value === undefined || value === "") return "-";
  if (
    [
      "deadline",
      "managerRatingDate",
      "hrRatingDate",
      "verificationClosedDate",
    ].includes(field) &&
    dayjs(value).isValid()
  ) {
    return dayjs(value).format("DD-MM-YYYY");
  }
  if (field === "closingDate" && dayjs(value).isValid()) {
    return formatDateTime(value);
  }
  return String(value);
};
const emptySelfKra = () => ({
  category: "",
  title: "",
  lead: "",
  isActive: true,
});
const emptyForm = () => ({
  month: currentMonth(),
  target: "",
  deadline: "",
  managerComments: "",
  kpaRating: "",
  managerRatingDate: "",
  hrComments: "",
  hrRating: "",
  hrRatingDate: "",
  verification: "Pending",
  verificationDate: "",
  selfKras: [emptySelfKra()],
});

const KpaActionCell = ({
  data,
  node,
  onEdit,
  onHistory,
  onAction,
  isPending,
  canDelete,
  canEditActions,
  canComplete,
  showHistory,
}) => {
  const [selected, setSelected] = useState(() => Boolean(node.isSelected()));

  useEffect(() => {
    const syncSelection = () => setSelected(Boolean(node.isSelected()));
    syncSelection();
    node.addEventListener("rowSelected", syncSelection);
    return () => node.removeEventListener("rowSelected", syncSelection);
  }, [node]);

  const isInactive = data.isActive === false;
  const disabled = !selected || isPending || isInactive;
  const editDisabled = isPending || !selected;

  return (
    <div className="flex h-full items-center gap-2">
      {showHistory && (
        <button
          type="button"
          title="View Edit History"
          aria-label={`View edit history for ${data.target || data.title || "task"}`}
          disabled={!selected || isPending}
          onClick={() => onHistory(data)}
          className="flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed"
        >
          <MdHistory size={25} color={!selected || isPending ? "#9ca3af" : "#111827"} />
        </button>
      )}
      {data.status !== "Completed" && canComplete && (
        <PrimaryButton
          type="button"
          title="Mark As Done"
          handleSubmit={() => onAction("complete", data)}
          disabled={disabled}
          className="!px-2 !py-1 !text-xs !h-7 whitespace-nowrap"
        />
      )}
      {canEditActions && (
        <button
          type="button"
          title="Edit"
          aria-label={`Edit ${data.target || data.title || "Self KRA"}`}
          disabled={editDisabled}
          onClick={() => onEdit(data)}
          className="flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed"
        >
          <HiPencilSquare
            size={24}
            color={editDisabled ? "#9ca3af" : "#111827"}
          />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          title="Delete"
          aria-label={`Delete ${data.target || data.title || "Self KRA"}`}
          disabled={disabled}
          onClick={() => onAction("delete", data)}
          className="flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed"
        >
          <MdDeleteForever size={26} color={disabled ? "#9ca3af" : "red"} />
        </button>
      )}
    </div>
  );
};

const KraKpaIndividualMonthlyKpa = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const location = useLocation();
  const isSelfKra = location.pathname.toLowerCase().endsWith("/self-kra");
  const { auth } = useAuth();
  const selectedDepartment = useSelector(
    (state) => state.performance.selectedDepartment,
  );
  const selectedDepartmentName = useSelector(
    (state) => state.performance.selectedDepartmentName,
  );
  const selectedMember = useSelector(
    (state) => state.performance.selectedMember,
  );
  const isIndividualRoute = location.pathname.includes(
    "/kra-kpa/individual/",
  );
  const isEmployeeRoute = location.pathname.includes("/employee-KRA-KPA");
  const member = isEmployeeRoute || isIndividualRoute
    ? null
    : location.state?.selectedMember || selectedMember;
  const departmentId = isEmployeeRoute || isIndividualRoute
    ? auth?.user?.departments?.[0]?._id
    : location.state?.selectedDepartment ||
      selectedDepartment ||
      auth?.user?.departments?.[0]?._id;
  const employeeId = isEmployeeRoute
    ? auth?.user?._id
    : member?.memberId || auth?.user?._id;
  const employeeName =
    member?.memberName ||
    [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
      .filter(Boolean)
      .join(" ");
  const departmentName = isEmployeeRoute || isIndividualRoute
    ? auth?.user?.departments?.[0]?.name
    : location.state?.selectedDepartmentName ||
      selectedDepartmentName ||
      auth?.user?.departments?.find((item) => item._id === departmentId)?.name;
  const [dateRange, setDateRange] = useState(() =>
    monthRange(
      initialMonth(
        location.state?.month,
        location.state?.fiscalYear || getCurrentFiscalYear(),
      ),
    ),
  );
  const [selectedSelfKraDate, setSelectedSelfKraDate] = useState(() =>
    dayjs().startOf("day"),
  );
  const [calendarAnchor, setCalendarAnchor] = useState(null);
  const [editingRecord, setEditingRecord] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});
  const [modalOpen, setModalOpen] = useState(false);
  const [categoryModalOpen, setCategoryModalOpen] = useState(false);
  const [categoryName, setCategoryName] = useState("");
  const [categoryError, setCategoryError] = useState("");
  const [selectedSelfKras, setSelectedSelfKras] = useState([]);
  const [selectionResetKey, setSelectionResetKey] = useState(0);
  const [dailyLogTargets, setDailyLogTargets] = useState([]);
  const [dailyLogDate, setDailyLogDate] = useState(
    dayjs().format("YYYY-MM-DD"),
  );
  const [dailyLogDateError, setDailyLogDateError] = useState("");
  const [viewRecord, setViewRecord] = useState(null);
  const [historyRecord, setHistoryRecord] = useState(null);
  const [historyDateRange, setHistoryDateRange] = useState(() => monthRange(currentMonth()));
  const [historyCalendarAnchor, setHistoryCalendarAnchor] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [completionComment, setCompletionComment] = useState("");
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const isManager = roleTitles.some((role) => role.includes("manager"));
  const isTopManagement =
    roleTitles.includes("top management") ||
    auth?.user?.departments?.some(
      (department) =>
        department?.name?.trim().toLowerCase() === "top management",
    );
  const isHrUser = roleTitles.some((role) => /^hr(?:\s|$)/.test(role));
  const isEmployeeUser =
    roleTitles.some((role) => role.includes("employee")) &&
    !isManager &&
    !isTopManagement &&
    !isHrUser;
  const canSelectSelfKraLead = isManager || isTopManagement;
  const canManageOthers = roleTitles.some(
    (role) =>
      role.includes("manager") ||
      role.endsWith("admin") ||
      role === "hr employee",
  );
  const canEdit =
    String(employeeId) === String(auth?.user?._id) ||
    canManageOthers ||
    isTopManagement ||
    isHrUser;
  const canAddKraKpa =
    String(employeeId) === String(auth?.user?._id) ||
    isManager ||
    isTopManagement ||
    (isHrUser && !isSelfKra);
  const canAddKraCategory = isSelfKra;
  const isAssignedToLoggedInUser = (record) =>
    String(record?.employee?._id || record?.employee || "") ===
    String(auth?.user?._id || "");
  const isSelectedSelfKraToday = selectedSelfKraDate.isSame(dayjs(), "day");
  const canCompleteRecord = (record) =>
    !isSelfKra &&
    (!record?.approvalStatus || record.approvalStatus === "Approved") &&
    isAssignedToLoggedInUser(record);

  const refreshKpaQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["kraKpaIndividualMonthlyKpa"] });
    queryClient.invalidateQueries({ queryKey: ["kraKpaSelfKra"] });
    queryClient.invalidateQueries({ queryKey: ["kraKpaDailyLogs"] });
    queryClient.invalidateQueries({ queryKey: ["kraKpaKpaOverview"] });
    queryClient.invalidateQueries({
      queryKey: ["departmentWiseDepartmentKpaStats"],
    });
    queryClient.invalidateQueries({
      queryKey: ["performanceMemberWiseKraKpa"],
    });
  };

  const { data: records = [], isLoading } = useQuery({
    queryKey: [
      isSelfKra ? "kraKpaSelfKra" : "kraKpaIndividualMonthlyKpa",
      departmentId,
      employeeId,
      ...(isSelfKra ? [selectedSelfKraDate.format("YYYY-MM-DD")] : []),
    ],
    enabled: Boolean(departmentId && employeeId),
    queryFn: async () => {
      const response = await axios.get(
        isSelfKra
          ? "/api/kra-kpa/self-kra"
          : "/api/kra-kpa/individual-monthly-kpa",
        {
          params: {
            department: departmentId,
            employee: employeeId,
            ...(isSelfKra && {
              date: selectedSelfKraDate.format("YYYY-MM-DD"),
            }),
          },
        },
      );
      return response.data || [];
    },
  });

  const { data: leadOptions = [], isLoading: isLoadingLeads } = useQuery({
    queryKey: ["kraKpaSelfKraLeadOptions", departmentId],
    enabled: Boolean(isSelfKra && departmentId && canSelectSelfKraLead),
    queryFn: async () => {
      const response = await axios.get("/api/kra-kpa/self-kra/lead-options", {
        params: { department: departmentId },
      });
      return (response.data || []).map((user) => ({
        id: user._id,
        name:
          [user.firstName, user.middleName, user.lastName]
            .filter(Boolean)
            .join(" ") || user.empId,
        empId: user.empId,
      }));
    },
  });

  const { data: kraCategories = [], isLoading: isLoadingKraCategories } =
    useQuery({
      queryKey: ["kraCategories", departmentId],
      enabled: Boolean(isSelfKra && departmentId),
      queryFn: async () => {
        const response = await axios.get("/api/kra-kpa/self-kra-categories", {
          params: { department: departmentId },
        });
        return response.data || [];
      },
    });

  const addKraCategory = useMutation({
    mutationFn: async (categoryToCreate) => {
      const response = await axios.post("/api/kra-kpa/self-kra-categories", {
        department: departmentId,
        categoryName: categoryToCreate,
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["kraCategories", departmentId],
      });
      setCategoryModalOpen(false);
      setCategoryName("");
      setCategoryError("");
      toast.success("KRA category added");
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message || "Unable to add KRA category";
      setCategoryError(message);
      toast.error(message);
    },
  });

  const { data: reviewAccess } = useQuery({
    queryKey: ["kraKpaIndividualMonthlyKpaReviewAccess", departmentId],
    enabled: Boolean(departmentId && !isSelfKra),
    queryFn: async () => {
      const response = await axios.get(
        "/api/kra-kpa/individual-monthly-kpa/review-access",
        {
          params: { department: departmentId },
        },
      );
      return response.data;
    },
  });
  const canEditReview = Boolean(reviewAccess?.canEditReview);
  const canEditManagerReview = Boolean(reviewAccess?.canEditManagerReview);
  const canEditHrRating = Boolean(reviewAccess?.canEditHrRating);
  const showEmployeeCommentOnly = Boolean(
    editingRecord && isEmployeeUser,
  );
  const hideKpaCoreFields = showEmployeeCommentOnly;
  const { data: deleteAccess } = useQuery({
    queryKey: ["kraKpaDeleteAccess", departmentId],
    enabled: Boolean(departmentId),
    queryFn: async () => {
      const response = await axios.get("/api/kra-kpa/delete-access", {
        params: { department: departmentId },
      });
      return response.data;
    },
  });
  const canDelete = Boolean(deleteAccess?.canDelete);

  const saveRecord = useMutation({
    mutationFn: async (payload) => {
      if (editingRecord) {
        const response = await axios.patch(
          `/api/kra-kpa/${isSelfKra ? "self-kra" : "individual-monthly-kpa"}/${editingRecord._id}`,
          payload,
        );
        return response.data;
      }
      const response = await axios.post(
        `/api/kra-kpa/${isSelfKra ? "self-kra" : "individual-monthly-kpa"}`,
        {
          ...payload,
          department: departmentId,
          employee: employeeId,
        },
      );
      return response.data;
    },
    onSuccess: (savedRecord, payload) => {
      refreshKpaQueries();
      if (!isSelfKra && payload.month) setDateRange(monthRange(payload.month));
      setModalOpen(false);
      setEditingRecord(null);
      toast.success(
        isSelfKra
          ? "Self KRA saved"
          : savedRecord?.approvalStatus === "Pending Approval"
            ? "Self KPA submitted for approval"
            : "Self KPA saved",
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to save KPA");
    },
  });

  const performRowAction = useMutation({
    mutationFn: async ({ type, record, resourceComment }) => {
      if (type === "delete") {
        await axios.delete(
          `/api/kra-kpa/${isSelfKra ? "self-kra" : "individual-monthly-kpa"}/${record._id}`,
        );
      } else {
        await axios.patch(
          `/api/kra-kpa/${isSelfKra ? "self-kra" : "individual-monthly-kpa"}/${record._id}/complete`,
          isSelfKra
            ? { occurrenceDate: selectedSelfKraDate.format("YYYY-MM-DD") }
            : { resourceComment },
        );
      }
    },
    onSuccess: (_, { type }) => {
      refreshKpaQueries();
      setPendingAction(null);
      setCompletionComment("");
      setViewRecord(null);
      toast.success(
        type === "delete"
          ? `${isSelfKra ? "Self KRA" : "KPA"} deleted`
          : `${isSelfKra ? "Self KRA" : "KPA"} marked as done`,
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to update KPA");
    },
  });

  const addSelfKrasToDailyLogs = useMutation({
    mutationFn: async ({ records: selectedRecords, date }) => {
      const response = await axios.post("/api/kra-kpa/self-kra/daily-log", {
        selfKraIds: selectedRecords.map((record) => record._id),
        date,
      });
      return response.data;
    },
    onSuccess: (createdLogs) => {
      queryClient.invalidateQueries({ queryKey: ["kraKpaDailyLogs"] });
      queryClient.invalidateQueries({ queryKey: ["kraKpaSelfKra"] });
      setSelectedSelfKras([]);
      setSelectionResetKey((key) => key + 1);
      setDailyLogTargets([]);
      setDailyLogDate(dayjs().format("YYYY-MM-DD"));
      setDailyLogDateError("");
      toast.success(
        `${createdLogs.length} Self KRA${createdLogs.length === 1 ? "" : "s"} added to Daily Logs`,
      );
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Unable to add Self KRAs to Daily Logs",
      );
    },
  });

  const openRowAction = (type, record) => {
    setCompletionComment("");
    setPendingAction({ type, record });
  };

  const closeRowAction = () => {
    setPendingAction(null);
    setCompletionComment("");
  };

  const canScheduleSelfKra = (record) =>
    record?.isActive !== false &&
    !record?.isScheduled &&
    String(record?.lead?._id || record?.lead || "") ===
      String(auth?.user?._id || "");
  const canScheduleSelectedSelfKras =
    selectedSelfKras.length > 0 &&
    selectedSelfKras.every(canScheduleSelfKra);
  const dailyLogMinDate = dailyLogTargets.reduce((latest, record) => {
    const startsOn = record.startsOn || record.createdAt;
    if (!startsOn || !dayjs(startsOn).isValid()) return latest;
    const date = dayjs(startsOn).startOf("day");
    return !latest || date.isAfter(latest) ? date : latest;
  }, null);
  const openAddSelfKrasToDailyLogs = () => {
    if (!canScheduleSelectedSelfKras) return;
    const latestStartsOn = selectedSelfKras.reduce((latest, record) => {
      const startsOn = record.startsOn || record.createdAt;
      if (!startsOn || !dayjs(startsOn).isValid()) return latest;
      const date = dayjs(startsOn).startOf("day");
      return !latest || date.isAfter(latest) ? date : latest;
    }, null);
    const scheduleDay = selectedSelfKraDate.startOf("day");
    setDailyLogDate(
      latestStartsOn && scheduleDay.isBefore(latestStartsOn)
        ? latestStartsOn.format("YYYY-MM-DD")
        : scheduleDay.format("YYYY-MM-DD"),
    );
    setDailyLogDateError("");
    setDailyLogTargets(selectedSelfKras);
  };
  const submitSelfKrasToDailyLogs = (event) => {
    event.preventDefault();
    if (!dailyLogDate) {
      setDailyLogDateError("Schedule Date is required");
      return;
    }
    if (
      dailyLogMinDate &&
      dayjs(dailyLogDate).isBefore(dailyLogMinDate, "day")
    ) {
      setDailyLogDateError("Schedule Date cannot be before the KRA start date");
      return;
    }
    if (dailyLogTargets.length === 0) return;
    addSelfKrasToDailyLogs.mutate({
      records: dailyLogTargets,
      date: dailyLogDate,
    });
  };

  const confirmRowAction = () => {
    if (!pendingAction) return;
    performRowAction.mutate({
      ...pendingAction,
      resourceComment: completionComment.trim(),
    });
  };

  const openCreate = () => {
    setEditingRecord(null);
    setForm(emptyForm());
    setFormErrors({});
    setModalOpen(true);
  };
  const openCategoryModal = () => {
    setCategoryName("");
    setCategoryError("");
    setCategoryModalOpen(true);
  };
  const handleCategorySubmit = (event) => {
    event.preventDefault();
    const normalizedCategoryName = categoryName.trim().toLowerCase();
    if (!normalizedCategoryName) {
      setCategoryError("Category name is required");
      return;
    }
    if (
      kraCategories.some(
        (category) =>
          category.categoryName.trim().toLowerCase() === normalizedCategoryName,
      )
    ) {
      setCategoryError("This category already exists");
      return;
    }
    addKraCategory.mutate(categoryName.trim());
  };
  const openEdit = (record) => {
    if (!isSelfKra && isEmployeeUser) return;
    setEditingRecord(record);
    setFormErrors({});
    setForm({
      month: record.month,
      target: record.target,
      deadline: record.deadline
        ? dayjs(record.deadline).format("YYYY-MM-DD")
        : "",
      managerComments: record.managerComments || "",
      kpaRating:
        record.kpaRating === null || record.kpaRating === undefined
          ? ""
          : String(record.kpaRating),
      managerRatingDate: record.managerRatingDate
        ? dayjs(record.managerRatingDate).format("YYYY-MM-DD")
        : "",
      hrComments: record.hrComments || "",
      hrRating:
        record.hrRating === null || record.hrRating === undefined
          ? ""
          : String(record.hrRating),
      hrRatingDate: record.hrRatingDate
        ? dayjs(record.hrRatingDate).format("YYYY-MM-DD")
        : "",
      verification: record.verification || "Pending",
      verificationDate: record.verificationClosedDate
        ? dayjs(record.verificationClosedDate).format("YYYY-MM-DD")
        : "",
      selfKras: [
        {
          category: record.category?._id || record.category || "",
          title: record.title || "",
          lead: record.lead?._id || record.lead || "",
          isActive: record.isActive !== false,
        },
      ],
    });
    setModalOpen(true);
  };
  const openEditHistory = (record) => {
    const dates = getKraKpaEditHistory(record, isSelfKra ? "kra" : "kpa")
      .map((entry) => dayjs(entry.editedAt))
      .filter((date) => date.isValid())
      .sort((first, second) => first.valueOf() - second.valueOf());
    setHistoryDateRange({
      startDate: (dates[0] || dayjs()).startOf("day").toDate(),
      endDate: (dates[dates.length - 1] || dayjs()).endOf("day").toDate(),
      key: "selection",
    });
    setHistoryCalendarAnchor(null);
    setHistoryRecord(record);
  };
  const clearFormError = (field) =>
    setFormErrors((current) => ({ ...current, [field]: "" }));
  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    clearFormError(field);
  };
  const updateSelfKra = (index, field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      selfKras: current.selfKras.map((kra, kraIndex) =>
        kraIndex === index ? { ...kra, [field]: value } : kra,
      ),
    }));
    clearFormError(field);
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const selfKra = form.selfKras[0];
    const nextErrors = {};
    if (isSelfKra) {
      if (!selfKra.category) nextErrors.category = "Category is required";
      if (!selfKra.title.trim()) nextErrors.title = "Title is required";
      if (canSelectSelfKraLead && !selfKra.lead)
        nextErrors.lead = "Lead is required";
    } else if (!hideKpaCoreFields) {
      if (!form.month) nextErrors.month = "Month is required";
      if (!form.target.trim()) nextErrors.target = "KPA is required";
      if (!form.deadline) nextErrors.deadline = "Deadline is required";
    }
    if (
      !isSelfKra &&
      canEditManagerReview &&
      editingRecord?.status === "Completed" &&
      form.verification === "Changes Required" &&
      !form.managerComments.trim()
    ) {
      nextErrors.managerComments =
        "Manager Comments are required when changes are requested";
    }
    setFormErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;
    const payload = isSelfKra
      ? {
          category: selfKra.category,
          title: selfKra.title.trim(),
          ...(editingRecord && { isActive: selfKra.isActive }),
          ...(canSelectSelfKraLead && { lead: selfKra.lead }),
          ...(editingRecord && {
            occurrenceDate: selectedSelfKraDate.format("YYYY-MM-DD"),
          }),
        }
      : hideKpaCoreFields
        ? {}
        : {
            month: form.month,
            target: form.target.trim(),
            deadline: form.deadline,
          };
    if (editingRecord && !isSelfKra) {
      if (canEditManagerReview) {
        payload.managerComments = form.managerComments.trim();
        if (form.verification === "Closed") {
          payload.kpaRating = form.kpaRating;
          payload.managerRatingDate = form.managerRatingDate;
        }
        if (
          editingRecord.status === "Completed" &&
          form.verification !== "Pending"
        ) {
          payload.verification = form.verification;
          payload.verificationDate = form.verificationDate;
        }
      }
      if (canEditHrRating) {
        if (form.kpaRating) {
          payload.hrComments = form.hrComments.trim();
        }
        if (form.verification === "Closed") {
          payload.hrRating = form.hrRating;
          payload.hrRatingDate = form.hrRatingDate;
        }
      }
    }
    saveRecord.mutate(payload);
  };

  const { pendingTableData, completedTableData } = useMemo(() => {
    const mapRecords = (items) =>
      items.map((record, index) => ({
          ...record,
          srNo: index + 1,
          monthLabel: record.month
            ? dayjs(`${record.month}-01`).format("MMMM")
            : "-",
          deadlineLabel: formatDate(record.deadline),
          reviewStatus: record.verification || "Pending",
          finalClosure:
            record.hrRating === null || record.hrRating === undefined
              ? "Pending"
              : "Closed",
          approvalStatus: record.approvalStatus || "Approved",
          categoryName:
            record.category && typeof record.category === "object"
              ? record.category.categoryName || "-"
              : "-",
          activeStatus: record.isActive === false ? "Inactive" : "Active",
          leadName:
            record.lead && typeof record.lead === "object"
              ? [
                  record.lead.firstName,
                  record.lead.middleName,
                  record.lead.lastName,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                record.lead.empId ||
                "-"
              : record.lead || "-",
          assignedByName:
            record.createdBy && typeof record.createdBy === "object"
              ? [
                  record.createdBy.firstName,
                  record.createdBy.middleName,
                  record.createdBy.lastName,
                ]
                  .filter(Boolean)
                  .join(" ") ||
                record.createdBy.empId ||
                "-"
              : "-",
        }));
    const isInSelectedPeriod = (record) => {
      if (isSelfKra) {
        return true;
      }
      const recordStart = dayjs(`${record.month}-01`);
      const recordEnd = recordStart.endOf("month");
      return (
        recordStart.isBefore(dayjs(dateRange.endDate).endOf("day")) &&
        recordEnd.isAfter(dayjs(dateRange.startDate).startOf("day"))
      );
    };
    const belongsInCompletedTable = (record) => {
      if (isSelfKra) return record.status === "Completed";
      return (
        record.status === "Completed" &&
        record.hrRating !== null &&
        record.hrRating !== undefined
      );
    };
    const sortInactiveLast = (items) =>
      isSelfKra
        ? [...items].sort(
            (first, second) =>
              Number(first.isActive === false) -
              Number(second.isActive === false),
          )
        : items;

    return {
      pendingTableData: mapRecords(
        sortInactiveLast(
          records.filter(
            (record) =>
              !belongsInCompletedTable(record) && isInSelectedPeriod(record),
          ),
        ),
      ),
      completedTableData: mapRecords(
        sortInactiveLast(
          records.filter(
            (record) =>
              belongsInCompletedTable(record) && isInSelectedPeriod(record),
          ),
        ),
      ),
    };
  }, [records, dateRange, isSelfKra]);

  const statusColumn = {
    headerName: isSelfKra ? "Status" : "KPA Status",
    field: "status",
    width: 140,
    cellRenderer: ({ value }) => (
      <Chip
        size="small"
        label={value}
        sx={
          value === "Completed"
            ? { backgroundColor: "#d8f0df", color: "#16784d" }
            : { backgroundColor: "#ffedc9", color: "#ad7000" }
        }
      />
    ),
  };
  const workflowStatusRenderer = ({ value }) => (
    <Chip
      size="small"
      label={value || "Pending"}
      sx={
        value === "Closed"
          ? { backgroundColor: "#d8f0df", color: "#16784d" }
          : value === "Changes Required"
            ? { backgroundColor: "#fde2e2", color: "#b42318" }
            : { backgroundColor: "#ffedc9", color: "#ad7000" }
      }
    />
  );
  const approvalStatusColumn = {
    headerName: "Approvals",
    field: "approvalStatus",
    width: 180,
    cellRenderer: ({ value }) => (
      <Chip
        size="small"
        label={value || "Approved"}
        sx={
          value === "Rejected"
            ? { backgroundColor: "#fde2e2", color: "#b42318" }
            : value === "Pending Approval"
              ? { backgroundColor: "#ffedc9", color: "#ad7000" }
              : { backgroundColor: "#d8f0df", color: "#16784d" }
        }
      />
    ),
  };
  const reviewStatusColumn = {
    headerName: "Review Status",
    field: "reviewStatus",
    width: 180,
    cellRenderer: workflowStatusRenderer,
  };
  const finalClosureColumn = {
    headerName: "Final Closure",
    field: "finalClosure",
    width: 165,
    cellRenderer: workflowStatusRenderer,
  };
  const showActionColumn =
    (!isSelfKra || isSelectedSelfKraToday) && (canEdit || canDelete);
  const historyOnlyColumn = {
    headerName: "Actions",
    field: "historyActions",
    pinned: "right",
    width: 100,
    sortable: false,
    filter: false,
    cellRenderer: ({ data }) => (
      <div className="flex h-full items-center">
        <button
          type="button"
          title="View Edit History"
          aria-label={`View edit history for ${data.title || data.target || "task"}`}
          onClick={() => openEditHistory(data)}
          className="flex h-8 w-8 items-center justify-center"
        >
          <MdHistory size={25} color="#111827" />
        </button>
      </div>
    ),
  };
  const actionColumns = showActionColumn
    ? [
        {
          headerName: "Actions",
          field: "actions",
          pinned: "right",
          width: canDelete ? 230 : 190,
          sortable: false,
          filter: false,
          cellRenderer: ({ data, node }) => (
            <KpaActionCell
              data={data}
              node={node}
              onEdit={openEdit}
              onHistory={openEditHistory}
              onAction={openRowAction}
              isPending={performRowAction.isPending}
              canDelete={canDelete}
              canEditActions={
                canEdit &&
                (isSelfKra ? isSelectedSelfKraToday : !isEmployeeUser)
              }
              canComplete={canCompleteRecord(data)}
              showHistory
            />
          ),
        },
      ]
    : [];
  const individualKpaColumns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    {
      headerName: "KPA",
      field: "target",
      flex: 3,
      minWidth: 300,
      cellRenderer: ({ data, value }) => (
        <button
          type="button"
          className="text-left text-primary hover:underline"
          onClick={() => setViewRecord(data)}
        >
          {value}
        </button>
      ),
    },
    { headerName: "Deadline", field: "deadlineLabel", width: 165 },
    approvalStatusColumn,
    statusColumn,
    reviewStatusColumn,
    finalClosureColumn,
    ...actionColumns,
  ];
  const scheduledColumn = {
    headerName: "Scheduled",
    field: "isScheduled",
    width: 140,
    valueFormatter: ({ value }) => value ? "Yes" : "No",
    cellRenderer: ({ value }) => (
      <Chip
        size="small"
        label={value ? "Yes" : "No"}
        sx={value
          ? { backgroundColor: "#d8f0df", color: "#16784d" }
          : { backgroundColor: "#f3f4f6", color: "#4b5563" }}
      />
    ),
  };
  const selfKraColumns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    {
      headerName: "KRA Title",
      field: "title",
      minWidth: 240,
      flex: 1,
      cellRenderer: ({ data, value }) => (
        <button
          type="button"
          className="text-left text-primary hover:underline"
          onClick={() => setViewRecord(data)}
        >
          {value}
        </button>
      ),
    },
    { headerName: "Category", field: "categoryName", minWidth: 170, flex: 1 },
    { headerName: "Lead", field: "leadName", minWidth: 180, flex: 1 },
    {
      headerName: "Assigned By",
      field: "assignedByName",
      minWidth: 180,
      flex: 1,
    },
    scheduledColumn,
    { headerName: "Active Status", field: "activeStatus", width: 150 },
    statusColumn,
    ...(actionColumns.length ? actionColumns : [{
      ...historyOnlyColumn,
      cellRenderer: ({ data, node }) => (
        <KpaActionCell data={data} node={node} onHistory={openEditHistory} showHistory />
      ),
    }]),
  ];
  const columns = isSelfKra ? selfKraColumns : individualKpaColumns;
  const completedColumns = isSelfKra
    ? [
        { headerName: "Sr No", field: "srNo", width: 85 },
        {
          headerName: "KRA Title",
          field: "title",
          minWidth: 240,
          flex: 1,
          cellRenderer: ({ data, value }) => (
            <button
              type="button"
              className="text-left text-primary hover:underline"
              onClick={() => setViewRecord(data)}
            >
              {value}
            </button>
          ),
        },
        { headerName: "Category", field: "categoryName", minWidth: 170, flex: 1 },
        { headerName: "Lead", field: "leadName", minWidth: 180, flex: 1 },
        {
          headerName: "Assigned By",
          field: "assignedByName",
          minWidth: 180,
          flex: 1,
        },
        scheduledColumn,
        { headerName: "Active Status", field: "activeStatus", width: 150 },
        {
          headerName: "Completed Date",
          field: "closingDate",
          width: 220,
          valueFormatter: ({ value }) => formatDateTime(value),
        },
        historyOnlyColumn,
      ]
    : [
        { headerName: "Sr No", field: "srNo", width: 85 },
        {
          headerName: "KPA",
          field: "target",
          minWidth: 300,
          flex: 2,
          cellRenderer: ({ data, value }) => (
            <button
              type="button"
              className="text-left text-primary hover:underline"
              onClick={() => setViewRecord(data)}
            >
              {value}
            </button>
          ),
        },
        { headerName: "Deadline", field: "deadlineLabel", width: 165 },
        approvalStatusColumn,
        {
          headerName: "Completed Date",
          field: "closingDate",
          width: 220,
          valueFormatter: ({ value }) => formatDateTime(value),
        },
        {
          headerName: "Resource Comment",
          field: "resourceComment",
          minWidth: 240,
          flex: 1,
        },
        statusColumn,
        reviewStatusColumn,
        finalClosureColumn,
        {
          headerName: "Actions",
          field: "completedActions",
          pinned: "right",
          width: 100,
          sortable: false,
          filter: false,
          cellRenderer: ({ data }) => (
            <div className="flex h-full items-center">
              <button
                type="button"
                title="View Edit History"
                aria-label={`View edit history for ${data.target || "KPA"}`}
                onClick={() => openEditHistory(data)}
                className="flex h-8 w-8 items-center justify-center"
              >
                <MdHistory size={25} color="#111827" />
              </button>
            </div>
          ),
        },
      ];
  const managerReviewTimeline = (() => {
    const history = Array.isArray(viewRecord?.managerReviewHistory)
      ? viewRecord.managerReviewHistory
      : [];
    if (history.length > 0) return history;
    if (!viewRecord?.managerReviewedAt) return [];
    return [
      {
        status: viewRecord.verification || "Pending",
        reviewedBy: viewRecord.managerReviewedBy || viewRecord.verifiedBy,
        reviewedAt: viewRecord.managerReviewedAt,
        managerComments: viewRecord.managerComments || "",
      },
    ];
  })();
  const completionTimeline = (() => {
    const history = Array.isArray(viewRecord?.completionHistory)
      ? viewRecord.completionHistory
      : [];
    if (history.length > 0) return history;
    if (!viewRecord?.closingDate) return [];
    return [
      {
        completedBy: viewRecord.createdBy,
        completedAt: viewRecord.closingDate,
        resourceComment: viewRecord.resourceComment || "",
      },
    ];
  })();
  const editHistoryEntries = getKraKpaEditHistory(historyRecord, isSelfKra ? "kra" : "kpa")
    .filter((entry) => {
      const editedAt = dayjs(entry.editedAt);
      return !editedAt.isBefore(dayjs(historyDateRange.startDate), "day") &&
        !editedAt.isAfter(dayjs(historyDateRange.endDate), "day");
    })
    .map((entry, index) => ({
      ...entry,
      srNo: index + 1,
      historyKey: String(entry._id || `${entry.editedAt}-${index}`),
    }));
  const editHistoryRows = editHistoryEntries.flatMap((entry) =>
    (entry.changes || []).filter((change) => {
      if (isSelfKra) return true;
      // Omit dependent status/date/rating resets from older history entries.
      if (change.field === "closingDate") return false;
      if (change.field === "status") return change.newValue === "Completed";
      if (change.field === "verification" && change.newValue === "Pending") return false;
      const requestsChanges = entry.changes?.some(
        (item) => item.field === "verification" && item.newValue === "Changes Required",
      );
      if (requestsChanges && ["verificationClosedDate", "kpaRating", "managerRatingDate", "hrRating", "hrRatingDate"].includes(change.field) && change.newValue == null) return false;
      return true;
    }).map((change, index) => ({
      ...entry,
      change,
      rowKey: `${entry.historyKey}-${index}`,
    })),
  );

  return (
    <PageFrame>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-pmedium uppercase text-primary">
          {departmentName ? `${departmentName} - ` : ""}
          {employeeName}
        </h1>
        {!isLoading && isSelfKra && <div className="flex flex-wrap items-center justify-end gap-3">
          {canAddKraCategory && <PrimaryButton type="button" title="Add Category" handleSubmit={openCategoryModal} />}
          {canAddKraKpa && <PrimaryButton type="button" title="Add Self KRA" handleSubmit={openCreate} />}
          <PrimaryButton
            type="button"
            title={`Add to Daily Logs (${selectedSelfKras.length})`}
            handleSubmit={openAddSelfKrasToDailyLogs}
            disabled={!canScheduleSelectedSelfKras || addSelfKrasToDailyLogs.isPending}
            className="!w-[230px]"
          />
        </div>}
      </div>
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <AgTable
          headerActions={
            !isSelfKra && canAddKraKpa && <PrimaryButton type="button" title="Add Self KPA" handleSubmit={openCreate} />
          }
          toolbarDateControls={
            <>
              {!isSelfKra && <>
                      <div className="flex items-center justify-center gap-2">
                        <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
                          {dayjs(dateRange.startDate).format("DD MMM YYYY")}
                        </div>
                        <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
                          {dayjs(dateRange.endDate).format("DD MMM YYYY")}
                        </div>
                        <button type="button" aria-label="Select date range" className="rounded-md bg-primary p-3 text-white" onClick={event => setCalendarAnchor(event.currentTarget)}>
                          <MdCalendarToday size={20} />
                        </button>
                      </div>
                      <Popover open={Boolean(calendarAnchor)} anchorEl={calendarAnchor} onClose={() => setCalendarAnchor(null)} anchorOrigin={{
                  vertical: "bottom",
                  horizontal: "center"
                }} transformOrigin={{
                  vertical: "top",
                  horizontal: "center"
                }}>
                        <DateRangePicker ranges={[dateRange]} onChange={({
                    selection
                  }) => setDateRange(selection)} moveRangeOnFirstSelection={false} direction="vertical" />
                      </Popover>
                    </>}
              {isSelfKra && <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <div className="flex items-center justify-center gap-3">
                        <button type="button" aria-label="Previous day" onClick={() => setSelectedSelfKraDate(date => date.subtract(1, "day"))} className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90">
                          <MdChevronLeft size={22} />
                        </button>
                        <DatePicker format="ddd, MMMM D, YYYY" value={selectedSelfKraDate} onChange={date => {
                    if (date?.isValid()) setSelectedSelfKraDate(date.startOf("day"));
                  }} slotProps={{
                    textField: {
                      size: "small",
                      sx: {
                        width: 245,
                        "& .MuiOutlinedInput-root": {
                          borderRadius: "6px",
                          height: 38
                        },
                        "& .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1e3d73"
                        },
                        "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1e3d73"
                        },
                        "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
                          borderColor: "#1e3d73"
                        },
                        "& .MuiInputBase-input": {
                          color: "#111827",
                          fontSize: "0.875rem"
                        },
                        "& .MuiSvgIcon-root": {
                          color: "#1e3d73"
                        }
                      }
                    }
                  }} />
                        <button type="button" aria-label="Next day" onClick={() => setSelectedSelfKraDate(date => date.add(1, "day"))} className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90">
                          <MdChevronRight size={22} />
                        </button>
                      </div>
                    </LocalizationProvider>}
            </>
          }
          showDateControls={false}
          data={pendingTableData}
          getRowId={getPerformanceRowId}
          selectionResetKey={selectionResetKey}
          columns={columns}
          hideTitle
          enableCheckbox
          checkAll={isSelfKra}
          getRowStyle={({ data }) =>
            isSelfKra && (data?.isActive === false || data?.isScheduled)
              ? { backgroundColor: "#f3f4f6", color: "#9ca3af" }
              : undefined
          }
          search
          onSelectionChange={isSelfKra ? setSelectedSelfKras : undefined}
          exportData
          hideFilter={false}
          processExportCell={({ value }) => value ?? ""}
          tableHeight={Math.max(
            300,
            Math.min(650, pendingTableData.length * 58 + 90),
          )}
        />
      )}

      <div className="mt-6">
        <AgTable
          showDateControls={false}
          data={completedTableData}
          columns={completedColumns}
          tableTitle={`COMPLETED ${isSelfKra ? "SELF KRA" : "SELF KPA"}`}
          search
          exportData
          hideFilter={false}
          getRowStyle={({ data }) =>
            isSelfKra && (data?.isActive === false || data?.isScheduled)
              ? { backgroundColor: "#f3f4f6", color: "#9ca3af" }
              : undefined
          }
          processExportCell={({ value }) => value ?? ""}
          tableHeight={Math.max(
            300,
            Math.min(650, completedTableData.length * 58 + 90),
          )}
        />
      </div>

      <MuiModal
        open={dailyLogTargets.length > 0}
        onClose={() => {
          setDailyLogTargets([]);
          setDailyLogDateError("");
        }}
        title="Add to Daily Logs"
        widthClass="w-[92vw] max-w-[680px]"
      >
        <form
          className="grid gap-4"
          onSubmit={submitSelfKrasToDailyLogs}
          noValidate
        >
          <div>
            <div className="mb-2 text-sm font-medium text-primary">
              Selected KRAs ({dailyLogTargets.length})
            </div>
            <div className="max-h-52 space-y-2 overflow-y-auto rounded-lg border border-gray-200 bg-gray-50 p-3">
              {dailyLogTargets.map((record, index) => (
                <div
                  key={record._id}
                  className="flex items-start justify-between gap-3 rounded-md bg-white px-3 py-2"
                >
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-50 text-xs font-medium text-primary">
                    {index + 1}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="font-medium text-gray-800">
                      {record.title}
                    </div>
                    <div className="mt-0.5 text-xs text-gray-500">
                      {record.categoryName || "Self KRA"}
                    </div>
                  </div>
                  <button
                    type="button"
                    title="Remove Self KRA"
                    aria-label={`Remove ${record.title}`}
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-gray-500 hover:bg-red-50 hover:text-red-600"
                    onClick={() =>
                      setDailyLogTargets((current) =>
                        current.filter((item) => item._id !== record._id),
                      )
                    }
                  >
                    <MdClose size={20} />
                  </button>
                </div>
              ))}
            </div>
          </div>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Schedule Date *"
              format="DD-MM-YYYY"
              value={dailyLogDate ? dayjs(dailyLogDate) : null}
              minDate={dailyLogMinDate || undefined}
              onChange={(date) => {
                setDailyLogDate(
                  date?.isValid() ? date.format("YYYY-MM-DD") : "",
                );
                setDailyLogDateError("");
              }}
              slotProps={{
                textField: {
                  size: "small",
                  fullWidth: true,
                  error: Boolean(dailyLogDateError),
                  helperText: dailyLogDateError,
                },
              }}
            />
          </LocalizationProvider>
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Cancel"
              handleSubmit={() => {
                setDailyLogTargets([]);
                setDailyLogDateError("");
              }}
            />
            <PrimaryButton
              type="submit"
              title="Add Daily Logs"
              isLoading={addSelfKrasToDailyLogs.isPending}
              disabled={addSelfKrasToDailyLogs.isPending}
            />
          </div>
        </form>
      </MuiModal>

      <MuiModal
        open={Boolean(viewRecord)}
        onClose={() => setViewRecord(null)}
        title={
          isSelfKra ? "Self KRA Details" : "Self KPA Details"
        }
        widthClass="w-[92vw] max-w-[680px]"
      >
        {viewRecord && (
          <div className="space-y-2 py-2">
            {isSelfKra ? (
              <>
                <div className="font-bold">KRA Details</div>
                <DetalisFormatted title="KRA Title" detail={viewRecord.title} />
                <DetalisFormatted
                  title="Approved By"
                  detail={formatUserName(viewRecord.approvedBy)}
                />
                <DetalisFormatted
                  title="Category"
                  detail={viewRecord.categoryName || "-"}
                />
                <DetalisFormatted
                  title="Lead"
                  detail={viewRecord.leadName || "-"}
                />
                <DetalisFormatted
                  title="Assigned By"
                  detail={viewRecord.assignedByName || "-"}
                />
                <DetalisFormatted
                  title="Active Status"
                  detail={viewRecord.activeStatus}
                />
                <DetalisFormatted title="Status" detail={viewRecord.status} />
                {viewRecord.approvalStatus === "Rejected" && (
                  <>
                    <DetalisFormatted title="Rejected By" detail={formatUserName(viewRecord.rejectedBy)} />
                    <DetalisFormatted title="Rejected On" detail={formatDateTime(viewRecord.rejectedAt)} />
                  </>
                )}
                <DetalisFormatted
                  title="Closing Date"
                  detail={formatDateTime(viewRecord.closingDate)}
                />
                {viewRecord.status === "Completed" && (
                  <>
                    <DetalisFormatted
                      title="Start Time"
                      detail={
                        viewRecord.startTime
                          ? dayjs(viewRecord.startTime).format("hh:mm A")
                          : "-"
                      }
                    />
                    <DetalisFormatted
                      title="End Time"
                      detail={
                        viewRecord.endTime
                          ? dayjs(viewRecord.endTime).format("hh:mm A")
                          : "-"
                      }
                    />
                  </>
                )}
              </>
            ) : (
              <>
                <div className="font-bold">KPA Details</div>
                <DetalisFormatted
                  title="Month"
                  detail={dayjs(`${viewRecord.month}-01`).format("MMMM YYYY")}
                />
                <DetalisFormatted
                  title="KPA"
                  detail={viewRecord.target}
                />
                <DetalisFormatted
                  title="Assigned By"
                  detail={viewRecord.assignedByName || "-"}
                />
                <DetalisFormatted
                  title="Assigned On"
                  detail={formatDateTime(viewRecord.createdAt)}
                />
                <DetalisFormatted
                  title="Deadline"
                  detail={formatDate(viewRecord.deadline)}
                />
                <DetalisFormatted
                  title="Approval"
                  detail={viewRecord.approvalStatus || "Approved"}
                />
                <DetalisFormatted
                  title="Approved By"
                  detail={formatUserName(viewRecord.approvedBy)}
                />
                <DetalisFormatted
                  title="Approved On"
                  detail={formatDateTime(viewRecord.approvedAt)}
                />
                <DetalisFormatted title="Status" detail={viewRecord.status} />
                <DetalisFormatted
                  title="Closing Date"
                  detail={formatDateTime(viewRecord.closingDate)}
                />
                <DetalisFormatted
                  title="Delayed Days"
                  detail={viewRecord.delayedDays || 0}
                />
                <div className="text-content flex w-full items-start">
                  <span className="w-[50%]">Completion Timeline</span>
                  <span>:</span>
                  <div className="flex w-full flex-col items-start justify-start gap-2 pl-4">
                    {completionTimeline.length > 0 ? (
                      completionTimeline.map((completion, index) => (
                        <div
                          key={
                            completion._id ||
                            `${completion.completedAt}-${index}`
                          }
                        >
                          <div className="text-borderGray">
                            {formatDateTime(completion.completedAt)}
                          </div>
                          {completion.resourceComment && (
                            <div className="text-gray-600">
                              {completion.resourceComment}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-borderGray">
                        No completion history
                      </div>
                    )}
                  </div>
                </div>

                <br />
                <div className="font-bold">Manager Review</div>
                <DetalisFormatted
                  title="Closed On"
                  detail={formatDate(viewRecord.verificationClosedDate)}
                />
                <div className="text-content flex w-full items-start">
                  <span className="w-[50%]">Review Status Timeline</span>
                  <span>:</span>
                  <div className="flex w-full flex-col items-start justify-start gap-2 pl-4">
                    {managerReviewTimeline.length > 0 ? (
                      managerReviewTimeline.map((review, index) => (
                        <div
                          key={review._id || `${review.status}-${review.reviewedAt}-${index}`}
                        >
                          <div className="font-medium">{review.status}</div>
                          <div>{formatUserName(review.reviewedBy)}</div>
                          <div className="text-borderGray">
                            {formatDateTime(review.reviewedAt)}
                          </div>
                          {review.managerComments && (
                            <div className="text-gray-600">
                              {review.managerComments}
                            </div>
                          )}
                        </div>
                      ))
                    ) : (
                      <div className="text-borderGray">
                        No review status history
                      </div>
                    )}
                  </div>
                </div>
                <DetalisFormatted
                  title="Manager Rating"
                  detail={
                    viewRecord.kpaRating === null ||
                    viewRecord.kpaRating === undefined
                      ? "Not rated"
                      : String(viewRecord.kpaRating)
                  }
                />
                <br />
                <div className="font-bold">HR Review</div>
                <DetalisFormatted
                  title="HR Comments"
                  detail={viewRecord.hrComments || "-"}
                />
                <DetalisFormatted
                  title="HR Rating"
                  detail={
                    viewRecord.hrRating === null ||
                    viewRecord.hrRating === undefined
                      ? "Not rated"
                      : String(viewRecord.hrRating)
                  }
                />
              </>
            )}
          </div>
        )}
      </MuiModal>

      <MuiModal
        open={Boolean(historyRecord)}
        onClose={() => {
          setHistoryRecord(null);
          setHistoryCalendarAnchor(null);
        }}
        title={isSelfKra ? historyRecord?.title || "KRA" : historyRecord?.target || "KPA"}
        widthClass="w-[calc(100vw-2rem)] max-w-[960px]"
      >
        <div className="mb-4 flex flex-wrap items-center justify-center gap-2">
          <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
            {dayjs(historyDateRange.startDate).format("DD MMM YYYY")}
          </div>
          <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
            {dayjs(historyDateRange.endDate).format("DD MMM YYYY")}
          </div>
          <button
            type="button"
            aria-label="Select edit history date range"
            className="rounded-md bg-primary p-3 text-white"
            onClick={(event) => setHistoryCalendarAnchor(event.currentTarget)}
          >
            <MdCalendarToday size={20} />
          </button>
        </div>
        <Popover
          open={Boolean(historyCalendarAnchor)}
          anchorEl={historyCalendarAnchor}
          onClose={() => setHistoryCalendarAnchor(null)}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
          transformOrigin={{ vertical: "top", horizontal: "center" }}
        >
          <DateRangePicker
            ranges={[historyDateRange]}
            onChange={({ selection }) => setHistoryDateRange(selection)}
            moveRangeOnFirstSelection={false}
            direction="vertical"
          />
        </Popover>
        <div className="max-h-[65vh] overflow-auto rounded-md border border-borderGray">
          <table className="w-full min-w-[760px] border-collapse text-left text-sm">
            <thead className="sticky top-0 bg-gray-50 text-primary">
              <tr>
                <th className="border-b px-4 py-3">Sr No</th>
                <th className="border-b px-4 py-3">Edited On</th>
                <th className="border-b px-4 py-3">Edited By</th>
                <th className="border-b px-4 py-3">Field</th>
                <th className="border-b px-4 py-3">Previous Value</th>
                <th className="border-b px-4 py-3">New Value</th>
              </tr>
            </thead>
            <tbody>
              {editHistoryRows.length > 0 ? (
                editHistoryRows.map((entry, index) => (
                  <tr key={entry.rowKey}>
                    <td className="border-b px-4 py-3 align-top">{index + 1}</td>
                    <td className="whitespace-nowrap border-b px-4 py-3 align-top">{formatDateTime(entry.editedAt)}</td>
                    <td className="border-b px-4 py-3 align-top">{formatUserName(entry.editedBy)}</td>
                    <td className="border-b px-4 py-3 align-top font-medium">{entry.change.label}</td>
                    <td className="whitespace-pre-wrap break-words border-b px-4 py-3 align-top">{formatHistoryValue(entry.change.field, entry.change.oldValue)}</td>
                    <td className="whitespace-pre-wrap break-words border-b px-4 py-3 align-top">{formatHistoryValue(entry.change.field, entry.change.newValue)}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan={6}
                    className="px-4 py-10 text-center text-borderGray"
                  >
                    {getKraKpaEditHistory(historyRecord, isSelfKra ? "kra" : "kpa").length
                      ? "No edit history found for the selected dates"
                      : "No edit history available"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </MuiModal>

      <ConfirmationModal
        open={Boolean(pendingAction)}
        onClose={closeRowAction}
        onConfirm={confirmRowAction}
        title={
          pendingAction?.type === "delete"
            ? `Delete ${isSelfKra ? "Self KRA" : "KPA"}`
            : `Mark ${isSelfKra ? "Self KRA" : "KPA"} as Done`
        }
        message={
          pendingAction?.type === "delete"
            ? `Are you sure you want to delete this ${isSelfKra ? "Self KRA" : "KPA"}?`
            : `Mark this ${isSelfKra ? "Self KRA" : "KPA"} as completed?${isSelfKra ? "" : " It will be submitted for review."}`
        }
        confirmText={
          pendingAction?.type === "delete" ? "Delete" : "Mark as Done"
        }
        cancelText={pendingAction?.type === "complete" ? "Cancel" : "No"}
        cancelFirst={pendingAction?.type === "complete"}
        confirmDisabled={
          pendingAction?.type === "complete" &&
          !canCompleteRecord(pendingAction.record)
        }
        isLoading={performRowAction.isPending}
      >
        {pendingAction?.type === "complete" && !isSelfKra && (
          <TextField
            label="Resource Comment"
            size="small"
            multiline
            minRows={3}
            value={completionComment}
            onChange={(event) => setCompletionComment(event.target.value)}
            disabled={!canCompleteRecord(pendingAction.record)}
            helperText={
              canCompleteRecord(pendingAction.record)
                ? ""
                : "Only the assigned employee can complete it"
            }
            inputProps={{ maxLength: 5000 }}
            fullWidth
          />
        )}
      </ConfirmationModal>

      <MuiModal
        open={categoryModalOpen}
        onClose={() => {
          setCategoryModalOpen(false);
          setCategoryName("");
          setCategoryError("");
        }}
        title="Add KRA Category"
        widthClass="w-[92vw] max-w-[430px]"
      >
        <form onSubmit={handleCategorySubmit} className="grid gap-4">
          <TextField
            fullWidth
            label="Category Name *"
            size="small"
            value={categoryName}
            disabled={isLoadingKraCategories || addKraCategory.isPending}
            onChange={(event) => {
              setCategoryName(event.target.value);
              setCategoryError("");
            }}
            error={Boolean(categoryError)}
            helperText={categoryError}
            inputProps={{ maxLength: 200 }}
            autoFocus
          />
          <div>
            <div className="mb-2 text-sm font-medium text-primary">Existing Categories</div>
            {isLoadingKraCategories ? (
              <div className="text-sm text-gray-500">Loading categories...</div>
            ) : kraCategories.length ? (
              <ul className="max-h-48 divide-y divide-gray-100 overflow-y-auto rounded-md border border-borderGray">
                {kraCategories.map((category) => (
                  <li key={category._id} className="break-words px-3 py-2 text-sm text-gray-700">
                    {category.categoryName}
                  </li>
                ))}
              </ul>
            ) : (
              <div className="text-sm text-gray-500">No categories added yet.</div>
            )}
          </div>
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Close"
              handleSubmit={() => {
                setCategoryModalOpen(false);
                setCategoryName("");
                setCategoryError("");
              }}
            />
            <PrimaryButton
              type="submit"
              title="Save"
              isLoading={addKraCategory.isPending}
              disabled={isLoadingKraCategories || addKraCategory.isPending}
            />
          </div>
        </form>
      </MuiModal>

      <MuiModal
        open={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setFormErrors({});
        }}
        title={
          editingRecord
            ? isSelfKra
              ? "Self KRA"
              : "Self KPA"
            : isSelfKra
              ? "Add Self KRA"
              : "Add Self KPA"
        }
        widthClass="w-[92vw] max-w-[680px]"
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          {isSelfKra ? (
            <>
              <TextField
                label="Category *"
                select
                size="small"
                value={form.selfKras[0].category}
                onChange={updateSelfKra(0, "category")}
                error={Boolean(formErrors.category)}
                helperText={formErrors.category}
                disabled={isLoadingKraCategories}
              >
                <MenuItem value="" disabled>
                  {isLoadingKraCategories
                    ? "Loading categories..."
                    : "Select Category"}
                </MenuItem>
                {kraCategories.length ? (
                  kraCategories.map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.categoryName}
                    </MenuItem>
                  ))
                ) : (
                  <MenuItem value="no-categories" disabled>
                    No categories found
                  </MenuItem>
                )}
              </TextField>
              <TextField
                label="Title *"
                size="small"
                value={form.selfKras[0].title}
                onChange={updateSelfKra(0, "title")}
                error={Boolean(formErrors.title)}
                helperText={formErrors.title}
                inputProps={{ maxLength: 300 }}
              />
              {editingRecord && (
                <TextField
                  label="Active Status *"
                  select
                  size="small"
                  value={form.selfKras[0].isActive ? "active" : "inactive"}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      selfKras: current.selfKras.map((kra, index) =>
                        index === 0
                          ? { ...kra, isActive: event.target.value === "active" }
                          : kra,
                      ),
                    }))
                  }
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              )}
              {canSelectSelfKraLead && (
                <TextField
                  label="Lead *"
                  select
                  size="small"
                  value={form.selfKras[0].lead}
                  onChange={updateSelfKra(0, "lead")}
                  error={Boolean(formErrors.lead)}
                  helperText={formErrors.lead}
                  disabled={isLoadingLeads}
                >
                  <MenuItem value="" disabled>
                    {isLoadingLeads ? "Loading active users..." : "Select Lead"}
                  </MenuItem>
                  {leadOptions.length
                    ? leadOptions.map((user) => (
                        <MenuItem key={user.id} value={user.id}>
                          {user.name}
                          {user.empId ? ` (${user.empId})` : ""}
                        </MenuItem>
                      ))
                    : !isLoadingLeads && (
                        <MenuItem value="no-active-users" disabled>
                          No active users found in this department
                        </MenuItem>
                      )}
                </TextField>
              )}
            </>
          ) : (
            <section
              className={
                isEmployeeUser
                  ? "grid gap-4"
                  : "grid gap-4 rounded-md border border-borderGray p-4"
              }
            >
              {editingRecord && (
                <h3 className="text-content font-pmedium uppercase text-primary">
                  KPA Details
                </h3>
              )}
              {!showEmployeeCommentOnly && (
                <>
                  {editingRecord && (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Month *"
                        views={["year", "month"]}
                        format="MMMM YYYY"
                        value={form.month ? dayjs(`${form.month}-01`) : null}
                        disabled
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                  <TextField
                    label="KPA *"
                    size="small"
                    multiline
                    minRows={2}
                    value={form.target}
                    onChange={updateForm("target")}
                    disabled={!canEdit}
                    error={Boolean(formErrors.target)}
                    helperText={formErrors.target}
                  />
                  <LocalizationProvider dateAdapter={AdapterDayjs}>
                    <DatePicker
                      label="Deadline *"
                      format="DD-MM-YYYY"
                      value={form.deadline ? dayjs(form.deadline) : null}
                      onChange={(date) => {
                        setForm((current) => ({
                          ...current,
                          deadline: date?.isValid()
                            ? date.format("YYYY-MM-DD")
                            : "",
                        }));
                        clearFormError("deadline");
                      }}
                      disabled={!canEdit}
                      slotProps={{
                        textField: {
                          size: "small",
                          fullWidth: true,
                          error: Boolean(formErrors.deadline),
                          helperText: formErrors.deadline,
                        },
                      }}
                    />
                  </LocalizationProvider>
                </>
              )}
            </section>
          )}
          {!isSelfKra && editingRecord && canEditReview && (
            <>
              {canEditManagerReview && (
                <section className="grid gap-4 rounded-md border border-borderGray p-4">
                  <h3 className="text-content font-pmedium uppercase text-primary">
                    Manager Review
                  </h3>
                  <TextField
                    label="Review Status"
                    select
                    size="small"
                    value={
                      form.verification === "Pending" ? "" : form.verification
                    }
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        verification: event.target.value,
                        verificationDate:
                          event.target.value === "Closed"
                            ? current.verificationDate ||
                              dayjs().format("YYYY-MM-DD")
                            : "",
                      }))
                    }
                    disabled={editingRecord.status !== "Completed"}
                    InputLabelProps={{ shrink: true }}
                    SelectProps={{
                      displayEmpty: true,
                      renderValue: (value) => value || "Pending",
                    }}
                  >
                    <MenuItem value="Changes Required">
                      Changes Required
                    </MenuItem>
                    <MenuItem value="Closed">Closed</MenuItem>
                  </TextField>
                  {form.verification === "Closed" && (
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <DatePicker
                        label="Closed On"
                        format="DD-MM-YYYY"
                        value={
                          form.verificationDate
                            ? dayjs(form.verificationDate)
                            : null
                        }
                        onChange={(date) =>
                          setForm((current) => ({
                            ...current,
                            verificationDate: date?.isValid()
                              ? date.format("YYYY-MM-DD")
                              : "",
                          }))
                        }
                        disabled={editingRecord.status !== "Completed"}
                        slotProps={{
                          textField: {
                            size: "small",
                            fullWidth: true,
                          },
                        }}
                      />
                    </LocalizationProvider>
                  )}
                  <TextField
                    label="Manager Comments"
                    size="small"
                    multiline
                    minRows={3}
                    value={form.managerComments}
                    onChange={updateForm("managerComments")}
                    error={Boolean(formErrors.managerComments)}
                    helperText={formErrors.managerComments}
                    inputProps={{ maxLength: 5000 }}
                  />
                  <TextField
                    label="Manager Rating"
                    select
                    size="small"
                    value={form.kpaRating}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        kpaRating: event.target.value,
                        managerRatingDate: event.target.value
                          ? current.managerRatingDate ||
                            dayjs().format("YYYY-MM-DD")
                          : "",
                      }))
                    }
                    disabled={
                      editingRecord.status !== "Completed" ||
                      form.verification !== "Closed"
                    }
                  >
                    <MenuItem value="">Not rated</MenuItem>
                    <MenuItem value="0">0</MenuItem>
                    <MenuItem value="1">1</MenuItem>
                  </TextField>
                </section>
              )}
              {canEditHrRating && (
                <section className="grid gap-4 rounded-md border border-borderGray p-4">
                  <h3 className="text-content font-pmedium uppercase text-primary">
                    HR Review
                  </h3>
                  <TextField
                    label="HR Comments"
                    size="small"
                    multiline
                    minRows={3}
                    value={form.hrComments}
                    onChange={updateForm("hrComments")}
                    disabled={!form.kpaRating}
                    inputProps={{ maxLength: 5000 }}
                  />
                  <TextField
                    label="HR Rating"
                    select
                    size="small"
                    value={form.hrRating}
                    onChange={(event) =>
                      setForm((current) => ({
                        ...current,
                        hrRating: event.target.value,
                        hrRatingDate: event.target.value
                          ? current.hrRatingDate || dayjs().format("YYYY-MM-DD")
                          : "",
                      }))
                    }
                    disabled={
                      form.verification !== "Closed" || !form.kpaRating
                    }
                  >
                    <MenuItem value="">Not rated</MenuItem>
                    <MenuItem value="0">0</MenuItem>
                    <MenuItem value="1">1</MenuItem>
                  </TextField>
                </section>
              )}
            </>
          )}
          {!isSelfKra &&
            editingRecord &&
            canEditManagerReview &&
            editingRecord.status !== "Completed" && (
              <p className="text-sm text-amber-700">
                Complete the KPA to enable review.
              </p>
            )}
          {!isSelfKra &&
            editingRecord &&
            canEditReview &&
            editingRecord.status === "Completed" &&
            form.verification !== "Closed" && (
              <p className="text-sm text-amber-700">
                Close the review to enable ratings.
              </p>
            )}
          {!isSelfKra &&
            editingRecord &&
            canEditHrRating &&
            !form.kpaRating &&
            form.verification === "Closed" &&
            !(canEditManagerReview && editingRecord.status !== "Completed") && (
              <p className="text-sm text-amber-700">
                Manager rating is required to enable HR rating.
              </p>
            )}
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Close"
              handleSubmit={() => {
                setModalOpen(false);
                setFormErrors({});
              }}
            />
            {(canEdit || canEditReview) && (
              <PrimaryButton
                type="submit"
                title="Save"
                isLoading={saveRecord.isPending}
                disabled={saveRecord.isPending}
              />
            )}
          </div>
        </form>
      </MuiModal>
    </PageFrame>
  );
};

export default KraKpaIndividualMonthlyKpa;
