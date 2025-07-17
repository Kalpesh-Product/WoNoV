import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";

const DirectorsCompany = () => {
  const location = useLocation();
  const axios = useAxiosPrivate();
  const navigate = useNavigate();

  const { data: kycDetails, isLoading } = useQuery({
    queryKey: ["directorsCompany"],
    queryFn: async () => {
      const response = await axios.get("/api/company/get-kyc");
      return response.data.data;
    },
  });

  const tableData = React.useMemo(() => {
    if (!kycDetails) return [];

    const result = [];

    // Add company row
    result.push({
      id: "company",
      srno: 1,
      name: "Company",
      files: kycDetails.companyKyc || [],
      documentCount: kycDetails.companyKyc?.length || 0,
    });

    // Add directors
    kycDetails.directorKyc?.forEach((director, index) => {
      result.push({
        id: `director-${index}`,
        srno: index + 2,
        name: director.nameOfDirector,
        files: director.documents || [],
        documentCount: director.documents?.length || 0,
      });
    });
    return result;
  }, [kycDetails]);

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
                ? `/app/dashboard/finance-dashboard/mix-bag/directors-company-KYC/${params.data.name}`
                : `/app/company-KYC/${params.data.name}`,
              {
                state: {
                  files: params.data.files,
                  name: params.data.name,
                },
              }
            )
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
          tableTitle=" DIRECTORS & COMPANY KYC"
          hideFilter
          search
          loading={isLoading}
        />
      </PageFrame>
    </div>
  );
};

export default DirectorsCompany;
