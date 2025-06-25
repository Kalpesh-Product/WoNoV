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

const SopUpload = () => {
  const axios = useAxiosPrivate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const department = usePageDepartment();

  const uploadItems = ["Upload Sops"];

  const sopsUploadDataColumns = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "templateName", headerName: "Template Name", flex: 1 },
    { field: "uploadedBy", headerName: "Uploaded By", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
  ];

  const { mutate: uploadSop, isPending } = useMutation({
    mutationFn: async (file) => {
      const formData = new FormData();
      formData.append("department-document", file);
      formData.append("type", "sop");
      formData.append("documentName", file?.name || "Untitled");

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
      setSelectedFile(null);
      queryClient.invalidateQueries({ queryKey: ["departmentSOP"] });
    },
    onError: (error) => {
      toast.error(error?.message || "Failed to upload SOP.");
    },
  });

  const handleFileChange = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const triggerFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.warning("Please select a file first.");
      return;
    }
    if (!department?._id) {
      toast.error("Invalid department. Cannot upload.");
      return;
    }
    uploadSop(selectedFile);
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
    { field: "name", headerName: "Document Name", flex: 1 },
    {
      field: "documentLink",
      headerName: "Document Link",
      pinned: "right",
      width: 200,
      cellRenderer: (params) => (
        <a
          className="text-primary underline cursor-pointer"
          href={params?.value || "#"}
          target="_blank"
          rel="noopener noreferrer"
        >
          View SOP
        </a>
      ),
    },
  ];

  const tableData = Array.isArray(data)
    ? data.map((item, index) => ({
        srNo: index + 1,
        name: item?.name || "Untitled",
        documentLink: item?.documentLink || "#",
      }))
    : [];

  return (
    <div className="flex flex-col gap-4">
      <span className="text-title font-pmedium text-primary">Upload SOPs</span>
      <hr />

      <div className="grid lg:grid-cols-3 md:grid-col-3 sm:grid-col-1">
        {uploadItems.map((item, index) => (
          <div className="space-y-2 border-default p-4 rounded-md" key={index}>
            <div className="mb-2">
              <span className="text-subtitle text-primary">{item}</span>
            </div>
            <div className="flex gap-4">
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
              <div className="flex items-end w-full border justify-end border-gray-200 rounded-md">
                <PrimaryButton
                  title={!isPending ? "Choose File" : "Uploading"}
                  handleSubmit={triggerFileDialog}
                  isLoading={isPending}
                  disabled={isPending}
                />
              </div>
              {!isPending && (
                <div className="flex gap-2 items-center">
                  <div
                    onClick={handleUpload}
                    className="bg-borderGray text-black p-2 rounded-md cursor-pointer hover:bg-gray-200 transition-all"
                  >
                    <MdUpload style={{ fill: "black" }} />
                  </div>
                  <div className="bg-borderGray text-black p-2 rounded-md cursor-pointer hover:bg-gray-200 transition-all">
                    <IoMdDownload style={{ fill: "black" }} />
                  </div>
                </div>
              )}
            </div>

            {selectedFile && (
              <span className="text-sm text-gray-600">{selectedFile.name}</span>
            )}
          </div>
        ))}
      </div>

      <div>
        <PageFrame>
          <AgTable
            key={data?.length || 0}
            columns={columns}
            data={tableData}
            search
            tableTitle="SOP documents"
          />
        </PageFrame>
      </div>
    </div>
  );
};

export default SopUpload;
