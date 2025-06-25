import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const ComplianceDocuments = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const axios = useAxiosPrivate();

  const { data: complianceData, isLoading } = useQuery({
    queryKey: ["complianceDocuments"],
    queryFn: async () => {
      const res = await axios.get("/api/company/get-compliance-documents");
      return res.data.data;
    },
  });

  const tableData = React.useMemo(() => {
    if (!complianceData) return [];

    return complianceData.map((entry, index) => ({
      srno: index + 1,
      name: entry.personName,
      id: `compliance-${index}`,
      files: entry.documents || [],
      documentCount: entry.documents?.length || 0,
    }));
  }, [complianceData]);

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
            navigate(`/app/company-KYC/${params.data.id}`, {
              state: {
                name: params.data.name,
                files: params.data.files,
              },
            })
          }
          className="text-primary underline cursor-pointer">
          {params.value}
        </span>
      ),
    },
    { field: "documentCount", headerName: "No. of Documents", flex: 1 },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        <AgTable
          columns={columns}
          data={tableData}
          tableTitle="Compliance Documents"
          tableHeight={400}
          hideFilter
          search
          loading={isLoading}
        />
      </PageFrame>
    </div>
  );
};

export default ComplianceDocuments;
