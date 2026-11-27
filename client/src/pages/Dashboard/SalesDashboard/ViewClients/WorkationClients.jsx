import { useMemo, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Chip, MenuItem, TextField } from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import dayjs from "dayjs";
import { HiPencilSquare } from "react-icons/hi2";
import { toast } from "sonner";
import AgTable from "../../../../components/AgTable";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import MuiModal from "../../../../components/MuiModal";
import PageFrame from "../../../../components/Pages/PageFrame";
import PrimaryButton from "../../../../components/PrimaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const getEmptyFormValues = () => ({
  clientName: "",
  particulars: "",
  startDate: dayjs(),
  isActive: true,
});

const SummaryChip = ({ label, value, tone }) => {
  const tones = {
    total: "border-[#aec6fb] bg-[#dbe4ff] text-[#274784]",
    active: "border-[#a9ddba] bg-[#d8f0df] text-[#16784d]",
    inactive: "border-[#f3b7a8] bg-[#fce8e3] text-[#d96b4f]",
  };

  return (
    <div
      className={`flex items-center justify-center gap-1 rounded-lg border px-3 py-1.5 text-sm font-pmedium uppercase ${tones[tone]}`}
    >
      <span>{label} :</span>
      <span>{value}</span>
    </div>
  );
};

const WorkationClients = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [formMode, setFormMode] = useState(null);
  const [editingClient, setEditingClient] = useState(null);
  const [viewClient, setViewClient] = useState(null);
  const { control, handleSubmit, reset } = useForm({
    defaultValues: getEmptyFormValues(),
  });

  const { data: clients = [], isLoading } = useQuery({
    queryKey: ["view-clients-workation"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/get-workation-clients");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const refreshClients = async () => {
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: ["view-clients-workation"] }),
      queryClient.invalidateQueries({ queryKey: ["workationClients"] }),
    ]);
  };

  const closeForm = () => {
    setFormMode(null);
    setEditingClient(null);
    reset(getEmptyFormValues());
  };

  const openCreateForm = () => {
    setEditingClient(null);
    setFormMode("create");
    reset(getEmptyFormValues());
  };

  const openEditForm = (client) => {
    if (!client?._id) {
      toast.error("This imported client must be added before it can be edited");
      return;
    }

    setEditingClient(client);
    setFormMode("edit");
    reset({
      clientName: client.clientName || "",
      particulars: client.particulars || "",
      startDate: client.startDate ? dayjs(client.startDate) : dayjs(),
      isActive: client.isActive !== false,
    });
  };

  const { mutate: saveClient, isPending: isSaving } = useMutation({
    mutationFn: async (values) => {
      const payload = {
        clientName: values.clientName?.trim(),
        particulars: values.particulars?.trim(),
        startDate: values.startDate
          ? dayjs(values.startDate).startOf("day").toISOString()
          : null,
        isActive: values.isActive,
      };

      if (formMode === "edit") {
        return axios.patch(
          `/api/sales/workation-clients/${editingClient._id}`,
          payload,
        );
      }

      return axios.post("/api/sales/workation-clients", payload);
    },
    onSuccess: async (response) => {
      toast.success(
        response?.data?.message ||
          `Workation client ${formMode === "edit" ? "updated" : "added"} successfully`,
      );
      await refreshClients();
      closeForm();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Unable to save workation client",
      );
    },
  });

  const { mutate: updateStatus, isPending: isStatusUpdating } = useMutation({
    mutationFn: ({ id, isActive }) =>
      axios.patch(`/api/sales/workation-clients/${id}/status`, { isActive }),
    onSuccess: async (response) => {
      toast.success(response?.data?.message || "Client status updated");
      await refreshClients();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message || "Unable to update client status",
      );
    },
  });

  const tableData = useMemo(
    () =>
      [...clients]
        .sort((first, second) =>
          String(first?.clientName || "").localeCompare(
            String(second?.clientName || ""),
            undefined,
            { sensitivity: "base", numeric: true },
          ),
        )
        .map((client, index) => ({
          ...client,
          id: index + 1,
          isActive: client.isActive !== false,
        })),
    [clients],
  );

  const activeCount = tableData.filter((client) => client.isActive).length;
  const inactiveCount = tableData.length - activeCount;

  const columns = [
    { field: "id", headerName: "Sr No", width: 110 },
    {
      field: "clientName",
      headerName: "Client Name",
      flex: 1.3,
      cellRenderer: (params) => (
        <button
          type="button"
          onClick={() => setViewClient(params.data)}
          className="text-left text-primary underline underline-offset-2 hover:text-primary-dark"
          aria-label={`View ${params.value || "workation client"} details`}
        >
          {params.value || "-"}
        </button>
      ),
    },
    {
      field: "particulars",
      headerName: "Particulars",
      flex: 1.5,
      valueFormatter: (params) => params.value || "-",
    },
    {
      field: "startDate",
      headerName: "Start Date",
      flex: 1,
      valueFormatter: (params) =>
        params.value ? dayjs(params.value).format("DD-MM-YYYY") : "-",
    },
    {
      field: "isActive",
      headerName: "Status",
      flex: 0.8,
      pinned: "right",
      cellRenderer: (params) => {
        const isActive = params.value !== false;
        return (
          <Chip
            label={isActive ? "Active" : "Inactive"}
            sx={{
              backgroundColor: isActive ? "#90EE90" : "#FFECC5",
              color: isActive ? "#006400" : "#CC8400",
            }}
          />
        );
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      pinned: "right",
      width: 150,
      sortable: false,
      filter: false,
      cellRenderer: (params) => {
        const client = params.data;
        const canManage = Boolean(client?._id);
        return (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              onClick={() =>
                updateStatus({
                  id: client._id,
                  isActive: !client.isActive,
                })
              }
              disabled={!canManage || isStatusUpdating}
              className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#4B4B4B] disabled:cursor-not-allowed disabled:opacity-40 ${
                client.isActive ? "bg-green-500" : "bg-gray-300"
              }`}
              role="switch"
              aria-checked={client.isActive}
              title={canManage ? "Change Status" : "Imported client"}
            >
              <span
                className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
                  client.isActive ? "translate-x-[18px]" : "translate-x-0.5"
                }`}
              />
            </button>
            <button
              type="button"
              onClick={() => openEditForm(client)}
              disabled={!canManage}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-gray-100 text-gray-700 transition-colors duration-200 hover:bg-gray-200 hover:text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40"
              aria-label={`Edit ${client.clientName || "client"}`}
              title={canManage ? "Edit" : "Imported client"}
            >
              <HiPencilSquare size={22} />
            </button>
          </div>
        );
      },
    },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          search
          tableTitle="WORKATION CLIENT DETAILS"
          titleRightContent={
            <div className="flex flex-wrap items-center justify-end gap-1.5">
              <SummaryChip label="Total" value={tableData.length} tone="total" />
              <SummaryChip label="Active" value={activeCount} tone="active" />
              <SummaryChip
                label="Inactive"
                value={inactiveCount}
                tone="inactive"
              />
            </div>
          }
          buttonTitle="Add Client"
          handleClick={openCreateForm}
          data={isLoading ? [] : tableData}
          columns={columns}
          exportData
        />
      </PageFrame>

      {viewClient && (
        <MuiModal
          open
          onClose={() => setViewClient(null)}
          title="View Workation Client Details"
        >
          <div className="grid w-full grid-cols-1 gap-4">
            <DetalisFormatted
              title="Client Name"
              detail={viewClient.clientName || "-"}
            />
            <DetalisFormatted
              title="Particulars"
              detail={viewClient.particulars || "-"}
            />
            <DetalisFormatted
              title="Start Date"
              detail={
                viewClient.startDate
                  ? dayjs(viewClient.startDate).format("DD-MM-YYYY")
                  : "-"
              }
            />
            <DetalisFormatted
              title="Status"
              detail={viewClient.isActive !== false ? "Active" : "Inactive"}
            />
          </div>
        </MuiModal>
      )}

      {formMode && (
        <MuiModal
          open
          onClose={closeForm}
          title={
            formMode === "edit"
              ? "Edit Workation Client"
              : "Add Workation Client"
          }
        >
          <form
            onSubmit={handleSubmit(saveClient)}
            className="grid grid-cols-2 gap-4"
          >
            <Controller
              name="clientName"
              control={control}
              rules={{ required: "Client name is required" }}
              render={({ field, fieldState }) => (
                <TextField
                  {...field}
                  label="Client Name"
                  size="small"
                  fullWidth
                  required
                  error={Boolean(fieldState.error)}
                  helperText={fieldState.error?.message}
                />
              )}
            />

            <Controller
              name="startDate"
              control={control}
              render={({ field }) => (
                <DatePicker
                  value={field.value || null}
                  onChange={field.onChange}
                  label="Start Date"
                  format="DD-MM-YYYY"
                  slotProps={{
                    textField: { fullWidth: true, size: "small" },
                  }}
                />
              )}
            />

            <Controller
              name="particulars"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label="Particulars"
                  size="small"
                  fullWidth
                  multiline
                  minRows={2}
                  className="col-span-2"
                />
              )}
            />

            <Controller
              name="isActive"
              control={control}
              render={({ field }) => (
                <TextField
                  select
                  label="Status"
                  size="small"
                  fullWidth
                  value={field.value ? "active" : "inactive"}
                  onChange={(event) =>
                    field.onChange(event.target.value === "active")
                  }
                  className="col-span-2"
                >
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                </TextField>
              )}
            />

            <div className="col-span-2">
              <PrimaryButton
                type="submit"
                title={formMode === "edit" ? "Update Client" : "Add Client"}
                disabled={isSaving}
                isLoading={isSaving}
                className="w-full"
              />
            </div>
          </form>
        </MuiModal>
      )}
    </div>
  );
};

export default WorkationClients;
