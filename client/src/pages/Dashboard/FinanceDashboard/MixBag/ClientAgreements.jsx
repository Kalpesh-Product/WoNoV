import { useState } from "react";
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

const ClientAgreements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [openModal, setOpenModal] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: { name: "" },
  });

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
    onSuccess: () => {
      toast.success("Client created successfully");
      queryClient.invalidateQueries({ queryKey: ["finance-client-agreements"] });
      setOpenModal(false);
      reset();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create client");
    },
  });

  const tableData = clientsData
    .slice()
    .sort((a, b) => (a?.clientName || "").localeCompare(b?.clientName || ""))
    .map((item, index) => ({
      srno: index + 1,
      name: item?.clientName || "Unnamed",
      documentCount: Array.isArray(item?.documents) ? item.documents.length : 0,
      files: item?.documents || [],
      id: item?._id || "",
    }));

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
            handleClick={() => setOpenModal(true)}
          />
        ) : (
          <div className="h-72 place-items-center">
            <CircularProgress />
          </div>
        )}
      </PageFrame>

      <MuiModal title="Add New Client" open={openModal} onClose={() => setOpenModal(false)}>
        <form onSubmit={handleSubmit((data) => createClient({ name: data.name.trim() }))} className="grid grid-cols-1 gap-4">
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
          <PrimaryButton type="submit" title="Add New Client" isLoading={isCreateClientPending} disabled={isCreateClientPending} />
        </form>
      </MuiModal>
    </div>
  );
};

export default ClientAgreements;