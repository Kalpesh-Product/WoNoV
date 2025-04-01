import React from "react";
import BudgetDisplay from "../../../../components/BudgetDisplay";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import useAuth from "../../../../hooks/useAuth";
import { CircularProgress } from "@mui/material";

const SalesBudget = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();
  const { data: salesFinance = [], isPending: isSalesPending } = useQuery({
    queryKey: ["salesFinance"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          `/api/budget/company-budget?departmentId=${auth.user.departments.map(
            (item) => item._id
          )}`
        );
        return response.data.allBudgets;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });
  return (
    <div>
      {!isSalesPending ? (
        salesFinance.length > 0 ? (
          <BudgetDisplay budgetData={salesFinance} />
        ) : (
          <div className="h-[65vh] flex justify-center items-center">
            <span className="text-title text-primary">No Data Available</span>
          </div>
        )
      ) : (
        <CircularProgress color="#1E3D73" />
      )}
    </div>
  );
};

export default SalesBudget;
