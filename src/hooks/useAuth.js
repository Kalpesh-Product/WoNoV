import { AuthContext } from "../context/AuthContext";
import { use } from "react";

export default function useAuth() {
  return use(AuthContext);
}
