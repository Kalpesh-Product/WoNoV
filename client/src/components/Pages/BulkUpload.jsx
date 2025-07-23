import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import { useQuery, useMutation } from "@tanstack/react-query";
import YearWiseTable from "../Tables/YearWiseTable";
import AgTable from "../AgTable";
import PrimaryButton from "../PrimaryButton";
import { MdUpload } from "react-icons/md";
import { IoMdDownload } from "react-icons/io";
import { useMemo, useState } from "react";
import { Chip, MenuItem, TextField } from "@mui/material";
import PageFrame from "./PageFrame";
import MuiModal from "../MuiModal";
import { Controller, useForm } from "react-hook-form";
import UploadFileInput from "../UploadFileInput";
import { toast } from "sonner";
import humanDate from "../../utils/humanDateForamt";

export default function BulkUpload() {
  const axios = useAxiosPrivate();
  const deptDetails = usePageDepartment();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("");

  const { data: departmentDocuments = [], isPending: isTemplatesPending } =
    useQuery({
      queryKey: ["department-templates"],
      queryFn: async () => {
        const response = await axios.get(
          `/api/company/department-templates/${deptDetails._id}`
        );
        return response.data;
      },
    });
  const {
    handleSubmit,
    reset,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      file: null,
      documentName: "",
    },
  });

  const { mutate: uploadDocument, isPending: isUploading } = useMutation({
    mutationFn: async ({ file, documentName }) => {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("documentName", documentName);
      formData.append("departmentId", deptDetails._id); // optional if needed

      // Just log it
      console.log("Uploading:", {
        file,
        documentName,
        departmentId: deptDetails._id,
      });

      // Simulate a delay
      return new Promise((resolve) =>
        setTimeout(() => resolve({ message: "Logged successfully" }), 1000)
      );
    },
    onSuccess: () => {
      toast.success("Document logged successfully");
      setOpenModal(false);
      reset();
    },
    onError: (error) => {
      toast.error("Failed to log document");
      console.error(error);
    },
  });

  const formattedTemplates = useMemo(() => {
    if (!departmentDocuments?.templates) return [];
    return departmentDocuments.templates.map((template, index) => ({
      srNo: index + 1,
      name: template.name,
      documentLink: template.documentLink,
      isActive: template.isActive ? "Active" : "Inactive",
      date: humanDate(template.createdAt),
      updatedAt: template.updatedAt,
    }));
  }, [departmentDocuments]);

  const templateColumns = [
    {
      headerName: "S.No.",
      field: "srNo",
      maxWidth: 80,
    },
    {
      headerName: "Template Name",
      field: "name",
      flex: 1,
    },
    {
      headerName: "Status",
      field: "isActive",
      cellRenderer: () => {
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap["Active"] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={"Active"}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    {
      headerName: "Date",
      field: "date",
    },
    {
      headerName: "Last Modified",
      field: "updatedAt",
    },
    {
      headerName: "Download",
      field: "documentLink",
      cellRenderer: (params) => (
        <div className="p-2">
          <a href={params.data.documentLink}>
            <IoMdDownload size={20} />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className=" flex flex-col gap-4">
      <PageFrame>
        <AgTable
          data={formattedTemplates}
          columns={templateColumns}
          formatDate={true}
          tableTitle={"Bulk Upload Data templates"}
          buttonTitle={"Upload Document"}
          handleClick={() => {
            setModalMode("add");
            setOpenModal(true);
          }}
        />
      </PageFrame>
      <MuiModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        title={"Bulk Upload Document"}
      >
        {modalMode === "add" && (
          <div>
            <form
              onSubmit={handleSubmit((data) => uploadDocument(data))}
              className="grid grid-cols-1 gap-4"
            >
              <Controller
                name="documentName"
                control={control}
                rules={{ required: "Document type is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    select
                    fullWidth
                    size="small"
                    label="Document Type"
                    error={!!errors.documentName}
                    helperText={
                      errors.documentName ? errors.documentName.message : null
                    }
                  >
                    <MenuItem value="" disabled>
                      Select A Document Type
                    </MenuItem>
                    {isTemplatesPending
                      ? []
                      : departmentDocuments.templates?.map((item) => (
                          <MenuItem key={item._id} value={item.name}>
                            {item.name}
                          </MenuItem>
                        ))}
                  </TextField>
                )}
              />
              <Controller
                name="file"
                control={control}
                rules={{ required: "File is required" }}
                render={({ field }) => (
                  <UploadFileInput
                    onChange={field.onChange}
                    value={field.value}
                    allowedExtensions={["csv"]}
                    previewType="auto" 
                  />
                )}
              />
              <PrimaryButton
                title="Upload"
                type="submit"
                isLoading={isUploading}
                disabled={isUploading}
              />
            </form>
          </div>
        )}
      </MuiModal>
    </div>
  );
}
