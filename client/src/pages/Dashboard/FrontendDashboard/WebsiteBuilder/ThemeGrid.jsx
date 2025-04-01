import React from "react";
import BiznestImage from "../../../../assets/WONO_images/img/products-images/biznestImage.png";
import BiznestImageMockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/biznest-mockup.webp";
import Cafe_2 from "../../../../assets/WONO_images/img/website-builder/new-layout/cafe-2.webp";
import Cafe2Mockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/cafe-mockup-2.png";
import Cafe_3 from "../../../../assets/WONO_images/img/website-builder/new-layout/cafe-3.webp";
import Cafe3Mockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/cafe-mockup-3.png";
import CoWorkingImage from "../../../../assets/WONO_images/img/website-builder/new-layout/co-working.webp";
import CoWorkingImageMockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/co-working-mockup-bg.webp";
import CoLivingImage from "../../../../assets/WONO_images/img/website-builder/new-layout/co-living.webp";
import CoLivingImageMockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/co-living-mockup.webp";
import CoWorkingImage_2 from "../../../../assets/WONO_images/img/website-builder/new-layout/co-working-2.webp";
import CoWorkingNomad from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/co-living-nomad.png";
import CoWorkingImage_3 from "../../../../assets/WONO_images/img/website-builder/new-layout/co-working-3.webp";
import CoWorkingImage_3_Mockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/co-working-3.png";
import Featured from "../../../../assets/WONO_images/img/website-builder/new-layout/featured/featured-1.png";
import Boutique from "../../../../assets/WONO_images/img/website-builder/new-layout/boutique.webp";
import BoutiqueMockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/boutique-mockup.webp";
import CoWorkingMewo from "../../../../assets/WONO_images/img/website-builder/new-layout/co-working-mewo.webp";
import CoWorkingMewoMockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/co-working-mewo-mockup.webp";
import BizNestMockup from "../../../../assets/WONO_images/img/website-builder/new-layout/Macbook-mockup.webp";
import Hostels from "../../../../assets/WONO_images/img/website-builder/new-layout/hostels.png";
import Hostels_mockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/hostels.png";
import { useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { CircularProgress } from "@mui/material";

const ThemeGrid = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const fetchTemplates = async () => {
    try {
      const response = await axios.get("/api/editor/templates");
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const { data: templates = [], isPending: isTemplatesPending } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  });

  const themeImages = [
    {
      src: BiznestImage,
      mockup: BiznestImageMockup,
      alt: "BiznestImage",
      tag: "co-working",
    },
    {
      src: CoWorkingMewo,
      mockup: CoWorkingMewoMockup,
      alt: "CoWorkingMewo",
      tag: "co-working",
    },
    {
      src: CoWorkingImage,
      mockup: CoWorkingImageMockup,
      alt: "Co-Working Image",
      tag: "co-working",
    },
    {
      src: Boutique,
      mockup: BoutiqueMockup,
      alt: "Boutique Image",
      tag: "boutique",
    },
    {
      src: CoLivingImage,
      mockup: CoLivingImageMockup,
      alt: "Co-Living Image",
      tag: "co-living",
    },
    {
      src: CoWorkingImage_2,
      mockup: CoWorkingNomad,
      alt: "CoLivingImage_2",
      tag: "co-working",
    },
    {
      src: CoWorkingImage_3,
      mockup: CoWorkingImage_3_Mockup,
      alt: "CoLivingImage_3",
      tag: "co-working",
    },
    { src: Cafe_2, mockup: Cafe2Mockup, alt: "Cafe_2", tag: "cafe" },
    { src: Cafe_3, mockup: Cafe3Mockup, alt: "Cafe_3", tag: "cafe" },
    { src: Hostels, mockup: Hostels_mockup, alt: "Hostels", tag: "hostels" },
  ];

  const themeWebsiteGridData = [
    {
      title: "Faster loading",
      description: "WoNo is designed for performance so your site loads faster",
    },
    {
      title: "Built with SEO in mind",
      description:
        "Get the SEO capabilities you need to optimize your site for search visibility.",
    },
    {
      title: "Enterprise-grade security",
      description: "We keep your site and visitors data protected, 24/7.",
    },
    {
      title: "Resilient infrastructure",
      description:
        "Multi-cloud hosting ensures 99.9% uptime, even during traffic spikes.",
    },
    {
      title: "Accessible for everyone",
      description:
        "Make your own website inclusive with built-in accessibility tools.",
    },
    {
      title: "Easy customization",
      description:
        "Personalize your website effortlessly by using  customizable templates.",
    },
  ];
  return (
    <div>
      <div className="p-4">
        <div className="themePage-content-header bg-white">
          <span className="text-left text-title text-primary font-pmedium">
            Select Themes
          </span>
        </div>

        {!isTemplatesPending ? (
          <div className="grid grid-cols-2 sm:grid-cols1 gap-4">
            {templates.map((template, index) => (
              <div>
                <div
                  className="theme-grid w-full h-full overflow-hidden shadow-lg"
                  key={index}
                  onClick={()=>navigate('/app/dashboard/frontend-dashboard/view-theme', {state: {
                    templateName: template.templateName,
                    pageName: template.pages[0]?.pageName,
                  }},)}
                >
                  <span>{template.templateName}</span>
                  <img
                    src={BiznestImage}
                    alt={template.templateName}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-110 cursor-pointer"
                  />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <CircularProgress color="#1E3D73"/>
        )}

        {/* <div className="themePage-content-grid grid grid-cols-2 gap-8 py-4 bg-white">
          {themeImages.map((image, index) => (
            <div
              className="theme-grid w-full h-full overflow-hidden shadow-lg"
              key={index}
              onClick={() => {
                navigate("/app/dashboard/frontend-dashboard/view-theme", {
                  state: { image },
                }); // Pass theme data
                window.scrollTo({ top: 0, behavior: "instant" });
              }}
            >
              <img
                src={image.src}
                alt={image.alt}
                className="w-full h-full object-cover transition-transform duration-200 hover:scale-110 cursor-pointer"
              />
            </div>
          ))}
        </div> */}

        <div className="themePage-featured flex items-center justify-center py-4 bg-white">
          <div className="themePage-featured-grid grid grid-cols-2 gap-4">
            <div className="themePage-featured-grid-1 flex flex-col justify-center">
              <div className="themePage-featured-header">
                <h1 className="text-4xl text-left mb-8">
                  Customize it your way
                </h1>
              </div>
              <div className="themePage-featured-content mb-8 pl-2">
                <ul className="text-lg">
                  <li className="mb-2">1000's advanced web capabilities</li>
                  <li className="mb-2">
                    Intuitive drag and drop website editor
                  </li>
                  <li className="mb-2">
                    Powerful AI features for smart customization
                  </li>
                  <li className="mb-2">
                    Full-stack web dev tools for custom functionality
                  </li>
                </ul>
              </div>
              <div className="themePage-featured-button flex justify-start">
                <button
                  className="get-started-main-button px-4 py-2 bg-blue-600 text-white rounded"
                  onClick={() => {
                    navigate("/register");
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                >
                  Get started
                </button>
              </div>
            </div>

            <div className="themePage-featured-grid-2 w-full h-full relative bg-white">
              <img
                src={BizNestMockup}
                alt="coWorking"
                className="w-full h-full object-contain"
              />
            </div>
          </div>
        </div>

        <div className="themePage-website-features-section py-4 bg-white">
          <div className="themePage-website-features">
            <div className="themePage-website-header mb-4 text-left">
              <h1 className="text-4xl">
                A website builder engineered for growth
              </h1>
            </div>
            <div className="themePage-website-features-grid grid grid-cols-3 gap-8 my-8">
              {themeWebsiteGridData.map((item, index) => (
                <div key={index} className="text-left">
                  <h4 className="font-semibold">{item.title}</h4>
                  <p>{item.description}</p>
                </div>
              ))}
            </div>
            <div className="flex justify-center mt-4">
              <button
                className="get-started-main-button px-4 py-2 bg-blue-600 text-white rounded"
                onClick={() => {
                  navigate("/register");
                  window.scrollTo({ top: 0, behavior: "instant" });
                }}
              >
                Get started
              </button>
            </div>
          </div>
        </div>

        <div className="themePage-website-support-section py-4 flex items-center">
          <div className="themePage-website-support flex flex-col items-center">
            <div className="themePage-website-support-header text-left mb-8 w-full">
              <h1 className="text-4xl">We're here for you</h1>
            </div>
            <div className="themePage-website-support-grid grid grid-cols-3 gap-8">
              <div className="themePage-website-support-grid-1 flex flex-col border-t-2 border-black p-2">
                <h2 className="text-xl font-medium mt-4 mb-4">Get answers</h2>
                <p className="mb-4">
                  Watch tutorials and read detailed articles in Wono help center
                </p>
                <span className="border-b-2 border-black hover:border-none cursor-pointer">
                  Go to FAQ →
                </span>
              </div>
              <div className="themePage-website-support-grid-1 flex flex-col border-t-2 border-black p-2">
                <h2 className="text-xl font-medium mt-4 mb-4">Contact Us</h2>
                <p className="mb-4">
                  Get support by chat or schedule a call with a Customer Care
                  Expert
                </p>
                <span
                  className="border-b-2 border-black hover:border-none cursor-pointer"
                  onClick={() => {
                    navigate("/contact");
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                >
                  Connect With us →
                </span>
              </div>
              <div className="themePage-website-support-grid-1 flex flex-col border-t-2 border-black p-2">
                <h2 className="text-xl font-medium mt-4 mb-4">Hire a pro</h2>
                <p className="mb-4">
                  Get help at any stage -- from site creation to online growth
                </p>
                <span
                  className="border-b-2 border-black hover:border-none cursor-pointer"
                  onClick={() => {
                    navigate("/saas");
                    window.scrollTo({ top: 0, behavior: "instant" });
                  }}
                >
                  Browse all services →
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ThemeGrid;
