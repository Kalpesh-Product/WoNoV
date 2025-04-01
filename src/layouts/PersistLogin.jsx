import { Outlet } from "react-router-dom";
import { useEffect, useState } from "react";
import useRefresh from "../hooks/useRefresh";
import useAuth from "../hooks/useAuth";
import Loading from "../pages/Loading";

export default function PersistLogin() {
  const [isLoading, setIsLoading] = useState(true);
  const refresh = useRefresh();
  const { auth } = useAuth();

  useEffect(() => {
    const verifyRefreshToken = async () => {
      try {
        await refresh();
      } catch (error) {
        throw new Error(error)
      } finally {
        setIsLoading(false);
      }
    };
    !auth?.accessToken.length ? verifyRefreshToken() : setIsLoading(false);
  }, []);

  return <>{isLoading ? <Loading /> : <Outlet />}</>;
}
