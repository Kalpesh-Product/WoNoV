import React, { useState, useEffect, useRef } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import Header from "../components/Header";
import BreadCrumbComponent from "../components/BreadCrumbComponent";
import Footer from "../components/Footer";

const MainLayout = () => {
  const [showFooter, setShowFooter] = useState(false);
  const dummyRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setShowFooter(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    if(dummyRef.current){
      observer.observe(dummyRef.current);
    }else{}

    return () =>{
      if(dummyRef.current){
        observer.unobserve(dummyRef.current);
      }
    }
  });

  return (
    <div className="w-full flex flex-col justify-between h-screen overflow-y-auto">
      <header className="flex w-full shadow-md">
        <Header />
      </header>
      <div className="flex w-full flex-grow">
        <aside className="bg-white">
          <Sidebar />
        </aside>
        <div className="w-full">
          <main className="w-full bg-[#F7F8FA] p-3 flex flex-col gap-2">
            <div className="p-4 rounded-t-md bg-white">
              <BreadCrumbComponent />
            </div>
            <div className="bg-white h-[80vh] overflow-y-auto flex flex-col">
              <Outlet />
              <div ref={dummyRef} className="h-1 bg-transparent"></div>
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
