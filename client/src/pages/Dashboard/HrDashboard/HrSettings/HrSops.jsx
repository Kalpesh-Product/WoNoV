import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";
import WidgetSection from "../../../../components/WidgetSection";
import AgTable from "../../../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import usePageDepartment from "../../../../hooks/usePageDepartment";

const HrSops = () => {
  const axios = useAxiosPrivate();
  const fileInputRef = useRef(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const department = usePageDepartment()

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
      // Optional: Add more fields if needed, e.g. formData.append("departmentId", "xyz");

      const response = await axios.post(
        `/api/company/add-department-document/${department._id}`,
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
    },
    onError: () => {
      toast.error("Failed to upload SOP.");
    },
  });

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const triggerFileDialog = () => {
    fileInputRef.current.click();
  };

  const handleUpload = () => {
    if (!selectedFile) {
      toast.warning("Please select a file first.");
      return;
    }
    uploadSop(selectedFile);
  };

  return (
    <div className="flex flex-col gap-4">
      <span className="text-title font-pmedium text-primary">Upload SOPs</span>
      <hr />

      <div className="grid lg:grid-cols-3 md:grid-col-3 sm:grid-col-1">
        {uploadItems.map((item, index) => (
          <div
            className="space-y-2 border-default p-4 rounded-md"
            key={index}
          >
            <div className="mb-2">
              <span className="text-subtitle text-primary">{item}</span>
            </div>
            <div className="flex gap-4">
              {/* Hidden File Input */}
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />

              {/* Trigger File Dialog */}
              <div className="flex items-end w-full border justify-end border-gray-200 rounded-md">
                <PrimaryButton title="Choose File" handleSubmit={triggerFileDialog} />
              </div>

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
            </div>

            {selectedFile && (
              <span className="text-sm text-gray-600">{selectedFile.name}</span>
            )}
          </div>
        ))}
      </div>

      <div>
        <WidgetSection border title="Upload SOPs">
          <AgTable data={[]} columns={sopsUploadDataColumns} search={true} />
        </WidgetSection>
      </div>
    </div>
  );
};

export default HrSops;
