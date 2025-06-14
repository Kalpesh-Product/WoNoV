import { useLocation } from "react-router-dom";
import useAuth from "./useAuth";

const usePageDepartment = () => {
  const { auth } = useAuth();
  const location = useLocation();

  const pathSegments = location.pathname.split("/").filter(Boolean);
  const dashboardSegment = pathSegments.find((segment) =>
    segment.endsWith("-dashboard")
  );

  let section = dashboardSegment?.split("-")[0].toLowerCase();
  console.log("Section from hook", section)

  // ✅ Temporary override: treat "frontend" as "tech"
  if (section === "frontend") {
    section = "tech";
  }

  const department = auth?.user?.departments?.find((dept) =>
    dept.name.toLowerCase().includes(section)
  );

  return department;
};

export default usePageDepartment;
