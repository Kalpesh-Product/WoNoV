import React from "react";
import wonoLogo from "../assets/WONO_images/img/WONO.png";
import { getFiscalYearString } from "../utils/dateFormat";
import useAuth from "../hooks/useAuth";

const Footer = ({ changeActiveTab }) => {
  const { auth } = useAuth();
  const footerLinks = [
    { id: 1, title: "Sign In", route: "https://wonofe.vercel.app" },
    { id: 2, title: "Modules", route: "https://www.wono.co/modules" },
    { id: 3, title: "Capital", route: "https://www.wono.co/capital" },
    { id: 4, title: "FAQs", route: "https://www.wono.co/faqs" },
    { id: 5, title: "Sign Up", route: "https://www.wono.co/register" },
    { id: 6, title: "Themes", route: "https://www.wono.co/themes" },
    { id: 7, title: "Career", route: "https://www.wono.co/career" },
    { id: 8, title: "Privacy", route: "https://www.wono.co/privacy" },
    { id: 9, title: "Contact", route: "https://www.wono.co/contact" },
    { id: 10, title: "Leads", route: "https://www.wono.co/leads" },
    { id: 11, title: "About", route: "https://www.wono.co/contact" },
    { id: 12, title: "T&C", route: "https://www.wono.co/termsandconditions" },
  ];
  

  return (
    <div className="bg-black text-white p-6">
      <div className="py-2 px-4 lg:py-10 lg:px-[5.7rem] pb-[2rem] flex flex-wrap lg:flex-nowrap items-center gap-8 lg:gap-40">
        <div className=" w-full flex flex-col gap-1 justify-center items-center md:justify-center md:items-center lg:justify-start lg:items-start">
          <div className="h-15 w-40">
            <img
              className="w-[88%] h-full object-contain mb-9"
              src={wonoLogo}
              alt="wono-logo"
            />
          </div>
          <div className="flex flex-col gap-1 justify-start">
            <span className="text-content">
              WONOCO PRIVATE LIMITED 10 ANSON ROAD #33-10
            </span>
            <span className="text-content">
              INTERNATIONAL PLAZA SINGAPORE - 079903
            </span>
          </div>
          <div className="flex gap-2 justify-start">
            <span className="text-content text-blue-700 hover:underline cursor-pointer pr-10">
              response@wono.co
            </span>
          </div>
        </div>
        <div className="w-full text-center grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-6 gap-x-2 uppercase lg:text-start">
          {footerLinks.map((link) => (
            <div key={link.id} className="text-center lg:text-start">
              {auth?.user === null ? (
                <a
                  href={link.route}
                  className="text-content text-white hover:underline"
                >
                  {link.title}
                </a>
              ) : (
                <span className="text-content text-white opacity-50 cursor-not-allowed">
                  {link.title}
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center border-t border-gray-600 pt-4">
        <p className="text-[16px] text-white text-center">
          © Copyright {getFiscalYearString()} by WONOCO PRIVATE LIMITED -
          SINGAPORE. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
