import React from "react";
import biznestLogo from "../../../../assets/biznest/biznest_logo.jpg";
import HierarchyTree from "../../../../components/HierarchyTree";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { IoIosArrowDown, IoIosArrowForward } from "react-icons/io";
import AccessTree from "../../../../components/AccessTree";

const CompanyHandbook = () => {
  const accordionData = [
    {
      id: 1,
      title: "Tech",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div>
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 2,
      title: "Networking & IT",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 3,
      title: "Finance",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 4,
      title: "Human Resource & EA",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 5,
      title: "Sales & Business Development",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 6,
      title: "Marketing",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 7,
      title: "Civil & Maintainance",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 8,
      title: "Legal",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 9,
      title: "Administartion & Front Office",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 10,
      title: "Service & Maintainance",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 11,
      title: "Kaffe & Operation",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
    {
      id: 12,
      title: "Kaffe Kitchen",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">SOP's</span>
            </div>
            <div className="flex-row">
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Policies</span>
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
  const accordionDataGeneral = [
    {
      id: 1,
      title: "SOPs",
      content: (
        <div className="flex flex-col gap-4">
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Leave SOP</span>
            </div>
            <div>
              <button className="p-2 border-default border-black rounded-md text-content">
                <IoIosArrowForward />
              </button>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <div>
              <span className="text-content">Attendance SOP</span>
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
    // {
    //   id: 3,
    //   title: "Finance",
    //   content: "Content for Accordion 3",
    // },
    // {
    //   id: 4,
    //   title: "Human Resource & EA",
    //   content: "Content for Accordion 3",
    // },
    // {
    //   id: 5,
    //   title: "Sales & Business Development",
    //   content: "Content for Accordion 3",
    // },
    // {
    //   id: 6,
    //   title: "Marketing",
    //   content: "Content for Accordion 3",
    // },
    // {
    //   id: 7,
    //   title: "Civil & Maintainance",
    //   content: "Content for Accordion 3",
    // },
    // {
    //   id: 8,
    //   title: "Legal",
    //   content: "Content for Accordion 3",
    // },
    // {
    //   id: 9,
    //   title: "Administartion & Front Office",
    //   content: "Content for Accordion 3",
    // },
    // {
    //   id: 10,
    //   title: "Service & Maintainance",
    //   content: "Content for Accordion 3",
    // },
    // {
    //   id: 11,
    //   title: "Kaffe & Operation",
    //   content: "Content for Accordion 3",
    // },
    // {
    //   id: 12,
    //   title: "Kaffe Kitchen",
    //   content: "Content for Accordion 3",
    // },
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="flex">
        <div className="w-full shadow-md p-4 rounded-md">
          <div className="h-80 w-full flex flex-col gap-4">
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
                advantage
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
        <div className="w-full h-full shadow-md p-4 rounded-md">
          <AccessTree />
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
              key={item.id}>
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                aria-controls={`panel${item.id}-content`}
                id={`panel${item.id}-header`}
                // sx={{borderBottom:'1px solid #d1d5db'}}
              >
                <span className="text-subtitle">{item.title}</span>
              </AccordionSummary>
              <div className="border-[1px] border-borderGray"></div>
              <AccordionDetails sx={{ padding: "1rem" }}>
                <span className="text-content">{item.content}</span>
              </AccordionDetails>
            </Accordion>
          ))}
          <br />
          <div className="py-4">
            <span className="text-title text-primary font-pmedium">
              Departments
            </span>
          </div>
          {accordionData.map((item) => (
            <Accordion
              sx={{ boxShadow: "none", border: "1px solid #d1d5db" }}
              key={item.id}>
              <AccordionSummary
                expandIcon={<IoIosArrowDown />}
                aria-controls={`panel${item.id}-content`}
                id={`panel${item.id}-header`}
                // sx={{borderBottom:'1px solid #d1d5db'}}
              >
                <span className="text-subtitle">{item.title}</span>
              </AccordionSummary>
              <div className="border-[1px] border-borderGray"></div>
              <AccordionDetails sx={{ padding: "1rem" }}>
                <span className="text-content">{item.content}</span>
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
