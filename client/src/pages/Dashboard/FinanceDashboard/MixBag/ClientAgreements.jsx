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
import ThreeDotMenu from "../../../../components/ThreeDotMenu";

const ClientAgreements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);
  const [editingClient, setEditingClient] = useState(null);

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
    queryKey: ["finance-client-agreements"],
    queryFn: async () => {
      const response = await axios.get("/api/finance/client-agreements");
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

  const tableData = useMemo(() => clientsData
    .slice()
    .sort((a, b) => (a?.clientName || "").localeCompare(b?.clientName || ""))
    .map((item, index) => ({
      srno: index + 1,
      name: item?.clientName || "Unnamed",
      documentCount: Array.isArray(item?.documents) ? item.documents.length : 0,
      files: item?.documents || [],
      id: item?._id || "",
    })), [clientsData]);

  const columns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() =>
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
            )
          }
          className="text-primary underline cursor-pointer"
        >
          {params.value || "Unnamed"}
        </span>
      ),
    },
    { field: "documentCount", headerName: "No. of Documents", flex: 1 },
    {
      field: "actions",
      headerName: "Action",
      width: 110,
      sortable: false,
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data.id}
          menuItems={[{ label: "Edit", onClick: () => { setEditingClient(params.data); reset({ name: params.data.name }); setOpenModal(true); } }]}
        />
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
    </div>
  );
};

export default ClientAgreements;