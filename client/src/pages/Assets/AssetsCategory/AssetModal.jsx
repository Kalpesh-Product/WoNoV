import { useState, useEffect } from "react";
import { useForm, Controller } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
  Button,
} from "@mui/material";
import MuiModal from "../../../components/MuiModal";
import PrimaryButton from "../../../components/PrimaryButton";
import SecondaryButton from "../../../components/SecondaryButton";

const AssetModal = ({
  mode = "add", // 'add', 'view', or 'edit'
  isOpen,
  onClose,
  onSubmit,
  assetData = null,
  onModeChange,
}) => {
  const [previewImage, setPreviewImage] = useState(null);
  const {
    control,
    handleSubmit,
    formState: { errors },
    watch,
    reset,
    setValue,
  } = useForm({
    defaultValues: {
      department: "",
      name: "",
      description: "",
      image: null,
      category: "",
      status: "",
    },
  });

  // Predefined lists
  const departments = ["IT", "HR", "Administration", "Finance"];
  const categories = ["Laptop", "Projector", "Printer", "Scanner"];
  const vendors = [
    "Sumo Payroll",
    "Plumbing Company",
    "John Doe",
    "Grocery Company",
  ];
  const locations = ["Office A", "Office B", "Warehouse"];

  // Watch form values for dynamic calculations
  const watchedImage = watch("assetImage");
  const quantity = watch("quantity");
  const price = watch("price");
  const totalPrice = quantity && price ? quantity * price : 0;

  // Reset form and set initial data when modal opens or mode changes
  useEffect(() => {
    if (isOpen && assetData) {
      // Convert initial data to form values
      Object.keys(assetData).forEach((key) => {
        if (key === "purchaseDate") {
          // Convert date string to dayjs object
          setValue(key, dayjs(assetData[key], "DD-MM-YYYY"));
        } else {
          setValue(key, assetData[key]);
        }
      });
    }

    // Reset form when modal closes
    if (!isOpen) {
      reset();
    }
  }, [isOpen, assetData, mode, reset, setValue]);

  // Prevent memory leaks
  useEffect(() => {
    if (watchedImage?.[0] instanceof File) {
      const objectURL = URL.createObjectURL(watchedImage[0]);
      setPreviewImage(objectURL);
      return () => URL.revokeObjectURL(objectURL); // Cleanup
    }
    setPreviewImage(null);
  }, [watchedImage]);

  // Handle form submission
  const handleFormSubmit = (data) => {
    // Convert purchase date to string format if it's a dayjs object
    const formattedData = {
      ...data,
      purchaseDate: data.purchaseDate
        ? data.purchaseDate.format("DD-MM-YYYY")
        : null,
      totalPrice,
    };

    onSubmit(formattedData);
    onClose();
  };

  return (
    <MuiModal
      open={isOpen}
      onClose={onClose}
      title={
        mode === "add"
          ? "Add Asset"
          : mode === "view"
          ? "Asset Details"
          : "Edit Asset"
      }>
      {mode !== "view" ? (
 <></>
      ) : (
        <>
          <div className="grid grid-cols-2 gap-8 px-6 pb-6">
            {assetData?.assetImage && (
              <div className="col-span-2 flex justify-center border-2 rounded-md border-gray-300 p-2">
                <img
                  src={assetData.assetImage}
                  alt="Asset"
                  className="w-4/5 h-48 object-contain"
                />
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-content">Department</span>
              <span className="text-content text-gray-500">
                {assetData?.department}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Category</span>
              <span className="text-content text-gray-500">
                {assetData?.category}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Brand</span>
              <span className="text-content text-gray-500">
                {assetData?.brand}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Model Name</span>
              <span className="text-content text-gray-500">
                {assetData?.modelName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Quantity</span>
              <span className="text-content text-gray-500">
                {assetData?.quantity}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Price</span>
              <span className="text-content text-gray-500">
                {assetData?.price}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Total Price</span>
              <span className="text-content text-gray-500">
                {assetData?.quantity * assetData?.price}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Vendor Name</span>
              <span className="text-content text-gray-500">
                {assetData?.vendorName}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Purchase Date</span>
              <span className="text-content text-gray-500">
                {assetData?.purchaseDate}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Warranty</span>
              <span className="text-content text-gray-500">
                {assetData?.warranty}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-content">Location</span>
              <span className="text-content text-gray-500">
                {assetData?.location}
              </span>
            </div>
          </div>
          <div className="w-full flex justify-center">
            <PrimaryButton
              title={"Edit"}
              handleSubmit={() => {
                onModeChange("edit");
              }}
            />
          </div>
        </>
      )}
    </MuiModal>
  );
};

export default AssetModal;
