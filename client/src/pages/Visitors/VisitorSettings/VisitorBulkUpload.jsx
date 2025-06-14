import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";
import WidgetSection from "../../../components/WidgetSection";
import AgTable from "../../../components/AgTable";

const VisitorBulkUpload = () => {
  const uploadItems = ["Upload Visitors"];
  const bulkUploadDataColumns = [
    { field: "srNo", headerName: "SR No", flex: 1 },
    { field: "templateName", headerName: "Template Name", flex: 1 },
    { field: "uploadedBy", headerName: "Uploaded By", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
  ];

  const bulkUploadData = [
    {
      srNo: 1,
      templateName: "Upload Visitors",
      uploadedBy: "John Doe",
      date: "01-03-2025",
    },
    {
      srNo: 2,
      templateName: "Upload Visitors",
      uploadedBy: "Jane Smith",
      date: "08-03-2025",
    },
    {
      srNo: 3,
      templateName: "Upload Visitors",
      uploadedBy: "Michael Johnson",
      date: "15-03-2025",
    },
    {
      srNo: 4,
      templateName: "Upload Visitors",
      uploadedBy: "Emily Davis",
      date: "22-03-2025",
    },
  ];

  return (
    <div className="">
      <h2 className="text-title font-pmedium text-primary pb-4">
        Bulk Upload Data
      </h2>

      <div className="grid lg:grid-cols-3 md:grid-col-3 sm:grid-col-1 pb-4">
        {uploadItems.map((index, item) => {
          return (
            <div>
              <div
                className="space-y-2 border-default p-4  rounded-md"
                key={index}>
                <div className="mb-2">{index}</div>
                <div className="flex space-x-2">
                  {/* Placeholder Input Box */}
                  <div className="flex items-end w-full border border-gray-200 rounded-md">
                    <span className="text-white bg-gray-600 rounded-md p-2 ml-auto">
                      Choose file
                    </span>
                  </div>

                  {/* Filter Button */}
                  <button className="bg-[#48BBCC] p-2">
                    <MdUpload style={{ fill: "white" }} />
                  </button>
                  <button className="bg-[#48BBCC] p-2">
                    <IoMdDownload style={{ fill: "white" }} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div>
        <WidgetSection border title="Bulk Upload Data">
          <AgTable
            data={[]}
            columns={bulkUploadDataColumns}
            search={true}
          />
        </WidgetSection>
      </div>
    </div>
  );
};

export default VisitorBulkUpload;
