import { useEffect, useMemo, useState } from "react";
import PrimaryButton from "../../../components/PrimaryButton";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import MuiModal from "../../../components/MuiModal";
import { Controller, useForm, useWatch } from "react-hook-form";
import { Box, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import DetalisFormatted from "../../../components/DetalisFormatted";
import PageFrame from "../../../components/Pages/PageFrame";
import YearWiseTable from "../../../components/Tables/YearWiseTable";
import usePageDepartment from "../../../hooks/usePageDepartment";
import { queryClient } from "../../../main";
import { inrFormat } from "../../../utils/currencyFormat";
import AgTable from "../../../components/AgTable";
import { PERMISSIONS } from "../../../constants/permissions";
import { isAlphanumeric, noOnlyWhitespace } from "../../../utils/validators";
import ThreeDotMenu from "../../../components/ThreeDotMenu";
import formatDateTime from "../../../utils/formatDateTime";
import useAuth from "../../../hooks/useAuth";
import { useLocation, useNavigate, useParams } from "react-router-dom";

const Inventory = ({ forcedBuildingTab = null }) => {
  const { auth } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { unitNo: unitNoParam } = useParams();
  const userPermissions = auth?.user?.permissions?.permissions || [];
  const department = usePageDepartment();

  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isAddItemModalOpen, setIsAddItemModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [selectedUnit, setSelectedUnit] = useState(null);
  const [selectedBuildingTab, setSelectedBuildingTab] = useState(
    forcedBuildingTab || "sunteck"
  );

  const isAdminInventoryPath = location.pathname.includes(
    "/app/dashboard/admin-dashboard/inventory"
  );

  const isItInventoryPath = location.pathname.includes(
    "/app/dashboard/IT-dashboard/inventory"
  );

  const inventoryTabPermissions = useMemo(() => {
    if (isAdminInventoryPath) {
      return {
        sunteck: PERMISSIONS.ADMIN_INVENTORY_SUNTECK_UNITS.value,
        dempo: PERMISSIONS.ADMIN_INVENTORY_DEMPO_UNITS.value,
      };
    }

    if (isItInventoryPath) {
      return {
        sunteck: PERMISSIONS.IT_INVENTORY_SUNTECK_UNITS.value,
        dempo: PERMISSIONS.IT_INVENTORY_DEMPO_UNITS.value,
      };
    }

    return {
      sunteck: PERMISSIONS.MAINTENANCE_INVENTORY_SUNTECK_UNITS.value,
      dempo: PERMISSIONS.MAINTENANCE_INVENTORY_DEMPO_UNITS.value,
    };
  }, [isAdminInventoryPath, isItInventoryPath]);

  const canViewSunteckUnits = userPermissions.includes(
    inventoryTabPermissions.sunteck
  );

  const canViewDempoUnits = userPermissions.includes(
    inventoryTabPermissions.dempo
  );

  const blockedUnitsByTab = useMemo(
    () => ({
      sunteck: ["601 B", "ST 601 B"],
      dempo: ["605 A", "603 A"],
    }),
    []
  );

  useEffect(() => {
    if (forcedBuildingTab) {
      setSelectedBuildingTab(forcedBuildingTab);
      setSelectedUnit(null);
    }
  }, [forcedBuildingTab]);

  const tabOptions = useMemo(
    () => [
      {
        key: "sunteck",
        label: "Sunteck Kanaka Units",
        buildingName: "Sunteck Kanaka",
        buildingAliases: ["sunteck kanaka", "sunteck"],
        isAllowed: canViewSunteckUnits,
      },
      {
        key: "dempo",
        label: "Dempo Trade Center",
        buildingName: "Dempo Trade Center",
        buildingAliases: ["dempo trade center", "dempo trade centre", "dempo"],
        isAllowed: canViewDempoUnits,
      },
    ],
    [canViewDempoUnits, canViewSunteckUnits]
  );

  useEffect(() => {
    const firstAllowedTab = tabOptions.find((tab) => tab.isAllowed);
    if (!firstAllowedTab) return;

    if (
      !tabOptions.some(
        (tab) => tab.key === selectedBuildingTab && tab.isAllowed
      )
    ) {
      setSelectedBuildingTab(firstAllowedTab.key);
      setSelectedUnit(null);
    }
  }, [selectedBuildingTab, tabOptions]);

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
      openingInventoryUnits: 0,
      openingPerUnitPrice: 0,
      openingInventoryValue: 0,
      newPurchaseUnits: "",
      newPurchasePerUnitPrice: "",
      newPurchaseInventoryValue: "",
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
      addedByName: "",
      date: "",
      buildingName: "",
      unitNo: "",
      itemName: "",
      department: "",
      openingInventoryUnits: "",
      openingPerUnitPrice: "",
      openingInventoryValue: "",
      lastConsumedUnitValue: "",
      lastRemainingUnitValue: 0,
      newPurchaseUnits: "",
      newPurchasePerUnitPrice: "",
      newPurchaseInventoryValue: "",
      newConsumedUnitValue: "",
      newRemainingUnitValue: 0,
      closingInventoryUnits: 0,
      category: "",
    },
  });

  const currentUserName =
    `${auth?.user?.firstName || ""} ${auth?.user?.lastName || ""}`.trim() ||
    auth?.user?.name ||
    auth?.user?.email ||
    "N/A";

  const currentDate = useMemo(() => new Date().toISOString().split("T")[0], []);

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

  const selectedTabBuildingName = useMemo(() => {
    if (selectedBuildingTab === "sunteck") return "Sunteck Kanaka";
    if (selectedBuildingTab === "dempo") return "Dempo Trade Center";
    return "";
  }, [selectedBuildingTab]);

  const selectedTabConfig = useMemo(
    () => tabOptions.find((tab) => tab.key === selectedBuildingTab),
    [selectedBuildingTab, tabOptions]
  );

  useEffect(() => {
    setValue("itemName", selectedAsset?.itemName);
    setValue("department", selectedAsset?.department);
    setValue("openingInventoryUnits", selectedAsset?.openingInventoryUnits);
    setValue("openingPerUnitPrice", selectedAsset?.openingPerUnitPrice);
    setValue("openingInventoryValue", selectedAsset?.openingInventoryValue);
    setValue(
      "lastConsumedUnitValue",
      selectedAsset?.consumedOpenInventoryUnits ?? ""
    );
    setValue(
      "lastRemainingUnitValue",
      selectedAsset?.remainingInventoryUnits ?? 0
    );
    setValue("newPurchaseUnits", selectedAsset?.newPurchaseUnits);
    setValue("newPurchasePerUnitPrice", selectedAsset?.newPurchasePerUnitPrice);
    setValue(
      "newPurchaseInventoryValue",
      selectedAsset?.newPurchaseInventoryValue
    );
    setValue(
      "newConsumedUnitValue",
      selectedAsset?.consumedNewPurchaseInventoryUnits ?? ""
    );
    setValue(
      "newRemainingUnitValue",
      selectedAsset?.closingInventoryUnits ?? 0
    );
    setValue(
      "closingInventoryUnits",
      selectedAsset?.closingInventoryUnits ?? 0
    );
    setValue("addedByName", selectedAsset?.addedByName || currentUserName);
    setValue(
      "date",
      selectedAsset?.dateRaw
        ? new Date(selectedAsset.dateRaw).toISOString().split("T")[0]
        : currentDate
    );
    setValue(
      "buildingName",
      selectedAsset?.buildingName ||
        selectedUnit?.building?.buildingName ||
        selectedUnit?.buildingName ||
        selectedTabConfig?.buildingName ||
        defaultBuildingName
    );
    setValue(
      "unitNo",
      selectedAsset?.unitNo || selectedUnit?.unitNo || defaultUnitNo
    );
    setValue("categoryName", selectedAsset?.categoryName || "");
    setValue("categoryId", selectedAsset?.categoryId || null);
    setValue(
      "category",
      selectedAsset?.category?._id ||
        selectedAsset?.categoryId ||
        selectedAsset?.category ||
        ""
    );
  }, [
    currentDate,
    currentUserName,
    defaultBuildingName,
    defaultUnitNo,
    selectedAsset,
    selectedTabConfig?.buildingName,
    selectedUnit?.building?.buildingName,
    selectedUnit?.buildingName,
    selectedUnit?.unitNo,
    setValue,
  ]);

  const openingUnits = useWatch({ control, name: "openingInventoryUnits" });
  const openingUnitPrice = useWatch({ control, name: "openingPerUnitPrice" });
  const selectedItemForAdd = useWatch({ control, name: "itemName" });
  const newPurchaseUnits = useWatch({ control, name: "newPurchaseUnits" });
  const newPurchaseUnitPrice = useWatch({
    control,
    name: "newPurchasePerUnitPrice",
  });
  const selectedCategoryForAdd = useWatch({ control, name: "category" });

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
  const updateLastConsumedUnits = useWatch({
    control: updateControl,
    name: "lastConsumedUnitValue",
  });
  const updateNewConsumedUnits = useWatch({
    control: updateControl,
    name: "newConsumedUnitValue",
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

  useEffect(() => {
    const openingUnitsVal = Number(updateOpeningUnits) || 0;
    const lastConsumedUnits = Number(updateLastConsumedUnits) || 0;
    const computedLastRemainingUnits = openingUnitsVal - lastConsumedUnits;

    setValue(
      "lastRemainingUnitValue",
      computedLastRemainingUnits >= 0 ? computedLastRemainingUnits : 0,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  }, [setValue, updateLastConsumedUnits, updateOpeningUnits]);

  useEffect(() => {
    const lastRemainingUnits = Number(
      (Number(updateOpeningUnits) || 0) -
        (Number(updateLastConsumedUnits) || 0)
    );
    const newPurchaseUnitsValue = Number(updateNewPurchaseUnits) || 0;
    const newConsumedUnits = Number(updateNewConsumedUnits) || 0;

    const computedNewRemainingUnits =
      lastRemainingUnits + newPurchaseUnitsValue - newConsumedUnits;

    setValue(
      "newRemainingUnitValue",
      computedNewRemainingUnits >= 0 ? computedNewRemainingUnits : 0,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
    setValue(
      "closingInventoryUnits",
      computedNewRemainingUnits >= 0 ? computedNewRemainingUnits : 0,
      {
        shouldDirty: true,
        shouldValidate: true,
      }
    );
  }, [
    setValue,
    updateLastConsumedUnits,
    updateNewConsumedUnits,
    updateNewPurchaseUnits,
    updateOpeningUnits,
  ]);

  const { data: inventoryData, isPending: isInventoryLoading } = useQuery({
    queryKey: ["maintainance-inventory", department?._id],
    enabled: Boolean(department?._id),
    queryFn: async () => {
      const response = await axios.get(
        `/api/inventory/get-inventories?department=${department._id}`
      );

      return response.data.map((item) => {
        const safeDate =
          item.date ||
          item.createdAt ||
          item.updatedAt ||
          new Date().toISOString();

        return {
          ...item,
          itemName: item?.itemName?.name || item?.itemName || "N/A",
          itemId: item?.itemName?._id || null,
          unitId: item?.unit?._id || item?.unit || null,
          unitNo: item?.unit?.unitNo || item?.unitNo || "",
          unitName: item?.unit?.unitName || "",
          buildingName:
            item?.unit?.buildingName ||
            item?.buildingName ||
            item?.unit?.building?.buildingName ||
            "",
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
        `/api/category/get-category?departmentId=${department._id}&appliesTo=inventory`
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

  const { data: inventoryItems = [] } = useQuery({
    queryKey: [
      "inventory-items",
      department?._id,
      selectedCategoryForAdd || "",
    ],
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
      if (Array.isArray(response.data)) {
        return response.data;
      }

      if (Array.isArray(response.data?.data)) {
        return response.data.data;
      }

      return [];
    },
  });

  const itemOptions = useMemo(() => {
    if (!Array.isArray(inventoryItems)) return [];
    const uniqueById = new Map();

    inventoryItems.forEach((item) => {
      const itemId = item?._id;
      const itemName = item?.name?.trim();

      if (!itemId || !itemName || uniqueById.has(itemId)) {
        return;
      }

      uniqueById.set(itemId, {
        id: itemId,
        name: itemName,
      });
    });

    return Array.from(uniqueById.values());
  }, [inventoryItems]);

  useEffect(() => {
    setAddValue("itemName", "");
  }, [selectedCategoryForAdd, setAddValue]);

  useEffect(() => {
    const fetchOpeningData = async () => {
      if (!selectedItemForAdd || !selectedCategoryForAdd || !department?._id)
        return;

      try {
        const res = await axios.get(
          `/api/inventory/get-inventories?department=${department._id}`
        );

        const data = res.data || [];

        const matched = data
          .filter(
            (item) =>
              String(item?.itemName?._id) === String(selectedItemForAdd) &&
              String(item?.category?._id) === String(selectedCategoryForAdd)
          )
          .sort(
            (a, b) =>
              new Date(b.createdAt || b.date) - new Date(a.createdAt || a.date)
          )[0];

        if (matched) {
          const units = Number(matched.closingInventoryUnits || 0);
          const price = Number(matched.newPurchasePerUnitPrice || 0);

          setAddValue("openingInventoryUnits", units, {
            shouldValidate: true,
          });

          setAddValue("openingPerUnitPrice", price, {
            shouldValidate: true,
          });

          setAddValue("openingInventoryValue", units * price, {
            shouldValidate: true,
          });
        } else {
          setAddValue("openingInventoryUnits", 0);
          setAddValue("openingPerUnitPrice", 0);
          setAddValue("openingInventoryValue", 0);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchOpeningData();
  }, [selectedItemForAdd, selectedCategoryForAdd, department?._id, axios, setAddValue]);

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
        }
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Inventory added successfully!");
      queryClient.invalidateQueries({
        queryKey: ["maintainance-inventory", department?._id],
      });
      setIsModalOpen(false);
      setIsAddItemModalOpen(false);
      resetAddInventory();
      resetAddItemForm();
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || "Failed to add inventory.");
      console.error(error);
    },
  });

  const { mutate: createCategory, isPending: isCreatingCategory } = useMutation({
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
        error?.response?.data?.message || "Failed to add category."
      );
      console.error(error);
    },
  });

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
        }
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
      openingInventoryUnits: 0,
      openingPerUnitPrice: 0,
      openingInventoryValue: 0,
      newPurchaseUnits: "",
      newPurchasePerUnitPrice: "",
      newPurchaseInventoryValue: "",
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
        defaultBuildingName
    );
    setAddValue("unitNo", selectedUnit?.unitNo || defaultUnitNo);
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
    if (!selectedUnit?._id) {
      toast.error("Unit not found. Please reselect the unit and try again.");
      return;
    }
    addAsset({
      itemName: data.itemName,
      department: department._id,
      openingInventoryUnits: Number(data.openingInventoryUnits),
      openingPerUnitPrice: Number(data.openingPerUnitPrice),
      openingInventoryValue: Number(data.openingInventoryValue),
      newPurchaseUnits: Number(data.newPurchaseUnits),
      newPurchasePerUnitPrice: Number(data.newPurchasePerUnitPrice),
      newPurchaseInventoryValue: Number(data.newPurchaseInventoryValue),
      consumedOpenInventoryUnits: 0,
      consumedNewPurchaseInventoryUnits: 0,
      closingInventoryUnits:
        Number(data.openingInventoryUnits) + Number(data.newPurchaseUnits),
      category: data.category,
      unit: selectedUnit._id,
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

  const handleUpdateSubmit = (data) => {
    updateAsset({
      ...data,
      openingInventoryUnits: Number(data.openingInventoryUnits) || 0,
      openingPerUnitPrice: Number(data.openingPerUnitPrice) || 0,
      openingInventoryValue: Number(data.openingInventoryValue) || 0,
      consumedOpenInventoryUnits: Number(data.lastConsumedUnitValue) || 0,
      remainingInventoryUnits: Number(data.lastRemainingUnitValue) || 0,
      newPurchaseUnits: Number(data.newPurchaseUnits) || 0,
      newPurchasePerUnitPrice: Number(data.newPurchasePerUnitPrice) || 0,
      newPurchaseInventoryValue: Number(data.newPurchaseInventoryValue) || 0,
      consumedNewPurchaseInventoryUnits: Number(data.newConsumedUnitValue) || 0,
      closingInventoryUnits: Number(data.newRemainingUnitValue) || 0,
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
      field: "consumedOpenInventoryUnits",
      headerName: "Consumed Unit Value",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "remainingInventoryUnits",
      headerName: "Remaining Unit Value",
      cellRenderer: (params) => inrFormat(params.value),
    },
    {
      field: "closingInventoryUnits",
      headerName: "Closing Units",
      cellRenderer: (params) => inrFormat(params.value),
    },
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
    if (!selectedTabConfig?.buildingName || !Array.isArray(unitsData))
      return [];

    const aliases =
      selectedTabConfig.buildingAliases?.map((alias) => alias.toLowerCase()) ||
      [];
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
          ? unitBuildingName.includes(
              selectedTabConfig.buildingName.toLowerCase()
            )
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
      const normalizedBuildingName = String(
        unit?.buildingName ||
          unit?.building?.buildingName ||
          unit?.building ||
          ""
      ).toLowerCase();
      const buildingAliases =
        selectedTabConfig?.buildingAliases?.map((alias) =>
          alias.toLowerCase()
        ) || [];

      const linkedInventory = inventoryTableData?.find((inv) => {
        const matchesUnit =
          String(inv?.unitNo || "").trim() ===
          String(unit?.unitNo || "").trim();

        if (!matchesUnit) return false;

        const invBuildingName = String(inv?.buildingName || "").toLowerCase();
        const matchesByAlias = buildingAliases.some((alias) =>
          invBuildingName.includes(alias)
        );

        return (
          matchesByAlias || invBuildingName.includes(normalizedBuildingName)
        );
      });

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
    selectedTabConfig?.buildingAliases,
  ]);

  useEffect(() => {
    if (!forcedBuildingTab) return;

    if (!unitNoParam) {
      setSelectedUnit(null);
      return;
    }

    const decodedUnitNo = decodeURIComponent(unitNoParam);
    const matchedUnit = unitListingRows.find(
      (row) =>
        String(row?.rawUnit?.unitNo || "").trim() === decodedUnitNo.trim()
    );

    setSelectedUnit(matchedUnit?.rawUnit || null);
  }, [forcedBuildingTab, unitListingRows, unitNoParam]);

  const unitColumns = [
    { field: "srNo", headerName: "Sr. No", width: 110, flex: 2 },
    {
      field: "unitNo",
      headerName: "Unit No",
      minWidth: 210,
      flex: 2,
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
    { field: "unitName", headerName: "Unit Name", minWidth: 210, flex: 1 },
  ];

  const selectedUnitInventoryRows = useMemo(() => {
    if (!selectedUnit) return [];

    const buildingAliases =
      selectedTabConfig?.buildingAliases?.map((alias) => alias.toLowerCase()) ||
      [];

    return (inventoryTableData || []).filter((item) => {
      const matchesUnit =
        String(item?.unitNo || "").trim() ===
        String(selectedUnit?.unitNo || "").trim();
      if (!matchesUnit) return false;

      const itemBuildingName = String(item?.buildingName || "").toLowerCase();
      if (buildingAliases.length === 0) return true;

      return buildingAliases.some((alias) => itemBuildingName.includes(alias));
    });
  }, [inventoryTableData, selectedTabConfig?.buildingAliases, selectedUnit]);

  const dynamicInventoryTitle = selectedUnit
    ? `List Of Inventory - ${selectedTabConfig?.label || ""} - ${
        selectedUnit?.unitNo || ""
      }`
    : "List Of Inventory";

  const unitWiseHeading = `Unit Wise Inventory - ${selectedTabConfig?.label || ""}`;

  const handleTabChange = (value) => {
    if (forcedBuildingTab || value === selectedBuildingTab) return;
    setSelectedBuildingTab(value);
    setSelectedUnit(null);
  };

  const handleUnitOpen = (unit) => {
    if (forcedBuildingTab && unit?.unitNo) {
      navigate(`${location.pathname}/${encodeURIComponent(unit.unitNo)}`);
      return;
    }
    setSelectedUnit(unit);
  };

  return (
    <div className={forcedBuildingTab ? "" : "p-4"}>
      <PageFrame>
        {!selectedUnit ? (
          <>
            {!forcedBuildingTab && (
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
                        {tab.label}
                      </button>
                    );
                  })}
              </Box>
            )}
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
            hideTitle={true}
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
                    </TextField>
                  )}
                />
                <Controller
                  name="itemName"
                  control={control}
                  rules={{
                    required: "Item name is required",
                  }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Item Name"
                      size="small"
                      fullWidth
                      select
                      error={!!errors.itemName}
                      helperText={errors.itemName?.message}
                    >
                      <MenuItem value="">Select item</MenuItem>
                      {itemOptions.map((item) => (
                        <MenuItem key={item.id} value={item.id}>
                          {item.name}
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
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Opening Units"
                      type="number"
                      size="small"
                      fullWidth
                      disabled
                    />
                  )}
                />

                <Controller
                  name="openingPerUnitPrice"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Opening Per Unit Price"
                      type="number"
                      size="small"
                      fullWidth
                      disabled
                    />
                  )}
                />

                <Controller
                  name="openingInventoryValue"
                  control={control}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Opening Value"
                      type="number"
                      size="small"
                      fullWidth
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
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="New Purchase Value"
                      type="number"
                      size="small"
                      fullWidth
                      disabled
                    />
                  )}
                />
              </div>

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
          </div>
        )}

        {modalMode === "edit" && (
          <div>
            <form
              onSubmit={handleUpdate(handleUpdateSubmit)}
              className="flex flex-col gap-4"
            >
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="addedByName"
                  control={updateControl}
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
                  control={updateControl}
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
                  control={updateControl}
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
                  control={updateControl}
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
                  control={updateControl}
                  rules={{ required: "Category required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Category"
                      size="small"
                      fullWidth
                      select
                      disabled
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
                      disabled
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
                       disabled
                      // error={!!updateErrors.openingInventoryUnits}
                      // helperText={updateErrors.openingInventoryUnits?.message}
                    />
                  )}
                />

                <Controller
                  name="openingPerUnitPrice"
                  control={updateControl}
                 // rules={{ required: "Per unit price required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Opening Per Unit Price"
                      type="number"
                      size="small"
                      fullWidth
                       disabled
                      // error={!!updateErrors.openingPerUnitPrice}
                      // helperText={updateErrors.openingPerUnitPrice?.message}
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
                      disabled
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <Controller
                  name="newPurchaseUnits"
                  control={updateControl}
                 // rules={{ required: "New purchase units required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="New Purchase Units"
                      type="number"
                      size="small"
                      fullWidth
                       disabled
                      // error={!!updateErrors.newPurchaseUnits}
                      // helperText={updateErrors.newPurchaseUnits?.message}
                    />
                  )}
                />

                <Controller
                  name="newPurchasePerUnitPrice"
                  control={updateControl}
                 // rules={{ required: "New per unit price required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="New Purchase Per Unit Price"
                      type="number"
                      size="small"
                      fullWidth
                      disabled
                      // error={!!updateErrors.newPurchasePerUnitPrice}
                      // helperText={updateErrors.newPurchasePerUnitPrice?.message}
                    />
                  )}
                />

                <Controller
                  name="newPurchaseInventoryValue"
                  control={updateControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="New Purchase Value"
                      type="number"
                      size="small"
                      fullWidth
                      disabled
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="lastConsumedUnitValue"
                  control={updateControl}
                  rules={{ required: "Last consumed unit value is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Consumed Unit Value"
                      type="number"
                      size="small"
                      fullWidth
                      error={!!updateErrors.lastConsumedUnitValue}
                      helperText={updateErrors.lastConsumedUnitValue?.message}
                    />
                  )}
                />
                <Controller
                  name="lastRemainingUnitValue"
                  control={updateControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="Last Remaining Unit Value"
                      type="number"
                      size="small"
                      fullWidth
                      disabled
                    />
                  )}
                />
              </div>

              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Controller
                  name="newConsumedUnitValue"
                  control={updateControl}
                  rules={{ required: "New consumed unit value is required" }}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="New Consumed Unit Value"
                      type="number"
                      size="small"
                      fullWidth
                      error={!!updateErrors.newConsumedUnitValue}
                      helperText={updateErrors.newConsumedUnitValue?.message}
                    />
                  )}
                />
                <Controller
                  name="newRemainingUnitValue"
                  control={updateControl}
                  render={({ field }) => (
                    <TextField
                      {...field}
                      label="New Remaining Unit Value"
                      type="number"
                      size="small"
                      fullWidth
                      disabled
                    />
                  )}
                />
              </div>

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