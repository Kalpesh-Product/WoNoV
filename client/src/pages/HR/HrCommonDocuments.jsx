import AgTable from "../../components/AgTable";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import PageFrame from "../../components/Pages/PageFrame";
import YearWiseTable from "../../components/Tables/YearWiseTable";

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
    {
      field: "name",
      headerName: `${documentType === "sop" ? "SOP" : "Policy"} Name`,
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
      field: "uploadedDate",
      headerName: "Upload Date",
    },
    {
      field: "modifiedDate",
      headerName: "Modified Date",
    },
  ];

  const tableData = isLoading
    ? []
    : data.map((item, index) => ({
        srNo: index + 1,
        name: item.name,
        documentLink: item.documentLink,
        uploadedDate : item.createdAt,
        modifiedDate : item.updatedAt
      }));

  console.log("Data", data);

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          dateColumn={"uploadedDate"}
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
