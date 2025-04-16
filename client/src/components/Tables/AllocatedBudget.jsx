import React from "react";
import Accordion from "@mui/material/Accordion";
import AccordionSummary from "@mui/material/AccordionSummary";
import AccordionDetails from "@mui/material/AccordionDetails";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../AgTable";
import dayjs from "dayjs";
import { MdTrendingUp } from "react-icons/md";
import { BsCheckCircleFill } from "react-icons/bs";

const AllocatedBudget = ({ financialData }) => {
  return financialData ? (
    <div>
      <div className="flex flex-col gap-2 border-default border-borderGray rounded-md p-4">
        {/* Top Bar: Allocated Budget */}
        <div className="flex justify-between items-center py-4">
          <div className="flex items-center gap-4">
            <span className="text-title font-pmedium text-primary">
              Allocated Budget:
            </span>
            <span className="text-title font-pmedium">
              {"INR " + Number(500000).toLocaleString("en-IN")}
            </span>
          </div>
        </div>

        {/* Header Row (Aligned with Summary) */}
        <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
          <div className="flex justify-between items-center w-full px-4 py-2">
            <span className="w-1/3 text-sm text-muted font-pmedium text-title">
              MONTH
            </span>
            <span className="w-1/3 text-sm text-muted font-pmedium text-title flex items-center gap-1">
              PROJECTED
            </span>
            <span className="w-1/3 text-sm text-muted font-pmedium text-title flex items-center gap-1">
              ACTUAL
            </span>
          </div>
        </div>

        {/* Accordion Section */}
        {financialData.map((data, index) => (
          <Accordion key={index} className="py-4">
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              className="border-b-[1px] border-borderGray">
              <div className="flex justify-between items-center w-full px-4">
                <span className="w-1/3 text-content font-pmedium">
                  {`${new Date(data.month).toLocaleString("default", {
                    month: "short",
                  })}-${new Date(data.month).getFullYear()}`}
                </span>
                <span className="w-1/3 text-content font-pmedium flex items-center gap-1">
                  <MdTrendingUp
                    title="Projected"
                    className="text-yellow-600 w-4 h-4"
                  />
                  {"INR " +
                    Number(
                      data.projectedAmount
                        .toLocaleString("en-IN")
                        .replace(/,/g, "")
                    ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
                <span className="w-1/3 text-content font-pmedium flex items-center gap-1">
                  <BsCheckCircleFill
                    title="Actual"
                    className="text-green-600 w-4 h-4"
                  />
                  {"INR " +
                    Number(
                      data.amount.toLocaleString("en-IN").replace(/,/g, "")
                    ).toLocaleString("en-IN", { maximumFractionDigits: 0 })}
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="border-t-[1px] border-borderGray py-4">
                <AgTable
                  search={data.tableData?.rows?.length >= 10}
                  data={data.tableData.rows}
                  columns={data.tableData.columns}
                  tableHeight={400}
                  hideFilter={data.tableData?.rows?.length <= 9}
                />
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
    </div>
  ) : (
    <p>Loading...</p>
  );
};

export default AllocatedBudget;
