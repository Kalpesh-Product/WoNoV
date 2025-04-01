import { RouterProvider } from "react-router-dom";
import { routes } from "./routes/Routes";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Toaster } from "sonner";


const theme = createTheme({
  typography: {
    fontFamily: [
      "Poppins-Regular",
      "Poppins-SemiBold",
      "Roboto",
      "Helvetica Neue",
      "Arial",
      "sans-serif",
    ].join(","),
  },
});

function App() {
  return (
    <ThemeProvider theme={theme}>
        <RouterProvider router={routes} />
        <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;
