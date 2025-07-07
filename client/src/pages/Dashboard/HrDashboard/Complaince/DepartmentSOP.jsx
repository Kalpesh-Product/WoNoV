import AgTable from "../../../../components/AgTable";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import humanDate from "../../../../utils/humanDateForamt";

const DepartmentSOP = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const { departmentId, departmentName, documentType } = location.state;
  const { data = [], isLoading } = useQuery({
    queryKey: ["departmentSOP", departmentId],
    queryFn: async () => {
      const response = await axios.get(
        `/api/company/get-department-documents?departmentId=${departmentId}&type=${
          documentType ? documentType : "sop"
        }`
      );
      const sopDocuments = response.data?.documents?.sopDocuments;
      const policyDocuments = response.data?.documents?.policyDocuments;
      const filtered = documentType === "sop" ? sopDocuments : policyDocuments;
      return filtered;
    },
    enabled: !!departmentId,
  });

  const columns = [
    { field: "srNo", headerName: "Sr No", width: 100 },
    {
      field: "name",
      headerName: "Document Name",
      flex: 1,
      cellRenderer: (params) => (
        <>
          <a
            className="text-primary underline cursor-pointer"
            href={params.data.documentLink}
            target="_blank"
            rel="noopener noreferrer"
          >
            {params.value}
          </a>
        </>
      ),
    },
    {
      field: "createdAt",
      headerName: "Created At",
      width: 180,
      valueFormatter: (params) =>
        params.value ? humanDate(params.value) : "-",
    },
    {
      field: "updatedAt",
      headerName: "Updated At",
      width: 180,
      valueFormatter: (params) =>
        params.value ? humanDate(params.value) : "-",
    },
  ];
  const tableData = isLoading
    ? []
    : data.map((item, index) => ({
        ...item,
        srNo: index + 1,
        name: item.name,
        documentLink: item.documentLink,
        createdAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

  console.log("Data", data);

  return (
    <div>
      <PageFrame>
        <AgTable
          key={data.length}
          columns={columns}
          data={tableData}
          tableTitle={`${departmentName || "Null"} ${
            documentType ? documentType : "SOP"
          } Documents`}
          search
        />
      </PageFrame>
    </div>
  );
};

export default DepartmentSOP;
