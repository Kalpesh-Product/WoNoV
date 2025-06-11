import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";
import WidgetSection from "../../../../components/WidgetSection";
import AgTable from "../../../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";

const HrPolicies = () => {
  const uploadItems = ["Upload Policies"];
  const policiesUploadDataColumns = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "templateName", headerName: "Template Name", flex: 1 },
    { field: "uploadedBy", headerName: "Uploaded By", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
  ];

  const policiesUploadData = [
    {
      srNo: 1,
      templateName: "Code of Conduct Policy",
      uploadedBy: "Utkarsha Palkar",
      date: "18-11-2024",
    },
    {
      srNo: 2,
      templateName: "Equal Employment Opportunity Policy",
      uploadedBy: "Utkarsha Palkar",
      date: "07-12-2024",
    },
    {
      srNo: 3,
      templateName: "Workplace Harassment Policy",
      uploadedBy: "Utkarsha Palkar",
      date: "19-01-2025",
    },
    {
      srNo: 4,
      templateName: "Remote Work & Flexibility Policy",
      uploadedBy: "Utkarsha Palkar",
      date: "11-03-2025",
    },
  ];

  return (
    <div className=" flex flex-col gap-4">
      <span className="text-title font-pmedium text-primary">
        Upload Policies
      </span>
      <hr />

      <div className="grid lg:grid-cols-3 md:grid-col-3 sm:grid-col-1">
        {uploadItems.map((index, item) => {
          return (
            <>
              <div
                className="space-y-2 border-default p-4  rounded-md"
                key={index}>
                <div className="mb-2">
                  <span className="text-subtitle text-primary">{index}</span>
                </div>
                <div className="flex gap-4">
                  {/* Placeholder Input Box */}
                  <div className="flex items-end w-full border justify-end border-gray-200 rounded-md">
                    <PrimaryButton title={"Choose File"} />
                  </div>
                  <div className="flex gap-2 items-center">
                    <div className="bg-borderGray text-black p-2 rounded-md cursor-pointer hover:bg-gray-200 transition-all">
                      <MdUpload style={{ fill: "black" }} />
                    </div>
                    <div className="bg-borderGray text-black p-2 rounded-md cursor-pointer hover:bg-gray-200 transition-all">
                      <IoMdDownload style={{ fill: "black" }} />
                    </div>
                  </div>
                </div>
              </div>
            </>
          );
        })}
      </div>

      <div>
        <WidgetSection border title="Upload Policies">
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

export default HrPolicies;
