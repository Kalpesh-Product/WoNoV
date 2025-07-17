import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Container, Box, Grid, TextField } from "@mui/material";
import { toast } from "sonner";
import useRefresh from "../../hooks/useRefresh";
import { api } from "../../utils/axios";
import useAuth from "../../hooks/useAuth";
import "./ClientLogin.css";
import "./ClientSpecialClasses.css";
import LoginWithGoogleImage from "../../assets/WONO_images/img/login_images/google-icon2.png";
import LoginWithFacebookImage from "../../assets/WONO_images/img/login_images/login-with-facebook-icon.png";
import LoginWithEmailImage from "../../assets/WONO_images/img/login_images/email-icon.png";
import WonoLogo from "../../assets/WONO_images/img/WONO.png";
import Footer from "../../components/Footer";
import { CircularProgress, InputAdornment, IconButton } from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import { Drawer, List, ListItem, ListItemText } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { IoCloseSharp } from "react-icons/io5";

const LoginPage = () => {
  const { auth, setAuth } = useAuth();
  const user = auth.user
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const refresh = useRefresh();
  const defaultModules = [
    {
      id: 1,
      title: "Dashboard",
      submenus: [
        {
          id: 4,
          title: "Finance Dashboard",
          codeName: "Finance",
          route: "/app/dashboard",
        },
        {
          id: 5,
          title: "Sales Dashboard",
          codeName: "Sales",
          route: "/app/dashboard",
        },
        {
          id: 3,
          title: "HR Dashboard",
          codeName: "HR",
          route: "/app/dashboard",
        },

        {
          id: 2,
          title: "Frontend Dashboard",
          codeName: "Tec",
          route: "/app/dashboard",
        },

        {
          id: 6,
          title: "Admin Dashboard",
          codeName: "Administration",
          route: "/app/dashboard",
        },

        {
          id: 7,
          title: "Maintenance Dashboard",
          codeName: "Maintenance",
          route: "/app/dashboard",
        },
        {
          id: 9,
          title: "IT Dashboard",
          codeName: "IT",
          route: "/app/dashboard",
        },

        {
          id: 8,
          title: "Cafe Dashboard",
          codeName: "Cafe",
          route: "/app/dashboard",
        },
      ],
    },
  ];
  const userDepartments = auth.user?.departments?.map((item) => item.name);

  const filteredModules = defaultModules.map((module) => {
    const filteredSubmenus = module.submenus?.filter((submenu) =>
      userDepartments?.includes(submenu.codeName)
    );
  
    return {
      ...module,
      submenus: filteredSubmenus,
    };
  });
  
  const hasAnySubmenus = filteredModules.some((module) => module.submenus.length > 0);
  
  // If there are matches, use first matched route. Else fallback to Finance Dashboard
  const firstAvailableRoute = hasAnySubmenus
    ? filteredModules.find((module) => module.submenus.length > 0).submenus[0].route
    : "/app/dashboard";
  
  useEffect(() => {
    if (auth.accessToken) {
      navigate(firstAvailableRoute);
    } else {
      refresh();
    }
  }, [auth.accessToken]);

  // Validation function
  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const response = await api.post(
        "/api/auth/login",
        { email, password },
        {
          withCredentials: true,
        }
      );
      setAuth((prevState) => {
        return {
          ...prevState,
          accessToken: response?.data?.accessToken,
          user: response.data.user,
        };
      });
      toast.success("Successfully logged in");
    } catch (error) {
      toast.error(error.response?.data.message);
    } finally {
      setLoading(false);
    }
  };
  const navItems = [
    { label: "Modules", link: "https://wono.co/modules" },
    { label: "Themes", link: "https://wono.co/themes" },
    { label: "Leads", link: "https://wono.co/leads" },
    { label: "Capital", link: "https://wono.co/capital" },
    { label: "Career", link: "https://wono.co/career" },
  ];

  return (
    <>
      {/* Header */}
      <div className="bg-black flex justify-between items-center py-6 px-6 md:px-28">
        {/* Logo */}
        <a href="https://wono.co">
          <img src={WonoLogo} alt="wono" className="w-28" />
        </a>

        {/* Desktop Nav */}
        <ul className="hidden md:flex gap-6 text-white uppercase font-thin items-center">
          {navItems.map((item, idx) => (
            <li key={idx} className="cursor-pointer hover:underline">
              <a href={item.link}>{item.label}</a>
            </li>
          ))}
        </ul>

        {/* Desktop Buttons */}
        <div className="hidden md:flex gap-4">
          <a href="https://wonofe.vercel.app">
            <button className="bg-white text-black py-2 px-4 rounded-full uppercase">
              Sign In
            </button>
          </a>
          <a href="https://www.wono.co/register">
            <button className="bg-sky-400 text-white py-2 px-4 rounded-full uppercase">
              Sign Up
            </button>
          </a>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden">
          <div onClick={() => setDrawerOpen(true)} className="text-white">
            <MenuIcon />
          </div>
        </div>
      </div>
      {/* Mobile Drawer */}
      <Drawer
        anchor="left"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        {/* Drawer Header */}
        <div className="w-full bg-black text-white flex justify-end items-center border-b border-gray-700 p-4 text-2xl">
          <button onClick={() => setDrawerOpen(false)}>
            <IoCloseSharp />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="w-96 h-screen p-6 flex flex-col gap-8 items-center uppercase bg-black text-white text-center">
          <div
            className="cursor-pointer hover:text-gray-400"
            onClick={() => setDrawerOpen(false)}
          >
            <a href="https://wono.co/" className="block w-full uppercase">
              Home
            </a>
          </div>
          <hr className="w-[80%] text-gray-300" />

          {/* Dynamic nav items */}
          {navItems.map((item, index) => (
            <React.Fragment key={index}>
              <div
                className="cursor-pointer hover:text-gray-400"
                onClick={() => setDrawerOpen(false)}
              >
                <a href={item.link} className="block w-full uppercase">
                  {item.label}
                </a>
              </div>
              <hr className="w-[80%] text-gray-300" />
            </React.Fragment>
          ))}

          {/* Sign In button */}
          <div className="flex flex-col w-full items-center gap-6">
            <div>
              <a
                href="https://wonofe.vercel.app"
                className="block px-10 py-2 uppercase bg-white text-black mx-auto w-max rounded-full"
              >
                Sign In
              </a>
            </div>
            <hr className="w-[75%]" />
            <div>
              <a
                href="https://wono.co/register"
                className="block px-10 py-2 uppercase bg-[#0aa9ef] text-white mx-auto w-max rounded-full"
              >
                Sign Up
              </a>
            </div>
          </div>
        </div>
      </Drawer>
      {/* Header */}
      <div className="login-section loginTopPadding loginBottomPadding poppinsRegular heightPadding">
        <h1 className="text-center text-4xl font-bold">SIGN IN</h1>
        <div className="loginDividingContainer shrink-container">
          <div className="loginLeftContainer">
            <Container
              maxWidth="lg"
              style={{ padding: "3rem 0 0" }}
              direction={{ xs: "column", md: "row" }}
            >
              <Box
                component="form"
                sx={{ flexGrow: 1 }}
                onSubmit={handleLogin}
                noValidate
                autoComplete="off"
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <Grid item xs={12}>
                    <TextField
                      label="Email"
                      variant="standard"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      label="Password"
                      variant="standard"
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => setShowPassword(!showPassword)}
                              edge="end"
                              size="small"
                            >
                              {showPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                    />
                  </Grid>
                </div>

                <div className="mt-2 col-span-2 text-end">
                  <Link
                    to="https://wono.co/forgot-password"
                    className="hover:underline text-black"
                  >
                    Forgot Password?
                  </Link>
                </div>
                <div className="flex">
                  <div className="flex flex-col justify-center w-full items-center gap-4 mt-4">
                    <Grid item xs={12}>
                      <div className="centerInPhone">
                        <button
                          disabled={loading}
                          type="submit"
                          className="loginButtonStyling text-decoration-none text-subtitle w-40"
                        >
                          {loading ? (
                            <CircularProgress size={20} color="white" />
                          ) : (
                            "SIGN IN"
                          )}
                        </button>
                      </div>
                    </Grid>
                    <p className="text-[0.9rem]">
                      Don't have an account?{" "}
                      <span
                        onClick={() =>
                          (window.location.href = "https://wono.co/register")
                        }
                        className="underline hover:text-primary cursor-pointer"
                      >
                        Sign Up
                      </span>
                    </p>
                  </div>
                </div>
              </Box>
            </Container>
          </div>
        </div>
      </div>
      <div>
        <Footer />
      </div>
    </>
  );
};

export default LoginPage;
