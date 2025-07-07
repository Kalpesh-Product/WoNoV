import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import AgTable from "../../../../components/AgTable";
import clearImage from "../../../../assets/biznest/clear-seats.png";
import occupiedImage from "../../../../assets/biznest/occupied-seats.png";
import clientOccupied from "../../../../assets/biznest/occupancy/occupied-701.jpeg";
import clientClear from "../../../../assets/biznest/occupancy/clear-701.png";
import { Accordion, AccordionDetails, AccordionSummary } from "@mui/material";
import { IoIosArrowDown } from "react-icons/io";
import MuiModal from "../../../../components/MuiModal";
import { MdUploadFile } from "react-icons/md";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import PrimaryButton from "../../../../components/PrimaryButton";
import { useForm } from "react-hook-form";
import { useSelector } from "react-redux";
import PageFrame from "../../../../components/Pages/PageFrame";

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

  const { register, handleSubmit, setValue } = useForm();

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    setValue("unitImage", file);
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreview(imageUrl);
      setSelectedFile(file);
    }
  };

  // 🧠 Derive seat data from selectedClient
  const rows = useMemo(() => {
    if (!selectedClient) return [];

    const totalSeats =
      (selectedClient.openDesks ?? 0) + (selectedClient.cabinDesks ?? 0);

    return [
      {
        totalSeats,
        bookedSeats: totalSeats,
        occupancy: "100%",
        availableSeats: 0,
      },
    ];
  }, [selectedClient]);

  const currentRoomData = [
    {
      id: 1,
      title: "Occupied",
      image: clientClear, // ✅ show clear image instead of occupied
      type: "clearImage", // ✅ update image type accordingly
    },
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
    <div className="w-full">
      <PageFrame>
        {currentRoomData.map((item, index) => (
          <Accordion
            key={item.id}
            expanded={expanded === index}
            onChange={handleChange(index)}
          >
            <AccordionSummary
              expandIcon={<IoIosArrowDown />}
              sx={{ borderBottom: "1px solid #d1d5db" }}
            >
              <div className="p-2 w-full flex justify-between items-center">
                <span className="text-subtitle">{item.title}</span>
                <span className="text-subtitle">
                  {item.title === "Occupied"
                    ? rows[0]?.bookedSeats
                    : rows[0]?.availableSeats}
                </span>
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
                  search
                  searchColumn="Email"
                  data={rows}
                  columns={[
                    { field: "totalSeats", headerName: "Total Seats" },
                    { field: "bookedSeats", headerName: "Booked Seats" },
                    { field: "occupancy", headerName: "Occupancy %" },
                    {
                      field: "availableSeats",
                      headerName: "Available Seats",
                      flex: 1,
                    },
                  ]}
                  tableHeight={150}
                />
              </div>
            </AccordionDetails>
          </Accordion>
        ))}
      </PageFrame>

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
                {...register("unitImage")}
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
                    alt="preview"
                    className="h-full w-full object-contain"
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
