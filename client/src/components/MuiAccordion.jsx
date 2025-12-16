import React from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Typography,
  Box,
  Stack,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import { IoIosArrowForward } from "react-icons/io";
import { PERMISSIONS } from "../constants/permissions";
import Permissions from "./Permissions/Permissions";

const MuiAccordion = ({
  data = [],
  titleKey = "name",
  itemsKey = "items",
  itemClick,
  disabledKey = "",
}) => {
  const sortItems = (a, b) => {
    const isAdminA = a.role?.some((r) =>
      r.roleTitle.toLowerCase().includes("admin")
    );
    const isAdminB = b.role?.some((r) =>
      r.roleTitle.toLowerCase().includes("admin")
    );

    if (isAdminA && !isAdminB) return -1;
    if (!isAdminA && isAdminB) return 1;
    return a.firstName.localeCompare(b.firstName);
  };

  const renderItem = (emp) => (
    <Box
      display="flex"
      justifyContent="space-between"
      alignItems="center"
      p={1}
      border="1px solid #e0e0e0"
      borderRadius={2}
    >
      <Box>
        <Typography fontWeight={500}>
          {emp.firstName} {emp.lastName}
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {emp.role?.map((r) => r.roleTitle).join(", ")}
        </Typography>
      </Box>

      <Permissions permissions={[PERMISSIONS.ACCESS_PERMISSIONS]}>
        <div
          onClick={() => itemClick?.(emp)}
          className="p-2 cursor-pointer border-default border-black rounded-md text-content flex items-center bg-white text-black hover:text-white hover:bg-primary hover:border-primary"
        >
          <IoIosArrowForward />
        </div>
      </Permissions>
    </Box>
  );

  // Sort sections by titleKey and separate active/inactive
  const sortedData = [...data].sort((a, b) =>
    a[titleKey]?.localeCompare(b[titleKey])
  );

  const activeSections = sortedData.filter(
    (section) => !disabledKey || section[disabledKey] !== false
  );
  const inactiveSections = sortedData.filter(
    (section) => disabledKey && section[disabledKey] === false
  );

  const finalSections = [...activeSections, ...inactiveSections];

  return (
    <Box>
      <div className="mb-4">
        <span className="text-primary font-pmedium text-title ">
          DEPARTMENTS
        </span>
      </div>
      {finalSections.map((section) => {
        const isDisabled = disabledKey && section[disabledKey] === false;
        const items = [...(section[itemsKey] || [])].sort(sortItems);

        return (
          <Accordion key={section._id} disableGutters>
            <AccordionSummary
              expandIcon={isDisabled ? null : <ExpandMoreIcon />}
            >
              <Typography fontWeight="bold">
                {section[titleKey]}
                {isDisabled && (
                  <Typography
                    component="span"
                    sx={{ fontSize: 12, color: "gray", marginLeft: 1 }}
                  >
                    (Inactive)
                  </Typography>
                )}
              </Typography>
            </AccordionSummary>
            {!isDisabled && (
              <AccordionDetails>
                <Stack spacing={2}>
                  {items.map((item) => (
                    <Box key={item._id}>{renderItem(item)}</Box>
                  ))}
                </Stack>
              </AccordionDetails>
            )}
          </Accordion>
        );
      })}
    </Box>
  );
};

export default MuiAccordion;
