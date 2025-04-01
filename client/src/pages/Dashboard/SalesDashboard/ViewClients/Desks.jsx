import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import clearImage from "../../../../assets/biznest/clear-seats.png";
import occupiedImage from "../../../../assets/biznest/occupied-seats.png";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Chip,
} from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import MuiModal from "../../../../components/MuiModal";
import { MdUploadFile } from "react-icons/md";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";

const Desks = () => {
  const navigate = useNavigate();
  const axios = useAxiosPrivate();
  const [expanded, setExpanded] = useState(0);
  const [imageOpen, setImageOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(occupiedImage);
  const selectedClient = useSelector((state) => state.client.selectedClient);
  const [imageType, setImageType] = useState("");

  const handleChange = (index) => (event, isExpanded) => {
    setExpanded(isExpanded ? index : false);
  };

  const { register, handleSubmit, setValue, watch } = useForm();
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setValue("unitImage", file);
    if (file) {
      const imageUrl = URL.createObjectURL(file);

      setImagePreview(imageUrl);
      setSelectedFile(file);
    }
  };

  const viewEmployeeColumns = [
    { field: "totalSeats", headerName: "Total Seats" },
    { field: "bookedSeats", headerName: "Booked Seats" },
    { field: "occupancy", headerName: "Occupancy %", flex: 1 },
    { field: "availableSeats", headerName: "Available Seats", flex: 1 },
  ];

  const rows = [
    {
      totalSeats: "8",
      bookedSeats: "4",
      occupancy: "50%",
      availableSeats: "4",
    },
  ];
  const currentRoomData = [
    { id: 1, title: "Occupied", image: selectedClient.occupiedImage, type: "occupiedImage" },
    { id: 2, title: "Available", image: clearImage, type: "clearImage" },
  ];

  const uploadRoomImage = async ({ file, imageType }) => {
    const formData = new FormData();
    formData.append("unitImage", file);
    formData.append("imageType", imageType);
    formData.append("clientId", selectedClient._id);

    const response = await axios.post(
      "/api/sales/upload-unit-image",
      formData,
      {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data;
  };

  const { mutate: uploadImage, isPending: isUploadPending } = useMutation({
    mutationKey: ["uploadImage"],
    mutationFn: uploadRoomImage,
    onSuccess: (data) => toast.success(data.message),
    onError: (error) => toast.error(error.message),
  });

  const onSubmit = () => {
    if (!selectedFile) {
      toast.error("Please select a file.");
      return;
    }

    uploadImage({
      file: selectedFile,
      imageType: imageType,
    });
  };

  return (
    <div>
      <div className="w-full ">
        {currentRoomData.map((item, index) => (
          <Accordion
            expanded={expanded === index}
            onChange={handleChange(index)}
          >
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              id={index}
              sx={{ borderBottom: "1px solid #d1d5db" }}
            >
              <div className="p-2 w-full flex justify-between items-center">
                <span className="text-subtitle">{item.title}</span>
                {rows.map((row, index) => (
                  <span key={index} className="text-subtitle">
                    {item.title === "Occupied"
                      ? row.totalSeats
                      : row.availableSeats}
                  </span>
                ))}
              </div>
            </AccordionSummary>
            <AccordionDetails>
              <div className="w-full flex flex-col gap-4">
                <div className="flex justify-center items-center">
                  <img
                    className="w-[50%] h-[80%] object-contain cursor-pointer"
                    src={item.image}
                    alt="Image"
                    onClick={() => {
                      setImageType(item.type);
                      setImageOpen(true);
                    }}
                  />
                </div>
                <AgTable
                  search={true}
                  searchColumn="Email"
                  data={rows}
                  columns={viewEmployeeColumns}
                  tableHeight={150}
                />
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </div>
      <MuiModal
        open={imageOpen}
        onClose={() => setImageOpen(false)}
        title={`Upload ${imageType} space image`}
      >
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="flex flex-col items-center justify-center gap-4 p-6">
            <span className="text-subtitle font-pmedium">Upload New Image</span>
            <label className="cursor-pointer flex flex-col items-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg hover:bg-gray-100">
              <MdUploadFile className="text-4xl text-gray-500" />
              <span className="text-gray-500">Click to upload</span>
              <input
                {...register}
                type="file"
                className="hidden"
                onChange={handleFileChange}
              />
            </label>
            {selectedFile && (
              <div className="flex flex-col gap-4">
                <div className="mt-4 h-[50%] w-full text-gray-700">
                  <img
                    src={imagePreview}
                    alt="preview-image"
                    className="h-full w-full overflow-hidden object-contain"
                  />
                </div>
                <PrimaryButton
                  title={"Upload"}
                  type={"submit"}
                  isLoading={isUploadPending}
                  disabled={isUploadPending}
                />
              </div>
            )}
          </div>
        </form>
      </MuiModal>
    </div>
  );
};

export default Desks;
