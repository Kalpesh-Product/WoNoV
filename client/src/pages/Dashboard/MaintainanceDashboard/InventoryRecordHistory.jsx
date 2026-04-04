import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import usePageDepartment from "../../../hooks/usePageDepartment";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
import MuiModal from "../../../components/MuiModal";
import DetalisFormatted from "../../../components/DetalisFormatted";
import { inrFormat } from "../../../utils/currencyFormat";
import formatDateTime from "../../../utils/formatDateTime";

const normalizeUnitNo = (value) =>
    String(value || "")
        .trim()
        .toUpperCase()
        .replace(/^ST\s*/i, "")
        .replace(/\s+/g, " ");

const normalizeText = (value) =>
    String(value || "")
        .trim()
        .toLowerCase();

const InventoryRecordHistory = () => {
    const { unitNo, inventoryTab, inventoryItemName } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const axios = useAxiosPrivate();
    const department = usePageDepartment();
    const [selectedAsset, setSelectedAsset] = useState(null);
    const [isViewModalOpen, setIsViewModalOpen] = useState(false);

    const decodedUnitNo = useMemo(
        () => (unitNo ? decodeURIComponent(unitNo) : ""),
        [unitNo],
    );
    // const decodedCategoryName = useMemo(
    //     () => (inventoryCategory ? decodeURIComponent(inventoryCategory) : ""),
    //     [inventoryCategory],
    // );
    const decodedItemName = useMemo(
        () => (inventoryItemName ? decodeURIComponent(inventoryItemName) : ""),
        [inventoryItemName],
    );

     const selectedCategoryFromState = useMemo(
        () => normalizeText(location.state?.inventoryCategory),
        [location.state?.inventoryCategory],
    );

    const unitTabs = useMemo(
        () => [
            { key: "category", path: "category", label: "Category" },
            { key: "item", path: "item", label: "Item" },
            { key: "inventory", path: "item-inventory", label: "Item Inventory" },
        ],
        [],
    );

       const activeUnitTab =
        unitTabs.find(
            (tab) =>
                tab.path === inventoryTab ||
                (tab.key === "inventory" && inventoryTab === "inventory"),
        )?.key || "inventory";

    const handleUnitTabChange = (tabPath) => {
        if (
            !decodedUnitNo ||
            tabPath ===
            unitTabs.find((tab) => tab.key === activeUnitTab)?.path
        )
            return;

        const basePath = location.pathname.split(`/${encodeURIComponent(decodedUnitNo)}/`)[0];
          navigate(`${basePath}/${encodeURIComponent(decodedUnitNo)}/${tabPath}`);
    };

    const { data: inventoryData = [] } = useQuery({
        queryKey: ["inventory-record-history", department?._id],
        enabled: Boolean(department?._id),
        queryFn: async () => {
            const response = await axios.get(
                `/api/inventory/get-inventories?department=${department._id}`,
            );

            return (response.data || []).map((item) => {
                const safeDate =
                    item.date ||
                    item.createdAt ||
                    item.updatedAt ||
                    new Date().toISOString();
                    const hasAddedByName =
                    item.addedBy &&
                    (item.addedBy.firstName ||
                        item.addedBy.lastName ||
                        item.addedBy.name ||
                        item.addedBy.email);

                return {
                    ...item,
                    itemName: item?.itemName?.name || item?.itemName || "N/A",
                    unitNo: item?.unit?.unitNo || item?.unitNo || "",
                    categoryName:
                        item.Category ||
                        (typeof item.category === "string"
                            ? item.category
                            : item.category?.categoryName) ||
                        "N/A",
                     addedByName: hasAddedByName
                        ? [
                            item.addedBy.firstName,
                            item.addedBy.middleName,
                            item.addedBy.lastName,
                        ]
                            .filter(Boolean)
                            .join(" ") ||
                        item.addedBy.name ||
                        item.addedBy.email ||
                        "N/A"
                        : "N/A",        

                    dateRaw: safeDate,
                };
            });
        },
    });

    const historyRows = useMemo(() => {
        const unitKey = normalizeUnitNo(decodedUnitNo);
        //const categoryKey = normalizeText(decodedCategoryName);
        const itemKey = normalizeText(decodedItemName);

        return inventoryData
            .filter(
                (item) =>
                    normalizeUnitNo(item?.unitNo) === unitKey &&
                      (!selectedCategoryFromState ||
                        normalizeText(item?.categoryName) === selectedCategoryFromState) &&
                    normalizeText(item?.itemName) === itemKey,
            )
            .sort(
                (a, b) =>
                    new Date(b?.createdAt || b?.dateRaw || b?.date || b?.updatedAt || 0) -
                    new Date(a?.createdAt || a?.dateRaw || a?.date || a?.updatedAt || 0),
            )
            .map((item, index) => ({
                ...item,
                srNo: index + 1,
            }));
   }, [decodedItemName, decodedUnitNo, inventoryData, selectedCategoryFromState]);

    const columns = [
        { field: "srNo", headerName: "Sr. No", width: 110 },
       {
            field: "itemName",
            headerName: "Item Name",
            flex: 1,
            minWidth: 180,
            cellRenderer: (params) => (
                <span
                    role="button"
                    onClick={() => {
                        setSelectedAsset(params.data);
                        setIsViewModalOpen(true);
                    }}
                    className="text-primary cursor-pointer underline"
                >
                    {params.value || "N/A"}
                </span>
            ),
        },
        {
            field: "openingInventoryUnits",
            headerName: "Opening Units",
            flex: 1,
            minWidth: 150,
            cellRenderer: (params) => inrFormat(params.value),
        },
        {
            field: "openingPerUnitPrice",
            headerName: "Opening Unit Price",
            flex: 1,
            minWidth: 180,
            //cellRenderer: (params) => inrFormat(params.value),
        },
        {
            field: "openingInventoryValue",
            headerName: "Opening Value",
            flex: 1,
            minWidth: 170,
            cellRenderer: (params) => inrFormat(params.value),
        },
         {
            field: "newPurchaseUnits",
            headerName: "New Purchases Unit",
            flex: 1,
            minWidth: 180,
        },
        {
            field: "newPurchasePerUnitPrice",
            headerName: "New Purchases Per Unit Price",
            flex: 1,
            minWidth: 230,
            cellRenderer: (params) => inrFormat(params.value),
        },
        {
            field: "newPurchaseInventoryValue",
            headerName: "New Purchases Value",
            flex: 1,
            minWidth: 190,
            cellRenderer: (params) => inrFormat(params.value),
        },
        {
            field: "remainingNewPurchaseInventoryUnits",
            headerName: "Closing Unit",
            flex: 1,
            minWidth: 150,
        },
        {
            field: "categoryName",
            headerName: "Category",
            flex: 1,
            minWidth: 160,
        },
        {
            field: "dateRaw",
            headerName: "Date",
            flex: 1,
            minWidth: 160,
            cellRenderer: (params) => formatDateTime(params.value),
        },
    ];


     const resolvedCategoryName = useMemo(() => {
        if (location.state?.inventoryCategory) {
            return location.state.inventoryCategory;
        }

        const uniqueCategories = Array.from(
            new Set(
                historyRows
                    .map((item) => item?.categoryName)
                    .filter((value) => String(value || "").trim()),
            ),
        );

        return uniqueCategories[0] || "Category";
    }, [historyRows, location.state?.inventoryCategory]);

    const tableTitle = `Inventory Item History - ${decodedItemName || "Item"} - ${resolvedCategoryName}`;

    return (
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
                {unitTabs.map((tab, index) => {
                    const isActive = activeUnitTab === tab.key;

                    return (
                        <button
                            key={tab.key}
                            type="button"
                            disabled={isActive}
                            onClick={() => handleUnitTabChange(tab.path)}
                            className={`py-3 px-4 text-center font-normal text-[16px] transition-colors flex-1 ${isActive
                                ? "bg-primary text-white cursor-default"
                                : "bg-white text-primary"
                                } ${index !== unitTabs.length - 1 ? "border-r border-borderGray" : ""}`}
                        >
                            {tab.label}
                        </button>
                    );
                })}
            </Box>
            <PageFrame>
                <AgTable
                    data={historyRows}
                    columns={columns}
                    search={true}
                    tableTitle={tableTitle}
                    tableHeight={450}
                />
            </PageFrame>

             <MuiModal
                open={isViewModalOpen}
                onClose={() => setIsViewModalOpen(false)}
                title="View Details"
            >
                {selectedAsset && (
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
                            detail={selectedAsset.openingInventoryUnits ?? "0"}
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
                            detail={selectedAsset.newPurchaseUnits ?? "0"}
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
                            detail={
                                selectedAsset?.remainingNewPurchaseInventoryUnits || 0
                            }
                        />
                         <DetalisFormatted
                                      title="Last Consumed Units"
                                      detail={
                                         selectedAsset.lastConsume ??
                                       // selectedAsset.lastConsumedUnitValue ??
                                        //selectedAsset.consumedOpenInventoryUnits ??
                                        "0"
                                       }
                                    />
                                    <DetalisFormatted
                                      title="Last Remaining Units"
                                      detail={
                                        selectedAsset.remainingOpeningInventoryUnits ??
                                        "0"
                                      }
                                    />
                                    <DetalisFormatted
                                      title="New Consumed Units"
                                      detail={
                                        selectedAsset.newConsumedUnitValue??
                                        //selectedAsset.consumedNewPurchaseInventoryUnits ??
                                        "0"
                                      }
                                    />
                                    <DetalisFormatted
                                      title="New Remaining Units"
                                      detail={
                                       selectedAsset.remainingNewPurchaseInventoryUnits??
                                        "0"
                                      }
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
            </MuiModal>

        </>
    );
};

export default InventoryRecordHistory;