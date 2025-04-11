import React from "react";
import { TextField, Box } from "@mui/material";
import { IoMdDownload } from "react-icons/io";
import { MdUpload } from "react-icons/md";
import WidgetSection from "../../../../components/WidgetSection";
import AgTable from "../../../../components/AgTable";

const BulkUpload = () => {
  const uploadItems = [
    "Upload Employee" 
  ];

  const bulkUploadDataColumns = [
    { field: "srNo", headerName: "Sr No", flex: 1 },
    { field: "templateName", headerName: "Template Name", flex: 1 },
    { field: "uploadedBy", headerName: "Uploaded By", flex: 1 },
    { field: "date", headerName: "Date", flex: 1 },
  ];

  const bulkUploadData = [
    {
      srNo: 1,
      templateName: "Upload Employee",
      uploadedBy: "John Doe",
      date: "01-03-2025",
    },
    {
      srNo: 2,
      templateName: "Upload Employee",
      uploadedBy: "Jane Smith",
      date: "08-03-2025",
    },
    {
      srNo: 3,
      templateName: "Upload Employee",
      uploadedBy: "Michael Johnson",
      date: "15-03-2025",
    },
    {
      srNo: 4,
      templateName: "Upload Employee",
      uploadedBy: "Emily Davis",
      date: "22-03-2025",
    },
  ];
  

  // return (
  //   <div className="flex flex-col gap-4">
  //     <div className="flex justify-between items-center mb-6">
  //       <div className="w-1/4">
  //         <TextField
  //           label="Search Job Application"
  //           type="text"
  //           variant="outlined"
  //         />
  //       </div>
  //       <div className="flex"></div>
  //     </div>

  //     <div className="border-default rounded-md">
  //       <h2 className="text-title font-pmedium text-primary p-5">
  //         Bulk Upload Data
  //       </h2>
  //     </div>

  //     <div className="grid lg:grid-cols-3 md:grid-col-3 sm:grid-col-1 pb-4">
  //       {uploadItems.map((index, item) => {
  //         return (
  //           <div>
  //             <div
  //               className="space-y-2 border-default p-4  rounded-md"
  //               key={index}>
  //               <div className="mb-2">{index}</div>
  //               <div className="flex space-x-2">
  //                 {/* Placeholder Input Box */}
  //                 <div className="flex items-end w-full border border-gray-200 rounded-md">
  //                   <span className="text-white bg-gray-600 rounded-md p-2 ml-auto">
  //                     Choose file
  //                   </span>
  //                 </div>

  //                 {/* Filter Button */}
  //                 <button className="bg-[#48BBCC] p-2">
  //                   <MdUpload style={{ fill: "white" }} />
  //                 </button>
  //                 <button className="bg-[#48BBCC] p-2">
  //                   <IoMdDownload style={{ fill: "white" }} />
  //                 </button>
  //               </div>
  //             </div>

  //           </div>
  //         );
  //       })}
  //     </div>

  //     <div>
  //             <WidgetSection border title="Bulk Upload Data">
  //         <AgTable
  //           data={bulkUploadData}
  //           columns={bulkUploadDataColumns}
  //           search={true}
  //         />
  //       </WidgetSection>
  //     </div>
  //   </div>
  // );

 return (
    <div className="p-4">
      <h2 className="text-title font-pmedium text-primary pb-4">
        Upload Data
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
            data={bulkUploadData}
            columns={bulkUploadDataColumns}
            search={true}
          />
        </WidgetSection>
      </div>
    </div>
  );
};

export default BulkUpload;
