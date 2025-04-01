import React, {useEffect} from "react";
import { Outlet } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import { useDispatch } from "react-redux";
import { setMeetings } from "../../redux/slices/meetingSlice";
import { CircularProgress } from "@mui/material";

const MeetingLayout = () => {
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  //------------------------------------------ Common API's------------------------------------//
  const {
    data: meetings = [],
    isPending : isMeetingsPending,
    error,
  } = useQuery({
    queryKey: ["meetings"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/meetings/get-meetings");
        return response.data;
      } catch (error) {
        toast.error("Failed to fetch meetings");
        throw error;
      }
    },
  });
  useEffect(() => {
    if (meetings.length > 0) {
      dispatch(setMeetings(meetings));
    }
  }, [meetings, dispatch]);

  //------------------------------------------ Common API's------------------------------------//

  return (
    <div>
      {isMeetingsPending ? (
        <div className="h-screen flex justify-center items-center">
          <CircularProgress color="#1E3D73" />
        </div>
      ) : (
        <Outlet />
      )}
    </div>
  );
};

export default MeetingLayout;
