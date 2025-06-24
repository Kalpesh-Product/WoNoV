import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { CircularProgress } from "@mui/material";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import PageFrame from "../../../../components/Pages/PageFrame";

const LandlordAgreements = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const { data: landlordData = [], isLoading } = useQuery({
    queryKey: ["landlord-agreements"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/finance/get-landlord-agreements"
        );
        return response.data || [];
      } catch (error) {
        console.error("Failed to fetch landlord agreements:", error);
        return [];
      }
    },
  });

  const tableData = Array.isArray(landlordData)
    ? landlordData
        .slice()
        .sort((a, b) => (a?.name || "").localeCompare(b?.name))
        .map((item, index) => {
          const rawName = item?.name || "Unnamed";
          const safeName = rawName.replace(/\//g, ""); // Remove all slashes

          return {
            srno: index + 1,
            name: safeName,
            documentCount: Array.isArray(item?.documents)
              ? item.documents.length
              : 0,
            files: item?.documents || [],
            id: item?._id || "",
          };
        })
    : [];

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
                ? `/app/dashboard/finance-dashboard/mix-bag/landlord-agreements/${params.data.name}`
                : `/app/landlord-agreements/${params.data.name}`,
              {
                state: {
                  files: params.data.files || [],
                  name: params.data.name || "Unnamed",
                  id: params.data.id,
                },
              }
            )
          }
          className="text-primary underline cursor-pointer"
        >
          {params.value || "Unnamed"}
        </span>
      ),
    },
    { field: "documentCount", headerName: "No. of Documents", flex: 1 },
  ];

  return (
    <div className="p-4">
      <PageFrame>

      {!isLoading ? (
        <>
          <AgTable
            columns={columns}
            data={tableData}
            tableTitle="Landlord Agreements"
            tableHeight={400}
            hideFilter
            search
          />
        </>
      ) : (
        <div className="h-72 place-items-center">
          <CircularProgress />
        </div>
      )}
      </PageFrame>
    </div>
  );
};

export default LandlordAgreements;
