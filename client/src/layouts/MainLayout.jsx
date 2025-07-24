import React, { useState, useEffect, useRef } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Drawer, IconButton } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useMediaQuery } from "@mui/material";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import BreadCrumbComponent from "../components/BreadCrumbComponent";
import Footer from "../components/Footer";
import { useSidebar } from "../context/SideBarContext";
import { GiHamburgerMenu } from "react-icons/gi";
import { IoIosArrowForward } from "react-icons/io";
import ScrollToTop from "../components/ScrollToTop"; // Adjust path if needed
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../hooks/useAxiosPrivate";
import useAuth from "../hooks/useAuth";
import { PERMISSIONS } from "../constants/permissions";

const MainLayout = () => {
  const { auth } = useAuth();
  const [showFooter, setShowFooter] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dummyRef = useRef(null);
  const location = useLocation()
  const navigate = useNavigate()
  const axios = useAxiosPrivate();
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();
  const {
    data: notifications = [],
    isLoading: isNotificationsLoading,
    refetch: refetchNotifications,
  } = useQuery({
    queryKey: ["notifications"],
    queryFn: async () => {
      const res = await axios.get("/api/notifications/get-my-notifications");

      const filtered = res.data.filter(
        (n) => n.initiatorData?._id !== auth?.user?._id
      );

      return filtered;
    },
    refetchInterval: 15000,
  });

useEffect(() => {
  const pathname = location.pathname;
  console.log("🔍 Current pathname:", pathname);

  const rawPermissions = auth?.user?.permissions?.permissions || [];
  console.log("🔑 Raw permissions from auth:", rawPermissions);

  // Step 1: Collect relevant route patterns from PERMISSIONS object
  const permissionRoutes = Object.values(PERMISSIONS).map((perm) =>
    perm.value?.replace(/_/g, "-")
  );
  console.log("🎯 Routes to be permission-guarded:", permissionRoutes);

  // Step 2: Check if the current pathname contains any of the permission routes
  const pathRequiresPermission = permissionRoutes.some((route) =>
    pathname.includes(route)
  );
  console.log("🚦 Does this path require permission?", pathRequiresPermission);

  // Step 3: If permission is required, verify if the user has it
  if (pathRequiresPermission) {
    const formattedUserPermissions = rawPermissions.map((perm) =>
      perm.replace(/_/g, "-")
    );
    console.log("🛡️ User's formatted permissions:", formattedUserPermissions);

    const isAllowed = formattedUserPermissions.some((perm) =>
      pathname.includes(perm)
    );
    console.log("✅ Is user allowed?", isAllowed);

    if (!isAllowed) {
      console.warn("⛔ Unauthorized access detected, redirecting...");
      navigate("/unauthorized");
    }
  } else {
    console.log("✅ This route is public or not permission-controlled.");
  }
}, [location.pathname, auth, navigate]);



  const unreadCount = notifications.reduce((total, notification) => {
    const count = notification.users.filter(
      (user) =>
        user.userActions?.hasRead === false &&
        user.userActions?.whichUser?._id === auth.user._id
    ).length;
    return total + count;
  }, 0);
  const isMobile = useMediaQuery("(max-width: 768px)");

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFooter(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (dummyRef.current) {
      observer.observe(dummyRef.current);
    }

    return () => {
      if (dummyRef.current) {
        observer.unobserve(dummyRef.current);
      }
    };
  }, []);

  return (
    <div className="w-full flex flex-col justify-between h-screen overflow-y-auto">
      <header className="flex w-full shadow-md items-center px-4">
        {isMobile && (
          <IconButton onClick={() => setMobileOpen(true)} edge="start">
            <MenuIcon />
          </IconButton>
        )}
        <Header
          notifications={notifications}
          unseenCount={unreadCount || 0}
          onRefreshNotifications={refetchNotifications}
          isRefreshingNotifications={isNotificationsLoading}
        />
      </header>

      <div className="flex w-full flex-grow">
        {isMobile ? (
          <Drawer
            anchor="left"
            open={mobileOpen}
            onClose={() => setMobileOpen(false)}
            PaperProps={{
              style: { width: 250 },
            }}
          >
            <div className="py-2">
              <Sidebar
                drawerOpen={mobileOpen}
                onCloseDrawer={() => setMobileOpen(false)}
              />
            </div>
          </Drawer>
        ) : (
          <aside className="bg-white">
            <Sidebar />
          </aside>
        )}

        <div className="w-full">
          <main className="w-full bg-[#F7F8FA] p-3 flex flex-col gap-2">
            <div className="p-4 rounded-t-md bg-white">
              <BreadCrumbComponent />
            </div>
            <div
              id="scrollable-content"
              className="bg-white h-[80vh] overflow-y-auto flex flex-col justify-between"
            >
              <ScrollToTop />
              <Outlet />
              <div
                ref={dummyRef}
                className="h-1 w-1 bg-red-500 text-red-500"
              ></div>
            </div>
          </main>
        </div>
      </div>

      {showFooter && (
        <footer
          className={`transition-all duration-500 transform ${
            showFooter
              ? "opacity-100 translate-y-0"
              : "opacity-0 translate-y-10"
          }`}
        >
          <Footer />
        </footer>
      )}
    </div>
  );
};

export default MainLayout;
