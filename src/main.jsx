import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import "./index.css";
import { SidebarProvider } from "./context/SideBarContext";
import AuthContextProvider from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

export const queryClient = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
     <AuthContextProvider>
      <QueryClientProvider client={queryClient}>
        <SidebarProvider>
          <App />
        </SidebarProvider>
      </QueryClientProvider>
    </AuthContextProvider>
  </StrictMode>,
)
