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
import { HiPencilSquare } from "react-icons/hi2";
import { MdDeleteForever, MdOutlineRestore } from "react-icons/md";
import useAuth from "../../../../hooks/useAuth";
import ConfirmationModal from "../../../../components/ConfirmationModal";

const TECH_DEPARTMENT_ID = "6798ba9de469e809084e2494";

const LandlordAgreements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const { auth } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [editingLandlord, setEditingLandlord] = useState(null);
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
    setEditingLandlord(null);
    reset({ name: "" });
  };

  const { data: landlordData = [], isLoading } = useQuery({
    queryKey: ["landlord-agreements", Boolean(isTechDepartment)],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/finance/get-landlord-agreements",
          { params: { includeDeleted: Boolean(isTechDepartment) } },
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
            ? `/app/dashboard/finance-dashboard/mix-bag/landlord-agreements/${encodeURIComponent(landlord.name)}`
            : `/app/landlord-agreements/${encodeURIComponent(landlord.name)}`,
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

  const { mutate: updateLandlord, isPending: isUpdating } = useMutation({
    mutationFn: async (payload) => {
      const response = await axios.patch("/api/finance/landlord", payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["landlord-agreements"] });
      closeModal();
      toast.success("Landlord updated successfully");
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update landlord");
    },
  });

  const { mutate: manageLandlord, isPending: isManaging } = useMutation({
    mutationFn: async ({ landlordId, action }) => {
      const response = await axios.patch("/api/finance/landlord/action", {
        landlordId,
        action,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "Landlord updated successfully");
      queryClient.invalidateQueries({ queryKey: ["landlord-agreements"] });
      setConfirmationAction(null);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to update landlord");
    },
  });

  const tableData = useMemo(
    () =>
      Array.isArray(landlordData)
        ? landlordData
          .slice()
          .sort((a, b) => (a?.name || "").localeCompare(b?.name))
          .map((item, index) => ({
            srno: index + 1,
            name: item?.name || "Unnamed",
            documentCount: Array.isArray(item?.documents)
              ? item.documents.length
              : 0,
            files: item?.documents || [],
            id: item?._id || "",
            isDeleted: Boolean(item?.isDeleted),
            deletedByName: item?.deletedBy
              ? [item.deletedBy.firstName, item.deletedBy.lastName]
                  .filter(Boolean)
                  .join(" ") ||
                item.deletedBy.employeeName ||
                item.deletedBy.name ||
                item.deletedBy.email ||
                "N/A"
              : "",
          }))
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
          role={params.data.isDeleted ? undefined : "button"}
          onClick={() => {
            if (params.data.isDeleted) return;
            navigate(
              location.pathname.includes("mix-bag")
                ? `/app/dashboard/finance-dashboard/mix-bag/landlord-agreements/${encodeURIComponent(params.data.name)}`
                : `/app/landlord-agreements/${encodeURIComponent(params.data.name)}`,
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
              title="Restore landlord"
              aria-label="Restore landlord"
              disabled={isManaging}
              onClick={() => handleRestore(data)}
              className="flex h-8 w-8 items-center justify-center text-black hover:text-primary disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdOutlineRestore size={24} />
            </button>
            <button
              type="button"
              title="Permanently delete landlord"
              aria-label="Permanently delete landlord"
              disabled={isManaging}
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
              title="Edit landlord"
              aria-label="Edit landlord"
              onClick={() => {
                setEditingLandlord(data);
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
                  ? "Permanently delete landlord"
                  : "Delete landlord"
              }
              aria-label="Delete landlord"
              disabled={isManaging}
              onClick={() => handleDelete(data)}
              className="flex h-8 w-8 items-center justify-center text-red-600 hover:text-red-700 disabled:cursor-not-allowed disabled:text-gray-400"
            >
              <MdDeleteForever size={24} />
            </button>
          </div>
        ),
    },
  ];

  const handleDelete = (landlord) => {
    setConfirmationAction({
      type: isTechDepartment ? "permanent-delete" : "delete",
      landlord,
    });
  };

  const handleRestore = (landlord) => {
    setConfirmationAction({ type: "restore", landlord });
  };

  const confirmLandlordAction = () => {
    const landlord = confirmationAction?.landlord;
    if (!landlord) return;

    manageLandlord({
      landlordId: landlord.id,
      action: confirmationAction.type === "restore" ? "restore" : "delete",
    });
  };

  const confirmationContent = {
    delete: {
      title: "Delete Landlord",
      message: "Are you sure you want to delete this landlord?",
    },
    "permanent-delete": {
      title: "Permanently Delete Landlord",
      message: "Are you sure you want to permanently delete this landlord?",
    },
    restore: {
      title: "Restore Landlord",
      message: "Are you sure you want to restore this landlord?",
    },
  }[confirmationAction?.type];

  const onSubmit = ({ name }) => {
    const trimmedName = name.trim();

    if (editingLandlord) {
      updateLandlord({ landlordId: editingLandlord.id, name: trimmedName });
      return;
    }

    createLandlord({ name: trimmedName });
  };

  return (
    <div className="p-4 space-y-4">
      <PageFrame>
        <div className="flex justify-end pb-4">
          <PrimaryButton
            title="Add New Landlord"
            handleSubmit={() => { setEditingLandlord(null); reset({ name: "" }); setOpenModal(true); }}
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

      <MuiModal title={editingLandlord ? "Edit Landlord" : "Add New Landlord"} open={openModal} onClose={closeModal}>
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
            title={editingLandlord ? "Save Changes" : "Create"}
            isLoading={isCreating || isUpdating}
            disabled={isCreating || isUpdating}
          />
        </form>
      </MuiModal>

      <ConfirmationModal
        open={Boolean(confirmationAction)}
        title={confirmationContent?.title}
        message={confirmationContent?.message}
        confirmText="Yes"
        cancelText="No"
        isLoading={isManaging}
        onClose={() => setConfirmationAction(null)}
        onConfirm={confirmLandlordAction}
      />
    </div>
  );
};

export default LandlordAgreements;
