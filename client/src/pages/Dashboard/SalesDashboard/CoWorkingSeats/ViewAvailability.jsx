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

const mockSalesData = {
  totalDesks: 146,
  clientDetails: [
    {
      client: "WoNo",
      occupiedDesks: 6,
      memberDetails: [
        { member: "Kalpesh Naik", date: "20-02-2024" },
        { member: "Aiwinraj KS", date: "20-02-2024" },
        { member: "Allan Silveira", date: "21-02-2024" },
        { member: "Sankalp Kalangutkar", date: "22-02-2024" },
        { member: "Muskan Dodmani", date: "22-02-2024" },
      ],
    },
    {
      client: "Axis Bank",
      occupiedDesks: 5,
      memberDetails: [
        { member: "Amit Sharma", date: "25-02-2024" },
        { member: "Priya Verma", date: "26-02-2024" },
        { member: "Rahul Patel", date: "26-02-2024" },
        { member: "Anjali Gupta", date: "26-02-2024" },
        { member: "Vikram Singh", date: "26-02-2024" },
      ],
    },
    {
      client: "SquadStack",
      occupiedDesks: 12,
      memberDetails: [
        { member: "Arjun Mehra", date: "01-03-2024" },
        { member: "Sneha Kapoor", date: "01-03-2024" },
        { member: "Rohan Malhotra", date: "02-03-2024" },
        { member: "Kavita Joshi", date: "02-03-2024" },
        { member: "Nikhil Rana", date: "02-03-2024" },
        { member: "Divya Nair", date: "03-03-2024" },
        { member: "Siddharth Iyer", date: "03-03-2024" },
        { member: "Pooja Desai", date: "03-03-2024" },
        { member: "Aditya Kulkarni", date: "04-03-2024" },
        { member: "Meera Saxena", date: "04-03-2024" },
        { member: "Karan Thakur", date: "04-03-2024" },
        { member: "Shruti Bhatt", date: "05-03-2024" },
        { member: "Vivek Chawla", date: "05-03-2024" },
        { member: "Neha Aggarwal", date: "05-03-2024" },
        { member: "Pranav Dubey", date: "06-03-2024" },
        { member: "Aarti Saini", date: "06-03-2024" },
        { member: "Manish Vyas", date: "06-03-2024" },
        { member: "Riya Sengupta", date: "07-03-2024" },
        { member: "Saurabh Mishra", date: "07-03-2024" },
        { member: "Tanya Grover", date: "07-03-2024" },
      ],
    },
    {
      client: "BDO",
      occupiedDesks: 4,
      memberDetails: [
        { member: "Suresh Yadav", date: "25-02-2024" },
        { member: "Lakshmi Menon", date: "26-02-2024" },
        { member: "Deepak Rawat", date: "26-02-2024" },
        { member: "Sunita Pillai", date: "26-02-2024" },
        { member: "Rakesh Jha", date: "26-02-2024" },
      ],
    },
  ],
};


const ViewAvailability = () => {
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
  const unit = location.state?.unitId;
  console.log(unit);
  const params = new URLSearchParams(location.search);
  const locationParam = params.get("location");
  const floorParam = params.get("floor");
  const axios = useAxiosPrivate();

  const handleViewDetails = (data) => {
    setOpenModal(true);
    setMemberDetails(data);
  };

  const {
    data: unitDetails = [],
    isLoading: isUnitsLoading,
    error,
  } = useQuery({
    queryKey: ["unitDetails"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/sales/co-working-members", {
          params: { unitId: unit },
        });
        return response.data;
      } catch (error) {
        console.error(error);
      }
    },
  });
  const totalOccupied = isUnitsLoading ? 0 : unitDetails?.totalOccupiedDesks

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setSelectedFile(file);
      setImagePreview(imageUrl);
      setImageOpen(false);
    }
  };

  const handleClearedFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setClearedFile(file);
      setClearedImagePreview(imageUrl);
      setClearedImageOpen(false);
    }
  };

  const handleViewModal = (rowData) => {
    setViewDetails(rowData);
    setViewModalOpen(true);
  };

  if (isUnitsLoading) {
    // While the data is loading, display the skeleton loader
    return (
      <div className="h-screen">
        <Skeleton height={"100%"} width={"100%"} />
      </div>
    );
  }

  if (error) {
    // Display error message if data fetching fails
    return <div className="h-screen flex justify-center items-center">No Data Available</div>;
  }

  return (
    <div className="p-4 flex flex-col gap-8">
      <div>
        <div className="w-full ">
          <div className="border-[1px] border-borderGray rounded-xl">
            <Tabs
              value={tabIndex}
              onChange={handleTabChange}
              variant="fullWidth"
              TabIndicatorProps={{ style: { display: "none" } }}
              sx={{
                width: "100%",
                backgroundColor: "white",
                borderRadius: 3,
                "& .MuiTab-root": {
                  textTransform: "none",
                  fontWeight: "medium",
                  padding: "12px 15px",
                  minWidth: "20%",
                  borderRight: "0.1px solid #d1d5db",
                },
                "& .MuiTabs-scrollButtons": {
                  "&.Mui-disabled": { opacity: 0.3 },
                },
              }}
            >
              <Tab label="Occupied" />
              <Tab label="Clear" />
            </Tabs>
          </div>

          {tabIndex === 0 && (
            <div className="py-4 text-center">
              <div
                onClick={() => setImageOpen(true)}
                className="h-[32rem] w-full cursor-pointer p-4 border border-borderGray rounded-lg"
              >
                <img
                  src={unitDetails?.occupiedImage?.url || occupiedImage}
                  alt="Occupied"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}

          {tabIndex === 1 && (
            <div className="py-4 text-center">
              <div
                onClick={() => setClearedImageOpen(true)}
                className="h-[32rem] w-full cursor-pointer p-4 border border-borderGray rounded-lg"
              >
                <img
                  src={unitDetails?.clearImage?.url || cleared}
                  alt="Clear"
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 4 cards section start */}
      <div className=" flex flex-col gap-4">
        <WidgetSection layout={4} padding>
          <DataCard
            data={unitDetails?.totalDesks}
            title={"Total Desks"}
            description={`Last Month : Apr-25`}
          />
          <DataCard
            data={unitDetails?.totalOccupiedDesks}
            title={"Occupied Desks"}
            description={`Last Month : Apr-25`}
          />
          <DataCard
            data={((unitDetails?.totalOccupiedDesks/unitDetails?.totalDesks)*100).toFixed(0)}
            title={"Occupancy %"}
            description={`Last Month : Apr-25`}
          />
          <DataCard
            data={(unitDetails?.totalDesks - unitDetails?.totalOccupiedDesks)}
            title={"Free Desks"}
            // description={`Last Month : ${new Date().toLocaleString("default", {
            //   month: "short",
            // })}-25`}
            description={`Last Month : Apr-25`}
          />
        </WidgetSection>
      </div>
      {/* 4 cards section end */}

      <WidgetSection
        title={`occupancy details of ${locationParam} - ${floorParam}`}
        border
        TitleAmount={`TOTAL OCCUPIED : ${totalOccupied} `}
      >
        <CollapsibleTable
          columns={[
            { field: "client", headerName: "Client Name" },
            { field: "occupiedDesks", headerName: "Occupied Desks" },
            { field: "occupancyPercent", headerName: "Occupied %" },
          ]}
          data={unitDetails?.clientDetails?.map((data, index) => ({
            id: index, // Using index as a unique identifier
            client: data.client || "",
            occupiedDesks: data.occupiedDesks || "",
            occupancyPercent:
              ((data.occupiedDesks / unitDetails?.totalOccupiedDesks) * 100).toFixed(
                0
              ) || "",
            memberDetails: data.memberDetails, // Pass memberDetails to the data for each row
          }))} // Mapping through clientDetails
          renderExpandedRow={(row) => {
            if (!row?.memberDetails || !Array.isArray(row.memberDetails)) {
              return <div>No member details available</div>; // Fallback message if no data
            }

            return (
              <AgTable
                data={row.memberDetails.map((member, idx) => ({
                  ...member,
                  id: idx + 1,
                  date: dayjs(
                    new Date(member.date.split("-").reverse().join("-"))
                  ).format("DD-MM-YYYY"),
                }))}
                hideFilter
                columns={[
                  { field: "id", headerName: "Sr No", width: 100 },
                  { field: "member", headerName: "Member Name", flex: 1 },
                  { field: "date", headerName: "Date", flex: 1 },
                  {
                    headerName: "Action",
                    field: "action",
                    cellRenderer: (params) => (
                      <div className="p-2 mb-2 flex gap-2">
                        <span
                          className="text-subtitle cursor-pointer"
                          onClick={() => handleViewDetails(params.data)}
                        >
                          <MdOutlineRemoveRedEye />
                        </span>
                      </div>
                    ),
                  },
                ]}
                tableHeight={300}
              />
            );
          }}
        />
      </WidgetSection>

      <MuiModal
        open={openModal}
        title={"Member Details"}
        onClose={() => {
          setOpenModal(false);
          setMemberDetails({});
        }}
      >
        <div className="grid grid-cols-2 gap-8 px-2 pb-8 border-b-default border-borderGray">
          <div className="flex items-center justify-between">
            <span className="text-content">Member Name</span>
            <span className="text-content text-gray-500">
              {memberDetails.member}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-content">Date of Joining</span>
            <span className="text-content text-gray-500">
              {memberDetails.date}
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
            date: dayjs(
              new Date(viewDetails.date.split("-").reverse().join("-"))
            ).format("DD-MM-YYYY"),
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
        title={"Upload occupied space"}
      >
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
        title={"Upload clear space"}
      >
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

export default ViewAvailability;
