import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "./useAxiosPrivate";
import useAuth from "./useAuth";

const useUserPermissions = () => {
  const axios = useAxiosPrivate();
  const { auth } = useAuth();

  const userId = auth?.user?._id;
  const fallbackPermissions = auth?.user?.permissions?.permissions || [];

  const { data } = useQuery({
    queryKey: ["liveUserPermissions", userId],
    enabled: Boolean(userId),
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    queryFn: async () => {
      const response = await axios.get(`/api/access/user-permissions/${userId}`);
      return response.data;
    },
  });

  const permissions = useMemo(() => {
    if (Array.isArray(data?.permissions)) {
      return data.permissions;
    }
    return fallbackPermissions;
  }, [data?.permissions, fallbackPermissions]);

  const hasPermission = (permission) => permissions.includes(permission);

  return { permissions, hasPermission };
};

export default useUserPermissions;