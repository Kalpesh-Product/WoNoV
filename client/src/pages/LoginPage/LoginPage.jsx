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

const LoginPage = () => {
  const { auth, setAuth } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const refresh = useRefresh();

  useEffect(() => {
    if (auth.accessToken) {
      navigate("/app/dashboard/finance-dashboard");
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

  return (
    <>
      <div className="bg-black flex justify-around py-4">
        <a href="https://wono.co">
          <div>
            <img src={WonoLogo} alt="wono" />
          </div>
        </a>

        <div className="flex items-center uppercase">
          <ul className="flex gap-5 text-white uppercase font-thin">
            <li className="cursor-pointer">Modules</li>
            <li className="cursor-pointer">Themes</li>
            <li className="cursor-pointer">Leads</li>
            <li className="cursor-pointer">Capital</li>
            <li className="cursor-pointer">Career</li>
          </ul>
        </div>
        <div className="flex gap-6">
          <div className="flex gap-6">
            <a href="https://wonofe.vercel.app">
              <button className="bg-white text-black py-2 px-4 rounded-full uppercase">
                Sign-In
              </button>
            </a>
            <a href="https://www.wono.co/register">
              <button className="bg-sky-400 text-black py-2 px-4 rounded-full uppercase">
                Sign-Up
              </button>
            </a>
          </div>
        </div>
      </div>
      <div className="login-section loginTopPadding loginBottomPadding poppinsRegular heightPadding">
        <h1 className="text-center text-4xl font-bold">LOG IN</h1>
        <div className="loginDividingContainer shrink-container">
          <div className="loginLeftContainer">
            <Container maxWidth="md" style={{ padding: "3rem 0 0" }}>
              <Box
                component="form"
                sx={{ flexGrow: 1 }}
                onSubmit={handleLogin}
                noValidate
                autoComplete="off"
              >
                <Grid container spacing={2}>
                  <Grid item xs={12} sx={{ width: "100%" }}>
                    <TextField
                      label="Email"
                      variant="outlined"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      fullWidth
                    />
                  </Grid>

                  <Grid item xs={12} sx={{ width: "100%" }}>
                    <TextField
                      label="Password"
                      variant="outlined"
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
                </Grid>
                <div className="flex flex-col justify-center w-full items-start gap-4">
                  <Grid style={{ paddingTop: "0" }} p={0}>
                    <Box p={0} mt={2}>
                      <Link
                        to="/forgot-password"
                        style={{ textDecoration: "none" }}
                      >
                        Forgot Password?
                      </Link>
                    </Box>
                  </Grid>

                  <Grid item xs={12}>
                    <div className="centerInPhone">
                      <button
                        disabled={loading}
                        type="submit"
                        className="loginButtonStyling text-decoration-none"
                      >
                        {loading ? (
                          <CircularProgress size={20} color="white" />
                        ) : (
                          "Login"
                        )}
                      </button>
                    </div>
                  </Grid>
                </div>
              </Box>
            </Container>
          </div>
          <div className="fullHeight LoginMiddleContainer">
            <div className="vertical-line lineSideMargin">
              <hr className="hrHeight" />
            </div>
            <div className="lineSideMargin">or</div>
            <div className="vertical-line lineSideMargin">
              <hr className="hrHeight" />
            </div>
          </div>
          <div className="phoneDividerContainer">
            <div className="phoneDivider w-100">
              <div className="w-100 bg-secondary border-secondary border-bottom line-height"></div>
              <div className="w-100 text-center">or</div>
              <div className="w-100 bg-secondary border-secondary border-bottom line-height"></div>
            </div>
          </div>
          <div className="loginRightContainer">
            <div className="loginWithSection d-flex flex-column justify-content-center align-items-center">
              <div className="loginWithSection d-flex flex-column justify-content-center align-items-center">
                <div className="LoginWithGoogleContainer loginWithBox loginWithGoogleBox d-flex justify-content-between align-items-center centerElement">
                  <div className="loginWithIconBox loginWithGoogleIconBox centerElement">
                    <img
                      src={LoginWithGoogleImage}
                      alt="Google Icon"
                      className="imageDimensions"
                    />
                  </div>
                  <div className="LoginWithGoogleText LoginWithText w-100 centerElement-social">
                    <div>Continue with Google</div>
                  </div>
                </div>
              </div>
              <div className="LoginWithFacebookContainer loginWithBox loginWithFacebookBox d-flex justify-content-between align-items-center centerElement">
                <div className="loginWithIconBox loginWithFacebookIconBox centerElement">
                  <img
                    src={LoginWithFacebookImage}
                    alt="Facebook Icon"
                    className="imageDimensions"
                  />
                </div>
                <div className="LoginWithFacebookText LoginWithText w-100 centerElement-social">
                  <div>Continue with Facebook</div>
                </div>

                <div className="login-empty-padding"></div>
              </div>
              {/*  */}
              <Link to="/register" className="text-decoration-none">
                <div className="LoginWithEmailContainer loginWithBox loginWithEmailBox d-flex justify-content-between align-items-center centerElement">
                  <div className="loginWithIconBox loginWithEmailIconBox centerElement">
                    <img
                      src={LoginWithEmailImage}
                      alt="Email Icon"
                      className="imageDimensions"
                    />
                  </div>
                  <div className="LoginWithEmailText LoginWithText w-100 centerElement-social">
                    <div>Continue with Email</div>
                  </div>
                </div>
              </Link>
              {/*  */}
            </div>
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
