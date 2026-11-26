import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { PERMISSIONS } from "../../constants/permissions";
import {
  getModuleDisplayName,
  groupPermissionsByModule,
} from "../../utils/permissionModules";

const LogPermissions = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const selectedEmployee = useSelector((state) => state.hr.selectedEmployee);
  const user = selectedEmployee || location.state?.user;

  const { data: accessProfile, isLoading } = useQuery({
    queryKey: ["userPermissions", user?._id],
    queryFn: async () => {
      const response = await axios.get(
        `/api/access/user-permissions/${user._id}`,
      );
      return response.data;
    },
    enabled: Boolean(user?._id),
  });

  if (!user?._id) {
    return (
      <div className="bg-white p-4">
        <div className="flex flex-col gap-3">
          <span className="text-content">No employee selected.</span>
          <button
            type="button"
            className="text-subtitle text-primary underline w-fit"
            onClick={() => navigate("/app/logs")}
          >
            Back to departments
          </button>
        </div>
      </div>
    );
  }

  const grantedPermissions = new Set(accessProfile?.permissions || []);
  const groupedPermissions = groupPermissionsByModule(PERMISSIONS);
  const accessibleModules = Object.entries(groupedPermissions).filter(
    ([, permissions]) =>
      permissions.some((permission) =>
        grantedPermissions.has(permission.action),
      ),
  );

  const hiddenCards = new Set(["AUTH", "SIDEBAR"]);

  const cards = [
    ["auth", []],
    ...accessibleModules.filter(([module]) => !hiddenCards.has(module)),
  ];

  return (
    <div className="bg-white p-4 flex flex-col gap-4">
      <span className="text-title text-primary font-pmedium">
        Manage Logs
      </span>

      {isLoading ? (
        <div className="text-content">Loading modules...</div>
      ) : (
        <div className="grid grid-cols-3 gap-4">
          {cards.map(([module]) => (
            <div
              key={module}
              role="button"
              tabIndex={0}
              className="p-4 rounded-md cursor-pointer flex flex-col gap-2 shadow-md hover:bg-gray-100"
              onClick={() =>
                navigate(module.toLowerCase(), {
                  state: { module: module.toLowerCase(), user },
                })
              }
              onKeyDown={(event) => {
                if (event.key === "Enter" || event.key === " ") {
                  navigate(module.toLowerCase(), {
                    state: { module: module.toLowerCase(), user },
                  });
                }
              }}
            >
              <span className="text-subtitle font-pmedium">
                {getModuleDisplayName(module)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default LogPermissions;
