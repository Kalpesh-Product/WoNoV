import { useQuery } from "@tanstack/react-query";
import React from "react";
import useAxiosPrivate from "../hooks/useAxiosPrivate";

const LogPage = () => {
  const axios = useAxiosPrivate();
  const { data, isLoading } = useQuery({
    queryKey: ["log"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/logs/get-logs");
        return response.data;
      } catch (error) {
        console.error(error.response.data.message);
      }
    },
  });
  return <div></div>;
};

export default LogPage;
