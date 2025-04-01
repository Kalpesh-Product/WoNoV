import { useState } from "react";
import {
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Box,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import PrimaryButton from "../../../components/PrimaryButton";
import MuiModal from "../../../components/MuiModal";
import { useForm, Controller } from "react-hook-form";
import {
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  FormHelperText,
} from "@mui/material";
import { QueryClient, useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { toast } from "sonner";

const AssetsSubCategories = () => {
  const axios = useAxiosPrivate();
  const queryClient = new QueryClient();
  const [isModalOpen, setModalOpen] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm();

  const { data: assetsSubCategories = [] } = useQuery({
    queryKey: "assetsSubCategories",
    queryFn: async () => {
      try {
        const response = await axios.get("/api/assets/get-subcategory");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });


  const { data: assetsCategories = [] } = useQuery({
    queryKey: "assetsCategories",
    queryFn: async () => {
      try {
        const response = await axios.get("/api/assets/get-category");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { mutate} = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/assets/create-asset-subcategory", {
        assetCategoryId : data.assetCategoryId,
        assetSubCategoryName: data.assetSubCategoryName,
      });
      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
    },
    onError: function (data) {
      toast.error(data.response.data.message || "Failed to add category");
    },
  });

  const { mutate: disableSubCategory } = useMutation({
    mutationFn: async (assetSubCategoryId) => {

      const response = await axios.patch(`/api/assets/disable-asset-subcategory/${assetSubCategoryId}`);

      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries(["assetCategories"]);
    },
    onError: (error) => {
      toast.error(error.response.data.message || "Failed to disable category");
    },
  });

  const subCategories = [
    { id: 1, categoryName: "Chairs", subCategoryName: "Plastic Chair" },
    { id: 2, categoryName: "Chairs", subCategoryName: "Ergonomic Chair" },
    { id: 3, categoryName: "Chairs", subCategoryName: "Leather Chair" },
    { id: 4, categoryName: "Chairs", subCategoryName: "Office Chair" },
    { id: 5, categoryName: "Laptops", subCategoryName: "Gaming Laptop" },
    { id: 6, categoryName: "Laptops", subCategoryName: "Ultrabook" },
    { id: 7, categoryName: "Cables", subCategoryName: "HDMI Cable" },
    { id: 8, categoryName: "Cables", subCategoryName: "USB-C Cable" },
    { id: 9, categoryName: "Monitors", subCategoryName: "Curved Monitor" },
  ];

  // Grouping subcategories by category
  const categorizedData = assetsCategories.map((category) => {
    const filteredSubCategories = subCategories.filter(
      (sub) => sub.categoryName === category.name
    );
    return {
      ...category,
      subCategories: filteredSubCategories,
    };
  });

  console.log(categorizedData);
  const handleAddSubCategory = (data) => {
    console.log(data)
    mutate(data)
    setModalOpen(false);
    reset();
  };

  return (
    <Box>
      <Box
        display="flex"
        justifyContent="space-between"
        alignItems="center"
        mb={2}
      >
        <span className="text-title text-primary font-pmedium">Assets Sub Categories</span>
        <PrimaryButton
          title="Add Sub Category"
          handleSubmit={() => setModalOpen(true)}
        />
      </Box>

      {assetsSubCategories.map((category) => (
        <Accordion key={category._id} >
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Box display="flex" justifyContent="space-between" width="100%" alignItems={"center"}>
              <span className="text-subtitle">{category.categoryName}</span>
              <span className="text-content">
                {category.subCategories.length}{" "}
                {category.subCategories.length === 1
                  ? "Subcategory"
                  : "Subcategories"}
              </span>
            </Box>
          </AccordionSummary>
          <AccordionDetails
            sx={{
              maxHeight: 200,
              overflowY: "auto",
              borderTop: "1px solid #e0e0e0",
            }}
          >
            <List>
              {category.subCategories.map((subCategory) => (
                <ListItem
                  key={subCategory._id}
                  sx={{ display: "flex", justifyContent: "space-between", padding:0 }}
                >
                  <ListItemText primary={subCategory.name} />
                  
                  <PrimaryButton disabled={!subCategory.isActive} title={"Disable"} handleSubmit={() => {
                     disableSubCategory(subCategory._id)
                  }
                 } />    
                </ListItem>
              ))}
            </List>
          </AccordionDetails>
        </Accordion>
      ))}

      <MuiModal
        open={isModalOpen}
        onClose={() => setModalOpen(false)}
        title="Add Sub Category"
      >
        <form
          onSubmit={handleSubmit(handleAddSubCategory)}
          className="flex flex-col items-center gap-6"
        >
          <FormControl sx={{ width: "80%" }} error={!!errors.categoryName}>
            <InputLabel>Select Category</InputLabel>
            <Controller
              name="assetCategoryId"
              control={control}
              defaultValue=""
              rules={{ required: "Category Name is required" }}
              render={({ field }) => (
                <Select {...field} label="Select Category">
                  {assetsCategories
                    .filter((category) => category.isActive) // Only include active categories
                    .map((category) => (
                      <MenuItem key={category._id} value={category._id}>
                        {category.categoryName}
                      </MenuItem>
                    ))}
                </Select>
              )}
            />
            {errors.categoryName && (
              <FormHelperText>{errors.categoryName.message}</FormHelperText>
            )}
          </FormControl>

          <Controller
            name="assetSubCategoryName"
            control={control}
            defaultValue=""
            rules={{ required: "Sub Category Name is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Sub Category Name"
                variant="outlined"
                sx={{ width: "80%" }}
                error={!!errors.subCategoryName}
                helperText={errors.subCategoryName?.message}
              />
            )}
          />

          <PrimaryButton
            title="Submit"
            handleSubmit={handleSubmit(handleAddSubCategory)}
          />
        </form>
      </MuiModal>
    </Box>
  );
};

export default AssetsSubCategories;
