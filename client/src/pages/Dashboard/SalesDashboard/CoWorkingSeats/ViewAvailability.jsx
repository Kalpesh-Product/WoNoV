import React, { useState } from "react";
import { Accordion, AccordionSummary, AccordionDetails } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import AgTable from "../../../../components/AgTable";
import occupied from "../../../../assets/biznest/occupancy/occupied.png";
import cleared from "../../../../assets/biznest/occupancy/cleared.png";
import PrimaryButton from "../../../../components/PrimaryButton";
import MuiModal from "../../../../components/MuiModal";
import { MdOutlineRemoveRedEye, MdUploadFile } from "react-icons/md";
import ViewDetailsModal from "../../../../components/ViewDetailsModal";
import dayjs from "dayjs";

const mockSalesData = [
  {
    client: "WoNo",
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
    memberDetails: [
      { member: "Suresh Yadav", date: "25-02-2024" },
      { member: "Lakshmi Menon", date: "26-02-2024" },
      { member: "Deepak Rawat", date: "26-02-2024" },
      { member: "Sunita Pillai", date: "26-02-2024" },
      { member: "Rakesh Jha", date: "26-02-2024" },
    ],
  },
];

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

  const handleViewDetails = (data) => {
    setOpenModal(true);
    setMemberDetails(data);
  };

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

  return (
    <div className="p-4 flex flex-col gap-8">
      <div>
        <div className="grid grid-cols-2  gap-4">
          <div className="flex w-full flex-col gap-4 text-center">
            <span className="text-primary text-title">Occupied</span>
            <div
              onClick={() => setImageOpen(true)}
              className="h-80 w-full  cursor-pointer">
              <img
                className="w-full h-full object-contain"
                src={imagePreview}
                alt=""
              />
            </div>
          </div>
          <div className="flex w-full flex-col gap-4 text-center">
            <span className="text-primary text-title">Clear</span>
            <div
              onClick={() => setClearedImageOpen(true)}
              className="h-80 w-full  cursor-pointer">
              <img
                className="w-full h-full object-contain"
                src={clearedImagePreview}
                alt=""
              />
            </div>
          </div>
        </div>
      </div>
      {/* aCCordion section */}
      <div>
        <div className="px-4 py-2 border-b-[1px] border-borderGray bg-gray-50">
          <div className="flex justify-between items-center w-full px-4 py-2">
            <span className="w-full text-muted font-pmedium text-subtitle">
              CLIENT
            </span>
            <span className="w-full text-muted font-pmedium text-subtitle text-right flex items-center justify-end gap-1">
              MEMBERS
            </span>
          </div>
        </div>
        {mockSalesData.map((data, index) => (
          <Accordion key={index} className="py-4">
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              aria-controls={`panel-${index}-content`}
              id={`panel-${index}-header`}
              className="border-b-[1px] border-borderGray">
              <div className="flex justify-between items-center w-full px-4">
                <span className="text-content font-pmedium">{data.client}</span>
                <span className="text-content font-pmedium">
                  {data.memberDetails.length} members
                </span>
              </div>
            </AccordionSummary>
            <AccordionDetails sx={{ borderTop: "1px solid #d1d5db" }}>
              <AgTable
                data={data.memberDetails.map((member, idx) => ({
                  ...member,
                  id: idx + 1,
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
                          onClick={() => handleViewModal(params.data)}>
                          <MdOutlineRemoveRedEye />
                        </span>
                      </div>
                    ),
                  },
                ]}
                tableHeight={300}
              />
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
      <MuiModal
        open={openModal}
        title={"Member Details"}
        onClose={() => {
          setOpenModal(false);
          setMemberDetails({});
        }}>
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
            date: dayjs(viewDetails.date).format("DD-MM-YYYY"),
          }}
          title="Tax Payment Detail"
          fields={[
            { label: "Member Name", key: "member" },
            { label: "Date Of Joining", key: "date" },
          ]}
        />
      )}

      <MuiModal
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        title={"Upload occupied space"}>
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
        title={"Upload clear space"}>
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
