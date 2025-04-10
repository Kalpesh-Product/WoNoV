import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";

const BulkUpload = () => {
  const uploadItems = [
    "Upload Assets",
    "Upload Assets",
    "Upload Assets",
    "Upload Assets",
    "Upload Assets",
    "Upload Assets",
  ];
  return (
    <div className="flex flex-col gap-4">
      <h2 className="text-title font-pmedium text-primary pb-4">
        Bulk Upload Data
      </h2>

      <div className="grid lg:grid-cols-3 md:grid-col-3 sm:grid-col-1">
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
    </div>
  );
};

export default BulkUpload;
