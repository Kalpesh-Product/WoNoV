import useAuth from "./useAuth";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/axios";
import { toast } from "sonner";

export default function useLogout() {
  const { setAuth, auth } = useAuth();
  const navigate = useNavigate();
  const user = auth.user;

  const logout = async () => {
    try {
      await api.post("/api/auth/logout", {
        user,
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
