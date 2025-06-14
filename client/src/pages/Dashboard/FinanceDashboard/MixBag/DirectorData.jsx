import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import UploadFileInput from "../../../../components/UploadFileInput";
import { toast } from "sonner";

const formatDate = (date) => {
  if (!date) return "Not Available";
  const parsed = new Date(date);
  return isNaN(parsed) ? "Invalid Date" : parsed.toLocaleDateString("en-GB");
};

const DirectorData = () => {
  const location = useLocation();
  const { id } = useParams();
  const path = location?.pathname?.split("/") || [];
  const axios = useAxiosPrivate();
  const isCompany = path[path.length - 1] === "Company";
  const [openModal, setOpenModal] = useState(false);

  const queryClient = useQueryClient();

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/users/fetch-users");
        return Array.isArray(response.data)
          ? response.data.filter((e) => e.isActive)
          : [];
      } catch (error) {
        console.error("Fetch error:", error);
        return [];
      }
    },
  });

  const filtered = Array.isArray(employees)
    ? employees.filter((emp) =>
        Array.isArray(emp?.departments)
          ? emp.departments.some((dept) => dept?.name === "Top Management")
          : false
      )
    : [];

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      type: "",
      directorName: "",
      documentName : '',
      kyc: null,
    },
  });

  const files = Array.isArray(location?.state?.files)
    ? location.state.files
    : [];
  const name = location?.state?.name || "N/A";

  const fileRows = files.map((file, index) => ({
    srno: index + 1,
    label: file?.name?.trim() || "Unnamed Document",
    documentLink: file?.documentLink?.trim() || null,
    uploadedDate: file?.uploadedDate || null,
    lastModified: file?.lastModified || null,
  }));

  useEffect(() => {
    if (name) setValue("directorName", name);
    setValue("type", isCompany ? "companyKyc" : "directorKyc");
  }, [name, isCompany, setValue]);

  const { mutate: uploadKycDocument, isPending: isUploading } = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.post(`/api/company/add-kyc-document`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      queryClient.invalidateQueries(["kycDocuments"]);
      setOpenModal(false);
      reset();
    },
    onError: () => {
      toast.error("Upload failed. Try again.");
    },
  });

  const onSubmit = (formValues) => {
    const { directorName, type, kyc, documentName } = formValues;
    if (!kyc) return toast.error("Please upload a document");

    const formData = new FormData();
    formData.append("type", type);
    formData.append("kyc", kyc);
    if (!isCompany) {
      formData.append("directorName", directorName);
    }
    formData.append("referenceId", id);
    formData.append("documentName", documentName);

    uploadKycDocument(formData);
  };

  const columns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    { field: "label", headerName: "Document", flex: 1 },
    {
      field: "uploadedDate",
      headerName: "Uploaded Date",
      flex: 1,
      cellRenderer: (params) => formatDate(params.value),
    },
    {
      field: "lastModified",
      headerName: "Last Modified",
      flex: 1,
      cellRenderer: (params) => formatDate(params.value),
    },
    {
      field: "documentLink",
      headerName: "View Link",
      flex: 1,
      cellRenderer: (params) =>
        params.value ? (
          <a
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline cursor-pointer"
          >
            View
          </a>
        ) : (
          <span className="text-gray-400 italic">No Link</span>
        ),
    },
  ];

  return (
    <div className="p-4 space-y-4">
      <PageFrame>
        <AgTable
          columns={columns}
          data={fileRows}
          tableTitle={`KYC Documents of ${name}`}
          buttonTitle={"Add Document"}
          tableHeight={300}
          hideFilter
          search={fileRows.length >= 10}
          handleClick={() => setOpenModal(true)}
        />
      </PageFrame>

      <MuiModal
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          reset();
        }}
        title={"Add Document"}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid grid-cols-1 gap-4">
            {!isCompany && (
              <Controller
                name="directorName"
                control={control}
                rules={{ required: "Director Name is required" }}
                render={({ field }) => (
                  <TextField
                    size="small"
                    disabled
                    {...field}
                    fullWidth
                    label={"Director Name"}
                    error={!!errors.directorName}
                    helperText={errors.directorName?.message}
                  />
                )}
              />
            )}
            <Controller
              name="type"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={"Type"}
                  fullWidth
                  size="small"
                  disabled
                />
              )}
            />
            <Controller
              name="documentName"
              control={control}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={"Document Name"}
                  fullWidth
                  size="small"
                />
              )}
            />

            <Controller
              name="kyc"
              control={control}
              rules={{ required: "Document is required" }}
              render={({ field }) => (
                <UploadFileInput
                  onChange={field.onChange}
                  value={field.value}
                  allowedExtensions={["jpg", "jpeg", "png", "pdf"]}
                />
              )}
            />

            <button
              type="submit"
              disabled={isUploading}
              className="bg-primary text-white rounded px-4 py-2 mt-2"
            >
              {isUploading ? "Uploading..." : "Submit"}
            </button>
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default DirectorData;
