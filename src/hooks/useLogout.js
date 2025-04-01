import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/axios";
import { toast } from "sonner";

export default function useLogout() {
  const { setAuth } = useAuth();
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.get("/api/auth/logout", {
        withCredentials: true,
      });
      toast.success("Successfully logged out");
      setAuth((prevState) => {
        return {
          ...prevState,
          accessToken: "",
          user: null,
        };
      });

      navigate("/");
    } catch (error) {
      toast.error(error.message);
    }
  };
  return logout;
}
