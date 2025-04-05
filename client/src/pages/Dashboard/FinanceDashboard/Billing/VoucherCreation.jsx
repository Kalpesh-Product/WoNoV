import React from "react";
import Template from "../../../../utils/Template.png";
import Template2 from "../../../../utils/Template1.png";
import Template1 from "../../../../utils/Template2.png";
import Template3 from "../../../../utils/Template3.png";
import Template4 from "../../../../utils/Template4.png";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";

const VoucherCreation = () => {
  const navigate = useNavigate();
  const templateData = [
    {
      id: 1,
      imgSrc: Template,
      title: "Experience Letter",
      date: "Jan 10, 2025",
    },
    {
      id: 2,
      imgSrc: Template2,
      title: "Handover & No-Dues Form",
      date: "Opened Jan 7, 2025",
    },
    {
      id: 3,
      imgSrc: Template1,
      title: "Timings Agreement",
      date: "Opened Jan 7, 2025",
    },
    {
      id: 4,
      imgSrc: Template3,
      title: "SOP Agreement",
      date: "Opened Jan 6, 2025",
    },
    {
      id: 5,
      imgSrc: Template4,
      title: "Internship Report",
      date: "Dec 24, 2024",
    },
  ];

  const invoiceCreationColumns = [
    { field: "invoiceName", headerName: "Invoice Name" ,flex:1},
    {
        field: "emailInvoice",
        headerName: "Email Invoice",
        cellRenderer: (params) => (
          <>
            <div className="p-2 mb-2 flex gap-2">
            <span className="text-primary hover:underline text-content cursor-pointer">
                Send Email
              </span>
            </div>
          </>
        ),
      },
    { field: "date", headerName: "KRAs" ,flex:1},
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <>
          <div className="p-2 mb-2 flex gap-2">
          <span className="text-primary hover:underline text-content cursor-pointer">
              View Details
            </span>
          </div>
        </>
      ),
    },
  ];
  const rows = [
    {
        id: 1,
        invoiceName: "Chair Invoice",
        date : "Jan 6, 2025",
    },
    {
        id: 2,
        invoiceName: "Table Invoice",
        date : "Jan 6, 2025",
    },
    {
        id: 3,
        invoiceName: "AC Invoice",
        date : "Jan 6, 2025",
    },
    {
        id: 4,
        invoiceName: "Laptop Invoice",
        date : "Jan 6, 2025",
    },
    {
        id: 5,
        invoiceName: "John Doe Invoice",
        date : "Jan 6, 2025",
    },
];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex justify-between items-center mb-6">
        <span className=" text-primary text-title font-pmedium">Templates</span>
        <PrimaryButton title={"Add Template"} />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templateData.map((template, index) => (
          <div
            key={index}
            onClick={() => navigate(`${template.id}`)}
            className="bg-white shadow-md rounded-lg overflow-hidden border">
            <div className="h-48">
              <img
                src={template.imgSrc}
                alt="Template Image"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="p-4">
              <h2 className="widgetTitle font-semibold font-pregular">
                {template.title}
              </h2>
              <p className="text-content text-gray-500 font-pregular">
                {template.date}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <AgTable data={rows} columns={invoiceCreationColumns} search tableTitle={"Invoice Creation"}  />
      </div>
    </div>
  );
};

export default VoucherCreation;
