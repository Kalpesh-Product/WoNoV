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
import { FaUserTie } from "react-icons/fa6";
import { FiLogOut } from "react-icons/fi";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const Header = () => {
  const axios = useAxiosPrivate();
  const [isHovered, setIsHovered] = useState(false);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const navigate = useNavigate();
  const { auth } = useAuth(); // Assuming signOut is a method from useAuth()
  const logout = useLogout();
  const isMobile = useMediaQuery("(max-width: 768px)");

  // State for Popover
  const [anchorEl, setAnchorEl] = useState(null);
  const { data: companyLogo } = useQuery({
    queryKey: ["companyLogo"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/company/get-company-logo");
        return response.data;
      } catch (error) {
        console.log(error);
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

  return (
    <>
      <div className="flex w-full justify-between gap-x-10 items-center p-2">
        <div>
          <div>
            <div className={`w-48 flex items-center gap-16 h-full pl-4`}>
              <img
                onClick={() => navigate("dashboard/frontend-dashboard")}
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
              <TextField
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
              />
            </div>

            <div className="flex w-full justify-end gap-4">
              <button className="bg-[#1E3D73] p-2 text-white rounded-md">
                <IoMdNotificationsOutline />
              </button>
              <button className="bg-[#1E3D73] p-2 text-white rounded-md">
                <MdOutlineMailOutline />
              </button>
            </div>
          </>
        )}
        <div className="flex items-center gap-4 w-[40%]">
          <Avatar onClick={handleAvatarClick} className="cursor-pointer">
            {auth.user.name === "Abrar Shaikh" ? (
              <img src={Abrar} alt="" />
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
                <h1 className="text-xl font-semibold">{auth.user.firstName}</h1>
                <span className="text-content">
                  {auth.user.designation.split(" ").length > 3
                    ? auth.user.designation.split(" ").slice(0, 3).join(" ") +
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
    </>
  );
};

export default Header;
