import { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { CircularProgress, TextField } from "@mui/material";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import PrimaryButton from "../../../../components/PrimaryButton";
import { queryClient } from "../../../../main";
import { toast } from "sonner";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";
import { HiPencilSquare } from "react-icons/hi2";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import useAuth from "../../../../hooks/useAuth";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const ClientAgreements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);
  const [confirmationAction, setConfirmationAction] = useState(null);
  const isTechDepartment = auth?.user?.departments?.some(
    (department) =>
      String(department?._id || department) === TECH_DEPARTMENT_ID ||
      ["tech", "tech department"].includes(
        department?.name?.trim().toLowerCase(),
      ),
  );

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: { name: "" },
  });

  const closeModal = () => {
    setOpenModal(false);
    setEditingClient(null);
    reset({ name: "" });
  };

  const { data: clientsData = [], isPending: isClientsDataPending } = useQuery({
    queryKey: ["finance-client-agreements", Boolean(isTechDepartment)],
    queryFn: async () => {
      const response = await axios.get("/api/finance/client-agreements", {
        params: { includeDeleted: Boolean(isTechDepartment) },
      });
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const { mutate: createClient, isPending: isCreateClientPending } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post("/api/finance/client-agreements/client", payload);
      return response.data;
    },
    onSuccess: (response) => {
      toast.success("Client created successfully");
      queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] });
      closeModal();

      const client = response?.client;
      if (client?._id) {
        navigate(
          location.pathname.includes("mix-bag")
            ? `/app/dashboard/finance-dashboard/mix-bag/client-agreements/${encodeURIComponent(client.clientName)}`
            : `/app/client-agreements/${encodeURIComponent(client.clientName)}`,
          {
            state: {
              files: [],
              name: client.clientName,
              id: client._id,
            },
          }
        );
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create client");
    },
  });

  const { mutate: updateClientName, isPending: isUpdateClientPending } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch("/api/finance/client-agreements/client", payload);
      return response.data;
    },
    onSuccess: () => {
      toast.success("Client updated successfully");
      queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] });
      closeModal();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update client");
    },
  });

  const { mutate: manageClient, isPending: isManagingClient } = useMutation({
    mutationFn: async ({ clientId, action }) => {
      const response = await axios.patch(
        "/api/finance/client-agreements/client/action",
        { clientId, action },
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Client agreement entry updated successfully");
      queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          "Failed to update client agreement entry",
      );
    },
  });

  const tableData = useMemo(() => clientsData
    .slice()
    .sort((a, b) => (a?.clientName || "").localeCompare(b?.clientName || ""))
    .map((item, index) => ({
      srno: index + 1,
      name: item?.clientName || "Unnamed",
      documentCount: Array.isArray(item?.documents) ? item.documents.length : 0,
      files: item?.documents || [],
      id: item?._id || "",
      isDeleted: Boolean(item?.clientAgreementStatus?.isDeleted),
      deletedByName: item?.clientAgreementStatus?.deletedBy
        ? [
            item.clientAgreementStatus.deletedBy.firstName,
            item.clientAgreementStatus.deletedBy.lastName,
          ]
            .filter(Boolean)
            .join(" ") ||
          item.clientAgreementStatus.deletedBy.employeeName ||
          item.clientAgreementStatus.deletedBy.name ||
          item.clientAgreementStatus.deletedBy.email ||
          "N/A"
        : "",
    })), [clientsData]);

  const handleDelete = (client) => {
    setConfirmationAction({
      type: isTechDepartment ? "permanent-delete" : "delete",
      client,
    });
  };

  const handleRestore = (client) => {
    setConfirmationAction({ type: "restore", client });
  };

  const confirmClientAction = () => {
    const client = confirmationAction?.client;
    if (!client) return;

    manageClient({
      clientId: client.id,
      action: confirmationAction.type === "restore" ? "restore" : "delete",
    });
  };

  const confirmationContent = {
    delete: {
      title: "Delete Client Agreement Entry",
      message: "Are you sure you want to delete this client agreement entry?",
    },
    "permanent-delete": {
      title: "Permanently Delete Client Agreement Entry",
      message:
        "Are you sure you want to permanently delete this client agreement entry?",
    },
    restore: {
      title: "Restore Client Agreement Entry",
      message: "Are you sure you want to restore this client agreement entry?",
    },
  }[confirmationAction?.type];

  const columns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role={params.data.isDeleted ? undefined : "button"}
          onClick={() => {
            if (params.data.isDeleted) return;
            navigate(
              location.pathname.includes("mix-bag")
                ? `/app/dashboard/finance-dashboard/mix-bag/client-agreements/${encodeURIComponent(params.data.name)}`
                : `/app/client-agreements/${encodeURIComponent(params.data.name)}`,
              {
                state: {
                  files: params.data.files || [],
                  name: params.data.name || "Unnamed",
                  id: params.data.id,
                },
              }
            );
          }}
          className={
            params.data.isDeleted
              ? "text-gray-500 cursor-not-allowed"
              : "text-primary underline cursor-pointer"
          }
        >
          {params.value || "Unnamed"}
        </span>
      ),
    },
    { field: "documentCount", headerName: "No. of Documents", flex: 1 },
    ...(tableData.some((item) => item.isDeleted)
      ? [
          {
            field: "deletedByName",
            headerName: "Deleted By",
            flex: 1,
          },
        ]
      : []),
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
      filter: false,
      cellRenderer: ({ data }) =>
        data.isDeleted ? (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title="Restore client agreement entry"
              aria-label="Restore client agreement entry"
              disabled={isManagingClient}
              onClick={() => handleRestore(data)}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdOutlineRestore size={24} />
            </button>
            <button
              type="button"
              title="Permanently delete client agreement entry"
              aria-label="Permanently delete client agreement entry"
              disabled={isManagingClient}
              onClick={() => handleDelete(data)}
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdDeleteForever size={24} />
            </button>
          </div>
        ) : (
          <div className="flex h-full items-center gap-2">
            <button
              type="button"
              title="Edit client"
              aria-label="Edit client"
              onClick={() => {
                setEditingClient(data);
                reset({ name: data.name });
                setOpenModal(true);
              }}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
            >
              <HiPencilSquare size={24} />
            </button>
            <button
              type="button"
              title={
                isTechDepartment
                  ? "Permanently delete client agreement entry"
                  : "Delete client agreement entry"
              }
              aria-label="Delete client agreement entry"
              disabled={isManagingClient}
              onClick={() => handleDelete(data)}
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdDeleteForever size={24} />
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        {!isClientsDataPending ? (
          <AgTable
            columns={columns}
            data={tableData}
            tableTitle="Client Agreements"
            tableHeight={400}
            hideFilter
            search
            buttonTitle="Add New Client"
            handleClick={() => { setEditingClient(null); reset({ name: "" }); setOpenModal(true); }}
          />
        ) : (
          <div className="h-72 place-items-center">
            <CircularProgress />
          </div>
        )}
      </PageFrame>

      <MuiModal title={editingClient ? "Edit Client" : "Add New Client"} open={openModal} onClose={closeModal}>
        <form onSubmit={handleSubmit((data) => {
          const trimmedName = data.name.trim();
          if (editingClient) {
            updateClientName({ clientId: editingClient.id, name: trimmedName });
            return;
          }
          createClient({ name: trimmedName });
        })} className="grid grid-cols-1 gap-4">
          <Controller
            name="name"
            control={control}
            rules={{
              required: "Client name is required",
              validate: { isAlphanumeric, noOnlyWhitespace },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Client Name"
                fullWidth
                size="small"
                error={!!errors.name}
                helperText={errors?.name?.message}
              />
            )}
          />
          <PrimaryButton type="submit" title={editingClient ? "Save Changes" : "Add New Client"} isLoading={isCreateClientPending || isUpdateClientPending} disabled={isCreateClientPending || isUpdateClientPending} />
        </form>
      </MuiModal>

      <ConfirmationModal
        open={Boolean(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText="Yes"
        cancelText="No"
        isLoading={isManagingClient}
        onClose={() => setConfirmationAction(null)}
        onConfirm={confirmClientAction}
      />
    </div>
  );
};

export default ClientAgreements;
