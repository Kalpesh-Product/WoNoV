import { useState, useEffect } from "react";
import BiznestImage from "../../../../assets/WONO_images/img/products-images/biznestImage.webp";
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
import Boutique from "../../../../assets/WONO_images/img/website-builder/new-layout/boutique.webp";
import BoutiqueMockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/boutique-mockup.webp";
import CoWorkingMewo from "../../../../assets/WONO_images/img/website-builder/new-layout/co-working-mewo.webp";
import CoWorkingMewoMockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/co-working-mewo-mockup.webp";
import Hostels from "../../../../assets/WONO_images/img/website-builder/new-layout/hostels.png";
import Hostels_mockup from "../../../../assets/WONO_images/img/website-builder/new-layout/mobile/mockups/hostels.png";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import PrimaryButton from "../../../../components/PrimaryButton";
// import { useSidebar } from "../../../../context/SideBarContext";

const ViewTheme = () => {
  // const { setIsSidebarOpen } = useSidebar();

  // useEffect(() => {
  //   setIsSidebarOpen(true);
  // }, []); // Empty dependency array ensures this runs once on mount

  const [showAll, setShowAll] = useState(false);
  const perks = [
    {
      icon: "fa-regular fa-circle-check",
      title: "Works with latest WoNo changes",
      description:
        "Themes on the WoNo Theme Store are guaranteed to stay up to date and work with WoNo's ever-growing feature set.",
    },
    {
      icon: "fa-solid fa-gauge-simple-high",
      title: "Speed tested and approved",
      description:
        "Every theme in the Theme Store meets WoNo's performance standards, ensuring a faster shopping experience for your buyers.",
    },
    {
      icon: "fa-regular fa-clock",
      title: "Unlimited free trial",
      description:
        "Try the theme for free with your own products, brand colors, and customizations. One-time payment of $300 if you publish the theme to your store.",
    },
    {
      icon: "fa-solid fa-images",
      title: "Free high resolution photos",
      description:
        "Demo stores aren't included, but you can get free stock photos from WoNo Burst.",
    },
    {
      icon: "fa-solid fa-window-maximize",
      title: "Free theme updates",
      description:
        "Get the latest theme features and fixes from the Theme Store. You can redownload your purchase at any time.",
    },
    {
      icon: "fa-regular fa-id-card",
      title: "Non-expiring license for one store",
      description:
        "Your payment entitles you to use the theme on a single store, and keep it as long as you like.",
    },
  ];

  const features = [
    "Website",
    "Payment Gateway",
    "Booking Engine",
    "Customer Profile",
    "No code & Self-serve",
  ];
  const recommendations = [
    {
      src: BiznestImage,
      mockup: BiznestImageMockup,
      alt: "BiznestImage",
      tag: "co-working",
    },
    {
      src: CoWorkingImage,
      mockup: CoWorkingImageMockup,
      alt: "Co-Working Image",
      tag: "co-working",
    },
    {
      src: CoLivingImage,
      mockup: CoLivingImageMockup,
      alt: "Co-Living Image",
      tag: "co-living",
    },
    {
      src: CoWorkingMewo,
      mockup: CoWorkingMewoMockup,
      alt: "CoWorkingMewo",
      tag: "co-working",
    },
    {
      src: Boutique,
      mockup: BoutiqueMockup,
      alt: "Boutique Image",
      tag: "boutique",
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
  const location = useLocation();
  const { templateName, pageName, tag, link } = location.state;

  const navigate = useNavigate();

  const { image: initialImage } = location.state || {
    image: { src: BiznestImage, tag: "co-working", alt: "Product Image" },
  };

  const [currentImage, setCurrentImage] = useState(initialImage);

  // Filter the recommendations based on the current image's tag
  const filteredRecommendations = recommendations.filter(
    (rec) => rec.tag || tag === currentImage.tag || ""
  );

  const handleViewMore = () => {
    setShowAll(true); // Show all recommendations
  };
  // Handle image click in the recommendations grid
  const handleImageClick = (newImage) => {
    setCurrentImage(newImage);
    window.scrollTo({ top: 0, behavior: "instant" });
  };
  return (
    <div className="p-4">
      <div className="product-page-section flex flex-col justify-center bg-black px-8 py-3 rounded-t-md">
        <div className="product-page bg-black text-white">
          <div className="product-page-content">
            <div className="product-page-grid grid grid-cols-[30%_1fr] gap-64">
              <div className="product-page-left-container">
                <div className="product-page-grid-item">
                  <h1 className="uppercase mb-8 font-medium text-4xl">
                    Inclusions
                  </h1>
                  <div className="product-page-feature">
                    {features.map((feature, index) => (
                      <div
                        key={index}
                        className="product-page-features flex items-center mb-4">
                        <span className="text-wonoColor font-bold">
                          ✔&nbsp;&nbsp;
                        </span>
                        <span className="text-lg">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="product-page-button-space flex gap-4 items-center">
                    <button
                      className="product-page-button bg-white text-black mb-8 w-full py-2 px-8 rounded-full"
                      onClick={() => {
                        if (templateName && pageName) {
                          navigate(
                            `/app/dashboard/frontend-dashboard/select-theme/edit-theme/${templateName}/${pageName}`
                          );
                        } else {
                          toast.success("Coming Soon.");
                        }
                      }}>
                      Edit theme
                    </button>
                    <button
                      className="product-page-button bg-white text-black mb-8 w-full py-2 px-8 rounded-full"
                      onClick={() => {
                        if (link) {
                          window.open(link, "_blank"); // ✅ open external link in new tab
                        } else {
                          navigate(
                            "/app/dashboard/frontend-dashboard/live-demo"
                          ); // fallback internal route
                        }
                      }}>
                      Live Demo
                    </button>
                  </div>
                  <div className="product-page-update-text text-gray-500 flex flex-col items-center">
                    <span>Last updated on Sep 11, 2024</span>
                    <span>Version 1.0</span>
                  </div>
                </div>
              </div>

              <div className="product-page-image-container overflow-hidden mb-8">
                <img
                  src={currentImage?.mockup || BiznestImageMockup}
                  alt={templateName}
                  onError={(e) => {
                    e.target.onerror = null; // prevent infinite loop if fallback also fails
                    e.target.src = BiznestImageMockup;
                  }}
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="product-page-perks-section flex items-center justify-center bg-white">
        <div className="product-page-perks px-8 py-3">
          <div className="product-page-perks-grid grid grid-cols-[40%_60%] gap-1">
            <div className="product-page-perks-grid-1 flex items-start">
              <span className="font-medium text-2xl">
                Built with confidence &#x2014; <br /> The theme store promise
              </span>
            </div>
            <div className="product-page-perks-grid-2 grid grid-cols-2 gap-8">
              {perks.map((perk, index) => (
                <div key={index} className="product-page-perks-grid-2-item">
                  <div className="product-page-perks-grid-2-item-layout grid grid-cols-[10%_1fr]">
                    <i className={perk.icon}></i>
                    <div className="product-page-perks-description">
                      <h4 className="mb-4 text-lg font-semibold">
                        {perk.title}
                      </h4>
                      <span className="text-base tracking-wide">
                        {perk.description}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="product-page-reccomendations-section bg-white">
        <div className="product-page-reccomendations  py-3">
          <div className="product-page-reccomendations-header mb-8">
            <span className="text-title">Few more suggestions for you</span>
          </div>
          <div className="product-page-reccomendations-grid grid grid-cols-2 gap-8">
            {filteredRecommendations
              .slice(0, showAll ? filteredRecommendations.length : 4)
              .map((rec, index) => (
                <div
                  key={index}
                  className="product-page-reccomendations-grid-image overflow-hidden shadow-lg rounded-xl cursor-pointer"
                  onClick={() => {
                    handleImageClick(rec);
                  }}>
                  <img
                    src={rec.src}
                    alt={rec.alt}
                    className="w-full h-full object-cover transition-transform duration-200 hover:scale-110"
                  />
                </div>
              ))}
          </div>
          <div className="themes-view-button flex justify-center mt-4">
            {filteredRecommendations.length > 4 && !showAll && (
              <PrimaryButton
                title={"Load More"}
                handleSubmit={handleViewMore}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ViewTheme;
