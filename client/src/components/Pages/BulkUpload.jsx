import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import useAuth from "../../hooks/useAuth";
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
import bulkInsertRoutes from "../../constants/bulkInsertRoutes";

export default function BulkUpload() {
  const axios = useAxiosPrivate();
  const deptDetails = usePageDepartment();
  const { auth } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("");

  const canUploadDocuments = useMemo(() => {
    const allowedDepartmentIds = new Set([
      "6798ba9de469e809084e2494", // Tech
      "6798bab0e469e809084e249a", // Finance
    ]);
    const allowedDepartmentNames = ["tech", "finance"];
    const topManagementDepartmentId = "67b2cf85b9b6ed5cedeb9a2e"; // Top

    const currentDepartmentName = deptDetails?.name?.toLowerCase() || "";
    const isAllowedCurrentDepartment =
      allowedDepartmentIds.has(deptDetails?._id) ||
      allowedDepartmentNames.some((departmentName) =>
        currentDepartmentName.includes(departmentName),
      );

    const isTopManagementUser = auth?.user?.departments?.some((department) => {
      const departmentName = department?.name?.toLowerCase() || "";

      return (
        department?._id === topManagementDepartmentId ||
        departmentName.includes("top management")
      );
    });

    return isAllowedCurrentDepartment || isTopManagementUser;
  }, [auth?.user?.departments, deptDetails?._id, deptDetails?.name]);

  const departmentDrop = useMemo(() => {
    const departmentFilter = bulkInsertRoutes?.find(
      (item) => item.department === deptDetails?._id,
    );

    return departmentFilter?.bulkInsertRoutes || [];
  }, [deptDetails?._id]);

  const { data: departmentDocuments = [], isPending: isTemplatesPending } =
    useQuery({
      queryKey: ["department-templates", deptDetails?._id],
      queryFn: async () => {
        const response = await axios.get(
          `/api/company/department-templates/${deptDetails._id}`,
        );
        return response.data;
      },
      enabled: !!deptDetails?._id,
    });
  const {
    handleSubmit,
    reset,
    control,
    watch,
    formState: { errors },
  } = useForm({
    defaultValues: {
      file: null,
      documentName: "",
    },
  });

  const normalizeTemplateName = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/&/g, "and")
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\s+/g, " ")
      .trim();

  const selectedDoc = watch("documentName");
  const templateOptions = useMemo(() => {
    if (!departmentDocuments?.templates?.length) return [];

    return departmentDocuments.templates
      .filter((template) => template.isActive !== false)
      .map((template) => {
        const templateName = template.name?.trim() || "Untitled Template";
        // const routeConfig = departmentDrop.find(
        //   (item) => item.name?.toLowerCase() === templateName.toLowerCase(),
        // );
        const normalizedTemplateName = normalizeTemplateName(templateName);
        const routeConfig = departmentDrop.find((item) => {
          const configuredNames = [item.name, ...(item.aliases || [])];

          return configuredNames.some(
            (configuredName) =>
              normalizeTemplateName(configuredName) === normalizedTemplateName,
          );
        });

        return {
          id: template._id || template.documentId || templateName,
          name: templateName,
          route: routeConfig?.route,
          fileKey: routeConfig?.fileKey,
        };
      });
  }, [departmentDocuments, departmentDrop]);

  const selectedTemplate = templateOptions.find(
    (item) => item.id === selectedDoc,
  );

  const { mutate: uploadDocument, isPending: isUploading } = useMutation({
    // mutationFn: async ({ file, documentName }) => {
    mutationFn: async ({ file }) => {
      if (!selectedTemplate?.route || !selectedTemplate?.fileKey) {
        console.log("!selectedTemplate?.route", selectedTemplate?.route);
        console.log("!selectedTemplate?.fileKey", selectedTemplate?.fileKey);
        throw new Error(
          "Bulk upload route is not configured for the selected template.",
        );
      }
      const formData = new FormData();
      formData.append(selectedTemplate.fileKey, file);

      const response = await axios.post(selectedTemplate.route, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "DATA UPLOADED");
      setOpenModal(false);
      reset();
    },
    onError: (error) => {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to upload data.",
      );
      // console.error(error);
    },
  });

  const formattedTemplates = useMemo(() => {
    if (!departmentDocuments?.templates) return [];
    return departmentDocuments.templates
      .filter((template) => template.isActive === true)
      .map((template, index) => ({
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
      sort: "desc",
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
          disabled={!canUploadDocuments}
          // disabled
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
                      : // : departmentDrop?.map((item) => (
                        //   <MenuItem key={item.name} value={item.route}>
                        //     {item.name}
                        //   </MenuItem>
                        // ))}
                        templateOptions.map((item) => (
                          <MenuItem key={item.id} value={item.id}>
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
                    previewType="none"
                    onInvalidFile={() =>
                      toast.error("Only CSV files are allowed.")
                    }
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
