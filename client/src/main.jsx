import React from "react";
import ReactDOM from "react-dom/client";
import "./index.css";
import App from "./App";
import "grapesjs/dist/css/grapes.min.css";
import 'react-date-range/dist/styles.css'; // main style file
import 'react-date-range/dist/theme/default.css'; // theme css file
import { SidebarProvider } from "./context/SideBarContext";
import AuthContextProvider from "./context/AuthContext";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "react-redux";
import store, { persistor } from "./redux/store/store";
import { PersistGate } from "redux-persist/integration/react";
import { PERMISSIONS } from "./constants/permissions";

export const queryClient = new QueryClient();

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <Provider store={store}>
    <PersistGate loading={null} persistor={persistor}>
      <AuthContextProvider>
        <QueryClientProvider client={queryClient}>
          <SidebarProvider>
            <App />
          </SidebarProvider>
        </QueryClientProvider>
      </AuthContextProvider>
    </PersistGate>
  </Provider>
);
