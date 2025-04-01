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
  components: {
    MuiInputBase: {
      styleOverrides: {
        input: {
          fontSize: "0.875rem",
        },
      },
    },
    MuiMenuItem:{
      styleOverrides:{
        root:{
          fontSize:'0.875rem'
        }
      }
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
      <RouterProvider router={routes} />
      <Toaster richColors />
    </ThemeProvider>
  );
}

export default App;
