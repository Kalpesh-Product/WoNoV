import { useLocation, useParams } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import MuiModal from "../../../../components/MuiModal";
import { useEffect, useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm, Controller } from "react-hook-form";
import { TextField } from "@mui/material";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import UploadFileInput from "../../../../components/UploadFileInput";
import { toast } from "sonner";
import humanDate from "../../../../utils/humanDateForamt";
import PrimaryButton from "../../../../components/PrimaryButton";
import { isAlphanumeric, noOnlyWhitespace } from "../../../../utils/validators";

const DirectorData = () => {
  const location = useLocation();
  const { id } = useParams();
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const [openModal, setOpenModal] = useState(false);

  const nameFromState = location?.state?.name;
  const name = nameFromState || id || "N/A";
  const isCompany = name === "Company";

  const {
    control,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      type: isCompany ? "companyKyc" : "directorKyc",
      nameOfDirector: name,
      documentName: "",
      kyc: null,
    },
  });

  const { data: kycDetails = {}, isLoading } = useQuery({
    queryKey: ["directorsCompany"],
    queryFn: async () => {
      const response = await axios.get("/api/company/get-kyc");
      return response.data.data;
    },
  });

  const files = useMemo(() => {
    if (!kycDetails) return [];

    if (isCompany) return kycDetails.companyKyc || [];

    const match = kycDetails.directorKyc?.find(
      (d) => d.nameOfDirector === name
    );
    return match?.documents || [];
  }, [kycDetails, name, isCompany]);

  const fileRows = files.map((file, index) => ({
    srno: index + 1,
    label: file?.name?.trim() || "Unnamed Document",
    documentLink: file?.documentLink?.trim() || null,
    uploadedDate: file?.createdDate || null,
    lastModified: file?.updatedDate || null,
  }));

  const { mutate: uploadKycDocument, isPending: isUploading } = useMutation({
    mutationFn: async (formData) => {
      const res = await axios.post("/api/company/add-kyc-document", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return res.data;
    },
    onSuccess: () => {
      toast.success("Document uploaded successfully");
      queryClient.invalidateQueries({ queryKey: ["directorsCompany"] });
      setOpenModal(false);
      reset();
    },
    onError: () => {
      toast.error("Upload failed. Try again.");
    },
  });

  const onSubmit = (formValues) => {
    const { nameOfDirector, type, kyc, documentName } = formValues;
    if (!kyc) return toast.error("Please upload a document");

    const formData = new FormData();
    formData.append("type", type);
    formData.append("kyc", kyc);
    if (!isCompany) {
      formData.append("nameOfDirector", nameOfDirector);
    }
    formData.append("referenceId", id);
    formData.append("documentName", documentName);

    uploadKycDocument(formData);
  };

  const columns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    {
      field: "label",
      headerName: "Document",
      flex: 1,
      cellRenderer: (params) =>
        params.value ? (
          <a
            href={params.data?.documentLink}
            target="_blank"
            rel="noopener noreferrer"
            className="text-primary underline cursor-pointer"
          >
            {params.value}
          </a>
        ) : (
          <span className="text-gray-400 italic">No Link</span>
        ),
    },
    {
      field: "uploadedDate",
      headerName: "Uploaded Date",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
    },
    {
      field: "lastModified",
      headerName: "Last Modified",
      flex: 1,
      cellRenderer: (params) => humanDate(params.value),
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
          loading={isLoading}
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
                name="nameOfDirector"
                control={control}
                rules={{ required: "Director Name is required" }}
                render={({ field }) => (
                  <TextField
                    size="small"
                    disabled
                    {...field}
                    fullWidth
                    label={"Director Name"}
                    error={!!errors.nameOfDirector}
                    helperText={errors.nameOfDirector?.message}
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
              rules={{
                required: "Document Name is required",
                validate: {
                  isAlphanumeric,
                  noOnlyWhitespace,
                },
              }}
              render={({ field }) => (
                <TextField
                  {...field}
                  label={"Document Name"}
                  fullWidth
                  size="small"
                  error={!!errors.documentName}
                  helperText={errors?.documentName?.message}
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

            <PrimaryButton
              type="submit"
              title={"Submit"}
              disabled={isUploading}
              isLoading={isUploading}
            />
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default DirectorData;
