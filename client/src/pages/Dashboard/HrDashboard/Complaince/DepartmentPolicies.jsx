import React from "react";
import AgTable from "../../../../components/AgTable";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";

const DepartmentPolicies = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const { departmentId, departmentName } = location.state;
  const { data=[], isLoading } = useQuery({
    queryKey: ["departmentSOP", departmentId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/company/get-department-documents?departmentId=${departmentId}&type=policies`
      );
      const filtered = response.data.documents.sopDocuments;
      return filtered;
    },
    enabled: !!departmentId, // runs only if departmentId is truthy
  });

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    { field: "name", headerName: "Document Name", flex: 1 },
    {
      field: "documentLink",
      headerName: "Document Link",
      pinned: "right",
      width: 200,
      cellRenderer: (params) => (
        <>
          <a
            className="text-primary underline cursor-pointer"
            href={params.value}
            target="_blank"
            rel="noopener noreferrer"
          >
            View Policy
          </a>
        </>
      ),
    },
  ];

  const tableData = isLoading
    ? []
    : data.map((item, index) => ({
        srNo: index + 1,
        name: item.name,
        documentLink: item.documentLink,
      }));

  return (
    <div>
      <PageFrame>
        <AgTable
          columns={columns}
          data={tableData}
          tableTitle={`${departmentName || "Null"} Policy Documents`}
          search
        />
      </PageFrame>
    </div>
  );
};

export default DepartmentPolicies;
