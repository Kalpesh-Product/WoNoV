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
import { HiPencilSquare } from "react-icons/hi2";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import useAuth from "../../../../hooks/useAuth";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const DirectorsCompany = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [createType, setCreateType] = useState("directorKyc");
  const [editTarget, setEditTarget] = useState(null);
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
    defaultValues: {
      name: "",
    },
  });

  const closeModal = () => {
    setOpenModal(false);
    setEditTarget(null);
    setCreateType("directorKyc");
    reset({ name: "" });
  };

  const openCreateModal = (type) => {
    setEditTarget(null);
    setCreateType(type);
    reset({ name: "" });
    setOpenModal(true);
  };

  const openEditModal = (row) => {
    setEditTarget(row);
    setCreateType(row.type);
    reset({ name: row.name });
    setOpenModal(true);
  };

  const { data: kycDetails, isLoading } = useQuery({
    queryKey: ["directorsCompany", Boolean(isTechDepartment)],
    queryFn: async () => {
      const response = await axios.get("/api/company/get-kyc", {
        params: { includeDeleted: Boolean(isTechDepartment) },
      });
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
          ? `/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC/${encodeURIComponent(targetName)}`
          : `/app/company-KYC/${encodeURIComponent(targetName)}`,
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

  const { mutate: updateKycEntryName, isPending: isUpdating } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch("/api/company/update-kyc-entry-name", payload);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["directorsCompany"] });
      closeModal();
      toast.success(variables.type === "companyKyc" ? "Company name updated successfully" : "Director name updated successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update name");
    },
  });

  const { mutate: manageKycEntry, isPending: isManagingEntry } = useMutation({
    mutationFn: async ({ row, action }) => {
      const response = await axios.patch("/api/company/manage-kyc-entry", {
        type: row.type,
        entryId: row.type === "directorKyc" ? row.id : undefined,
        action,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "KYC entry updated successfully");
      queryClient.invalidateQueries({ queryKey: ["directorsCompany"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update KYC entry");
    },
  });

  const tableData = useMemo(() => {
    if (!kycDetails) return [];

    const result = [];

    if (kycDetails.companyKycEntry !== null) {
      result.push({
        id: "company",
        name: kycDetails.companyName || "Company",
        routeName: "Company",
        type: "companyKyc",
        files: kycDetails.companyKyc || [],
        documentCount: kycDetails.companyKyc?.length || 0,
        isDeleted: Boolean(kycDetails.companyKycEntry?.isDeleted),
        deletedBy: kycDetails.companyKycEntry?.deletedBy,
      });
    }

    kycDetails.directorKyc?.forEach((director) => {
      result.push({
        id: director._id,
        name: director.nameOfDirector,
        routeName: director.nameOfDirector,
        type: "directorKyc",
        files: director.documents || [],
        documentCount: director.documents?.length || 0,
        isDeleted: Boolean(director.isDeleted),
        deletedBy: director.deletedBy,
      });
    });
    return result.map((entry, index) => ({
      ...entry,
      srno: index + 1,
      deletedByName: entry.deletedBy
        ? [entry.deletedBy.firstName, entry.deletedBy.lastName]
            .filter(Boolean)
            .join(" ") ||
          entry.deletedBy.employeeName ||
          entry.deletedBy.name ||
          entry.deletedBy.email ||
          "N/A"
        : "",
    }));
  }, [kycDetails]);

  const handleDelete = (row) => {
    setConfirmationAction({
      type: isTechDepartment ? "permanent-delete" : "delete",
      row,
    });
  };

  const handleRestore = (row) => {
    setConfirmationAction({ type: "restore", row });
  };

  const confirmKycAction = () => {
    const row = confirmationAction?.row;
    if (!row) return;

    manageKycEntry({
      row,
      action: confirmationAction.type === "restore" ? "restore" : "delete",
    });
  };

  const confirmationContent = {
    delete: {
      title: "Delete KYC Entry",
      message: "Are you sure you want to delete this KYC entry?",
    },
    "permanent-delete": {
      title: "Permanently Delete KYC Entry",
      message: "Are you sure you want to permanently delete this KYC entry?",
    },
    restore: {
      title: "Restore KYC Entry",
      message: "Are you sure you want to restore this KYC entry?",
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
                ? `/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC/${encodeURIComponent(params.data.routeName)}`
                : `/app/company-KYC/${encodeURIComponent(params.data.routeName)}`,
              {
                state: {
                  files: params.data.files,
                  name: params.data.routeName,
                },
              }
            );
          }}
          className={
            params.data.isDeleted
              ? "text-gray-500 cursor-not-allowed"
              : "text-primary underline cursor-pointer"
          }>
          {params.value}
        </span>
      ),
    },
    { field: "documentCount", headerName: "No. of Documents", flex: 1 },
    ...(tableData.some((entry) => entry.isDeleted)
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
              title="Restore KYC entry"
              aria-label="Restore KYC entry"
              disabled={isManagingEntry}
              onClick={() => handleRestore(data)}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdOutlineRestore size={24} />
            </button>
            <button
              type="button"
              title="Permanently delete KYC entry"
              aria-label="Permanently delete KYC entry"
              disabled={isManagingEntry}
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
              title="Edit KYC entry"
              aria-label="Edit KYC entry"
              onClick={() => openEditModal(data)}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary"
            >
              <HiPencilSquare size={24} />
            </button>
            <button
              type="button"
              title={
                isTechDepartment
                  ? "Permanently delete KYC entry"
                  : "Delete KYC entry"
              }
              aria-label="Delete KYC entry"
              disabled={isManagingEntry}
              onClick={() => handleDelete(data)}
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdDeleteForever size={24} />
            </button>
          </div>
        ),
    },
  ];

  const onSubmit = ({ name }) => {
    const trimmedName = name.trim();

    if (editTarget) {
      updateKycEntryName({
        type: editTarget.type,
        currentName: editTarget.name,
        name: trimmedName,
      });
      return;
    }

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
        title={editTarget ? (editTarget.type === "companyKyc" ? "Edit Company Name" : "Edit Director Name") : (createType === "directorKyc" ? "Add New Director KYC" : "Add New Company KYC")}
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
                label={editTarget ? (editTarget.type === "companyKyc" ? "Company Name" : "Director Name") : (createType === "directorKyc" ? "Director Name" : "Company Name")}
                fullWidth
                size="small"
                error={!!errors.name}
                helperText={errors.name?.message}
              />
            )}
          />

          <PrimaryButton
            type="submit"
            title={editTarget ? "Save Changes" : "Create"}
            disabled={isCreating || isUpdating}
            isLoading={isCreating || isUpdating}
          />
        </form>
      </MuiModal>

      <ConfirmationModal
        open={Boolean(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText="Yes"
        cancelText="No"
        isLoading={isManagingEntry}
        onClose={() => setConfirmationAction(null)}
        onConfirm={confirmKycAction}
      />
    </div>
  );
};

export default DirectorsCompany;
