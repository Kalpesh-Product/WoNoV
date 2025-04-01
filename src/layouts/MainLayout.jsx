import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
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

const MainLayout = () => {
  const [showFooter, setShowFooter] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dummyRef = useRef(null);
  const { isSidebarOpen, setIsSidebarOpen } = useSidebar();

  // Detect mobile view
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
        <Header />
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
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-500 text-xl"
            >
              {isSidebarOpen ? <GiHamburgerMenu /> : <IoIosArrowForward />}
            </button>
            <Sidebar />
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
            <div className="bg-white h-[80vh] overflow-y-auto flex flex-col justify-between">
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
