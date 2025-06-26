import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";
import WidgetSection from "../../components/WidgetSection";
import AgTable from "../../components/AgTable";
import PrimaryButton from "../../components/PrimaryButton";
import { useRef, useState } from "react";
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

const SopUpload = () => {
  const axios = useAxiosPrivate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const department = usePageDepartment();
  const [openModal, setOpenModal] = useState(false);
  const [selectedSop, setSelectedSop] = useState([]);
  const [modalType, setModalType] = useState("");
  const uploadItems = ["Upload Sops"];
  const {
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    control,
  } = useForm({
    defaultValues: {
      documentName: "",
      sop: null,
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
    mutationFn: async (data) => {},
    onSuccess: () => {},
    onError: () => {},
  });
  const { mutate: deleteSop, isPending: isDeletePending } = useMutation({
    mutationFn: async (data) => {},
    onSuccess: () => {},
    onError: () => {},
  });

  const handleAddSop = () => {
    setModalType("add");
    setOpenModal(true);
  };

  const handleEdit = (data) => {
    setOpenModal(true);
  };
  const handleDelete = (data) => {
    setOpenModal(true);
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
    staleTime: 1000 * 60 * 5, // optional: 5 min caching
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
    { field: "createdAt", headerName: "Upload Date", flex: 1 },
    { field: "updatedAt", headerName: "Modified Date", flex: 1 },
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
              onClick: () => {},
            },
            {
              label: "Delete",
              onClick: () => {},
            },
          ]}
        />
      ),
    },
  ];

  const tableData =
    Array.isArray(data) && !isLoading
      ? data.map((item, index) => ({
          srNo: index + 1,
          name: item?.name || "Untitled",
          documentLink: item?.documentLink || "#",
        }))
      : [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <PageFrame>
          <AgTable
            key={data?.length || 0}
            columns={columns}
            data={tableData}
            buttonTitle={"Add SOP"}
            handleClick={handleAddSop}
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
            : "Delete SOP"
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
                rules={{ required: "Document Name is Required" }}
                render={({ field }) => (
                  <TextField
                    name="documentName"
                    label="Document Name"
                    size="small"
                    {...field}
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
      </MuiModal>
    </div>
  );
};

export default SopUpload;
