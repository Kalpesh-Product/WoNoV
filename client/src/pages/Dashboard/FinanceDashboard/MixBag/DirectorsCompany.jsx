import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";

const DirectorsCompany = () => {
  const location = useLocation();
  const navigate = useNavigate();

  const folderData = [
    {
      id: 1,
      title: "Abrar Shaikh",
      files: [
        {
          id: 1,
          label: "Passport",
          link: "link here",
          uploadedDate: "2024-04-01",
          lastModified: "2024-06-01",
        },
        {
          id: 2,
          label: "License",
          link: "link here",
          uploadedDate: "2024-04-10",
          lastModified: "2024-06-01",
        },
        {
          id: 3,
          label: "Aadhar",
          link: "link here",
          uploadedDate: "2024-04-20",
          lastModified: "2024-06-01",
        },
      ],
    },
    {
      id: 2,
      title: "Kashif Shaikh",
      files: [
        {
          id: 1,
          label: "Passport",
          link: "link here",
          uploadedDate: "2024-04-05",
          lastModified: "2024-06-01",
        },
        {
          id: 2,
          label: "License",
          link: "link here",
          uploadedDate: "2024-04-15",
          lastModified: "2024-06-01",
        },
      ],
    },
    {
      id: 3,
      title: "Nasreen Shaikh",
      files: [
        {
          id: 1,
          label: "Passport",
          link: "link here",
          uploadedDate: "2024-03-25",
          lastModified: "2024-06-01",
        },
        {
          id: 2,
          label: "License",
          link: "link here",
          uploadedDate: "2024-04-05",
          lastModified: "2024-06-01",
        },
      ],
    },
    {
      id: 4,
      title: "Kabir Shaikh",
      files: [
        {
          id: 1,
          label: "Passport",
          link: "link here",
          uploadedDate: "2024-04-08",
          lastModified: "2024-06-01",
        },
        {
          id: 2,
          label: "License",
          link: "link here",
          uploadedDate: "2024-04-18",
          lastModified: "2024-06-01",
        },
      ],
    },
  ];

  const tableData = folderData.map((person, index) => ({
    srno: index + 1,
    name: person.title,
    documentCount: person.files.length,
    id: person.id,
    files: person.files,
  }));

  const columns = [
    { field: "srno", headerName: "Sr No", width: 100 },
    {
      field: "name",
      headerName: "Name",
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() =>
            navigate(
              location.pathname.includes("mix-bag")
                ? `/app/dashboard/finance-dashboard/mix-bag/company-KYC/${params.data.id}`
                : `/app/company-KYC/${params.data.id}`,
              {
                state: {
                  files: params.data.files,
                  name: params.data.name,
                },
              }
            )
          }
          className="text-primary underline cursor-pointer"
        >
          {params.value}
        </span>
      ),
    },
    { field: "documentCount", headerName: "No. of Documents", flex: 1 },
  ];

  return (
    <div className="p-4">
      <AgTable
        columns={columns}
        data={tableData}
        tableTitle={"COMPANY KYC"}
        tableHeight={400}
        hideFilter
        search
      />
    </div>
  );
};

export default DirectorsCompany;
