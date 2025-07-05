import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";
import WidgetSection from "../../components/WidgetSection";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import { useEffect, useRef, useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import usePageDepartment from "../../hooks/usePageDepartment";
import PageFrame from "./PageFrame";
import { queryClient } from "../../main";
import MuiModal from "../MuiModal";
import { Controller, useForm } from "react-hook-form";
import { TextField } from "@mui/material";
import UploadFileInput from "../UploadFileInput";
import ThreeDotMenu from "../ThreeDotMenu";
import YearWiseTable from "../Tables/YearWiseTable";
import SecondaryButton from "../SecondaryButton";
import DangerButton from "../DangerButton";
import { noOnlyWhitespace, isAlphanumeric } from "../../utils/validators";
import humanDate from "../../utils/humanDateForamt";

const SopUpload = () => {
  const axios = useAxiosPrivate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const department = usePageDepartment();
  const [openModal, setOpenModal] = useState(false);
  const [selectedSop, setSelectedSop] = useState([]);
  const [modalType, setModalType] = useState("");
  const uploadItems = ["Upload Sops"];

  // For adding an SOP
  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    control,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      documentName: "",
      sop: null,
    },
  });

  //For Editing SOP
  const {
    handleSubmit: handleEditForm,
    control: controlEdit,
    reset: resetEdit,
    formState: { errors: editErrors },
    setValue: setEditValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      newName: "",
    },
  });

  const { mutate: uploadSop, isPending } = useMutation({
    mutationFn: async ({ sop, documentName }) => {
      const formData = new FormData();
      formData.append("department-document", sop);
      formData.append("type", "sop");
      formData.append("documentName", documentName || sop?.name || "Untitled");

      const response = await axios.post(
        `/api/company/add-department-document/${department?._id || ""}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP uploaded successfully!");
      reset(); // reset form
      setOpenModal(false); // close modal
      queryClient.invalidateQueries({ queryKey: ["departmentSOP"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to upload SOP.");
    },
  });

  const { mutate: editSop, isPending: isEditPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/company/update-department-document`,
        data
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP updated successfully!");
      reset(); // reset form
      setOpenModal(false); // close modal
      queryClient.invalidateQueries({ queryKey: ["departmentSOP"] });
    },
    onError: () => {
      toast.error("Failed to update SOP.");
    },
  });
  const { mutate: deleteSop, isPending: isDeletePending } = useMutation({
    mutationFn: async (data) => {
      console.log("data for delete", data);
      const response = await axios.patch(
        `/api/company/delete-department-document`,
        {
          documentId: selectedSop?._id,
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("SOP Marked As Inactive Successfully!");
      setOpenModal(false); // close modal
      queryClient.invalidateQueries({ queryKey: ["departmentSOP"] });
    },
    onError: () => {
      toast.error("Failed to delete SOP.");
    },
  });

  const handleAddSop = () => {
    setModalType("add");
    setOpenModal(true);
  };

  const handleEdit = (data) => {
    setModalType("edit");
    setSelectedSop(data);
    setEditValue("newName", data?.name.trim() || "");
    setOpenModal(true);
  };
  const handleDelete = (data) => {
    deleteSop({
      documentId: selectedSop?._id,
    });
  };

  const { data = [], isLoading } = useQuery({
    queryKey: ["departmentSOP", department?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/company/get-department-documents?departmentId=${department?._id}&type=sop`
      );
      return response?.data?.documents?.sopDocuments || [];
    },
    enabled: !!department?._id,
    staleTime: 1000 * 60 * 5,
  });

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "name",
      headerName: "SOP Name",
      flex: 1,
      cellRenderer: (params) => (
        <a
          className="text-primary underline cursor-pointer"
          href={params?.data.documentLink || "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          {params.value}
        </a>
      ),
    },
    { field: "date", headerName: "Upload Date", flex: 1 },
    { field: "updatedAt", headerName: "Modified Date", flex: 1 },
    { field: "status", headerName: "Status", flex: 1 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data.id}
          menuItems={[
            {
              label: "Edit",
              onClick: () => {
                handleEdit(params.data);
              },
            },
            {
              label: "Mark As Inactive",
              onClick: () => {
                setModalType("delete");
                setSelectedSop(params.data);
                setOpenModal(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  const tableData =
    Array.isArray(data) && !isLoading
      ? data
          .map((item, index) => ({
            ...item,
            srNo: index + 1,
            name: item?.name || "Untitled",
            documentLink: item?.documentLink || "#",
            date: item.createdAt,
            status: item.isActive ? "Active" : "-",
            updatedAt : humanDate(item.updatedAt),
          }))
          .filter((item) => item.isActive === true)
      : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageFrame>
          <YearWiseTable
            dateColumn={"date"}
            key={data?.length || 0}
            columns={columns}
            data={tableData}
            buttonTitle={"Add SOP"}
            handleSubmit={handleAddSop}
            search
            tableTitle="SOP documents"
          />
        </PageFrame>
      </div>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={`${
          modalType === "add"
            ? "Add SOP"
            : modalType === "edit"
            ? "Edit SOP"
            : "Mark SOP As Inactive"
        }`}
      >
        {modalType === "add" && (
          <div>
            <form
              onSubmit={handleSubmit((data) => uploadSop(data))}
              className="grid grid-cols-1 gap-4"
            >
              <Controller
                name="documentName"
                control={control}
                rules={{
                  required: "Document Name is required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Document Name"
                    size="small"
                    fullWidth
                    error={!!errors.documentName}
                    helperText={errors?.documentName?.message}
                  />
                )}
              />
              <Controller
                name="sop"
                control={control}
                rules={{ required: "SOP is Required" }}
                render={({ field }) => (
                  <UploadFileInput
                    value={field.value}
                    onChange={field.onChange}
                    previewType="pdf"
                  />
                )}
              />
              <PrimaryButton
                type={"submit"}
                title={"Upload SOP"}
                isLoading={isPending}
                disabled={isPending}
              />
            </form>
          </div>
        )}

        {modalType === "edit" && (
          <div>
            <form
              className="grid grid-cols-1 gap-4"
              onSubmit={handleEditForm((data) =>
                editSop({
                  newName: data.newName,
                  documentId: selectedSop?._id,
                })
              )}
            >
              <Controller
                name="newName"
                control={controlEdit}
                rules={{
                  required: "Document Name is Required",
                  validate: {
                    noOnlyWhitespace,
                    isAlphanumeric,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    size="small"
                    label="Document Name"
                    fullWidth
                    error={!!editErrors.newName}
                    helperText={editErrors?.newName?.message}
                  />
                )}
              />
              <PrimaryButton
                type={"submit"}
                title={"Update SOP"}
                isLoading={isEditPending}
                disabled={isEditPending}
              />
            </form>
          </div>
        )}

        {modalType === "delete" && (
          <div className="border-default border-borderGray rounded-xl flex flex-col gap-4 p-4">
            <div>
              <span>Mark {selectedSop?.name} as Inactive ?</span>
            </div>
            <div className="flex justify-end gap-4 items-center">
              <SecondaryButton
                title={"Cancel"}
                handleSubmit={() => {
                  setOpenModal(false);
                  setSelectedSop([]);
                }}
              />
              <DangerButton
                title={"Confirm"}
                handleSubmit={() => handleDelete(selectedSop)}
              />
            </div>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default SopUpload;
