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
const normalizeTemplateName = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const getTemplateDedupKey = (template, departmentId) => {
  const sourceValue =
    departmentId === FRONTEND_DEPARTMENT_ID
      ? template?.displayName || template?.name
      : template?.name;

  return normalizeTemplateName(sourceValue);
};

const hasNormalizedToken = (value, token) =>
  new RegExp(`(^| )${token}( |$)`).test(value);

const FRONTEND_DEPARTMENT_ID = "6798ba9de469e809084e2494";
const FINANCE_DEPARTMENT_ID = "6798bab0e469e809084e249a";

const financeSalesTemplateLabels = [
  {
    match: [
      "coworking revenue",
      "coworking revenues",
      "co working revenue",
      "co working revenues",
      "co-working revenue",
      "co-working revenues",
    ],
    label: "Co-working Revenue - Finance & Sales",
  },
  {
    match: ["virtual office revenue", "virtual office revenues"],
    label: "Virtual Office Revenue - Finance & Sales",
  },
  {
    match: ["alternate revenue", "alternate revenues"],
    label: "Alternate Revenue - Finance & Sales",
  },
  {
    match: ["workation revenue", "workation revenues"],
    label: "Workation Revenue - Finance & Sales",
  },
];

const frontendSalesTemplateLabels = [
  {
    match: ["co working client data", "co working clients", "co working client"],
    label: "Co-working Client Data - Sales",
  },
  {
    match: ["virtual office clients", "virtual office client"],
    label: "Virtual Office Clients - Sales",
  },
  {
    match: ["workation clients data", "workation clients", "workation client"],
    label: "Workation Clients Data - Sales",
  },
  {
    match: ["leads", "lead"],
    label: "Leads - Sales",
  },
];

const frontendHrTemplateLabels = [
  {
    match: ["holidays and events", "holidays / events", "holiday events", "events"],
    label: "Holidays And Events - Hr",
  },
  {
    match: [
      "housekeeping members data",
      "housekeeping membres data",
      "housekeeping members",
      "housekeeping membres",
      "housekeeping member data",
    ],
    label: "Housekeeping Membres Data - Hr",
  },
  {
    match: ["employee leaves", "leaves", "leave"],
    label: "Employee Leaves - Hr",
  },
  {
    match: ["attendance", "attandance"],
    label: "Attendance - Hr",
  },
  {
    match: ["employee data", "users", "employee"],
    label: "Employee Data -Hr",
  },
];

const frontendHiddenTemplateNames = new Set([
  "coworking revenue",
  "coworking revenue finance and sales",
]);

const frontendOverallTemplateLabels = [
  {
    match: ["assets", "asset"],
    label: "Asset - Overall",
  },
  {
    match: ["vendors", "vendor"],
    label: "Vendor - Overall",
  },
  {
    match: ["inventory"],
    label: "Inventory - Overall",
  },
  {
    match: ["tasks", "task"],
    label: "Tasks - Overall",
  },
  {
    match: ["performance", "kra and kpa", "kra kpa", "kra", "kpa"],
    label: "KRA And KPA - Overall",
  },
  {
    match: ["expense and budget", "expense & budget", "budget", "budgets"],
    label: "Expense And Budget - Overall",
  },
];

const getTemplateDisplayName = (templateName, departmentId) => {
  if (departmentId !== FRONTEND_DEPARTMENT_ID) {
    return templateName?.trim() || "Untitled Template";
  }

  const normalizedTemplateName = normalizeTemplateName(templateName);
  const matchedLabel = [
    ...financeSalesTemplateLabels,
    ...frontendSalesTemplateLabels,
    ...frontendHrTemplateLabels,
    ...frontendOverallTemplateLabels,
  ].find(({ match }) =>
    match.some((candidate) => {
      const normalizedCandidate = normalizeTemplateName(candidate);

      return (
        normalizedCandidate === normalizedTemplateName ||
        hasNormalizedToken(normalizedTemplateName, normalizedCandidate) ||
        normalizedTemplateName.includes(normalizedCandidate) ||
        normalizedCandidate.includes(normalizedTemplateName)
      );
    }),
  );

  return matchedLabel?.label || templateName?.trim() || "Untitled Template";
};

const templateNameMatchesRoute = (templateName, routeConfig) => {
  const normalizedTemplateName = normalizeTemplateName(templateName);
  const normalizedRouteName = normalizeTemplateName(routeConfig?.name);

  if (normalizedRouteName === normalizedTemplateName) return true;

  return (routeConfig?.aliases || []).some((alias) => {
    const normalizedAlias = normalizeTemplateName(alias);

    return (
      normalizedAlias === normalizedTemplateName ||
      hasNormalizedToken(normalizedTemplateName, normalizedAlias) ||
      normalizedTemplateName.includes(normalizedAlias)
    );
  });
};    

const isTemplateNotFoundError = (error) =>
  String(error?.response?.data?.message || error?.message || "")
    .toLowerCase()
    .includes("template not found");


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

  const sourceDepartmentIds = useMemo(
    () =>
      Array.from(
        new Set(
          departmentDrop
            .map((item) => item.sourceDepartmentId)
            .filter(Boolean),
        ),
      ),
    [departmentDrop],
  );

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

  const { data: sourceDepartmentTemplates = [] } = useQuery({
    queryKey: [
      "department-templates",
      "source",
      deptDetails?._id,
      sourceDepartmentIds.join(","),
    ],
    queryFn: async () => {
      if (!sourceDepartmentIds.length) return [];

      const responses = await Promise.all(
        sourceDepartmentIds.map(async (departmentId) => {
          const response = await axios.get(
            `/api/company/department-templates/${departmentId}`,
          );

          return (response.data?.templates || []).map((template) => ({
            ...template,
            __departmentId: departmentId,
          }));
        }),
      );

      return responses.flat();
    },
    enabled: !!deptDetails?._id && sourceDepartmentIds.length > 0,
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

  // const normalizeTemplateName = (value) =>
  //   String(value || "")
  //     .trim()
  //     .toLowerCase()
  //     .replace(/&/g, "and")
  //     .replace(/[^a-z0-9]+/g, " ")
  //     .replace(/\s+/g, " ")
  //     .trim();

  const selectedDoc = watch("documentName");

  const findMatchingTemplate = (templateName, templates = []) =>
    templates.find((template) =>
      templateNameMatchesRoute(templateName, {
        name: template.name,
        aliases: template.aliases || [],
      }),
    );

  const documentTemplateOptions = useMemo(() => {
    if (!departmentDocuments?.templates?.length) return [];

    return departmentDocuments.templates
      .filter((template) => template.isActive !== false)
      .flatMap((template) => {
        const templateName = template.name?.trim() || "Untitled Template";
        const routeConfig = departmentDrop.find((item) =>
          templateNameMatchesRoute(templateName, item),
        );

        if (routeConfig?.sourceDepartmentId) {
          return [];
        }

        const sourceDepartmentId = deptDetails?._id;
        const sourceTemplate =
          routeConfig?.sourceDepartmentId
            ? findMatchingTemplate(
                templateName,
                sourceDepartmentTemplates.filter(
                  (item) => item.__departmentId === routeConfig.sourceDepartmentId,
                ),
              )
            : null;
        const resolvedTemplate = sourceTemplate || template;
        const templateId =
          resolvedTemplate._id || resolvedTemplate.documentId || templateName;

        return {
          id: templateId,
          templateId,
          name: templateName,
          displayName: getTemplateDisplayName(templateName, deptDetails?._id),
          route: routeConfig?.route,
          fileKey: routeConfig?.fileKey,
          documentLink: resolvedTemplate.documentLink,
          downloadedAt: resolvedTemplate.downloadedAt,
          uploadedAt: resolvedTemplate.uploadedAt,
          templateDepartmentId: sourceDepartmentId,
          source: sourceTemplate ? "source-document" : "document",
        };
      });
  }, [
    departmentDocuments,
    departmentDrop,
    deptDetails?._id,
    sourceDepartmentTemplates,
  ]);

  const sourceDocumentTemplateOptions = useMemo(() => {
    if (!sourceDepartmentTemplates?.length) return [];

    return sourceDepartmentTemplates.map((template) => {
      const templateName = template.name?.trim() || "Untitled Template";
      const routeConfig = departmentDrop.find((item) =>
        templateNameMatchesRoute(templateName, item),
      );

      return {
        id: template._id || template.documentId || templateName,
        templateId: template._id || template.documentId || templateName,
        name: templateName,
        displayName: getTemplateDisplayName(templateName, deptDetails?._id),
        route: routeConfig?.route,
        fileKey: routeConfig?.fileKey,
        documentLink: template.documentLink,
        downloadedAt: template.downloadedAt,
        uploadedAt: template.uploadedAt,
        templateDepartmentId: template.__departmentId || deptDetails?._id,
        source: "source-document",
      };
    });
  }, [sourceDepartmentTemplates, departmentDrop, deptDetails?._id]);

  const fallbackTemplateOptions = useMemo(() => {
    if (!departmentDrop?.length) return [];

    return departmentDrop
      .filter(
        (routeConfig) =>
          !documentTemplateOptions.some((template) =>
            templateNameMatchesRoute(template.name, routeConfig),
          ) &&
          !sourceDocumentTemplateOptions.some((template) =>
            templateNameMatchesRoute(template.name, routeConfig),
          ),
      )
      .map((item) => ({
        id: item.name,
        templateId: null,
        name: item.name,
        displayName: getTemplateDisplayName(item.name, deptDetails?._id),
        route: item.route,
        fileKey: item.fileKey,
        documentLink: null,
        downloadedAt: null,
        uploadedAt: null,
        templateDepartmentId: item.sourceDepartmentId || deptDetails?._id,
        source: "config",
      }));
  }, [
    departmentDrop,
    documentTemplateOptions,
    sourceDocumentTemplateOptions,
    deptDetails?._id,
  ]);

  const templateOptions = useMemo(
    () =>
      [
        ...documentTemplateOptions,
        ...sourceDocumentTemplateOptions,
        ...fallbackTemplateOptions,
      ].filter(
        (template) =>
          deptDetails?._id !== FRONTEND_DEPARTMENT_ID ||
          !frontendHiddenTemplateNames.has(
            normalizeTemplateName(template.name || template.displayName),
          ),
      )
      .filter(
        (template, index, templates) =>
          index ===
          templates.findIndex(
            (candidate) =>
              getTemplateDedupKey(candidate, deptDetails?._id) ===
              getTemplateDedupKey(template, deptDetails?._id),
          ),
      ),
    [
      documentTemplateOptions,
      sourceDocumentTemplateOptions,
      fallbackTemplateOptions,
      deptDetails?._id,
    ],
  );

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

  const updateTemplateLastModified = async (
    departmentId,
    templateId,
    type,
  ) => {
    if (!departmentId || !templateId) return null;

    const response = await axios.patch(
      `/api/company/department-templates/${departmentId}/${templateId}/${type}/lastmodified`,
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
      const data = await updateTemplateLastModified(
        template?.templateDepartmentId || deptDetails._id,
        templateId,
        "download",
      );
      setDownloadedAtByTemplate((prev) => ({
        ...prev,
        [templateId]: data?.downloadedAt,
      }));
    } catch (error) {
      if (!isTemplateNotFoundError(error)) {
        toast.error(
          error?.response?.data?.message ||
            error?.message ||
            "Failed to update template download time.",
        );
      }
      setDownloadedAtByTemplate((prev) => ({
        ...prev,
        [templateId]: new Date().toISOString(),
      }));
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
      if (selectedTemplate?.templateId) {
        try {
          const lastModifiedData = await updateTemplateLastModified(
            selectedTemplate.templateDepartmentId || deptDetails._id,
            selectedTemplate.templateId,
            "upload",
          );

          setUploadedAtByTemplate((prev) => ({
            ...prev,
            [selectedTemplate.templateId]: lastModifiedData?.uploadedAt,
          }));
        } catch (error) {
          if (!isTemplateNotFoundError(error)) {
            toast.error(
              error?.response?.data?.message ||
                error?.message ||
                "Failed to update template upload time.",
            );
          }
          setUploadedAtByTemplate((prev) => ({
            ...prev,
            [selectedTemplate.templateId]: new Date().toISOString(),
          }));
        }
      } else if (selectedTemplate?.id) {
        setUploadedAtByTemplate((prev) => ({
          ...prev,
          [selectedTemplate.id]: new Date().toISOString(),
        }));
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
    if (!templateOptions?.length) return [];

    return templateOptions.map((template, index) => ({
      srNo: index + 1,
      id: template.id,
      templateId: template.templateId,
      name: template.name,
      displayName: template.displayName,
      documentLink: template.documentLink,
      isActive: "Active",
      date: formatTemplateTimestamp(
        downloadedAtByTemplate[getTemplateRowId(template)] ||
          template.downloadedAt,
      ),
      updatedAt: formatTemplateTimestamp(
        uploadedAtByTemplate[getTemplateRowId(template)] ||
          template.uploadedAt,
      ),
    }));
  }, [
    templateOptions,
    downloadedAtByTemplate,
    uploadedAtByTemplate,
  ]);

  const templateColumns = [
    {
      headerName: "S.No.",
      field: "srNo",
      Width: 150,
    },
    {
      headerName: "Template Name",
      field: "displayName",
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
          {params.data.documentLink ? (
            <a
              href={params.data.documentLink}
              onClick={(event) => {
                event.preventDefault();
                handleTemplateDownload(params.data);
              }}
            >
              <IoMdDownload size={20} />
            </a>
          ) : (
            <span className="text-gray-400">-</span>
          )}
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
                    {
                      // : departmentDrop?.map((item) => (
                        //   <MenuItem key={item.name} value={item.route}>
                        //     {item.name}
                        //   </MenuItem>
                        // ))}
                      templateOptions.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.displayName}
                        </MenuItem>
                      ))
                    }
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
