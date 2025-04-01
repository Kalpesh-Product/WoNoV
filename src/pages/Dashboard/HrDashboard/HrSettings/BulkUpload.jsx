;
import { TextField } from "@mui/material";
import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";

const BulkUpload = () => {
  const uploadItems = [
    "Upload Employee",
    "Upload Budgets",
    "Upload Finance",
    "Upload Templates",
    "Upload Sops",
    "Upload Policies",
  ];
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <div className="w-1/4">
          <TextField
            label="Search Job Application"
            type="text"
            variant="outlined"
          />
        </div>
        <div className="flex"></div>
      </div>

      <div className="border-default rounded-md">
        <h2 className="text-title font-pmedium text-primary p-5">
          Bulk Upload Data
        </h2>

        <div className="grid lg:grid-cols-3 md:grid-col-3 sm:grid-col-1">
          {uploadItems.map((index) => {
            return (
              <>
                <div
                  className="space-y-2  border-default p-4 m-2 rounded-md"
                  key={index}
                >
                  <div className="mb-2">{index}</div>
                  <div className="flex space-x-2">
                    {/* Placeholder Input Box */}
                    <div className="flex items-end w-full   bg-gray-100 border border-gray-300 rounded-md">
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
      </div>
    </>
  );
};

export default BulkUpload;
