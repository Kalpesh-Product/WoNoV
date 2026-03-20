import React, { useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { CircularProgress, TextField } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import PageFrame from "../../../../components/Pages/PageFrame";
import PrimaryButton from "../../../../components/PrimaryButton";
import { toast } from "sonner";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const LandlordAgreements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);

  const { control, handleSubmit, reset, formState: { errors } } = useForm({
    mode: "onChange",
    defaultValues: {
      name: "",
    },
  });

  const closeModal = () => {
    setOpenModal(false);
    reset();
  };

  const { data: landlordData = [], isLoading } = useQuery({
    queryKey: ["landlord-agreements"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/finance/get-landlord-agreements"
        );
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch landlord agreements:", error);
        return [];
      }
    },
  });

  const { mutate: createLandlord, isPending: isCreating } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post("/api/finance/create-landlord", payload);
      return response.data;
    },
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["landlord-agreements"] });
      closeModal();
      toast.success("Landlord created successfully");

      const landlord = response?.landlord;
      if (landlord?._id) {
        navigate(
          location.pathname.includes("mix-bag")
            ? `/app/dashboard/finance-dashboard/mix-bag/landlord-agreements/${landlord.name}`
            : `/app/landlord-agreements/${landlord.name}`,
          {
            state: {
              files: [],
              name: landlord.name,
              id: landlord._id,
            },
          }
        );
      }
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create landlord");
    },
  });

  const tableData = useMemo(
    () =>
      Array.isArray(landlordData)
        ? landlordData
          .slice()
          .sort((a, b) => (a?.name || "").localeCompare(b?.name))
          .map((item, index) => {
            const rawName = item?.name || "Unnamed";
            const safeName = rawName.replace(/\//g, "");

            return {
              srno: index + 1,
              name: safeName,
              documentCount: Array.isArray(item?.documents)
                ? item.documents.length
                : 0,
              files: item?.documents || [],
              id: item?._id || "",
            };
          })
        : [],
    [landlordData]
  );

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
                ? `/app/dashboard/finance-dashboard/mix-bag/landlord-agreements/${params.data.name}`
                : `/app/landlord-agreements/${params.data.name}`,
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

  const onSubmit = ({ name }) => {
    createLandlord({ name: name.trim() });
  };

  return (
    <div className="p-4 space-y-4">
      <PageFrame>
        <div className="flex justify-end pb-4">
          <PrimaryButton
            title="Add New Landlord"
            handleSubmit={() => setOpenModal(true)}
            className="!w-auto"
            padding="px-4 py-2"
          />
        </div>

        {!isLoading ? (
          <AgTable
            columns={columns}
            data={tableData}
            tableTitle="Landlord Agreements"
            tableHeight={400}
            hideFilter
            search
          />
        ) : (
          <div className="h-72 place-items-center">
            <CircularProgress />
          </div>
        )}
      </PageFrame>

      <MuiModal title={"Add New Landlord"} open={openModal} onClose={closeModal}>
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
          <Controller
            name="name"
            control={control}
            rules={{
              required: "Landlord name is required",
              validate: {
                isAlphanumeric,
                noOnlyWhitespace,
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Landlord Name"
                fullWidth
                size="small"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />
          <PrimaryButton
            type="submit"
            title="Create"
            isLoading={isCreating}
            disabled={isCreating}
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default LandlordAgreements;