import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";
import WidgetSection from "../../../../components/WidgetSection";
import AgTable from "../../../../components/AgTable";

const Sops = () => {
  const uploadItems = [
    "Upload Sops" 
  ];
  const sopsUploadDataColumns = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "templateName", headerName: "Template Name", flex: 1 },
    { field: "uploadedBy", headerName: "Uploaded By", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
  ];

  const sopsUploadData = [
    {
      srNo: 1,
      templateName: "Upload Sops",
      uploadedBy: "John Doe",
      date: "01-03-2025"
    },
    {
      srNo: 2,
      templateName: "Upload Sops",
      uploadedBy: "Jane Smith",
      date: "08-03-2025"
    },
    {
      srNo: 3,
      templateName: "Upload Sops",
      uploadedBy: "Michael Johnson",
      date: "15-03-2025"
    },
    {
      srNo: 4,
      templateName: "Upload Sops",
      uploadedBy: "Emily Davis",
      date: "22-03-2025"
    }
  ];
  

  return (
    <div className="p-4">
      <h2 className="text-title font-pmedium text-primary pb-4">Upload Sops</h2>

      <div className="grid lg:grid-cols-3 md:grid-col-3 sm:grid-col-1 pb-4">
        {uploadItems.map((index, item) => {
          return (
            <>
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
            </>
          );
        })}
      </div>

      <div>
              <WidgetSection border title="SOPs Data">
          <AgTable
            data={sopsUploadData}
            columns={sopsUploadDataColumns}
            search={true}
          />
        </WidgetSection>
      </div>
    </div>
  );
};

export default Sops;
