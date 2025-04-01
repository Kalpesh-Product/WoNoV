import React, { createContext, useContext, useState } from "react";

// Create the Context
const SidebarContext = createContext();

// Custom hook for consuming the SidebarContext
export const useSidebar = () => useContext(SidebarContext);

// SidebarProvider to wrap the app or part of the component tree
export const SidebarProvider = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <SidebarContext.Provider value={{ isSidebarOpen, setIsSidebarOpen }}>
      {children}
    </SidebarContext.Provider>
  );
};
