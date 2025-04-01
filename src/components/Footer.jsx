;
import wonoLogo from "../assets/WONO_images/img/WONO.png";

const Footer = () => {
  const footerLinks = [
    {
      title: "About",
    },
    {
      title: "Career",
    },
    {
      title: "Contact",
    },
    {
      title: "Privacy",
    },
    {
      title: "FAQS",
    },
    {
      title: "T&C",
    },
  ];
  return (
    <div className="bg-black text-white py-6">
      <div className=" flex flex-col items-center border-b-[1px] border-gray-600 pb-4">
        <p className="text-content text-gray-400 text-center">
          Powered by WONOCO PRIVATE LIMITED - SINGAPORE. All Rights Reserved. ©
          Copyright 2024-25
        </p>
      </div>
      <div className="py-4 px-16 flex items-center">
        <div className=" w-full flex flex-col gap-2">
          <div className="h-20 w-40">
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

        <div className="w-full grid grid-cols-3 sm:grid-cols-1 md:grid-cols-3 gap-8 uppercase">
          {footerLinks.map((links)=>(
            <>
            <div className="text-center">
              <span className="text-content text-white">{links.title}</span>
            </div>
            </>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Footer;
