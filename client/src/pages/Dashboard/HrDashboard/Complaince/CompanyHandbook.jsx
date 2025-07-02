import React, { useState } from "react";
import biznestLogo from "../../../../assets/biznest/biznest_logo.jpg";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { toast } from "sonner";
import Access from "../../../Access/Access";
import { useLocation, useNavigate } from "react-router-dom";
import useAuth from "../../../../hooks/useAuth";

const CompanyHandbook = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const isProfile = pathname.includes("profile/HR/companyHandbook");
  const { auth } = useAuth();
  const departments = auth.user.departments;

  // Fetch logic for general docs
const fetchGeneralDocs = async (type) => {
  const res = await axios.get(`/api/company/get-company-documents/${type}`);
  return res.data?.[type] || [];
};

  const { data: sopDocs, isLoading: loadingSop } = useQuery({
    queryKey: ["companyDocuments", "sop"],
    queryFn: () => fetchGeneralDocs("sop"),
    onError: (error) => toast.error(error.message),
  });

  const { data: policyDocs, isLoading: loadingPolicies } = useQuery({
    queryKey: ["companyDocuments", "policies"],
    queryFn: () => fetchGeneralDocs("policies"),
    onError: (error) => toast.error(error.message),
  });

  // Department fetch
  const { data: departmentData, isLoading } = useQuery({
    queryKey: ["departmentData"],
    queryFn: async () => {
      const res = await axios.get("/api/departments/get-departments");
      return res.data;
    },
  });

  const departmentList = isLoading
    ? []
    : departmentData
        .map((item) => ({ id: item._id, title: item.name }))
        .sort((a, b) => a.title.localeCompare(b.title));

  const accordionDataGeneral = [
    {
      id: 1,
      title: "SOPs",
      data: sopDocs,
      loading: loadingSop,
    },
    {
      id: 2,
      title: "Policies",
      data: policyDocs,
      loading: loadingPolicies,
    },
  ];

  return (
    <div className="flex flex-col gap-4">
      {/* Company Overview */}
      <div className="flex">
        <div className="w-full shadow-md p-4 rounded-md">
          <div className="h-96 w-full flex flex-col gap-4">
            <img
              className="w-full object-contain h-[30%]"
              src={biznestLogo}
              alt="biznestLogo"
            />
            <div>
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

      {/* Access Tree */}
      <div className="flex">
        <div className="w-full h-full rounded-md">
          <Access />
        </div>
      </div>

      {/* General Section */}
      <div className="w-full shadow-md p-4 rounded-md">
        <div className="py-4">
          <span className="text-title text-primary font-pmedium">General</span>
        </div>

        {accordionDataGeneral.map((item) => (
          <Accordion
            key={item.id}
            sx={{ boxShadow: "none", border: "1px solid #d1d5db" }}
          >
            <AccordionSummary expandIcon={<IoIosArrowDown />}>
              <span className="text-subtitle">{item.title}</span>
            </AccordionSummary>
            <div className="border-[1px] border-borderGray" />
            <AccordionDetails sx={{ padding: "1rem" }}>
              <div className="flex flex-col gap-4">
                {item.loading ? (
                  <span className="text-sm text-gray-500">Loading...</span>
                ) : item.data && item.data.length > 0 ? (
                  item.data.map((doc) => (
                    <div
                      key={doc._id}
                      className="flex justify-between items-center"
                    >
                      <span className="text-content">{doc.name}</span>
                      <a
                        href={doc.documentLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 border-default border-black rounded-md text-content flex items-center"
                      >
                        <IoIosArrowForward />
                      </a>
                    </div>
                  ))
                ) : (
                  <span className="text-sm text-gray-500">
                    No documents available.
                  </span>
                )}
              </div>
            </AccordionDetails>
          </Accordion>
        ))}

        {/* Departments Section */}
        <div className="py-4">
          <span className="text-title text-primary font-pmedium">
            Departments
          </span>
        </div>
        {departmentList.map((item) => (
          <Accordion
            key={item.id}
            sx={{ boxShadow: "none", border: "1px solid #d1d5db" }}
          >
            <AccordionSummary expandIcon={<IoIosArrowDown />}>
              <span className="text-subtitle">{item.title}</span>
            </AccordionSummary>
            <div className="border-[1px] border-borderGray" />
            <AccordionDetails sx={{ padding: "1rem" }}>
              <div className="flex flex-col gap-4">
                <div className="flex justify-between items-center">
                  <span className="text-content">SOP's</span>
                  <button
                    className="p-2 border-default border-black rounded-md text-content"
                    onClick={() =>
                      navigate(`${item.title}`, {
                        state: {
                          departmentId: item.id,
                          departmentName: item.title,
                          documentType: "sop",
                        },
                      })
                    }
                  >
                    <IoIosArrowForward />
                  </button>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-content">Policies</span>
                  <button
                    className="p-2 border-default border-black rounded-md text-content"
                    onClick={() =>
                      navigate(`${item.title}`, {
                        state: {
                          departmentId: item.id,
                          departmentName: item.title,
                          documentType: "policies",
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
  );
};

export default CompanyHandbook;
