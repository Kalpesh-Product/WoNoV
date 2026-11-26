import { useLocation, useParams } from "react-router-dom";
import { useSelector } from "react-redux";

import LogPage from "../LogPage";
import { getModuleDisplayName } from "../../utils/permissionModules";

const LogModuleLogs = () => {
  const { module } = useParams();
  const location = useLocation();
  const selectedEmployee = useSelector((state) => state.hr.selectedEmployee);
  const user = selectedEmployee || location.state?.user;

  return (
    <LogPage
      moduleFilter={module || ""}
      userFilter={user?._id || ""}
      actionFilter={module === "auth" ? "login,logout,auth" : ""}
      tableTitle={
        module === "auth"
          ? "Auth Logs"
          : `${getModuleDisplayName(module || "")} Logs`
      }
    />
  );
};

export default LogModuleLogs;
