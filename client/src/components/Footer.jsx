import React from "react";
import wonoLogo from "../assets/WONO_images/img/WONO.png";
import { getFiscalYearString } from "../utils/dateFormat";

const Footer = ({ changeActiveTab }) => {
  const footerLinks = [
    {
      id: 1,
      title: "About",
    },
    {
      id: 2,
      title: "Career",
    },
    {
      id: 3,
      title: "Contact",
    },
    {
      id: 4,
      title: "Privacy",
    },
    {
      id: 5,
      title: "FAQS",
    },
    {
      id: 6,
      title: "T&C",
    },
  ];
  return (
    <div className="bg-black text-white p-6">
      <div className="py-10 px-10 flex flex-wrap lg:flex-nowrap items-center gap-4">
        <div className=" w-full flex flex-col gap-2 justify-center items-center md:justify-center md:items-center lg:justify-start lg:items-start">
          <div className="h-15 w-40">
            <img
              className="w-[88%] h-full object-contain"
              src={wonoLogo}
              alt="wono-logo"
            />
          </div>
          <div className="flex flex-col gap-2 justify-start">
            <span className="text-content">
              WONOCO PRIVATE LIMITED 10 ANSON ROAD #33-10
            </span>
            <span className="text-content">
              INTERNATIONAL PLAZA SINGAPORE - 079903
            </span>
          </div>
          <div className="flex gap-2 justify-start">
            <span className="text-content pr-10 border-r-default border-white">
              response@wono.co
            </span>
            <span className="text-content">www.wono.co</span>
          </div>
        </div>

        <div className="w-full grid grid-cols-1 sm:grid-cols-1 md:grid-cols-3 gap-8 uppercase">
          {footerLinks.map((links) => (
            <>
              <div key={links.id} className="text-center">
                <span className="text-content text-white">{links.title}</span>
              </div>
            </>
          ))}
        </div>
      </div>
      <div className="flex flex-col justify-center items-center border-t border-gray-600 pt-4">
        <p className="text-content text-gray-400 text-center">
        © Copyright {getFiscalYearString()}. Powered by WONOCO PRIVATE LIMITED - SINGAPORE. All Rights Reserved.
        </p>
      </div>
    </div>
  );
};

export default Footer;
