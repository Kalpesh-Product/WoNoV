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
import { CircularProgress, Skeleton } from "@mui/material";

const Websites = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();

  const fetchTemplates = async () => {
    try {
      const response = await axios.get("/api/editor/get-websites");
      return response.data;
    } catch (error) {
      console.error("Error fetching templates:", error);
    }
  };

  const { data: templates = [], isPending: isTemplatesPending } = useQuery({
    queryKey: ["templates"],
    queryFn: fetchTemplates,
  });

  return (
    <div>
      <div className="p-4 flex flex-col gap-4">
        <div className="themePage-content-header bg-white flex flex-col gap-4">
          <h4 className="text-4xl text-left">Websites</h4>
          <hr />
        </div>

        {!isTemplatesPending ? (
          <div className="grid grid-cols-2 sm:grid-cols1 gap-6">
            {/* {templates.map((template) => (
              <div key={template._id}>
                <div
                  onClick={() =>
                    navigate(
                      `/app/dashboard/frontend-dashboard/websites/${template.companyName}`,
                      {
                        state: {
                          website: template,
                          isLoading: isTemplatesPending,
                        },
                      }
                    )
                  }
                  className="relative group overflow-hidden shadow-lg rounded-xl cursor-pointer aspect-[16/9]" // ← fixed height via aspect ratio
                >
                  <img
                    src={template?.heroImages?.[0]?.url}
                    alt={template.companyName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" // ← fill box
                  />

                  {/* bottom gradient 
                  <div className="pointer-events-none absolute inset-x-0 bottom-0">
                    <div className="bg-gradient-to-t from-black/70 via-black/30 to-transparent h-20 w-full" />
                  </div>

                  {/* company name 
                  <div className="pointer-events-none absolute left-3 right-3 bottom-3">
                    <span className="inline-block max-w-full truncate text-white font-semibold text-lg drop-shadow-sm">
                      {template.companyName || "Untitled"}
                    </span>
                  </div>
                </div>
              </div>
            ))} */}

            {templates.map((template) => (
              <div key={template._id}>
                <div
                  onClick={() =>
                    navigate(
                      `/app/dashboard/frontend-dashboard/websites/${template.companyName}`,
                      {
                        state: {
                          website: template,
                          isLoading: isTemplatesPending,
                        },
                      }
                    )
                  }
                  className="relative group overflow-hidden shadow-lg rounded-xl cursor-pointer aspect-[16/9]"
                >
                  <img
                    src={template?.heroImages?.[0]?.url}
                    alt={template.companyName}
                    className="absolute inset-0 w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />

                  {/* subtle dark overlay for readability */}
                  <div className="absolute inset-0 bg-black/30" />

                  {/* centered title + subtitle */}
                  <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
                    <h3 className="text-white font-semibold text-xl md:text-2xl drop-shadow-sm truncate w-full">
                      {template.title || template.companyName || "Untitled"}
                    </h3>
                    {template.subTitle ? (
                      <p className="mt-1 text-white/90 text-sm md:text-base drop-shadow-sm truncate w-full">
                        {template.subTitle}
                      </p>
                    ) : null}
                    {template.companyName ? (
                      <h2 className="mt-1 font-bold text-white/90 text-sm md:text-base drop-shadow-sm truncate w-full">
                        {template.companyName}
                      </h2>
                    ) : null}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols2 gap-2">
            <Skeleton variant="rectangular" width="100%" height={300} />
            <Skeleton variant="rectangular" width="100%" height={300} />
            <Skeleton variant="rectangular" width="100%" height={300} />
            <Skeleton variant="rectangular" width="100%" height={300} />
          </div>
        )}
      </div>
    </div>
  );
};

export default Websites;
