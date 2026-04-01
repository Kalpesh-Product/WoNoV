import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import usePageDepartment from "../../../hooks/usePageDepartment";
import AgTable from "../../../components/AgTable";
import PageFrame from "../../../components/Pages/PageFrame";
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
    const { unitNo, inventoryTab, inventoryCategory, inventoryItemName } = useParams();
    const location = useLocation();
    const navigate = useNavigate();
    const axios = useAxiosPrivate();
    const department = usePageDepartment();

    const decodedUnitNo = useMemo(
        () => (unitNo ? decodeURIComponent(unitNo) : ""),
        [unitNo],
    );
    const decodedCategoryName = useMemo(
        () => (inventoryCategory ? decodeURIComponent(inventoryCategory) : ""),
        [inventoryCategory],
    );
    const decodedItemName = useMemo(
        () => (inventoryItemName ? decodeURIComponent(inventoryItemName) : ""),
        [inventoryItemName],
    );


    const unitTabs = useMemo(
        () => [
            { key: "category", label: "Category" },
            { key: "item", label: "Item" },
            { key: "inventory", label: "Inventory" },
        ],
        [],
    );

    const activeUnitTab = unitTabs.some((tab) => tab.key === inventoryTab)
        ? inventoryTab
        : "inventory";

    const handleUnitTabChange = (tabKey) => {
        if (!decodedUnitNo || tabKey === activeUnitTab) return;

        const basePath = location.pathname.split(`/${encodeURIComponent(decodedUnitNo)}/`)[0];
        navigate(`${basePath}/${encodeURIComponent(decodedUnitNo)}/${tabKey}`);
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
                    dateRaw: safeDate,
                };
            });
        },
    });

    const historyRows = useMemo(() => {
        const unitKey = normalizeUnitNo(decodedUnitNo);
        const categoryKey = normalizeText(decodedCategoryName);
        const itemKey = normalizeText(decodedItemName);

        return inventoryData
            .filter(
                (item) =>
                    normalizeUnitNo(item?.unitNo) === unitKey &&
                    normalizeText(item?.categoryName) === categoryKey &&
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
    }, [decodedCategoryName, decodedItemName, decodedUnitNo, inventoryData]);

    const columns = [
        { field: "srNo", headerName: "Sr. No", width: 110 },
        { field: "itemName", headerName: "Item Name", flex: 1, minWidth: 180 },
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
            cellRenderer: (params) => inrFormat(params.value),
        },
        {
            field: "openingInventoryValue",
            headerName: "Opening Value",
            flex: 1,
            minWidth: 170,
            cellRenderer: (params) => inrFormat(params.value),
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

    const tableTitle = `Inventory History - ${decodedItemName || "Item"} - ${decodedCategoryName || "Category"}`;

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
                            onClick={() => handleUnitTabChange(tab.key)}
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
        </>
    );
};

export default InventoryRecordHistory;