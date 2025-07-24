import { RouterProvider, useLocation, useNavigate } from "react-router-dom";
import { routes } from "./routes/Routes";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import { Toaster } from "sonner";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";

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
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "0.875rem",
        },
      },
    },
    MuiMenuItem: {
      styleOverrides: {
        root: {
          fontSize: "0.875rem",
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
            borderColor: "#1E3D73",
          },
        },
      },
    },

    MuiInputLabel: {
      styleOverrides: {
        root: {
          "&.Mui-focused": {
            color: "#1E3D73",
          },
        },
      },
    },
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <RouterProvider router={routes} />
        <Toaster richColors />
      </LocalizationProvider>
    </ThemeProvider>
  );
}

export default App;
