import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import useAuth from "../../hooks/useAuth";
import { useQuery, useMutation } from "@tanstack/react-query";
//import YearWiseTable from "../Tables/YearWiseTable";
import AgTable from "../AgTable";
import PrimaryButton from "../PrimaryButton";
//import { MdUpload } from "react-icons/md";
import { IoMdDownload } from "react-icons/io";
import { useMemo, useState } from "react";
import { Chip, MenuItem, TextField } from "@mui/material";
import PageFrame from "./PageFrame";
import MuiModal from "../MuiModal";
import { Controller, useForm } from "react-hook-form";
import UploadFileInput from "../UploadFileInput";
import { toast } from "sonner";
//import humanDate from "../../utils/humanDateForamt";
import bulkInsertRoutes from "../../constants/bulkInsertRoutes";
import formatDateTime from "../../utils/formatDateTime";

export default function BulkUpload() {
  const axios = useAxiosPrivate();
  const deptDetails = usePageDepartment();
  const { auth } = useAuth();
  const [openModal, setOpenModal] = useState(false);
  const [modalMode, setModalMode] = useState("");
  const [downloadedAtByTemplate, setDownloadedAtByTemplate] = useState({});
  const [uploadedAtByTemplate, setUploadedAtByTemplate] = useState({});

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

  const getTemplateRowId = (template) =>
    template?._id || template?.id || template?.documentId || template?.name;

  const formatTemplateTimestamp = (value) => {
    if (!value) return "-";

    const formattedValue = formatDateTime(value);

    return formattedValue && formattedValue !== "N/A" ? formattedValue : "-";
  };

  const updateTemplateLastModified = async (templateId, type) => {
    if (!deptDetails?._id || !templateId) return null;

    const response = await axios.patch(
      `/api/company/department-templates/${deptDetails._id}/${templateId}/${type}/lastmodified`,
    );

    return response.data;
  };
  const buildDownloadTimestamp = () => {
    const now = new Date();
    const pad = (value) => String(value).padStart(2, "0");

    return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(
      now.getDate(),
    )}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(
      now.getSeconds(),
    )}`;
  };

  const handleTemplateDownload = async (template) => {
    const originalUrl = template?.documentLink;
    const templateId = getTemplateRowId(template);
    if (!originalUrl) {
      toast.error("Template download link is not available.");
      return;
    }

    try {
      const data = await updateTemplateLastModified(templateId, "download");
      setDownloadedAtByTemplate((prev) => ({
        ...prev,
        [templateId]: data?.downloadedAt,
      }));
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          error?.message ||
          "Failed to update template download time.",
      );
    }

    const extension =
      originalUrl?.split(".").pop()?.split("?")[0]?.toLowerCase() || "csv";
    const safeTemplateName = String(template?.name || "bulk-upload-template")
      .trim()
      .replace(/[^a-z0-9_\- ]/gi, "_")
      .replace(/\s+/g, "-");

    const link = document.createElement("a");
    link.href = originalUrl.replace("/upload/", "/upload/fl_attachment/");
    link.download = `${safeTemplateName}-downloaded-${buildDownloadTimestamp()}.${extension}`;
    // setDownloadedAtByTemplate((prev) => ({
    //   ...prev,
    //   [template.id || template.documentLink || template.name]: new Date().toISOString(),
    // }));
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
   onSuccess: async (data) => {
      try {
        const lastModifiedData = await updateTemplateLastModified(
          selectedTemplate?.id,
          "upload",
        );

        setUploadedAtByTemplate((prev) => ({
          ...prev,
          [selectedTemplate?.id]: lastModifiedData?.uploadedAt,
        }));
      } catch (error) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update template upload time.",
        );
      }
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
        id: template._id || template.documentId || template.name,
        name: template.name,
        documentLink: template.documentLink,
        isActive: template.isActive ? "Active" : "Inactive",
        date: formatTemplateTimestamp(
          downloadedAtByTemplate[getTemplateRowId(template)] ||
            template.downloadedAt,
        ),
        updatedAt: formatTemplateTimestamp(
          uploadedAtByTemplate[getTemplateRowId(template)] ||
            template.uploadedAt,
        ),
      }));
  }, [departmentDocuments, downloadedAtByTemplate, uploadedAtByTemplate]);

  const templateColumns = [
    {
      headerName: "S.No.",
      field: "srNo",
      Width: 150,
    },
    {
      headerName: "Template Name",
      field: "name",
      flex: 1,
    },
    {
      headerName: "Status",
      field: "isActive",
      flex: 1,
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
      headerName: "Uploaded Date",
      field: "updatedAt",
      flex: 1,
    },
    {
      headerName: "Downloaded Date",
      field: "date",
      flex: 1,
    },
    {
      headerName: "Download",
      field: "documentLink",
      flex: 1,
      cellRenderer: (params) => (
        <div className="p-2">
          <a
            href={params.data.documentLink}
            onClick={(event) => {
              event.preventDefault();
              handleTemplateDownload(params.data);
            }}
          >
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
