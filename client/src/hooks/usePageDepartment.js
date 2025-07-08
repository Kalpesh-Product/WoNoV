import { useLocation } from "react-router-dom";
import useAuth from "./useAuth";
import useAxiosPrivate from "./useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const usePageDepartment = () => {
  const { auth } = useAuth();
  const location = useLocation();
  const axios = useAxiosPrivate();

  // Fetch departments
  const fetchDepartments = async () => {
    try {
      const response = await axios.get(
        "api/company/get-company-data?field=selectedDepartments"
      );
      return response.data?.selectedDepartments || [];
    } catch (error) {
      console.error("Error fetching departments:", error);
      return [];
    }
  };

  const { data: fetchedDepartments = [], isPending: departmentLoading } =
    useQuery({
      queryKey: ["fetchedDepartments"],
      queryFn: fetchDepartments,
      staleTime: 5 * 60 * 1000, // optional: avoid frequent refetching
    });

  const pathSegments = location?.pathname?.split("/")?.filter(Boolean) || [];
  const dashboardSegment = pathSegments.find((segment) =>
    segment?.endsWith("-dashboard")
  );

  let section = dashboardSegment?.split("-")?.[0]?.toLowerCase?.() || "";

  // Fallback for undefined section
  if (!section) {
    console.warn("usePageDepartment: Unable to determine section from path.");
    return null;
  }

  // Temporary override
  if (section === "frontend") {
    section = "tech";
  }

  const userDepartments = auth?.user?.departments || [];

  const managementAccessDepartments = [
    { _id: "67b2cf85b9b6ed5cedeb9a2e", name: "top management" },
    { _id: "6798ba9de469e809084e2494", name: "tech" },
    // Add more here as needed
  ];

  const isManagementAccess = userDepartments?.some((dept) =>
    managementAccessDepartments.some(
      (m) =>
        m._id === dept?._id &&
        dept?.name?.toLowerCase() === m.name.toLowerCase()
    )
  );

  if (isManagementAccess && Array.isArray(fetchedDepartments)) {
    const matchedDept = fetchedDepartments.find((deptObj) =>
      deptObj?.department?.name?.toLowerCase()?.includes(section)
    );

    if (matchedDept?.department) {
      return matchedDept.department;
    } else {
      console.warn(
        `usePageDepartment: Top Management user but no matching department found in fetchedDepartments for section "${section}"`
      );
    }
  }

  // Regular user logic
  const matchedUserDept = userDepartments.find((dept) =>
    dept?.name?.toLowerCase()?.includes(section)
  );

  if (matchedUserDept) {
    console.log("matched dept", matchedUserDept);
    return matchedUserDept;
  } else {
    console.warn(
      `usePageDepartment: No matching department found in userDepartments for section "${section}"`
    );
    return null; // fallback if nothing matches
  }
};

export default usePageDepartment;
