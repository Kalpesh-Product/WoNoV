import AgTable from "../../components/AgTable";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import PageFrame from "../../components/Pages/PageFrame";

const HrCommonDocuments = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const { departmentId, departmentName, documentType } = location.state;
  const { data = [], isLoading } = useQuery({
    queryKey: ["departmentDocuments"],
    queryFn: async () => {
      const response = await axios.get(
        `/api/company/get-department-documents?departmentId=${departmentId}&type=${
          documentType ? documentType : "sop"
        }`
      );

      const filtered =
        documentType === "policies"
          ? response.data.documents.policyDocuments
          : response.data.documents.sopDocuments;
      return filtered;
    },
    enabled: !!departmentId,
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
            View {documentType ? documentType : "SOP"}
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

export default HrCommonDocuments;
