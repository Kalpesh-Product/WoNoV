import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";
import WidgetSection from "../../../../components/WidgetSection";
import AgTable from "../../../../components/AgTable";

const SalesPolicies = () => {
  const uploadItems = [
    "Upload Policies" 
  ];
  const policiesUploadDataColumns = [
    { field: "srNo", headerName: "SR No", flex: 1 },
    { field: "templateName", headerName: "Template Name", flex: 1 },
    { field: "uploadedBy", headerName: "Uploaded By", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
  ];

  const policiesUploadData = [
    {
      srNo: 1,
      templateName: "Upload Policies",
      uploadedBy: "John Doe",
      date: "2025-03-01"
    },
    {
      srNo: 2,
      templateName: "Upload Policies",
      uploadedBy: "Jane Smith",
      date: "2025-03-08"
    },
    {
      srNo: 3,
      templateName: "Upload Policies",
      uploadedBy: "Michael Johnson",
      date: "2025-03-15"
    },
    {
      srNo: 4,
      templateName: "Upload Policies",
      uploadedBy: "Emily Davis",
      date: "2025-03-22"
    }
  ];

  return (
    <div className="p-4">
      <h2 className="text-title font-pmedium text-primary pb-4">Upload Policies</h2>

      <div className="grid lg:grid-cols-3 md:grid-col-3 sm:grid-col-1 pb-4">
        {uploadItems.map((index, item) => {
          return (
            <>
              <div
                className="space-y-2 border-default p-4 m-2 rounded-md"
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
            </>
          );
        })}
      </div>
       <div>
             <WidgetSection border title="Policies Data">
                <AgTable
                  data={policiesUploadData}
                  columns={policiesUploadDataColumns}
                  search={true}
                />
              </WidgetSection>
            </div>
    </div>
  );
};

export default SalesPolicies;
