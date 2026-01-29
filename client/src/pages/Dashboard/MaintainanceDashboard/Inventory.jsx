import { useState } from "react";
import PrimaryButton from "../../../components/PrimaryButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm, useWatch } from "react-hook-form";
import { MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import PageFrame from "../../../components/Pages/PageFrame";
import humanDate from "../../../utils/humanDateForamt";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import usePageDepartment from "../../../hooks/usePageDepartment";
import { queryClient } from "../../../main";
import { inrFormat } from "../../../utils/currencyFormat";
import {
  isAlphanumeric,
  isValidEmail,
  noOnlyWhitespace,
  isValidPhoneNumber,
} from "../../../utils/validators";
import { useEffect } from "react";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import formatDateTime from "../../../utils/formatDateTime";
const Inventory = () => {
  const department = usePageDepartment();

  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const {
    handleSubmit,
    control,
    formState: { errors },
    reset: resetAddInventory,
    setValue: setAddValue,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      itemName: "",
      department: "",
      openingInventoryUnits: "",
      openingPerUnitPrice: "",
      openingInventoryValue: "",
      newPurchaseUnits: "",
      newPurchasePerUnitPrice: "",
      newPurchaseInventoryValue: "",
      closingInventoryUnits: "",
      category: "",
    },
  });
  const {
    handleSubmit: handleCategorySubmit,
    control: categoryControl,
    formState: { errors: categoryErrors },
    reset: resetCategoryForm,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      categoryName: "",
    },
  });
  const {
    handleSubmit: handleUpdate,
    control: updateControl,
    formState: { errors: updateErrors },
    setValue,
    reset: resetUpdateInventory,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      itemName: "",
      department: "",
      openingInventoryUnits: "",
      openingPerUnitPrice: "",
      openingInventoryValue: "",
      newPurchaseUnits: "",
      newPurchasePerUnitPrice: "",
      newPurchaseInventoryValue: "",
      closingInventoryUnits: "",
      category: "",
    },
  });

  useEffect(() => {
    setValue("itemName", selectedAsset?.itemName);
    setValue("department", selectedAsset?.department);
    setValue("openingInventoryUnits", selectedAsset?.openingInventoryUnits);
    setValue("openingPerUnitPrice", selectedAsset?.openingPerUnitPrice);
    setValue("openingInventoryValue", selectedAsset?.openingInventoryValue);
    setValue("newPurchaseUnits", selectedAsset?.newPurchaseUnits);
    setValue("newPurchasePerUnitPrice", selectedAsset?.newPurchasePerUnitPrice);
    setValue(
      "newPurchaseInventoryValue",
      selectedAsset?.newPurchaseInventoryValue,
    );
    setValue("closingInventoryUnits", selectedAsset?.closingInventoryUnits);
    setValue("categoryName", selectedAsset?.categoryName || "");
    setValue("categoryId", selectedAsset?.categoryId || null);
    setValue("category", selectedAsset?.category || selectedAsset?.Category);
  }, [selectedAsset]);

  const openingUnits = useWatch({ control, name: "openingInventoryUnits" });
  const openingUnitPrice = useWatch({ control, name: "openingPerUnitPrice" });
  const newPurchaseUnits = useWatch({ control, name: "newPurchaseUnits" });
  const newPurchaseUnitPrice = useWatch({
    control,
    name: "newPurchasePerUnitPrice",
  });
  const updateOpeningUnits = useWatch({
    control: updateControl,
    name: "openingInventoryUnits",
  });
  const updateOpeningUnitPrice = useWatch({
    control: updateControl,
    name: "openingPerUnitPrice",
  });
  const updateNewPurchaseUnits = useWatch({
    control: updateControl,
    name: "newPurchaseUnits",
  });
  const updateNewPurchaseUnitPrice = useWatch({
    control: updateControl,
    name: "newPurchasePerUnitPrice",
  });

  useEffect(() => {
    const units = Number(openingUnits) || 0;
    const price = Number(openingUnitPrice) || 0;
    setAddValue("openingInventoryValue", units * price, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [openingUnits, openingUnitPrice, setAddValue]);

  useEffect(() => {
    const units = Number(newPurchaseUnits) || 0;
    const price = Number(newPurchaseUnitPrice) || 0;
    setAddValue("newPurchaseInventoryValue", units * price, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [newPurchaseUnits, newPurchaseUnitPrice, setAddValue]);

  useEffect(() => {
    const units = Number(updateOpeningUnits) || 0;
    const price = Number(updateOpeningUnitPrice) || 0;
    setValue("openingInventoryValue", units * price, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setValue, updateOpeningUnitPrice, updateOpeningUnits]);

  useEffect(() => {
    const units = Number(updateNewPurchaseUnits) || 0;
    const price = Number(updateNewPurchaseUnitPrice) || 0;
    setValue("newPurchaseInventoryValue", units * price, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }, [setValue, updateNewPurchaseUnitPrice, updateNewPurchaseUnits]);

  const { data: inventoryData, isPending: isInventoryLoading } = useQuery({
    queryKey: ["maintainance-inventory", department?._id],
    enabled: Boolean(department?._id),
    queryFn: async () => {
      const response = await axios.get(
        `/api/inventory/get-inventories?department=${department._id}`,
      );

      return response.data.map((item) => {
        // const safeDate =
        //   item.date ||
        //   item.createdAt ||
        //   item.updatedAt ||
        //   new Date().toISOString(); // last-resort fallback

        const safeDate = item.date || item.createdAt || item.updatedAt;

        console.log("dept", department._id);
        console.log("name", item.Category || item.category.categoryName);

        return {
          ...item,
          date: safeDate,
          dateRaw: safeDate,
          categoryId: item.category._id,
          categoryName: item.Category || item.category.categoryName,
          // categoryName: item.category?.categoryName || "N/A",
        };
      });
    },
  });
  const { data: inventoryCategories = [] } = useQuery({
    queryKey: ["inventory-categories", department?._id],
    queryFn: async () => {
      if (!department?._id) {
        return [];
      }
      const response = await axios.get(
        `/api/category/get-category?departmentId=${department._id}&appliesTo=inventory`,
      );
      return response.data;
    },
  });
  const { mutate: addAsset, isPending: isAddingAsset } = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.post(
        "/api/inventory/add-inventory-item",
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Inventory added successfully!");
      // queryClient.invalidateQueries({ queryKey: ["maintainance-inventory"] });
      queryClient.invalidateQueries({
        queryKey: ["maintainance-inventory", department?._id],
      });
      setIsModalOpen(false);
      resetAddInventory();
    },
    onError: (error) => {
      toast.error(error.response.data.message);
      console.error(error);
    },
  });

  const { mutate: createCategory, isPending: isCreatingCategory } = useMutation(
    {
      mutationFn: async (data) => {
        const response = await axios.post("/api/category/create-category", {
          assetCategoryName: data.categoryName,
          departmentId: department._id,
          appliesTo: "inventory",
        });
        return response.data;
      },
      onSuccess: (data) => {
        toast.success(data.message || "Category added successfully!");
        queryClient.invalidateQueries({
          queryKey: ["inventory-categories", department?._id],
        });
        setIsCategoryModalOpen(false);
        resetCategoryForm();
      },
      onError: (error) => {
        toast.error(
          error?.response?.data?.message || "Failed to add category.",
        );
        console.error(error);
      },
    },
  );
  const { mutate: updateAsset, isPending: isUpdatingAsset } = useMutation({
    mutationFn: async (formData) => {
      const response = await axios.patch(
        `/api/inventory/update-inventory/${selectedAsset?._id}`,
        formData,
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Inventory updated successfully!");
      queryClient.invalidateQueries({
        queryKey: ["maintainance-inventory", department?._id],
      });
      setIsModalOpen(false);
      resetUpdateInventory();
    },
    onError: (error) => {
      toast.error("Failed to update inventory. Please try again.");
      console.error(error);
    },
  });

  const handleDetailsClick = (asset) => {
    setSelectedAsset(asset);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAddAsset = () => {
    setModalMode("add");
    setSelectedAsset(null);
    setIsModalOpen(true);
  };
  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };
  const handleFormSubmit = (data) => {
    const formData = new FormData();

    // const openingInventoryValue =
    //   (data.openingInventoryUnits || 0) * (data.openingPerUnitPrice || 0);
    // const newPurchaseInventoryValue =
    //   (data.newPurchaseUnits || 0) * (data.newPurchasePerUnitPrice || 0);

    formData.append("itemName", data.itemName);
    formData.append("department", department._id);
    formData.append("openingInventoryUnits", data.openingInventoryUnits);
    formData.append("openingPerUnitPrice", data.openingPerUnitPrice);
    formData.append("openingInventoryValue", data.openingInventoryValue);
    formData.append("newPurchaseUnits", data.newPurchaseUnits);
    formData.append("newPurchasePerUnitPrice", data.newPurchasePerUnitPrice);
    formData.append(
      "newPurchaseInventoryValue",
      data.newPurchaseInventoryValue,
    );
    formData.append("closingInventoryUnits", data.closingInventoryUnits);
    formData.append("category", data.category);

    addAsset(formData);
  };

  const handleCategoryFormSubmit = (data) => {
    createCategory(data);
  };
  const inventoryColumns = [
    {
      field: "id",
      headerName: "Sr No",
      width: 100,
      valueGetter: (params) => params.node.rowIndex + 1,
    },
    {
      field: "itemName",
      headerName: "Item Name",
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => {
            handleDetailsClick(params.data);
          }}
          className="text-primary cursor-pointer underline"
        >
          {params.value}
        </span>
      ),
    },
    {
      field: "openingInventoryUnits",
      headerName: "Opening Units",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "openingPerUnitPrice",
      headerName: "Opening Per Unit Price",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "openingInventoryValue",
      headerName: "Opening Value (INR)",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "newPurchaseUnits",
      headerName: "New Purchase Units",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "newPurchasePerUnitPrice",
      headerName: "New Purchase Per Unit Price",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "newPurchaseInventoryValue",
      headerName: "New Purchase Value",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "closingInventoryUnits",
      headerName: "Closing Units",
      cellRenderer: (params) => inrFormat(params.value),
    },
    // {
    //   field: "Category",
    //   headerName: "Category",
    //   cellRenderer: (params) => params.data?.category || params.data?.Category,
    // },
    {
      field: "categoryName",
      headerName: "Category",
      cellRenderer: (params) => {
        console.log("params", params.value);
        return params.value;
      },
    },

    {
      field: "dateRaw",
      headerName: "Date",
      cellRenderer: (params) => {
        return formatDateTime(params.value);
      },
    },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <ThreeDotMenu
          rowId={params.data._id}
          menuItems={[
            {
              label: "Edit",
              onClick: () => {
                setSelectedAsset(params.data);
                setModalMode("edit");
                setIsModalOpen(true);
              },
            },
          ]}
        />
      ),
    },
  ];

  return (
    <div className="p-4">
      <PageFrame>
        <YearWiseTable
          key={isInventoryLoading ? 0 : inventoryData?.length}
          search={true}
          tableTitle={"List Of Inventory"}
          hideTitle={true}
          buttonTitle={"Add Inventory"}
          secondaryButtonTitle={"Add Category"}
          handleSecondarySubmit={handleOpenCategoryModal}
          data={inventoryData || []}
          tableHeight={450}
          dateColumn={"date"}
          columns={inventoryColumns}
          handleSubmit={handleAddAsset}
        />
      </PageFrame>

      <MuiModal
        open={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
        title="Add Category"
      >
        <form
          onSubmit={handleCategorySubmit(handleCategoryFormSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          <Controller
            name="categoryName"
            control={categoryControl}
            rules={{
              required: "Category name is required",
            }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Category Name"
                size="small"
                fullWidth
                error={!!categoryErrors.categoryName}
                helperText={categoryErrors.categoryName?.message}
              />
            )}
          />
          <PrimaryButton
            title={isCreatingCategory ? "Adding..." : "Add Category"}
            className="w-full"
            type="submit"
            disabled={isCreatingCategory}
          />
        </form>
      </MuiModal>
      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={modalMode === "view" ? "View Details" : "Add Inventory"}
      >
        {modalMode === "add" && (
          <div>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="grid grid-cols-2 gap-4"
            >
              <Controller
                name="category"
                control={control}
                rules={{ required: "Category required" }}
                render={({ field }) => (
                  <TextField
                    className="col-span-2"
                    {...field}
                    label="Category"
                    size="small"
                    fullWidth
                    select
                    error={!!errors.category}
                    helperText={errors.category?.message}
                  >
                    <MenuItem value="">Select category</MenuItem>
                    {inventoryCategories
                      .filter((category) => category.isActive)
                      .map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.categoryName}
                        </MenuItem>
                      ))}

                    {/* {department.name === "Administration"
                      ? adminCategories.map((m) => (
                          <MenuItem key={m.id} value={m.name}>
                            {m.name}
                          </MenuItem>
                        ))
                      : department.name === "Maintenance"
                        ? maintainanceCategories.map((m) => (
                            <MenuItem key={m.id} value={m.name}>
                              {m.name}
                            </MenuItem>
                          ))
                        : []} */}
                  </TextField>
                )}
              />
              <Controller
                name="itemName"
                control={control}
                rules={{
                  required: "Item name is required",
                  validate: {
                    isAlphanumeric,
                    noOnlyWhitespace,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Item Name"
                    fullWidth
                    size="small"
                    error={!!errors.itemName}
                    helperText={errors.itemName?.message}
                  />
                )}
              />

              <Controller
                name="openingInventoryUnits"
                control={control}
                rules={{ required: "Opening units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Units"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.openingInventoryUnits}
                    helperText={errors.openingInventoryUnits?.message}
                  />
                )}
              />

              <Controller
                name="openingPerUnitPrice"
                control={control}
                rules={{ required: "Per unit price required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Per Unit Price"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.openingPerUnitPrice}
                    helperText={errors.openingPerUnitPrice?.message}
                  />
                )}
              />

              <Controller
                name="openingInventoryValue"
                control={control}
                // rules={{ required: "Opening value required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Value"
                    type="number"
                    size="small"
                    fullWidth
                    // error={!!errors.openingInventoryValue}
                    // helperText={errors.openingInventoryValue?.message}
                    disabled
                  />
                )}
              />

              <Controller
                name="newPurchaseUnits"
                control={control}
                rules={{ required: "New purchase units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Purchase Units"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.newPurchaseUnits}
                    helperText={errors.newPurchaseUnits?.message}
                  />
                )}
              />

              <Controller
                name="newPurchasePerUnitPrice"
                control={control}
                rules={{ required: "New per unit price required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Purchase Per Unit Price"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.newPurchasePerUnitPrice}
                    helperText={errors.newPurchasePerUnitPrice?.message}
                  />
                )}
              />

              <Controller
                name="newPurchaseInventoryValue"
                control={control}
                // rules={{ required: "New purchase value required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Purchase Value"
                    type="number"
                    size="small"
                    fullWidth
                    // error={!!errors.newPurchaseInventoryValue}
                    // helperText={errors.newPurchaseInventoryValue?.message}
                    disabled
                  />
                )}
              />

              <Controller
                name="closingInventoryUnits"
                control={control}
                rules={{ required: "Closing units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Closing Inventory Units"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!errors.closingInventoryUnits}
                    helperText={errors.closingInventoryUnits?.message}
                  />
                )}
              />

              <PrimaryButton
                title="Add Inventory"
                className="w-full col-span-2"
                type="submit"
              />
            </form>
          </div>
        )}
        {modalMode === "view" && selectedAsset && (
          <div className="grid grid-cols-1 md:grid-cols-1 gap-3 px-2 py-4">
            {selectedAsset.image && (
              <div className="col-span-2 flex justify-center">
                <img
                  src={selectedAsset.image}
                  alt="Asset"
                  className="max-h-40 object-contain rounded-md shadow-md"
                />
              </div>
            )}
            <div className="font-bold">Item Information</div>
            <DetalisFormatted
              title="Item Name"
              detail={selectedAsset.itemName || "N/A"}
            />
            <DetalisFormatted
              title="Department"
              detail={
                selectedAsset.department?.name ||
                selectedAsset.department ||
                "N/A"
              }
            />
            <DetalisFormatted
              title="Date"
              detail={formatDateTime(selectedAsset.dateRaw)}
            />
            <DetalisFormatted
              title="Category"
              detail={selectedAsset.categoryName || "N/A"}
            />
            <br />
            <div className="font-bold">Inventory Units</div>

            <DetalisFormatted
              title="Opening Units"
              detail={selectedAsset.openingInventoryUnits ?? "N/A"}
            />
            <DetalisFormatted
              title="Opening Per Unit Price"
              detail={
                selectedAsset.openingPerUnitPrice != null
                  ? `INR ${inrFormat(selectedAsset.openingPerUnitPrice)}`
                  : "N/A"
              }
            />
            <DetalisFormatted
              title="New Purchase Units"
              detail={selectedAsset.newPurchaseUnits ?? "N/A"}
            />
            <DetalisFormatted
              title="New Purchase Per Unit Price"
              detail={
                selectedAsset.newPurchasePerUnitPrice != null
                  ? `INR ${inrFormat(selectedAsset.newPurchasePerUnitPrice)}`
                  : "N/A"
              }
            />
            <DetalisFormatted
              title="Closing Units"
              detail={selectedAsset.closingInventoryUnits ?? "N/A"}
            />
            <br />
            <div className="font-bold">Inventory Value</div>
            <DetalisFormatted
              title="Opening Value"
              detail={`INR ${
                inrFormat(selectedAsset.openingInventoryValue) ?? "N/A"
              }`}
            />

            <DetalisFormatted
              title="New Purchase Value"
              detail={`INR ${
                inrFormat(selectedAsset.newPurchaseInventoryValue) ?? "N/A"
              }`}
            />

            {/* <DetalisFormatted
              title="Purchase Date"
              detail={formatDateTime(selectedAsset.purchaseDate)}
            /> */}
            <br />
            {/* <div className="font-bold">Additional Information</div> */}
            {/* <DetalisFormatted
              title="Brand"
              detail={selectedAsset.brand || "N/A"}
            />

            <DetalisFormatted
              title="Quantity"
              detail={selectedAsset.quantity ?? "N/A"}
            />

            <DetalisFormatted
              title="Warranty (Months)"
              detail={selectedAsset.warranty ?? "N/A"}
            /> */}
          </div>
        )}
        {modalMode === "edit" && (
          <div>
            <form
              onSubmit={handleUpdate((data) => updateAsset(data))}
              className="grid grid-cols-2 gap-4"
            >
              <Controller
                name="category"
                control={updateControl}
                rules={{ required: "Category required" }}
                render={({ field }) => (
                  <TextField
                    className="col-span-2"
                    {...field}
                    label="Category"
                    size="small"
                    fullWidth
                    select
                    error={!!updateErrors.category}
                    helperText={updateErrors.category?.message}
                  >
                    <MenuItem value="">Select category</MenuItem>
                    {inventoryCategories
                      .filter((category) => category.isActive)
                      .map((category) => (
                        <MenuItem key={category._id} value={category._id}>
                          {category.categoryName}
                        </MenuItem>
                      ))}
                    {/* {department.name === "Administration"
                      ? adminCategories.map((m) => (
                          <MenuItem key={m.id} value={m.name}>
                            {m.name}
                          </MenuItem>
                        ))
                      : department.name === "Maintenance"
                        ? maintainanceCategories.map((m) => (
                            <MenuItem key={m.id} value={m.name}>
                              {m.name}
                            </MenuItem>
                          ))
                        : []} */}
                  </TextField>
                )}
              />
              <Controller
                name="itemName"
                control={updateControl}
                rules={{
                  required: "Item name is required",
                  validate: {
                    isAlphanumeric,
                    noOnlyWhitespace,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Item Name"
                    fullWidth
                    size="small"
                    error={!!updateErrors.itemName}
                    helperText={updateErrors.itemName?.message}
                  />
                )}
              />

              <Controller
                name="openingInventoryUnits"
                control={updateControl}
                rules={{ required: "Opening units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Units"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!updateErrors.openingInventoryUnits}
                    helperText={updateErrors.openingInventoryUnits?.message}
                  />
                )}
              />

              <Controller
                name="openingPerUnitPrice"
                control={updateControl}
                rules={{ required: "Per unit price required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Per Unit Price"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!updateErrors.openingPerUnitPrice}
                    helperText={updateErrors.openingPerUnitPrice?.message}
                  />
                )}
              />

              <Controller
                name="openingInventoryValue"
                control={updateControl}
                rules={{ required: "Opening value required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Opening Value"
                    type="number"
                    size="small"
                    fullWidth
                    // error={!!updateErrors.openingInventoryValue}
                    // helperText={updateErrors.openingInventoryValue?.message}
                    disabled
                  />
                )}
              />

              <Controller
                name="newPurchaseUnits"
                control={updateControl}
                rules={{ required: "New purchase units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Purchase Units"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!updateErrors.newPurchaseUnits}
                    helperText={updateErrors.newPurchaseUnits?.message}
                  />
                )}
              />

              <Controller
                name="newPurchasePerUnitPrice"
                control={updateControl}
                rules={{ required: "New per unit price required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Purchase Per Unit Price"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!updateErrors.newPurchasePerUnitPrice}
                    helperText={updateErrors.newPurchasePerUnitPrice?.message}
                  />
                )}
              />

              <Controller
                name="newPurchaseInventoryValue"
                control={updateControl}
                // rules={{ required: "New purchase value required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="New Purchase Value"
                    type="number"
                    size="small"
                    fullWidth
                    // error={!!updateErrors.newPurchaseInventoryValue}
                    // helperText={updateErrors.newPurchaseInventoryValue?.message}
                    disabled
                  />
                )}
              />

              <Controller
                name="closingInventoryUnits"
                control={updateControl}
                rules={{ required: "Closing units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Closing Inventory Units"
                    type="number"
                    size="small"
                    fullWidth
                    error={!!updateErrors.closingInventoryUnits}
                    helperText={updateErrors.closingInventoryUnits?.message}
                  />
                )}
              />

              <PrimaryButton
                title="Update Inventory"
                className="w-full col-span-2"
                type="submit"
              />
            </form>
          </div>
        )}
      </MuiModal>
    </div>
  );
};

export default Inventory;
