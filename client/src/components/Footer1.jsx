import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/WONO_LOGO_Black_TP.png";

import { FaGlobe, FaRupeeSign, FaFacebookF, FaInstagram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";

const HostFooter = () => {
  const navigate = useNavigate();
  const footerSections = [
    {
      links: [
        { name: "About", link: "/" },
        { name: "Career", link: "https://hosts.wono.co/career" },
        { name: "FAQs", link: "https://hosts.wono.co/faq" },
      ],
    },
    {
      links: [
       { name: "Privacy", link: "https://hosts.wono.co/privacy" },
        { name: "T&C", link: "https://hosts.wono.co/terms-and-conditions" },
        { name: "Contact", link: "https://hosts.wono.co/contact" },
      ],
    },
  ];

  return (
    <footer className="w-full bg-gray-100 text-black backdrop-blur-md  flex flex-col justify-center items-center gap-0  pb-0 md:pb-0   shadow-lg ">
      {/* <div className="w-full flex flex-wrap md:flex-wrap lg:flex-nowrap justify-between items-center pt-12 pb-12 px-4 md:px-[7.5rem]"> */}
      <div className="w-full flex flex-wrap md:flex-wrap lg:flex-nowrap justify-between items-center pt-12 pb-8 px-4 md:px-[7.5rem]">
        <div className="flex flex-col w-full lg:w-fit justify-center items-center md:flex-1 md:justify-center md:items-center lg:justify-start lg:items-start mb-8 lg:mb-0">
          <div className="w-full md:w-80 h-full flex flex-col lg:justify-start lg:items-start justify-center items-center">
            <img
              src={logo}
              onClick={() => {
                navigate("/home");
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
              className="w-36 cursor-pointer mb-4"
              alt="logo"
            />
            <p className="text-sm leading-6">
              WONOCO PRIVATE LIMITED <br />
              10 ANSON ROAD #33–10 <br />
              INTERNATIONAL PLAZA SINGAPORE – 079903 <br />
              <Link
                to="mailto:response@wono.co"
                className="text-[#0BA9EF] lowercase hover:underline"
              >
                response@wono.co
              </Link>
            </p>
            {/* <div className="flex gap-3 mt-4">
                  <FaTwitter className="bg-gray-700 p-1 rounded text-white text-xl cursor-pointer hover:text-blue-400" />
                  <FaFacebookF className="bg-gray-700 p-1 rounded text-white text-xl cursor-pointer hover:text-blue-500" />
                  <FaInstagram className="bg-gray-700 p-1 rounded text-white text-xl cursor-pointer hover:text-pink-400" />
                  <FaLinkedinIn className="bg-gray-700 p-1 rounded text-white text-xl cursor-pointer hover:text-blue-600" />
                </div> */}
          </div>
        </div>
        <div className="lg:w-fit w-full">
          <div className="w-full md:w-full lg:w-fit grid grid-cols-2 md:grid-cols-2 lg:grid-cols-2 gap-10 lg:gap-x-8 lg:gap-y-0  lg:mr-5">
            {footerSections.map((section, idx) => (
              <div
                key={idx}
                className="flex flex-col  justify-center items-center text-start lg:justify-start lg:items-center"
              >
                {/* <h3 className="font-semibold text-lg mb-2">
                {section.heading.toUpperCase()}
              </h3> */}
                {section.links.map((linkObj, i) => (
                  <Link
                    key={i}
                    to={linkObj.link}
                    className="text-sm  text-black opacity-80 hover:opacity-100 hover:text-gray-500 transition-all duration-200 cursor-pointer uppercase p-4"
                  >
                    {linkObj.name}
                  </Link>
                ))}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* <div className="w-full h-[0.3px] bg-secondary border-t border-white" /> */}
      {/* <div className="w-full text-center flex flex-col lg:mb-0 py-6 border-t-2 border-gray-700"> */}

      <div className="w-full text-center flex flex-col lg:mb-0 py-6 border-t-2 border-white">
        <div className="flex justify-center items-center flex-col md:flex-row lg:flex-row gap-2 text-content md:text-base">
          <span>
            &copy; Copyright {new Date().getFullYear()} -{" "}
            {(new Date().getFullYear() + 1).toString().slice(-2)} <span></span>
          </span>{" "}
          <span className="text-small lg:text-base">
            {" "}
            WONOCO PRIVATE LIMITED - SINGAPORE. All Rights Reserved.
          </span>
        </div>
      </div>

      {/* Footer Bottom Section */}
      <div className="w-full flex flex-col md:flex-row justify-center items-center text-[10px] md:text-xs px-4 py-4 text-gray-800 bg-gray-50 font-semibold">
        {/* Right Icons and Settings */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1">
            <FaGlobe className="text-[12px]" />
            <span className="tracking-wide">English (IN)</span>
          </div>
          <div className="px-2 py-[2px] border-2 border-gray-700 rounded-md text-[12px] flex items-center gap-1">
            <FaRupeeSign className="text-[12px]" />
            <span className="tracking-wide">INR</span>
          </div>
          <FaFacebookF className="text-[12px]" />

          <FaXTwitter className="text-[12px]" />
          <FaInstagram className="text-[12px]" />
        </div>
      </div>
    </footer>
  );
};

export default HostFooter;
