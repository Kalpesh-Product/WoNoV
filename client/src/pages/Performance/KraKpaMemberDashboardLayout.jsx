import { useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { useQuery } from "@tanstack/react-query";
import TabLayout from "../../components/Tabs/TabLayout";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const KraKpaMemberDashboardLayout = () => {
  const axios = useAxiosPrivate();
  const location = useLocation();
  const selectedDepartment = useSelector(
    (state) => state.performance.selectedDepartment,
  );
  const departmentId = location.state?.selectedDepartment || selectedDepartment;
  const { data: access } = useQuery({
    queryKey: ["kraKpaIndividualMonthlyKpaReviewAccess", departmentId],
    enabled: Boolean(departmentId),
    queryFn: async () => {
      const response = await axios.get(
        "/api/kra-kpa/individual-monthly-kpa/review-access",
        { params: { department: departmentId } },
      );
      return response.data;
    },
  });

  return (
    <TabLayout
      basePath="/app/kra-kpa/department-KPA/member-wise-KPA"
      defaultTabPath="employee-dashboard"
      tabs={[
        { label: "Employee Dashboard", path: "employee-dashboard" },
        ...(access?.canApproveKpa
          ? [{ label: "Pending Approvals", path: "member-pending-approvals" }]
          : []),
      ]}
      fitTabLabels
    />
  );
};

export default KraKpaMemberDashboardLayout;
