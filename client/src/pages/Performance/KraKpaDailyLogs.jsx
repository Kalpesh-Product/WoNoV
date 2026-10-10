import { useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Chip, CircularProgress, MenuItem, TextField } from "@mui/material";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { MdChevronLeft, MdChevronRight, MdDeleteForever } from "react-icons/md";
import { HiPencilSquare } from "react-icons/hi2";
import dayjs from "dayjs";
import { toast } from "sonner";
import AgTable from "../../components/AgTable";
import ConfirmationModal from "../../components/ConfirmationModal";
import DetalisFormatted from "../../components/DetalisFormatted";
import MuiModal from "../../components/MuiModal";
import PageFrame from "../../components/Pages/PageFrame";
import PrimaryButton from "../../components/PrimaryButton";
import SecondaryButton from "../../components/SecondaryButton";
import useAuth from "../../hooks/useAuth";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const formatDate = (value) =>
  value && dayjs(value).isValid() ? dayjs(value).format("DD-MM-YYYY") : "-";

const KPA_SLOTS = ["11:00 AM - 12:30 PM", "03:00 PM - 04:30 PM"];

const emptyForm = () => ({
  dayTaskName: "",
  type: "",
  kpaSlot: "",
  reasonForCarryForward: "",
  resourceComment: "",
  managerComments: "",
  hrComments: "",
});

const DailyLogActionCell = ({
  data,
  node,
  onEdit,
  onAction,
  canComplete,
  canEdit,
  canDelete,
  isPending,
}) => {
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
      {canComplete && (
        <PrimaryButton
          type="button"
          title="Mark As Done"
          handleSubmit={() => onAction("complete", data)}
          disabled={disabled}
          className="!h-7 whitespace-nowrap !px-2 !py-1 !text-xs"
        />
      )}
      {canEdit && (
        <button
          type="button"
          title="Edit"
          aria-label={`Edit ${data.dayTaskName}`}
          disabled={disabled}
          onClick={() => onEdit(data)}
          className="flex h-8 w-8 items-center justify-center disabled:cursor-not-allowed"
        >
          <HiPencilSquare size={24} color={disabled ? "#9ca3af" : "#111827"} />
        </button>
      )}
      {canDelete && (
        <button
          type="button"
          title="Delete"
          aria-label={`Delete ${data.dayTaskName}`}
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

const KraKpaDailyLogs = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const location = useLocation();
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
  const member = location.state?.selectedMember || selectedMember;
  const departmentId =
    location.state?.selectedDepartment ||
    selectedDepartment ||
    auth?.user?.departments?.[0]?._id;
  const employeeId = member?.memberId || auth?.user?._id;
  const employeeName =
    member?.memberName ||
    [auth?.user?.firstName, auth?.user?.middleName, auth?.user?.lastName]
      .filter(Boolean)
      .join(" ");
  const departmentName =
    location.state?.selectedDepartmentName ||
    selectedDepartmentName ||
    auth?.user?.departments?.find(
      (department) => String(department?._id) === String(departmentId),
    )?.name;
  const roleTitles =
    auth?.user?.role?.map((role) => role?.roleTitle?.toLowerCase()) || [];
  const canManageOthers = roleTitles.some(
    (role) =>
      role.includes("manager") ||
      role.endsWith("admin") ||
      /^hr(?:\s|$)/.test(role) ||
      role === "top management",
  );
  const isHrUser = roleTitles.some((role) => /^hr(?:\s|$)/.test(role));
  const isOwnPage = String(employeeId) === String(auth?.user?._id);
  const canEditManagerComments = canManageOthers;
  const canEditHrComments = isHrUser;
  const [selectedDate, setSelectedDate] = useState(() => dayjs().startOf("day"));
  const [modalOpen, setModalOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [viewRecord, setViewRecord] = useState(null);
  const [pendingAction, setPendingAction] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [formErrors, setFormErrors] = useState({});

  const { data: records = [], isLoading } = useQuery({
    queryKey: ["kraKpaDailyLogs", departmentId, employeeId],
    enabled: Boolean(departmentId && employeeId),
    queryFn: async () => {
      const response = await axios.get("/api/kra-kpa/daily-log", {
        params: { department: departmentId, employee: employeeId },
      });
      return response.data || [];
    },
  });

  const refresh = () => {
    queryClient.invalidateQueries({ queryKey: ["kraKpaDailyLogs"] });
  };

  const saveLog = useMutation({
    mutationFn: async (payload) => {
      if (editingRecord) {
        const response = await axios.patch(
          `/api/kra-kpa/daily-log/${editingRecord._id}`,
          payload,
        );
        return response.data;
      }
      const response = await axios.post("/api/kra-kpa/daily-log", {
        ...payload,
        department: departmentId,
        employee: employeeId,
      });
      return response.data;
    },
    onSuccess: () => {
      refresh();
      setModalOpen(false);
      setEditingRecord(null);
      toast.success(`Daily Log ${editingRecord ? "updated" : "created"}`);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to save Daily Log");
    },
  });

  const rowAction = useMutation({
    mutationFn: async ({ type, record }) => {
      if (type === "delete") {
        await axios.delete(`/api/kra-kpa/daily-log/${record._id}`);
      } else {
        await axios.patch(`/api/kra-kpa/daily-log/${record._id}/complete`);
      }
    },
    onSuccess: (_, { type }) => {
      refresh();
      setPendingAction(null);
      setViewRecord(null);
      toast.success(type === "delete" ? "Daily Log deleted" : "Daily Log completed");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Unable to update Daily Log");
    },
  });

  const openEdit = (record) => {
    setEditingRecord(record);
    setForm({
      dayTaskName: record.dayTaskName || "",
      type: record.type || "",
      kpaSlot: record.kpaSlot || "",
      reasonForCarryForward: record.reasonForCarryForward || "",
      resourceComment: record.resourceComment || "",
      managerComments: record.managerComments || record.reviewerComments || "",
      hrComments: record.hrComments || "",
    });
    setFormErrors({});
    setModalOpen(true);
  };

  const updateForm = (field) => (event) => {
    setForm((current) => ({ ...current, [field]: event.target.value }));
    setFormErrors((current) => ({ ...current, [field]: "" }));
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    const errors = {};
    if (!form.dayTaskName.trim()) {
      errors.dayTaskName = "Day Task Name is required";
    }
    if (!form.type) errors.type = "Type is required";
    if (form.type === "KPA" && !form.kpaSlot) {
      errors.kpaSlot = "KPA Slot is required";
    }
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) return;
    saveLog.mutate({
      date: editingRecord?.date
        ? dayjs(editingRecord.date).format("YYYY-MM-DD")
        : selectedDate.format("YYYY-MM-DD"),
      dayTaskName: form.dayTaskName.trim(),
      type: form.type,
      kpaSlot: form.type === "KPA" ? form.kpaSlot : "",
      ...(editingRecord && {
        reasonForCarryForward: form.reasonForCarryForward.trim(),
        resourceComment: form.resourceComment.trim(),
      }),
      ...(editingRecord && canEditManagerComments && {
        managerComments: form.managerComments.trim(),
      }),
      ...(editingRecord && canEditHrComments && {
        hrComments: form.hrComments.trim(),
      }),
    });
  };

  const filteredRecords = useMemo(
    () =>
      records.filter((record) => dayjs(record.date).isSame(selectedDate, "day")),
    [records, selectedDate],
  );

  const mapRows = (items) =>
    items.map((record, index) => ({ ...record, srNo: index + 1 }));
  const dueRows = mapRows(
    filteredRecords.filter((record) => record.status !== "Done"),
  );
  const completedRows = mapRows(
    filteredRecords.filter((record) => record.status === "Done"),
  );

  const baseColumns = [
    { headerName: "Sr No", field: "srNo", width: 85 },
    {
      headerName: "Day Task Name",
      field: "dayTaskName",
      minWidth: 320,
      flex: 2,
      valueGetter: ({ data }) =>
        data.type === "KPA" && data.kpaSlot
          ? `KPA Slot ${data.kpaSlot} > ${data.dayTaskName}`
          : data.dayTaskName,
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
    {
      headerName: "Type",
      field: "type",
      width: 110,
      cellRenderer: ({ value }) => (
        <Chip
          size="small"
          label={value}
          sx={{ backgroundColor: "#ffd8cf", color: "#b42318" }}
        />
      ),
    },
    {
      headerName: "Status",
      field: "status",
      width: 120,
      cellRenderer: ({ value }) => (
        <Chip
          size="small"
          label={value}
          sx={
            value === "Done"
              ? { backgroundColor: "#d8f0df", color: "#16784d" }
              : { backgroundColor: "#eadcf8", color: "#6b3fa0" }
          }
        />
      ),
    },
    {
      headerName: "Reason for Carry Forward",
      field: "reasonForCarryForward",
      minWidth: 260,
      flex: 1,
    },
    {
      headerName: "Resource Comment",
      field: "resourceComment",
      minWidth: 220,
      flex: 1,
    },
    ...(canEditManagerComments
      ? [
          {
            headerName: "Manager Comments",
            field: "managerComments",
            valueGetter: ({ data }) =>
              data.managerComments || data.reviewerComments || "",
            minWidth: 240,
            flex: 1,
          },
        ]
      : []),
    ...(canEditHrComments
      ? [
          {
            headerName: "HR Comments",
            field: "hrComments",
            minWidth: 240,
            flex: 1,
          },
        ]
      : []),
  ];

  const dueColumns = [
    ...baseColumns,
    {
      headerName: "Actions",
      field: "actions",
      pinned: "right",
      width: 230,
      sortable: false,
      filter: false,
      cellRenderer: ({ data, node }) => (
        <DailyLogActionCell
          data={data}
          node={node}
          onEdit={openEdit}
          onAction={(type, record) => setPendingAction({ type, record })}
          canComplete={isOwnPage}
          canEdit
          canDelete={canManageOthers && !isOwnPage}
          isPending={rowAction.isPending}
        />
      ),
    },
  ];

  const completedColumns = [
    ...baseColumns,
    {
      headerName: "Actions",
      field: "actions",
      pinned: "right",
      width: 100,
      sortable: false,
      filter: false,
      cellRenderer: ({ data, node }) => (
        <DailyLogActionCell
          data={data}
          node={node}
          onEdit={openEdit}
          onAction={(type, record) => setPendingAction({ type, record })}
          canComplete={false}
          canEdit
          canDelete={false}
          isPending={rowAction.isPending}
        />
      ),
    },
  ];

  return (
    <PageFrame>
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-title font-pmedium uppercase text-primary">
          {departmentName ? `${departmentName} - ` : ""}Daily Logs - {employeeName}
        </h1>
      </div>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <div className="mb-1 flex items-center justify-center gap-3">
          <button
            type="button"
            aria-label="Previous day"
            onClick={() => setSelectedDate((date) => date.subtract(1, "day"))}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90"
          >
            <MdChevronLeft size={22} />
          </button>
          <DatePicker
            format="ddd, MMMM D, YYYY"
            value={selectedDate}
            onChange={(date) => {
              if (date?.isValid()) setSelectedDate(date.startOf("day"));
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
                  "& .MuiOutlinedInput-root:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#1e3d73",
                  },
                  "& .MuiOutlinedInput-root.Mui-focused .MuiOutlinedInput-notchedOutline": {
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
            onClick={() => setSelectedDate((date) => date.add(1, "day"))}
            className="flex h-[38px] w-[38px] items-center justify-center rounded-md bg-primary text-white transition-opacity hover:opacity-90"
          >
            <MdChevronRight size={22} />
          </button>
        </div>
      </LocalizationProvider>

      {isLoading ? (
        <div className="flex h-64 items-center justify-center">
          <CircularProgress />
        </div>
      ) : (
        <>
          <AgTable
            data={dueRows}
            columns={dueColumns}
            hideTitle
            enableCheckbox
            search
            exportData
            hideFilter
            processExportCell={({ value }) => value ?? ""}
            tableHeight={Math.max(300, Math.min(650, dueRows.length * 58 + 90))}
          />
          <div className="mt-6">
            <AgTable
              data={completedRows}
              columns={completedColumns}
              tableTitle="COMPLETED DAILY LOGS"
              enableCheckbox
              search
              exportData
              hideFilter
              processExportCell={({ value }) => value ?? ""}
              tableHeight={Math.max(
                300,
                Math.min(650, completedRows.length * 58 + 90),
              )}
            />
          </div>
        </>
      )}

      <MuiModal
        open={Boolean(viewRecord)}
        onClose={() => setViewRecord(null)}
        title="Daily Log Details"
        widthClass="w-[92vw] max-w-[680px]"
      >
        {viewRecord && (
          <div className="space-y-2 py-2">
            <DetalisFormatted title="Date" detail={formatDate(viewRecord.date)} />
            <DetalisFormatted title="Day Task Name" detail={viewRecord.dayTaskName} />
            <DetalisFormatted title="Type" detail={viewRecord.type} />
            {viewRecord.type === "KPA" && (
              <DetalisFormatted title="KPA Slot" detail={viewRecord.kpaSlot || "-"} />
            )}
            <DetalisFormatted title="Status" detail={viewRecord.status} />
            <DetalisFormatted
              title="Reason for Carry Forward"
              detail={viewRecord.reasonForCarryForward || "-"}
            />
            <DetalisFormatted
              title="Resource Comment"
              detail={viewRecord.resourceComment || "-"}
            />
            {canEditManagerComments && (
              <DetalisFormatted
                title="Manager Comments"
                detail={
                  viewRecord.managerComments ||
                  viewRecord.reviewerComments ||
                  "-"
                }
              />
            )}
            {canEditHrComments && (
              <DetalisFormatted
                title="HR Comments"
                detail={viewRecord.hrComments || "-"}
              />
            )}
          </div>
        )}
      </MuiModal>

      <ConfirmationModal
        open={Boolean(pendingAction)}
        onClose={() => setPendingAction(null)}
        onConfirm={() => pendingAction && rowAction.mutate(pendingAction)}
        title={pendingAction?.type === "delete" ? "Delete Daily Log" : "Complete Daily Log"}
        message={
          pendingAction?.type === "delete"
            ? "Are you sure you want to delete this Daily Log?"
            : "Mark this Daily Log as done?"
        }
        confirmText={pendingAction?.type === "delete" ? "Delete" : "Mark As Done"}
        cancelText="Cancel"
        cancelFirst
        isLoading={rowAction.isPending}
      />

      <MuiModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editingRecord ? "Edit Daily Log" : "Add Daily Log"}
        widthClass="w-[92vw] max-w-[820px]"
      >
        <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
          <TextField
            label="Day Task Name *"
            size="small"
            multiline
            minRows={2}
            value={form.dayTaskName}
            onChange={updateForm("dayTaskName")}
            error={Boolean(formErrors.dayTaskName)}
            helperText={formErrors.dayTaskName}
            inputProps={{ maxLength: 1000 }}
          />
          <TextField
            label="Type *"
            select
            size="small"
            value={form.type}
            onChange={(event) => {
              const type = event.target.value;
              setForm((current) => ({
                ...current,
                type,
                ...(type !== "KPA" && { kpaSlot: "" }),
              }));
              setFormErrors((current) => ({
                ...current,
                type: "",
                ...(type !== "KPA" && { kpaSlot: "" }),
              }));
            }}
            error={Boolean(formErrors.type)}
            helperText={formErrors.type}
          >
            <MenuItem value="" disabled>Select Type</MenuItem>
            <MenuItem value="KRA">KRA</MenuItem>
            <MenuItem value="KPA">KPA</MenuItem>
          </TextField>
          {form.type === "KPA" && (
            <TextField
              label="KPA Slot *"
              select
              size="small"
              value={form.kpaSlot}
              onChange={updateForm("kpaSlot")}
              error={Boolean(formErrors.kpaSlot)}
              helperText={formErrors.kpaSlot}
            >
              <MenuItem value="" disabled>Select KPA Slot</MenuItem>
              {KPA_SLOTS.map((slot) => (
                <MenuItem key={slot} value={slot}>{slot}</MenuItem>
              ))}
            </TextField>
          )}
          {editingRecord && (
            <>
              <TextField
                label="Reason for Carry Forward"
                size="small"
                multiline
                minRows={2}
                value={form.reasonForCarryForward}
                onChange={updateForm("reasonForCarryForward")}
                inputProps={{ maxLength: 5000 }}
              />
              <TextField
                label="Resource Comment"
                size="small"
                multiline
                minRows={2}
                value={form.resourceComment}
                onChange={updateForm("resourceComment")}
                inputProps={{ maxLength: 5000 }}
              />
            </>
          )}
          {editingRecord && canEditManagerComments && (
            <TextField
              label="Manager Comments"
              size="small"
              multiline
              minRows={2}
              value={form.managerComments}
              onChange={updateForm("managerComments")}
              inputProps={{ maxLength: 5000 }}
            />
          )}
          {editingRecord && canEditHrComments && (
            <TextField
              label="HR Comments"
              size="small"
              multiline
              minRows={2}
              value={form.hrComments}
              onChange={updateForm("hrComments")}
              inputProps={{ maxLength: 5000 }}
            />
          )}
          <div className="flex justify-end gap-3">
            <SecondaryButton
              type="button"
              title="Close"
              handleSubmit={() => setModalOpen(false)}
            />
            <PrimaryButton
              type="submit"
              title="Save"
              isLoading={saveLog.isPending}
            />
          </div>
        </form>
      </MuiModal>
    </PageFrame>
  );
};

export default KraKpaDailyLogs;
