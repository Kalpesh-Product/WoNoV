import React, { useState } from "react";
import { Tabs, Tab, Skeleton } from "@mui/material";
import AgTable from "../../../../components/AgTable";
import occupied from "../../../../assets/biznest/occupancy/occupied-701.jpeg";
import cleared from "../../../../assets/biznest/occupancy/clear-701.png";
import MuiModal from "../../../../components/MuiModal";
import { MdOutlineRemoveRedEye, MdUploadFile } from "react-icons/md";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";
import dayjs from "dayjs";
import CollapsibleTable from "../../../../components/Tables/MuiCollapsibleTable";
import DataCard from "../../../../components/DataCard";
import WidgetSection from "../../../../components/WidgetSection";
import { useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";

const AdminOfficesLayout = () => {
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewDetails, setViewDetails] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [imageOpen, setImageOpen] = useState(false);
  const [memberDetails, setMemberDetails] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(occupied);
  const [occupiedImage, setOccupiedImage] = useState(occupied);
  const [clearedImagePreview, setClearedImagePreview] = useState(cleared);
  const [clearedImageOpen, setClearedImageOpen] = useState(false);
  const [clearedFile, setClearedFile] = useState(null);
  const [tabIndex, setTabIndex] = useState(0);

  const handleTabChange = (event, newValue) => {
    setTabIndex(newValue);
  };
  const location = useLocation();
  const unit = location.state?.unitId || "";
  const { unitName } = location.state;
  const params = new URLSearchParams(location.search);
  const locationParam = params.get("location") || "Unknown Location";
  const floorParam = params.get("floor") || "Unknown Floor";
  const axios = useAxiosPrivate();

  const formatUnitDisplay = (unitNo, buildingName = "") => {
    const match = unitNo?.match(/^([\d]+)\(?([A-Za-z]*)\)?$/);
    if (!match) return `${unitNo || "N/A"} ${buildingName}`;
    const [_, number, letter] = match;
    return `${number}${letter ? ` - ${letter}` : ""}`;
  };

  const handleViewDetails = (data) => {
    setOpenModal(true);
    setMemberDetails(data || {});
  };

  const {
    data: unitDetails = {},
    isLoading: isUnitsLoading,
    error,
  } = useQuery({
    queryKey: ["unitDetails"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-members", {
        params: { unitId: unit },
      });
      return response.data || {};
    },
  });

  const totalOccupied = Number(unitDetails?.totalOccupiedDesks) || 0;
  const totalActualOccupied =
    unitDetails?.clientDetails?.reduce(
      (sum, item) => sum + (Number(item.occupiedDesks) || 0),
      0
    ) || 0;

  const totalDesks = Number(unitDetails?.totalDesks) || 0;
  const occupancyPercent = totalDesks
    ? ((totalActualOccupied / totalDesks) * 100).toFixed(0)
    : "0";

  const handleFileChange = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setImagePreview(imageUrl);
      setImageOpen(false);
    }
  };

  const handleClearedFileChange = (event) => {
    const file = event.target?.files?.[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setClearedFile(file);
      setClearedImagePreview(imageUrl);
      setClearedImageOpen(false);
    }
  };

  const handleViewModal = (rowData) => {
    setViewDetails(rowData || {});
    setViewModalOpen(true);
  };

  if (isUnitsLoading) {
    return (
      <div className="h-screen">
        <Skeleton height="100%" width="100%" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-screen flex justify-center items-center">
        No Data Available
      </div>
    );
  }

  const tableData = (unitDetails?.clientDetails || []).map((data, index) => ({
    id: index + 1,
    client: data?.client || "-",
    occupiedDesks: data?.occupiedDesks || 0,
    occupancyPercent:
      totalOccupied > 0
        ? ((data?.occupiedDesks / totalOccupied) * 100).toFixed(0)
        : "0",
    memberDetails: data?.memberDetails || [],
  }));

  return (
    <div className="p-4 flex flex-col gap-8">
      <div className="border-[1px] border-borderGray rounded-xl">
        <Tabs
          value={tabIndex}
          onChange={handleTabChange}
          variant="fullWidth"
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            backgroundColor: "white",
            borderRadius: 3,
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "medium",
              padding: "12px 15px",
              minWidth: "20%",
              borderRight: "0.1px solid #d1d5db",
            },
          }}>
          <Tab label="Occupied" />
          <Tab label="Clear" />
        </Tabs>
      </div>

      {tabIndex === 0 && (
        <div className=" text-center">
          <div
            onClick={() => setImageOpen(true)}
            className="h-[32rem] w-full cursor-pointer p-4 border border-borderGray rounded-lg">
            <img
              src={unitDetails?.occupiedImage?.url || occupiedImage}
              alt="Occupied"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      {tabIndex === 1 && (
        <div className=" text-center">
          <div
            onClick={() => setClearedImageOpen(true)}
            className="h-[32rem] w-full cursor-pointer p-4 border border-borderGray rounded-lg">
            <img
              src={unitDetails?.clearImage?.url || clearedImagePreview}
              alt="Clear"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      )}

      <WidgetSection layout={4} padding>
        <DataCard
          data={totalDesks}
          title="Total Desks"
          description="Last Month : Apr-25"
        />
        <DataCard
          data={totalActualOccupied}
          title="Occupied Desks"
          description="Last Month : Apr-25"
        />
        <DataCard
          data={occupancyPercent}
          title="Occupancy %"
          description="Last Month : Apr-25"
        />
        <DataCard
          data={totalDesks - totalActualOccupied}
          title="Free Desks"
          description="Last Month : Apr-25"
        />
      </WidgetSection>

      <WidgetSection
        title={`Occupancy details - ${unitName}`}
        border
        TitleAmount={`TOTAL OCCUPIED : ${totalOccupied}`}>
        <AgTable
          tableHeight={300}
          hideFilter
          columns={[
            { field: "id", headerName: "Sr. No", width: 100 },
            { field: "client", headerName: "Client Name", flex: 1 },
            { field: "occupiedDesks", headerName: "Occupied Desks" },
            { field: "occupancyPercent", headerName: "Occupied %" },
          ]}
          data={tableData}
        />
      </WidgetSection>

      <MuiModal
        open={openModal}
        title="Member Details"
        onClose={() => {
          setOpenModal(false);
          setMemberDetails({});
        }}>
        <div className="grid grid-cols-2 gap-8 px-2 pb-8 border-b-default border-borderGray">
          <div className="flex items-center justify-between">
            <span className="text-content">Member Name</span>
            <span className="text-content text-gray-500">
              {memberDetails?.member || "-"}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-content">Date of Joining</span>
            <span className="text-content text-gray-500">
              {memberDetails?.date || "-"}
            </span>
          </div>
        </div>
      </MuiModal>

      {viewDetails && (
        <ViewDetailsModal
          open={viewModalOpen}
          onClose={() => setViewModalOpen(false)}
          data={{
            ...viewDetails,
            date: viewDetails?.date
              ? dayjs(
                  new Date(viewDetails.date.split("-").reverse().join("-"))
                ).format("DD-MM-YYYY")
              : "-",
          }}
          title="member details"
          fields={[
            { label: "Member Name", key: "member" },
            { label: "Date Of Joining", key: "date" },
          ]}
        />
      )}

      <MuiModal
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        title="Upload occupied space">
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <span className="text-subtitle font-pmedium">Upload New Image</span>
          <label className="cursor-pointer flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100">
            <MdUploadFile className="text-4xl text-gray-500" />
            <span className="text-gray-500">Click to upload</span>
            <input type="file" className="hidden" onChange={handleFileChange} />
          </label>
          {selectedFile && (
            <div className="mt-4 text-gray-700">
              Selected File: {selectedFile.name}
            </div>
          )}
        </div>
      </MuiModal>

      <MuiModal
        open={clearedImageOpen}
        onClose={() => setClearedImageOpen(false)}
        title="Upload clear space">
        <div className="flex flex-col items-center justify-center gap-4 p-6">
          <span className="text-subtitle font-pmedium">Upload New Image</span>
          <label className="cursor-pointer flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100">
            <MdUploadFile className="text-4xl text-gray-500" />
            <span className="text-gray-500">Click to upload</span>
            <input
              type="file"
              className="hidden"
              onChange={handleClearedFileChange}
            />
          </label>
          {clearedFile && (
            <div className="mt-4 text-gray-700">
              Selected File: {clearedFile.name}
            </div>
          )}
        </div>
      </MuiModal>
    </div>
  );
};

export default AdminOfficesLayout;
