import React, { useState } from "react";
import biznestLogo from "../../../../assets/biznest/biznest_logo.jpg";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import Access from "../../../Access/Access";
import { useLocation, useNavigate } from "react-router-dom";
import usePageDepartment from "../../../../hooks/usePageDepartment";
import useAuth from "../../../../hooks/useAuth";
import { useTopDepartment } from "../../../../hooks/useTopDepartment";

const CompanyHandbook = () => {
  const [generalDoc, setGeneralDoc] = useState(null); // initially null
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const isTop = useTopDepartment();

  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isProfile = pathname.includes("profile/HR/companyHandbook");
  const { auth } = useAuth();
  const departments = auth.user.departments;
  const { data: companyDocuments = {}, isLoading: isDocumentsLoading } =
    useQuery({
      queryKey: ["companyDocuments", generalDoc],
      queryFn: async () => {
        if (!generalDoc) return {}; // don't run until type is selected
        try {
          const response = await axios.get(
            `/api/company/get-company-documents/${generalDoc}`
          );
          return response.data;
        } catch (error) {
          toast.error(error.message);
          return {};
        }
      },
      enabled: !!generalDoc, // disables initial fetch until a type is selected
    });

  const { data: departmentData = [], isLoading } = useQuery({
    queryKey: ["departmentData"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/departments/get-departments");
        return response.data;
      } catch (error) {
        console.warn(error.message);
      }
    },
  });

  const departmentList = isLoading
    ? []
    : departmentData
        .map((item) => ({
          id: item._id,
          title: item.name,
        }))
        .sort((a, b) => a.title.localeCompare(b.title));

  const userDepartmentIds = auth.user?.departments?.map((d) => d._id) || [];

  const filteredAccordionData = isTop.isTop
    ? departmentList
    : departmentList.filter(
        (dep) => userDepartmentIds.includes(dep.id) // assuming dep.id is the department's ID in `departmentList`
      );

  const accordionDataGeneral = [
    {
      id: 1,
      title: "SOPs",
      content: (
        <div className="flex flex-col gap-4">
          {isDocumentsLoading ? (
            <span className="text-sm text-gray-500">Loading...</span>
          ) : companyDocuments?.[generalDoc]?.length > 0 ? (
            companyDocuments[generalDoc].map((doc) => (
              <div key={doc._id} className="flex justify-between items-center">
                <div>
                  <span className="text-content">{doc.name}</span>
                </div>
                <div>
                  <a
                    href={doc.documentLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 border-default border-black rounded-md text-content flex items-center"
                  >
                    <IoIosArrowForward />
                  </a>
                </div>
              </div>
            ))
          ) : (
            <span className="text-sm text-gray-500">
              No documents available.
            </span>
          )}
        </div>
      ),
    },
    {
      id: 2,
      title: "Policies",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Work From Home Policy</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Timings Policy</span>
            </div>
            <div>
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <div className="w-full shadow-md p-4 rounded-md">
          <div className="h-96 w-full flex flex-col gap-4">
            <img
              className="w-full  object-contain  h-[30%]"
              src={biznestLogo}
              alt="biznestLogo"
            />
            <div>
              {/* <span className="text-content">About</span> */}
              <p className="text-content">
                BIZ Nest ( Business with a Nest ) is the way of our Future
                Lifestyle! As data and trends indicate, our ecosystem has
                already started witnessing a strong and focused nomad community
                which has relocated and activated its lifestyle from aspiring
                destinations across the world and this community is growing
                bigger every year. Bold founders, professionals and even
                salaried individuals have quit their busy city lifestyle and
                have started living a healthy and happy lifestyle in smaller
                towns. We are building the bridge for these nomads by helping
                them settle in an aspiring destination like Goa via our
                fully-stack solution by providing co-working, co-living and
                workations to ensure their HAPPINESS!
                <br />
                <br />
                We are an early adapted platform of our FUTURE Lifestyle which
                we are confident will get fully activated in the global
                ecosystem by the end of this decade. We are the only Destination
                Based Lifestyle Subscription Platform in India targeted to
                become a National Destination Based Lifestyle Subscription
                Platform by the end of this decade due to our first mover
                advantage.
              </p>
            </div>
          </div>
        </div>
      </div>
      {/* <div className="flex h-2">
        <div className="w-full h-full] shadow-md p-4 rounded-md">
        
          <AccessTree />
        </div>
      </div> */}
      <div className="flex">
        <div className="w-full h-full rounded-md">
          <Access />
        </div>
      </div>

      <div>
        <div className="w-full shadow-md p-4 rounded-md">
          <div className="py-4">
            <span className="text-title text-primary font-pmedium">
              General
            </span>
          </div>
          {accordionDataGeneral.map((item) => (
            <Accordion
              sx={{ boxShadow: "none", border: "1px solid #d1d5db" }}
              key={item.id}
              onChange={() => {
                if (item.title === "SOPs") setGeneralDoc("sop");
                else if (item.title === "Policies") setGeneralDoc("policies");
              }}
            >
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                aria-controls={`panel${item.id}-content`}
                id={`panel${item.id}-header`}
              >
                <span className="text-subtitle">{item.title}</span>
              </AccordionSummary>
              <div className="border-[1px] border-borderGray"></div>
              <AccordionDetails sx={{ padding: "1rem" }}>
                {item.content}
              </AccordionDetails>
            </Accordion>
          ))}
          <br />

          {/* Departments */}
          <div className="py-4">
            <span className="text-title text-primary font-pmedium">
              Departments
            </span>
          </div>
          {filteredAccordionData.map((item) => (
            <Accordion
              sx={{ boxShadow: "none", border: "1px solid #d1d5db" }}
              key={item.id}
            >
              <AccordionSummary expandIcon={<IoIosArrowDown />}>
                <span className="text-subtitle">{item.title}</span>
              </AccordionSummary>
              <div className="border-[1px] border-borderGray"></div>
              <AccordionDetails sx={{ padding: "1rem" }}>
                <div className="flex flex-col gap-4">
                  {/* SOP's */}
                  <div className="flex justify-between items-center">
                    <span className="text-content">SOP's</span>
                    <button
                      className="p-2 border-default border-black rounded-md text-content"
                      onClick={() =>
                        navigate(`${item.title}`, {
                          state: {
                            departmentId: item.id,
                            departmentName: item.title,
                            documentType : "sop"
                          },
                        })
                      }
                    >
                      <IoIosArrowForward />
                    </button>
                  </div>
                  {/* Policies */}
                  <div className="flex justify-between items-center">
                    <span className="text-content">Policies</span>
                    <button
                      className="p-2 border-default border-black rounded-md text-content"
                      onClick={() =>
                        navigate(`${item.title}`, {
                          state: {
                            departmentId: item.id,
                            departmentName: item.title,
                            documentType : "policies"
                          },
                        })
                      }
                    >
                      <IoIosArrowForward />
                    </button>
                  </div>
                </div>
              </AccordionDetails>
            </Accordion>
          ))}
        </div>
      </div>
      <div></div>
    </div>
  );
};

export default CompanyHandbook;
