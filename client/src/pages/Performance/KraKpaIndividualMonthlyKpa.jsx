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
  MdDeleteForever,
} from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import { toast } from "sonner";
import dayjs from "dayjs";
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
const emptySelfKra = () => ({ title: "", description: "", lead: "" });
const emptyForm = () => ({
  month: currentMonth(),
  target: "",
  deadline: "",
  resourceComment: "",
  managerComments: "",
  kpaRating: "",
  hrRating: "",
  verification: "Pending",
  verificationDate: "",
  selfKras: [emptySelfKra()],
});

const KpaActionCell = ({ data, node, onEdit, onAction, isPending }) => {
  const [selected, setSelected] = useState(() => Boolean(node.isSelected()));

  useEffect(() => {
    const syncSelection = () => setSelected(Boolean(node.isSelected()));
    syncSelection();
    node.addEventListener("rowSelected", syncSelection);
    return () => node.removeEventListener("rowSelected", syncSelection);
  }, [node]);

  const disabled = !selected || isPending;

  return (
    <div className="flex h-full items-center gap-2">
      {data.status !== "Completed" && (
        <PrimaryButton
          type="button"
          title="Mark As Done"
          handleSubmit={() => onAction("complete", data)}
          disabled={disabled}
          className="!px-2 !py-1 !text-xs !h-7 whitespace-nowrap"
        />
      )}
      <button
        type="button"
        title="Edit"
        aria-label={`Edit ${data.target || data.title || "Self KRA"}`}
        disabled={disabled}
        onClick={() => onEdit(data)}
        className="flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed"
      >
        <HiPencilSquare size={24} color={disabled ? "#9ca3af" : "#111827"} />
      </button>
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
  const isEmployeeRoute = location.pathname.includes("/employee-KRA-KPA");
  const member = isEmployeeRoute
    ? null
    : location.state?.selectedMember || selectedMember;
  const departmentId = isEmployeeRoute
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
  const departmentName = isEmployeeRoute
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
  const [modalOpen, setModalOpen] = useState(false);
  const [viewRecord, setViewRecord] = useState(null);
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
  const canSelectSelfKraLead = isManager || isTopManagement;
  const canManageOthers = roleTitles.some(
    (role) =>
      role.includes("manager") ||
      role.endsWith("admin") ||
      role === "hr employee",
  );
  const canEdit =
    String(employeeId) === String(auth?.user?._id) || canManageOthers;
  const canAddKraKpa =
    String(employeeId) === String(auth?.user?._id) ||
    isManager ||
    isTopManagement;
  const isCreatedByLoggedInUser = (record) =>
    String(record?.createdBy?._id || record?.createdBy || "") ===
    String(auth?.user?._id || "");

  const refreshKpaQueries = () => {
    queryClient.invalidateQueries({ queryKey: ["kraKpaIndividualMonthlyKpa"] });
    queryClient.invalidateQueries({ queryKey: ["kraKpaSelfKra"] });
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
    ],
    enabled: Boolean(departmentId && employeeId),
    queryFn: async () => {
      const response = await axios.get(
        isSelfKra
          ? "/api/kra-kpa/self-kra"
          : "/api/kra-kpa/individual-monthly-kpa",
        {
          params: { department: departmentId, employee: employeeId },
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
    onSuccess: (_, payload) => {
      refreshKpaQueries();
      if (!isSelfKra) setDateRange(monthRange(payload.month));
      setModalOpen(false);
      setEditingRecord(null);
      toast.success(
        isSelfKra ? "Self KRA saved" : "Individual Monthly KPA saved",
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
          isSelfKra ? undefined : { resourceComment },
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

  const openRowAction = (type, record) => {
    setCompletionComment("");
    setPendingAction({ type, record });
  };

  const closeRowAction = () => {
    setPendingAction(null);
    setCompletionComment("");
  };

  const confirmRowAction = () => {
    if (
      pendingAction?.type === "complete" &&
      !isSelfKra &&
      !completionComment.trim()
    ) {
      toast.error("Resource Comment is required to mark the KPA as done");
      return;
    }
    performRowAction.mutate({
      ...pendingAction,
      resourceComment: completionComment.trim(),
    });
  };

  const openCreate = () => {
    setEditingRecord(null);
    setForm(emptyForm());
    setModalOpen(true);
  };
  const openEdit = (record) => {
    setEditingRecord(record);
    setForm({
      month: record.month,
      target: record.target,
      deadline: record.deadline
        ? dayjs(record.deadline).format("YYYY-MM-DD")
        : "",
      resourceComment: record.resourceComment || "",
      managerComments: record.managerComments || "",
      kpaRating:
        record.kpaRating === null || record.kpaRating === undefined
          ? ""
          : String(record.kpaRating),
      hrRating:
        record.hrRating === null || record.hrRating === undefined
          ? ""
          : String(record.hrRating),
      verification: record.verification || "Pending",
      verificationDate: (
        record.verification === "Changes Required"
          ? record.changesRequiredDate || record.verificationDate
          : record.verification === "Closed"
            ? record.verificationClosedDate
            : record.verificationDate
      )
        ? dayjs(
            record.verification === "Changes Required"
              ? record.changesRequiredDate || record.verificationDate
              : record.verification === "Closed"
                ? record.verificationClosedDate
                : record.verificationDate,
          ).format("YYYY-MM-DD")
        : "",
      selfKras: [
        {
          title: record.title || "",
          description: record.description || "",
          lead: record.lead?._id || record.lead || "",
        },
      ],
    });
    setModalOpen(true);
  };
  const updateForm = (field) => (event) =>
    setForm((current) => ({ ...current, [field]: event.target.value }));
  const updateSelfKra = (index, field) => (event) => {
    const value = event.target.value;
    setForm((current) => ({
      ...current,
      selfKras: current.selfKras.map((kra, kraIndex) =>
        kraIndex === index ? { ...kra, [field]: value } : kra,
      ),
    }));
  };
  const handleSubmit = (event) => {
    event.preventDefault();
    const selfKra = form.selfKras[0];
    const validSelfKra =
      selfKra.title.trim() &&
      selfKra.description.trim() &&
      (!canSelectSelfKraLead || selfKra.lead);
    if (
      (!isSelfKra && (!form.month || !form.target.trim())) ||
      (isSelfKra && !validSelfKra)
    ) {
      toast.error(
        isSelfKra
          ? canSelectSelfKraLead
            ? "Every KRA requires a title, description, and lead"
            : "Every KRA requires a title and description"
          : "Month and KPA target are required",
      );
      return;
    }
    if (
      !isSelfKra &&
      canEditReview &&
      editingRecord?.status === "Completed" &&
      form.verification === "Changes Required" &&
      !form.managerComments.trim()
    ) {
      toast.error("Manager Comments are required when changes are requested");
      return;
    }
    const payload = isSelfKra
      ? {
          title: selfKra.title.trim(),
          description: selfKra.description.trim(),
          ...(canSelectSelfKraLead && { lead: selfKra.lead }),
        }
      : {
          month: form.month,
          target: form.target.trim(),
          deadline: form.deadline,
          ...(editingRecord && {
            ...(isCreatedByLoggedInUser(editingRecord) && {
              resourceComment: form.resourceComment.trim(),
            }),
          }),
        };
    if (editingRecord && !isSelfKra) {
      if (canEditReview) {
        payload.managerComments = form.managerComments.trim();
        payload.kpaRating = form.kpaRating;
        payload.hrRating = form.hrRating;
        if (
          editingRecord.status === "Completed" &&
          form.verification !== "Pending"
        ) {
          payload.verification = form.verification;
          payload.verificationDate = form.verificationDate;
        }
      }
    }
    saveRecord.mutate(payload);
  };

  const tableData = useMemo(
    () =>
      records
        .filter((record) => {
          if (isSelfKra) {
            return dayjs(record.createdAt).isSame(selectedSelfKraDate, "day");
          }
          const recordStart = dayjs(`${record.month}-01`);
          const recordEnd = recordStart.endOf("month");
          return (
            recordStart.isBefore(dayjs(dateRange.endDate).endOf("day")) &&
            recordEnd.isAfter(dayjs(dateRange.startDate).startOf("day"))
          );
        })
        .map((record, index) => ({
          ...record,
          srNo: index + 1,
          monthLabel: record.month
            ? dayjs(`${record.month}-01`).format("MMMM")
            : "-",
          deadlineLabel: formatDate(record.deadline),
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
        })),
    [records, dateRange, isSelfKra, selectedSelfKraDate],
  );

  const statusColumn = {
    headerName: "Status",
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
  const actionColumns = canEdit
    ? [
        {
          headerName: "Actions",
          field: "actions",
          pinned: "right",
          width: 230,
          sortable: false,
          filter: false,
          cellRenderer: ({ data, node }) => (
            <KpaActionCell
              data={data}
              node={node}
              onEdit={openEdit}
              onAction={openRowAction}
              isPending={performRowAction.isPending}
            />
          ),
        },
      ]
    : [];
  const individualKpaColumns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    {
      headerName: "KPA TARGET",
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
    statusColumn,
    ...actionColumns,
  ];
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
    { headerName: "Description", field: "description", minWidth: 320, flex: 2 },
    { headerName: "Lead", field: "leadName", minWidth: 180, flex: 1 },
    statusColumn,
    ...actionColumns,
  ];
  const columns = isSelfKra ? selfKraColumns : individualKpaColumns;

  return (
    <PageFrame>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-pmedium text-primary uppercase">
          {departmentName ? `${departmentName} - ` : ""}
          {isSelfKra ? "Self KRA" : "Individual Monthly KPA"} - {employeeName}
        </h1>
        {canAddKraKpa && (
          <PrimaryButton
            type="button"
            title={isSelfKra ? "Add Self KRA" : "Add Individual Monthly KPA"}
            handleSubmit={openCreate}
          />
        )}
      </div>
      {!isSelfKra && (
        <>
          <div className="mb-5 flex flex-wrap items-center justify-center gap-2 border-b border-borderGray pb-6">
            <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
              {dayjs(dateRange.startDate).format("DD MMM YYYY")}
            </div>
            <div className="min-w-40 rounded-md border border-primary px-6 py-2 text-center text-content text-gray-600">
              {dayjs(dateRange.endDate).format("DD MMM YYYY")}
            </div>
            <button
              type="button"
              aria-label="Select date range"
              className="rounded-md bg-primary p-3 text-white"
              onClick={(event) => setCalendarAnchor(event.currentTarget)}
            >
              <MdCalendarToday size={20} />
            </button>
          </div>
          <Popover
            open={Boolean(calendarAnchor)}
            anchorEl={calendarAnchor}
            onClose={() => setCalendarAnchor(null)}
            anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            transformOrigin={{ vertical: "top", horizontal: "center" }}
          >
            <DateRangePicker
              ranges={[dateRange]}
              onChange={({ selection }) => setDateRange(selection)}
              moveRangeOnFirstSelection={false}
              direction="vertical"
            />
          </Popover>
        </>
      )}
      {isSelfKra && (
        <LocalizationProvider dateAdapter={AdapterDayjs}>
          <div className="mb-5 flex items-center justify-center gap-3 border-b border-borderGray pb-6">
            <button
              type="button"
              aria-label="Previous day"
              onClick={() =>
                setSelectedSelfKraDate((date) => date.subtract(1, "day"))
              }
              className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90"
            >
              <MdChevronLeft size={22} />
            </button>
            <DatePicker
              format="ddd, MMMM D, YYYY"
              value={selectedSelfKraDate}
              onChange={(date) => {
                if (date?.isValid())
                  setSelectedSelfKraDate(date.startOf("day"));
              }}
              slotProps={{
                textField: {
                  size: "small",
                  sx: {
                    width: 245,
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "6px",
                      height: 38,
                    },
                    "& .MuiOutlinedInput-notchedOutline": {
                      borderColor: "#1e3d73",
                    },
                    "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#1e3d73",
                      },
                    "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline":
                      {
                        borderColor: "#1e3d73",
                      },
                    "& .MuiInputBase-input": {
                      color: "#111827",
                      fontSize: "0.875rem",
                    },
                    "& .MuiSvgIcon-root": { color: "#1e3d73" },
                  },
                },
              }}
            />
            <button
              type="button"
              aria-label="Next day"
              onClick={() =>
                setSelectedSelfKraDate((date) => date.add(1, "day"))
              }
              className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90"
            >
              <MdChevronRight size={22} />
            </button>
          </div>
        </LocalizationProvider>
      )}
      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <AgTable
          data={tableData}
          columns={columns}
          hideTitle
          enableCheckbox
          search
          exportData
          hideFilter
          processExportCell={({ value }) => value ?? ""}
          tableHeight={Math.max(300, Math.min(650, tableData.length * 58 + 90))}
        />
      )}

      <MuiModal
        open={Boolean(viewRecord)}
        onClose={() => setViewRecord(null)}
        title={
          isSelfKra ? "Self KRA Details" : "Individual Monthly KPA Details"
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
                  title="Description"
                  detail={viewRecord.description}
                />
                <DetalisFormatted
                  title="Lead"
                  detail={viewRecord.leadName || "-"}
                />
                <DetalisFormatted title="Status" detail={viewRecord.status} />
                <DetalisFormatted
                  title="Closing Date"
                  detail={formatDate(viewRecord.closingDate)}
                />
              </>
            ) : (
              <>
                <div className="font-bold">KPA Details</div>
                <DetalisFormatted
                  title="Month"
                  detail={dayjs(`${viewRecord.month}-01`).format("MMMM YYYY")}
                />
                <DetalisFormatted
                  title="KPA Target"
                  detail={viewRecord.target}
                />
                <DetalisFormatted
                  title="Deadline"
                  detail={formatDate(viewRecord.deadline)}
                />
                <DetalisFormatted title="Status" detail={viewRecord.status} />
                <DetalisFormatted
                  title="Closing Date"
                  detail={formatDate(viewRecord.closingDate)}
                />
                <DetalisFormatted
                  title="Resource Comment"
                  detail={viewRecord.resourceComment || "-"}
                />

                <br />
                <div className="font-bold">Review Details</div>
                <DetalisFormatted
                  title="Manager Comments"
                  detail={viewRecord.managerComments || "-"}
                />
                <DetalisFormatted
                  title="KPA Rating"
                  detail={
                    viewRecord.kpaRating === null ||
                    viewRecord.kpaRating === undefined
                      ? "Not rated"
                      : String(viewRecord.kpaRating)
                  }
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
                <DetalisFormatted
                  title="Review Status"
                  detail={viewRecord.verification || "Pending"}
                />
                <DetalisFormatted
                  title="Verified On"
                  detail={formatDate(viewRecord.verificationDate)}
                />
                <DetalisFormatted
                  title="Changes Required On"
                  detail={formatDate(
                    viewRecord.changesRequiredDate ||
                      (viewRecord.verification === "Changes Required"
                        ? viewRecord.verificationDate
                        : null),
                  )}
                />
                <DetalisFormatted
                  title="Closed On"
                  detail={formatDate(viewRecord.verificationClosedDate)}
                />
                <DetalisFormatted
                  title="Reviewed By"
                  detail={
                    viewRecord.verifiedBy
                      ? [
                          viewRecord.verifiedBy.firstName,
                          viewRecord.verifiedBy.middleName,
                          viewRecord.verifiedBy.lastName,
                        ]
                          .filter(Boolean)
                          .join(" ") || "-"
                      : "-"
                  }
                />
              </>
            )}
          </div>
        )}
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
          !isSelfKra &&
          !isCreatedByLoggedInUser(pendingAction.record)
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
            required
            disabled={!isCreatedByLoggedInUser(pendingAction.record)}
            helperText={
              isCreatedByLoggedInUser(pendingAction.record)
                ? ""
                : "Only the KPA creator can add the Resource Comment"
            }
            inputProps={{ maxLength: 5000 }}
            fullWidth
          />
        )}
      </ConfirmationModal>

      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={
          editingRecord
            ? isSelfKra
              ? "Self KRA"
              : "Individual Monthly KPA"
            : isSelfKra
              ? "Add Self KRA"
              : "Add Individual Monthly KPA"
        }
        widthClass="w-[92vw] max-w-[680px]"
      >
        <form onSubmit={handleSubmit} className="grid gap-4">
          {isSelfKra ? (
            <>
              <TextField
                label="Title"
                size="small"
                value={form.selfKras[0].title}
                onChange={updateSelfKra(0, "title")}
                required
                inputProps={{ maxLength: 300 }}
              />
              <TextField
                label="Description"
                size="small"
                multiline
                minRows={3}
                value={form.selfKras[0].description}
                onChange={updateSelfKra(0, "description")}
                required
                inputProps={{ maxLength: 3000 }}
              />
              {canSelectSelfKraLead && (
                <TextField
                  label="Lead"
                  select
                  size="small"
                  value={form.selfKras[0].lead}
                  onChange={updateSelfKra(0, "lead")}
                  required
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
            <section className="grid gap-4 rounded-md border border-borderGray p-4">
              {editingRecord && (
                <h3 className="text-content font-pmedium uppercase text-primary">
                  KPA Details
                </h3>
              )}
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Month"
                  views={["year", "month"]}
                  format="MMMM YYYY"
                  value={form.month ? dayjs(`${form.month}-01`) : null}
                  onChange={(date) => {
                    if (date?.isValid())
                      setForm((current) => ({
                        ...current,
                        month: date.format("YYYY-MM"),
                      }));
                  }}
                  disabled={!canEdit}
                  slotProps={{
                    textField: {
                      size: "small",
                      required: true,
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
              <TextField
                label="KPA Target"
                size="small"
                multiline
                minRows={2}
                value={form.target}
                onChange={updateForm("target")}
                disabled={!canEdit}
                required
              />
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Deadline"
                  format="DD-MM-YYYY"
                  value={form.deadline ? dayjs(form.deadline) : null}
                  onChange={(date) =>
                    setForm((current) => ({
                      ...current,
                      deadline: date?.isValid()
                        ? date.format("YYYY-MM-DD")
                        : "",
                    }))
                  }
                  disabled={!canEdit}
                  slotProps={{ textField: { size: "small", fullWidth: true } }}
                />
              </LocalizationProvider>
              {editingRecord && (
                <TextField
                  label="Resource Comment"
                  size="small"
                  multiline
                  minRows={3}
                  value={form.resourceComment}
                  onChange={updateForm("resourceComment")}
                  disabled={!canEdit || !isCreatedByLoggedInUser(editingRecord)}
                />
              )}
            </section>
          )}
          {!isSelfKra && editingRecord && canEditReview && (
            <section className="grid gap-4 rounded-md border border-borderGray p-4">
              <h3 className="text-content font-pmedium uppercase text-primary">
                Review Details
              </h3>
              <TextField
                label="Manager Comments"
                size="small"
                multiline
                minRows={3}
                value={form.managerComments}
                onChange={updateForm("managerComments")}
                inputProps={{ maxLength: 5000 }}
                disabled={!canEditReview}
              />
              <TextField
                label="KPA Rating"
                select
                size="small"
                value={form.kpaRating}
                onChange={updateForm("kpaRating")}
                disabled={!canEditReview}
              >
                <MenuItem value="">Not rated</MenuItem>
                <MenuItem value="0">0</MenuItem>
                <MenuItem value="1">1</MenuItem>
              </TextField>
              <TextField
                label="HR Rating"
                select
                size="small"
                value={form.hrRating}
                onChange={updateForm("hrRating")}
                disabled={!canEditReview}
              >
                <MenuItem value="">Not rated</MenuItem>
                <MenuItem value="0">0</MenuItem>
                <MenuItem value="1">1</MenuItem>
              </TextField>
              <TextField
                label="Review Status"
                select
                size="small"
                value={form.verification === "Pending" ? "" : form.verification}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    verification: event.target.value,
                    verificationDate: "",
                  }))
                }
                disabled={
                  !canEditReview || editingRecord.status !== "Completed"
                }
                InputLabelProps={{ shrink: true }}
                SelectProps={{
                  displayEmpty: true,
                  renderValue: (value) => value || "Pending",
                }}
              >
                <MenuItem value="Verified">Verified</MenuItem>
                <MenuItem value="Changes Required">Changes Required</MenuItem>
                <MenuItem value="Closed">Closed</MenuItem>
              </TextField>
              <LocalizationProvider dateAdapter={AdapterDayjs}>
                <DatePicker
                  label="Reviewed On"
                  format="DD-MM-YYYY"
                  value={
                    form.verificationDate ? dayjs(form.verificationDate) : null
                  }
                  onChange={(date) =>
                    setForm((current) => ({
                      ...current,
                      verificationDate: date?.isValid()
                        ? date.format("YYYY-MM-DD")
                        : "",
                    }))
                  }
                  disabled={
                    !canEditReview ||
                    editingRecord.status !== "Completed" ||
                    form.verification === "Pending"
                  }
                  slotProps={{
                    textField: {
                      size: "small",
                      fullWidth: true,
                    },
                  }}
                />
              </LocalizationProvider>
            </section>
          )}
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Close"
              handleSubmit={() => setModalOpen(false)}
            />
            {canEdit && (
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
