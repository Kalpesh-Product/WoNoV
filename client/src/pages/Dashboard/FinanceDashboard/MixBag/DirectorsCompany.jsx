import React, { useMemo, useState } from "react";
import { TextField } from "@mui/material";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import PrimaryButton from "../../../../components/PrimaryButton";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const DirectorsCompany = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);
  const [createType, setCreateType] = useState("directorKyc");

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

  const openCreateModal = (type) => {
    setCreateType(type);
    setOpenModal(true);
  };

  const { data: kycDetails, isLoading } = useQuery({
    queryKey: ["directorsCompany"],
    queryFn: async () => {
      const response = await axios.get("/api/company/get-kyc");
      return response.data.data;
    },
  });

  const { mutate: createKycEntry, isPending: isCreating } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.post("/api/company/create-kyc-entry", payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["directorsCompany"] });
      closeModal();
      toast.success(
        variables.type === "directorKyc"
          ? "Director KYC created successfully"
          : "Company KYC ready to add documents"
      );

      const targetName = variables.type === "directorKyc" ? variables.nameOfDirector : "Company";
      navigate(
        location.pathname.includes("mix-bag")
          ? `/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC/${targetName}`
          : `/app/company-KYC/${targetName}`,
        {
          state: {
            files: [],
            name: targetName,
          },
        }
      );
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to create KYC entry");
    },
  });

  const tableData = useMemo(() => {
    if (!kycDetails) return [];

    const result = [];

    result.push({
      id: "company",
      srno: 1,
      name: "Company",
      files: kycDetails.companyKyc || [],
      documentCount: kycDetails.companyKyc?.length || 0,
    });

    kycDetails.directorKyc?.forEach((director, index) => {
      result.push({
        id: `director-${index}`,
        srno: index + 2,
        name: director.nameOfDirector,
        files: director.documents || [],
        documentCount: director.documents?.length || 0,
      });
    });
    return result;
  }, [kycDetails]);

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
                ? `/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC/${params.data.name}`
                : `/app/company-KYC/${params.data.name}`,
              {
                state: {
                  files: params.data.files,
                  name: params.data.name,
                },
              }
            )
          }
          className="text-primary underline cursor-pointer">
          {params.value}
        </span>
      ),
    },
    { field: "documentCount", headerName: "No. of Documents", flex: 1 },
  ];

  const onSubmit = ({ name }) => {
    const trimmedName = name.trim();
    createKycEntry({
      type: createType,
      ...(createType === "directorKyc" ? { nameOfDirector: trimmedName } : { companyName: trimmedName }),
    });
  };

  return (
    <div className="p-4 space-y-4">
      <PageFrame>
        <div className="flex flex-wrap justify-end gap-3 pb-4">
          <PrimaryButton
            title="Add New Director KYC"
            handleSubmit={() => openCreateModal("directorKyc")}
            className="!w-auto"
            padding="px-4 py-2"
          />
          <PrimaryButton
            title="Add New Company KYC"
            handleSubmit={() => openCreateModal("companyKyc")}
            className="!w-auto"
            padding="px-4 py-2"
          />
        </div>
        <AgTable
          columns={columns}
          data={tableData}
          tableTitle=" DIRECTORS & COMPANY KYC"
          hideFilter
          search
          loading={isLoading}
        />
      </PageFrame>

      <MuiModal
        open={openModal}
        onClose={closeModal}
        title={createType === "directorKyc" ? "Add New Director KYC" : "Add New Company KYC"}
      >
        <form onSubmit={handleSubmit(onSubmit)} className="grid grid-cols-1 gap-4">
          <Controller
            name="name"
            control={control}
            rules={{
              required: "Name is required",
              validate: {
                isAlphanumeric,
                noOnlyWhitespace,
              },
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label={createType === "directorKyc" ? "Director Name" : "Company Name"}
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
            disabled={isCreating}
            isLoading={isCreating}
          />
        </form>
      </MuiModal>
    </div>
  );
};

export default DirectorsCompany;