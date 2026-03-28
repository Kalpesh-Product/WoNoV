import { useEffect, useMemo, useState } from "react";
import PrimaryButton from "../../../components/PrimaryButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Box, MenuItem, Tab, Tabs, TextField } from "@mui/material";
import { toast } from "sonner";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import PageFrame from "../../../components/Pages/PageFrame";
import humanDate from "../../../utils/humanDateForamt";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import usePageDepartment from "../../../hooks/usePageDepartment";
import { queryClient } from "../../../main";
import { inrFormat } from "../../../utils/currencyFormat";
import AgTable from "../../../components/AgTable";
import { PERMISSIONS } from "../../../constants/permissions";
import {
  isAlphanumeric,
  isValidEmail,
  noOnlyWhitespace,
  isValidPhoneNumber,
} from "../../../utils/validators";
//import { useEffect } from "react";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import formatDateTime from "../../../utils/formatDateTime";
import useAuth from "../../../hooks/useAuth";
import { useLocation, useNavigate } from "react-router-dom";
const Inventory = () => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const department = usePageDepartment();

  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
   const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedBuildingTab, setSelectedBuildingTab] = useState("sunteck");
  const [selectedUnit, setSelectedUnit] = useState(null);

  const blockedUnitsByTab = useMemo(
    () => ({
      sunteck: ["601 B", "ST 601 B"],
      dempo: ["605 A", "603 A"],
    }),
    [],
  );

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
       consumedUnitValue: "",
      remainingUnitValue: 0,
      newPurchaseUnits: "",
      newPurchasePerUnitPrice: "",
      newPurchaseInventoryValue: "",
            closingInventoryUnits: 0,
      category: "",
      addedByName: "",
      date: "",
      buildingName: "",
      unitNo: "",
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
    handleSubmit: handleAddItemSubmit,
    control: addItemControl,
    formState: { errors: addItemErrors },
    reset: resetAddItemForm,
  } = useForm({
    mode: "onChange",
    defaultValues: {
      category: "",
      itemName: "",
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
     setValue(
      "category",
      selectedAsset?.category?._id ||
        selectedAsset?.categoryId ||
        selectedAsset?.category ||
        "",
    );
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
        const safeDate =
          item.date || item.createdAt || item.updatedAt || new Date().toISOString();

        return {
          ...item,
          date: safeDate,
          dateRaw: safeDate,
          categoryId: item.category?._id || null,
          categoryName: item.Category || item.category?.categoryName || "N/A",
          addedByName: item.addedBy
            ? [
                item.addedBy.firstName,
                item.addedBy.middleName,
                item.addedBy.lastName,
              ]
                .filter(Boolean)
                .join(" ")
            : "N/A",
          addedOn: item.createdAt || item.date || item.updatedAt || null,
        };
      });
    },
  });
  
   const isItemMasterRecord = (item) => {
    const openingUnits = Number(item?.openingInventoryUnits || 0);
    const openingPrice = Number(item?.openingPerUnitPrice || 0);
    const openingValue = Number(item?.openingInventoryValue || 0);
    const newUnits = Number(item?.newPurchaseUnits || 0);
    const newUnitPrice = Number(item?.newPurchasePerUnitPrice || 0);
    const newValue = Number(item?.newPurchaseInventoryValue || 0);
    const closingUnits = Number(item?.closingInventoryUnits || 0);

    return (
      openingUnits === 0 &&
      openingPrice === 0 &&
      openingValue === 0 &&
      newUnits === 0 &&
      newUnitPrice === 0 &&
      newValue === 0 &&
      closingUnits === 0
    );
  };

  const inventoryTableData = useMemo(() => {
    if (!Array.isArray(inventoryData)) return [];
    return inventoryData.filter((item) => !isItemMasterRecord(item));
  }, [inventoryData]);
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
   const { data: unitsData = [] } = useQuery({
    queryKey: ["inventory-units-list"],
    queryFn: async () => {
      const response = await axios.get("/api/company/fetch-simple-units");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const selectedCategoryForAdd = useWatch({ control, name: "category" });

  const { data: inventoryItems = [] } = useQuery({
    queryKey: ["inventory-items", department?._id, selectedCategoryForAdd || ""],
    enabled: Boolean(department?._id),
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      if (department?._id) {
        searchParams.set("department", department._id);
      }
      if (selectedCategoryForAdd) {
        searchParams.set("category", selectedCategoryForAdd);
      }

      const query = searchParams.toString();
      const response = await axios.get(`/api/items${query ? `?${query}` : ""}`);
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const currentUserName =
    `${auth?.user?.firstName || ""} ${auth?.user?.lastName || ""}`.trim() ||
    auth?.user?.name ||
    auth?.user?.email ||
    "N/A";

  const currentDate = useMemo(
    () => new Date().toISOString().split("T")[0],
    [],
  );

  const defaultBuildingName = useMemo(() => {
    const workLocations = auth?.user?.company?.workLocations;
    if (Array.isArray(workLocations) && workLocations.length > 0) {
      const firstLocation = workLocations[0];

      if (typeof firstLocation === "string") {
        return firstLocation;
      }

      if (typeof firstLocation === "object" && firstLocation?.buildingName) {
        return firstLocation.buildingName;
      }
    }

    return auth?.user?.buildingName || "N/A";
  }, [auth?.user?.buildingName, auth?.user?.company?.workLocations]);

  const defaultUnitNo = useMemo(() => {
    return auth?.user?.workLocation || auth?.user?.unitNo || "N/A";
  }, [auth?.user?.unitNo, auth?.user?.workLocation]);

  const hasInventoryAccess = userPermissions.includes(
    PERMISSIONS.MAINTENANCE_INVENTORY.value,
  );
  const canViewSunteckUnits =
    hasInventoryAccess ||
    userPermissions.includes(
      PERMISSIONS.MAINTENANCE_INVENTORY_SUNTECK_UNITS.value,
    );
  const canViewDempoUnits =
    hasInventoryAccess ||
    userPermissions.includes(PERMISSIONS.MAINTENANCE_INVENTORY_DEMPO_UNITS.value);

  const tabOptions = useMemo(
    () => [
      {
        key: "sunteck",
        label: "Sunteck Kanaka Units",
        tabLabel: "Sunteck Kanaka Unit",
        buildingName: "Sunteck Kanaka",
        buildingAliases: ["sunteck kanaka", "sunteck"],
        isAllowed: canViewSunteckUnits,
      },
      {
        key: "dempo",
        label: "Dempo Trade Center",
        tabLabel: "Dempo Trade Center Unit",
        buildingName: "Dempo Trade Center",
        buildingAliases: ["dempo trade center", "dempo trade centre", "dempo"],
        isAllowed: canViewDempoUnits,
      },
    ],
    [canViewDempoUnits, canViewSunteckUnits],
  );

  useEffect(() => {
    const firstAllowedTab = tabOptions.find((tab) => tab.isAllowed);
    if (!firstAllowedTab) return;

    if (!tabOptions.some((tab) => tab.key === selectedBuildingTab && tab.isAllowed)) {
      setSelectedBuildingTab(firstAllowedTab.key);
      setSelectedUnit(null);
    }
  }, [selectedBuildingTab, tabOptions]);

  const selectedTabConfig = useMemo(
    () => tabOptions.find((tab) => tab.key === selectedBuildingTab),
    [selectedBuildingTab, tabOptions],
  );

  const itemOptions = useMemo(() => {
    if (!Array.isArray(inventoryItems)) return [];
    return Array.from(
      new Set(
        inventoryItems
          .map((item) => item?.name?.trim())
          .filter(Boolean),
      ),
    );
  }, [inventoryItems]);

  useEffect(() => {
    const activeBuildingName =
      selectedUnit?.building?.buildingName ||
      selectedUnit?.buildingName ||
      selectedTabConfig?.buildingName ||
      defaultBuildingName;
    const activeUnitNo = selectedUnit?.unitNo || defaultUnitNo;

    setAddValue("addedByName", currentUserName);
    setAddValue("date", currentDate);
    setAddValue("buildingName", activeBuildingName);
    setAddValue("unitNo", activeUnitNo);
    setAddValue("remainingUnitValue", 0);
    setAddValue("closingInventoryUnits", 0);
  }, [
    currentDate,
    currentUserName,
    defaultBuildingName,
    defaultUnitNo,
    selectedTabConfig?.buildingName,
    selectedUnit,
    setAddValue,
  ]);
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
      setIsAddItemModalOpen(false);
      resetAddInventory();
      resetAddItemForm();
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
  const { mutate: createItem, isPending: isCreatingItem } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/items", data, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data;
    },
    onSuccess: () => {
      toast.success("Item added successfully!");
      queryClient.invalidateQueries({
        queryKey: ["inventory-items", department?._id],
      });
      setIsAddItemModalOpen(false);
      resetAddItemForm();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "Failed to add item.");
      console.error(error);
    },
  });
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
   resetAddInventory({
      itemName: "",
      department: "",
      openingInventoryUnits: "",
      openingPerUnitPrice: "",
      openingInventoryValue: "",
      consumedUnitValue: "",
      remainingUnitValue: 0,
      newPurchaseUnits: "",
      newPurchasePerUnitPrice: "",
      newPurchaseInventoryValue: "",
      closingInventoryUnits: 0,
      category: "",
      addedByName: currentUserName,
      date: currentDate,
      buildingName:
        selectedUnit?.building?.buildingName ||
        selectedUnit?.buildingName ||
        selectedTabConfig?.buildingName ||
        defaultBuildingName,
      unitNo: selectedUnit?.unitNo || defaultUnitNo,
    });
    setAddValue("addedByName", currentUserName);
    setAddValue("date", currentDate);
    setAddValue(
      "buildingName",
      selectedUnit?.building?.buildingName ||
        selectedUnit?.buildingName ||
        selectedTabConfig?.buildingName ||
        defaultBuildingName,
    );
    setAddValue("unitNo", selectedUnit?.unitNo || defaultUnitNo);
    setAddValue("remainingUnitValue", 0);
    setAddValue("closingInventoryUnits", 0);
    setIsModalOpen(true);
  };
  const handleOpenCategoryModal = () => {
    setIsCategoryModalOpen(true);
  };
  const handleOpenAddItemModal = () => {
    setIsAddItemModalOpen(true);
  };
  const handleFormSubmit = (data) => {
     if (!department?._id) {
      toast.error("Department not found. Please refresh and try again.");
      return;
    }

    addAsset({
      itemName: data.itemName,
      department: department._id,
      openingInventoryUnits: Number(data.openingInventoryUnits),
      openingPerUnitPrice: Number(data.openingPerUnitPrice),
      openingInventoryValue: Number(data.openingInventoryValue),
      consumedUnitValue: data.consumedUnitValue,
      remainingUnitValue: Number(data.remainingUnitValue || 0),
      newPurchaseUnits: Number(data.newPurchaseUnits),
      newPurchasePerUnitPrice: Number(data.newPurchasePerUnitPrice),
      newPurchaseInventoryValue: Number(data.newPurchaseInventoryValue),
      closingInventoryUnits: Number(data.closingInventoryUnits),
      category: data.category,
      date: data.date,
      buildingName: data.buildingName,
      unitNo: data.unitNo,
    });
  };

  const handleCategoryFormSubmit = (data) => {
    createCategory(data);
  };
   const handleAddItemFormSubmit = (data) => {
    if (!department?._id) {
      toast.error("Department not found. Please refresh and try again.");
      return;
    }

    createItem({
      name: data.itemName,
      department: department._id,
      category: data.category,
    });
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
     cellRenderer: (params) => params.value,
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
 const selectedBuildingUnits = useMemo(() => {
    if (!selectedTabConfig?.buildingName || !Array.isArray(unitsData)) return [];

    const aliases =
      selectedTabConfig.buildingAliases?.map((alias) => alias.toLowerCase()) || [];
    const blockedUnits = blockedUnitsByTab[selectedBuildingTab] || [];

    return unitsData.filter((unit) => {
      const unitBuildingName = (
        unit?.buildingName ||
        unit?.building?.buildingName ||
        unit?.building ||
        ""
      )
        .toString()
        .toLowerCase();

      const matchesBuilding =
        aliases.length === 0
          ? unitBuildingName.includes(selectedTabConfig.buildingName.toLowerCase())
          : aliases.some((alias) => unitBuildingName.includes(alias));

      if (!matchesBuilding) return false;

      const unitNo = String(unit?.unitNo || "").trim();
      return !blockedUnits.includes(unitNo);
    });
  }, [
    blockedUnitsByTab,
    selectedBuildingTab,
    selectedTabConfig?.buildingAliases,
    selectedTabConfig?.buildingName,
    unitsData,
  ]);

  const unitListingRows = useMemo(() => {
    return selectedBuildingUnits.map((unit, index) => {
      const linkedInventory = inventoryTableData?.find(
        (inv) =>
          String(inv?.unitNo || "").trim() === String(unit?.unitNo || "").trim() &&
          (inv?.buildingName || "").toLowerCase().includes(
            selectedTabConfig?.buildingName?.toLowerCase() || "",
          ),
      );

      return {
        id: unit?._id || `${selectedBuildingTab}-${index}`,
        srNo: index + 1,
        unitNo: unit?.unitNo || "-",
        unitName: unit?.unitName || "-",
        category: linkedInventory?.categoryName || "-",
        itemName: linkedInventory?.itemName || "-",
        rawUnit: unit,
      };
    });
  }, [
    inventoryTableData,
    selectedBuildingTab,
    selectedBuildingUnits,
    selectedTabConfig?.buildingName,
  ]);

  const unitColumns = [
    { field: "srNo", headerName: "Sr. No", width: 110 },
    {
      field: "unitNo",
      headerName: "Unit No",
      minWidth: 170,
      flex: 1,
      cellRenderer: (params) => (
        <span
          role="button"
          onClick={() => handleUnitOpen(params.data.rawUnit)}
          className="text-primary cursor-pointer underline"
        >
          {params.value}
        </span>
      ),
    },
    { field: "unitName", headerName: "Unit Name", minWidth: 200, flex: 1 },
    
    { field: "category", headerName: "Category", minWidth: 190, flex: 1 },
    { field: "itemName", headerName: "Item Name", minWidth: 210, flex: 1 },
  ];

  const selectedUnitInventoryRows = useMemo(() => {
    if (!selectedUnit) return [];

    return (inventoryTableData || []).filter((item) => {
      const matchesUnit =
        String(item?.unitNo || "").trim() === String(selectedUnit?.unitNo || "").trim();
      const activeBuildingName = (selectedTabConfig?.buildingName || "").toLowerCase();
      const itemBuildingName = String(item?.buildingName || "").toLowerCase();
      const matchesBuilding = activeBuildingName
        ? itemBuildingName.includes(activeBuildingName)
        : true;
      return matchesUnit && matchesBuilding;
    });
  }, [inventoryTableData, selectedTabConfig?.buildingName, selectedUnit]);

  const dynamicInventoryTitle = selectedUnit
    ? `List Of Inventory - ${selectedTabConfig?.label || ""} - ${
        selectedUnit?.unitNo || ""
      }`
    : "List Of Inventory";
  const unitWiseHeading = `Unit Wise Inventory - ${selectedTabConfig?.label || ""}`;

  useEffect(() => {
    if (!selectedTabConfig?.label) return;

    const searchParams = new URLSearchParams(location.search);
    searchParams.set("building", selectedTabConfig.label);
    if (selectedUnit?.unitNo) {
      searchParams.set("unit", selectedUnit.unitNo);
    } else {
      searchParams.delete("unit");
    }

    const nextSearch = searchParams.toString();
    const currentSearch = location.search.replace(/^\?/, "");

    if (nextSearch === currentSearch) return;

    navigate(
      {
        pathname: location.pathname,
        search: nextSearch,
      },
      { replace: true },
    );
  }, [
    location.pathname,
    location.search,
    navigate,
    selectedTabConfig?.label,
    selectedUnit?.unitNo,
  ]);

  const handleTabChange = (value) => {
    if (value === selectedBuildingTab) return;
    setSelectedBuildingTab(value);
    setSelectedUnit(null);
  };

  const handleUnitOpen = (unit) => {
    setSelectedUnit(unit);
  };


  return (
    <div className="p-4">
      <PageFrame>
           {!selectedUnit ? (
          <>
            <Box
              sx={{
                border: "1px solid #d1d5db",
                borderRadius: "8px",
                overflow: "hidden",
                mb: 3,
                display: "flex",
              }}
            >
              {tabOptions
                .filter((tab) => tab.isAllowed)
                .map((tab, index, arr) => {
                  const isActive = selectedBuildingTab === tab.key;
                  return (
                    <button
                      key={tab.key}
                      type="button"
                      disabled={isActive}
                      onClick={() => handleTabChange(tab.key)}
                      className={`py-3 px-4 text-center font-normal text-[18px] transition-colors ${
                        arr.length === 1 ? "w-full" : "flex-1"
                      } ${
                        isActive
                          ? "bg-primary text-white cursor-default"
                          : "bg-white text-primary"
                      } ${index !== arr.length - 1 ? "border-r border-borderGray" : ""}`}
                    >
                      {tab.tabLabel || tab.label}
                    </button>
                  );
                })}
            </Box>
            <AgTable
              data={unitListingRows}
              columns={unitColumns}
              search={true}
              hideTitle={false}
              tableTitle={unitWiseHeading}
              tableHeight={440}
            />
          </>
        ) : (
          <YearWiseTable
            key={isInventoryLoading ? 0 : selectedUnitInventoryRows?.length}
            search={true}
            tableTitle={dynamicInventoryTitle}
            hideTitle={false}
            buttonTitle={"Add Inventory"}
            secondaryButtonTitle={"Add Category"}
            middleButtonTitle={"Add Item"}
            handleSecondarySubmit={handleOpenCategoryModal}
            handleMiddleSubmit={handleOpenAddItemModal}
            data={selectedUnitInventoryRows || []}
            tableHeight={450}
            dateColumn={"date"}
            columns={inventoryColumns}
            handleSubmit={handleAddAsset}
          />
        )}
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
        open={isAddItemModalOpen}
        onClose={() => setIsAddItemModalOpen(false)}
        title="Add Item"
      >
        <form
          onSubmit={handleAddItemSubmit(handleAddItemFormSubmit)}
          className="grid grid-cols-1 gap-4"
        >
          <Controller
            name="category"
            control={addItemControl}
            rules={{ required: "Category required" }}
            render={({ field }) => (
              <TextField
                {...field}
                label="Category"
                size="small"
                fullWidth
                select
                error={!!addItemErrors.category}
                helperText={addItemErrors.category?.message}
              >
                <MenuItem value="">Select category</MenuItem>
                {inventoryCategories
                  .filter((category) => category.isActive)
                  .map((category) => (
                    <MenuItem key={category._id} value={category._id}>
                      {category.categoryName}
                    </MenuItem>
                  ))}
              </TextField>
            )}
          />
          <Controller
            name="itemName"
            control={addItemControl}
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
                error={!!addItemErrors.itemName}
                helperText={addItemErrors.itemName?.message}
              />
            )}
          />
          <PrimaryButton
            title={isCreatingItem ? "Adding..." : "Add Item"}
            className="w-full"
            type="submit"
            disabled={isCreatingItem}
          />
        </form>
      </MuiModal>
      <MuiModal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={
          modalMode === "view"
            ? "View Details"
            : modalMode === "add"
              ? "Add Inventory"
              : "Edit Inventory"
        }
      >
        {modalMode === "add" && (
          <div>
            <form
              onSubmit={handleSubmit(handleFormSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                 <Controller
                  name="addedByName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Name"
                      fullWidth
                      size="small"
                      disabled
                    />
                  )}
                />
                <Controller
                  name="date"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      type="date"
                      label="Date"
                      fullWidth
                      size="small"
                      InputLabelProps={{ shrink: true }}
                      disabled
                    />
                  )}
                />
                <Controller
                  name="buildingName"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Building Name"
                      fullWidth
                      size="small"
                      disabled
                    />
                  )}
                />
                <Controller
                  name="unitNo"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Unit No"
                      fullWidth
                      size="small"
                      disabled
                    />
                  )}
                />
                <Controller
                  name="category"
                  control={control}
                  rules={{ required: "Category required" }}
                  render={({ field }) => (
                    <TextField
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
                    // validate: {
                    //   isAlphanumeric,
                    //   noOnlyWhitespace,
                    // },
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Item Name"
                      //fullWidth
                      size="small"
                       fullWidth
                      select
                      error={!!errors.itemName}
                      helperText={errors.itemName?.message}
                        >
                      <MenuItem value="">Select item</MenuItem>
                      {itemOptions.map((itemName) => (
                        <MenuItem key={itemName} value={itemName}>
                          {itemName}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              </div>
               <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="consumedUnitValue"
                  control={control}
                  rules={{ required: "Consumed unit value required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Consumed Unit Value"
                      type="text"
                      size="small"
                      fullWidth
                      error={!!errors.consumedUnitValue}
                      helperText={errors.consumedUnitValue?.message}
                    />
                  )}
                />
                <Controller
                  name="remainingUnitValue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Remaining Unit Value"
                      type="number"
                      size="small"
                      fullWidth
                      disabled
                    />
                  )}
                />
              </div>
              <Controller
                name="closingInventoryUnits"
                control={control}
                //rules={{ required: "Closing units required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label="Closing Inventory Unit Value"
                    type="number"
                    size="small"
                    fullWidth
                     disabled
                   // error={!!errors.closingInventoryUnits}
                    //helperText={errors.closingInventoryUnits?.message}
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
          <br />
          <div className="font-bold">Inventory Added By</div>
            <DetalisFormatted
              title="Name"
              detail={selectedAsset.addedByName || "N/A"}
            />
            {/* <DetalisFormatted
              title="Added On"
              detail={formatDateTime(selectedAsset.addedOn || selectedAsset.dateRaw)}
            /> */}
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
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="category"
                  control={updateControl}
                  rules={{ required: "Category required" }}
                  render={({ field }) => (
                    <TextField
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
              </div>
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
