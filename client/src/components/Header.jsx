import React, { useState } from "react";
import {
  TextField,
  Avatar,
  InputAdornment,
  Popover,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  useMediaQuery,
  IconButton,
  Badge,
  CircularProgress,
} from "@mui/material";
import {
  IoIosArrowForward,
  IoIosSearch,
  IoMdNotificationsOutline,
} from "react-icons/io";
import { MdOutlineMailOutline } from "react-icons/md";
import { useSidebar } from "../context/SideBarContext";
import biznestLogo from "../assets/biznest/biznest_logo.jpg";
import { GiHamburgerMenu } from "react-icons/gi";
import Abrar from "../assets/abrar.jpeg";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import useLogout from "../hooks/useLogout";
import { FaCheck, FaUserTie } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import { HiOutlineRefresh } from "react-icons/hi";
import { toast } from "sonner";
import { queryClient } from "../main";
import relativeTime from "dayjs/plugin/relativeTime";
import dayjs from "dayjs";

const Header = ({
  notifications = [],
  unseenCount = 0,
  onRefreshNotifications,
  isRefreshingNotifications = false,
}) => {
  const axios = useAxiosPrivate();
  dayjs.extend(relativeTime);
  const [isHovered, setIsHovered] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const { auth } = useAuth(); // Assuming signOut is a method from useAuth()
  const logout = useLogout();
  const isMobile = useMediaQuery("(max-width: 768px)");
  const [notificationAnchorEl, setNotificationAnchorEl] = useState(null);

  const { mutate: updateRead, isPending: isUpdatePending } = useMutation({
    mutationKey: ["updateRead"],
    mutationFn: async (notificationId) => {
      const response = await axios.patch(
        `/api/notifications/mark-as-read/${notificationId}`
      );
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      toast.success(data.message || "UPDATED");
    },
    onError: (error) => {
      toast.error(error.message || "Error");
    },
  });

  // State for Popover
  const [anchorEl, setAnchorEl] = useState(null);
  const { data: companyLogo } = useQuery({
    queryKey: ["companyLogo"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/get-company-logo");

        return response.data;
      } catch (error) {
        console.warn(error);
      }
    },
  });

  const handleAvatarClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  const handleSignOut = async () => {
    await logout();
  };

  const handleProfileClick = () => {
    navigate("/app/profile");
    handlePopoverClose();
  };

  const open = Boolean(anchorEl);
  const id = open ? "avatar-popover" : undefined;

  const openNotification = Boolean(notificationAnchorEl);
  const notificationId = openNotification ? "notification-popover" : undefined;

  return (
    <>
      <div className="flex w-full justify-between gap-x-10 items-center py-2">
        <div>
          <div>
            <div className={`w-48 flex items-center gap-16 h-full pl-4`}>
              <img
                onClick={() => navigate("dashboard")}
                className="w-[70%] h-full object-contain cursor-pointer"
                src={companyLogo?.logoUrl || biznestLogo}
                alt="logo"
              />
              {!isMobile && (
                <button
                  onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                  className="p-2 text-gray-500 text-xl"
                >
                  {isSidebarOpen ? <GiHamburgerMenu /> : <IoIosArrowForward />}
                </button>
              )}
            </div>
          </div>
        </div>
        {!isMobile && (
          <>
            <div className="w-full flex items-center pl-20">
              {/* <TextField
                fullWidth
                size="small"
                type="search"
                placeholder="Type here to search..."
                variant="standard"
                slotProps={{
                  input: {
                    disableUnderline: true,
                    startAdornment: (
                      <InputAdornment position="start">
                        <IoIosSearch size={20} />
                      </InputAdornment>
                    ),
                  },
                }}
              /> */}
            </div>

            <div className="flex w-full justify-end gap-4">
              <button
                onClick={(e) => setNotificationAnchorEl(e.currentTarget)}
                className="relative bg-[#1E3D73] text-white rounded-md "
              >
                <Badge
                  badgeContent={unseenCount > 9 ? "9+" : unseenCount}
                  color="error"
                  className="bg-primary rounded-md p-2"
                  anchorOrigin={{ vertical: "top", horizontal: "right" }}
                  overlap="circular"
                >
                  <IoMdNotificationsOutline size={20} />
                </Badge>
              </button>

              <button className="bg-[#1E3D73] p-2 text-white rounded-md">
                <MdOutlineMailOutline size={20} />
              </button>
            </div>
          </>
        )}
        {/* <div className="flex items-center gap-4 w-[40%]"> */}
        <div className="flex items-center gap-4 md:w-[45%] w-fit">
          <Avatar onClick={handleAvatarClick} className="cursor-pointer">
            {/* {auth.user.email === "abrar@biznest.co.in" ? ( */}
            {auth?.user?.profilePicture?.url ? (
              // <img src={Abrar} alt="" />
              <img src={auth?.user?.profilePicture?.url} alt="" />
            ) : (
              auth.user.firstName.charAt(0)
            )}
          </Avatar>

          <div
            className="w-full relative"
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
          >
            {!isMobile && (
              <>
                <h1 className="text-xl font-semibold text-start">
                  {auth.user.firstName}
                </h1>
                <span className="text-content w-full">
                  {/* {auth.user.designation.split(" ").length > 2 */}
                  {auth.user.designation.split(" ").length > 3
                    ? // ? auth.user.designation.split(" ").slice(0, 2).join(" ") +
                      auth.user.designation.split(" ").slice(0, 2).join(" ") +
                      "..."
                    : auth.user.designation}
                </span>
                {isHovered && auth.user.designation.split(" ").length > 1 ? (
                  <div className="motion-preset-slide-up-sm absolute top-14 right-0 bg-white border-default border-primary rounded-md p-4 w-96">
                    <span>{auth.user.designation}</span>
                  </div>
                ) : (
                  ""
                )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* Popover Component */}
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handlePopoverClose}
        anchorOrigin={{
          vertical: "bottom",
          horizontal: "center",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "center",
        }}
      >
        <div className="p-4 w-48">
          <List>
            {/* Profile Option */}
            <ListItem
              button
              onClick={handleProfileClick}
              className="hover:text-primary transition-all duration-100 text-gray-500 cursor-pointer"
            >
              <ListItemIcon>
                <FaUserTie className="text-gray-500" />
              </ListItemIcon>
              <ListItemText primary="Profile" />
            </ListItem>

            <Divider />

            {/* Sign Out Option */}
            <ListItem
              button
              onClick={handleSignOut}
              className="hover:text-red-600 transition-all duration-100 text-gray-500 cursor-pointer"
            >
              <ListItemIcon>
                <FiLogOut className="text-gray-500" />
              </ListItemIcon>
              <ListItemText primary="Sign Out" />
            </ListItem>
          </List>
        </div>
      </Popover>

      {/* 🔔 Notification Popover */}
      <Popover
        id={notificationId}
        open={openNotification}
        anchorEl={notificationAnchorEl}
        onClose={() => setNotificationAnchorEl(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <div className="p-4 w-[30rem] max-h-[400px] overflow-y-auto">
          <div className="flex justify-between items-center mb-2">
            <div className="flex items-center gap-5 rounded-full">
              <span className="font-pmedium text-subtitle">Notifications</span>
              <Badge
                badgeContent={unseenCount > 9 ? "9+" : unseenCount}
                color="error"
                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                overlap="circular"
              ></Badge>
            </div>
            <IconButton
              size="small"
              onClick={onRefreshNotifications}
              disabled={isRefreshingNotifications}
            >
              <HiOutlineRefresh
                className={`${isRefreshingNotifications ? "animate-spin" : ""}`}
              />
            </IconButton>
          </div>
          <Divider className="my-2" />
          {isRefreshingNotifications ? (
            <div className="h-52 flex justify-center items-center">
              <CircularProgress size={15} />
            </div>
          ) : (
            <div className="mt-2">
              {notifications.length === 0 ? (
                <p className="text-gray-500 text-sm">No notifications yet.</p>
              ) : (
                <>
                  <div className="h-52 overflow-y-auto pr-4">
                    <ul className="space-y-2">
                      {notifications.slice(0, 9).map((n, index) => {
                        const initiator = `${n.initiatorData?.firstName} ${n.initiatorData?.lastName}`;
                        const currentUser = auth?.user?._id;
                        const module = n.module || "";
                        const navigations = {
                          Meetings: "/app/meetings/calendar",
                          Tickets: "/app/tickets/manage-tickets",
                          Tasks: "/app/tasks/department-tasks",
                          Performance: "/app/performance",
                        };

                        const userEntry = n.users?.find(
                          (item) =>
                            item.userActions?.whichUser?._id === currentUser
                        );

                        const hasRead = userEntry?.userActions?.hasRead;

                        return (
                          <li
                            key={n._id || index}
                            className={`text-sm p-2 rounded ${
                              !n.hasRead
                                ? "bg-gray-200 border-borderGray border-default"
                                : "border-default border-borderGray"
                            }`}
                          >
                            <div className="flex w-full justify-between items-center gap-4 mb-2">
                              <div className="flex justify-between w-full items-center">
                                <div
                                  role="button"
                                  onClick={() => {
                                    if (navigations[module]) {
                                      navigate(navigations[module]);
                                      setNotificationAnchorEl(null);
                                    }
                                  }}
                                  className="flex flex-col gap-1 w-full"
                                >
                                  <div className="flex justify-between w-full">
                                    <div className="flex justify-start w-full">
                                      <span className="font-pmedium">
                                        {n.module}
                                      </span>
                                    </div>

                                    <div className="text-xs text-gray-500 w-full flex justify-end">
                                      {dayjs(n.createdAt).fromNow()}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>

                            <div className="w-full grid grid-cols-5">
                              <div className="col-span-4 flex items-end">
                                <span>{n.message}</span>
                              </div>
                              <div className="col-span-1 flex justify-end items-start">
                                {!hasRead && (
                                  <button
                                    onClick={() => updateRead(n._id)}
                                    className="p-2 rounded-full bg-green-300 text-green-600"
                                    title="Mark as Read"
                                  >
                                    <FaCheck />
                                  </button>
                                )}
                              </div>
                            </div>
                          </li>
                        );
                      })}
                    </ul>
                  </div>

                  {notifications.length > 9 && (
                    <div className="mt-2 text-start">
                      <button
                        onClick={() => {
                          setNotificationAnchorEl(null);
                          navigate("/app/notifications");
                        }}
                        className="text-primary text-content font-pregular hover:underline"
                      >
                        View more
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </Popover>
    </>
  );
};

export default Header;
