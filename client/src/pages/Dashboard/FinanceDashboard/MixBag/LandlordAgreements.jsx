import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const LandlordAgreements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const { data: landlordData, isLoading: isLandlord } = useQuery({
    queryKey: ["landlord-agreements"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/finance/get-landlord-agreements"
        );
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });

  // const tableData = folderData.map((person, index) => ({
  //   srno: index + 1,
  //   name: person.title,
  //   documentCount: person.files.length,
  //   id: person.id,
  //   files: person.files,
  // }));

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
        data={[]}
        tableTitle={"Landlord Agreements"}
        tableHeight={400}
        hideFilter
        search
      />
    </div>
  );
};

export default LandlordAgreements;
