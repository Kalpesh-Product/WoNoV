import React from "react";
import BudgetDisplay from "../../../../components/BudgetDisplay";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const AdminBudget = () => {
  const axios = useAxiosPrivate();
  const { data: hrFinance = [] } = useQuery({
    queryKey: ["hrFinance"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/budget/company-budget");
        return response.data.allBudgets;
      } catch (error) {
        throw new Error("Error fetching data");
      }
    },
  });
  return (
    <div>
      <BudgetDisplay budgetData={hrFinance} />
    </div>
  );
};

export default AdminBudget;
