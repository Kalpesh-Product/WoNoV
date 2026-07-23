import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useParams } from "react-router-dom";
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
  const { unitNo, inventoryItemName } = useParams();
  const location = useLocation();
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
  const selectedBuildingFromState = useMemo(
    () => normalizeText(location.state?.buildingName || ""),
    [location.state?.buildingName],
  );
  const isOverallInventoryHistoryRoute = useMemo(
    () => location.pathname.includes("/overall-inventory/"),
    [location.pathname],
  );

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
          departmentId:
            item?.department?._id ||
            (typeof item?.department === "string" ? item.department : null) ||
            item?.departmentId ||
            null,
          departmentName:
            item?.department?.name ||
            item?.department?.departmentName ||
            item?.departmentName ||
            (typeof item?.department === "string" ? item.department : "") ||
            "",
          buildingName:
            item?.buildingName ||
            item?.unit?.buildingName ||
            item?.unit?.building?.buildingName ||
            "",
          unitNo: item?.unit?.unitNo || item?.unitNo || "",
          categoryName:
            item.Category ||
            (typeof item.category === "string"
              ? item.category
              : item.category?.categoryName) ||
            "N/A",
          lastConsumedUnitValue:
            item?.lastConsumedUnitValue ??
            item?.consumedOpenInventoryUnits ??
            item?.lastConsumed ??
            0,
          lastRemainingUnitValue:
            item?.lastRemainingUnitValue ??
            item?.remainingInventoryUnits ??
            item?.remainingOpeningInventoryUnits ??
            0,
          newConsumedUnitValue:
            item?.newConsumedUnitValue ??
            item?.consumedNewPurchaseInventoryUnits ??
            item?.totalConsumed ??
            0,
          newRemainingUnitValue:
            item?.newRemainingUnitValue ??
            item?.remainingNewPurchaseInventoryUnits ??
            item?.closingInventoryUnits ??
            0,
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

          rawDateTime: safeDate,
          inventoryStamp: formatDateTime(safeDate),
        };
      });
    },
  });

  const historyRows = useMemo(() => {
    const unitKey = normalizeUnitNo(decodedUnitNo);
    const itemKey = normalizeText(decodedItemName);

    const filtered = inventoryData.filter((item) => {
      const matchesCategory =
        !selectedCategoryFromState ||
        normalizeText(item?.categoryName) === selectedCategoryFromState;
      const matchesItem = normalizeText(item?.itemName) === itemKey;
      const matchesBuilding =
        !selectedBuildingFromState ||
        normalizeText(
          item?.buildingName ||
            item?.unit?.buildingName ||
            item?.unit?.building?.buildingName ||
            "",
        ) === selectedBuildingFromState;

      if (isOverallInventoryHistoryRoute) {
        return matchesCategory && matchesItem && matchesBuilding;
      }

      return normalizeUnitNo(item?.unitNo) === unitKey && matchesCategory && matchesItem;
    });

    return filtered
      .sort(
        (a, b) =>
          new Date(
            b?.createdAt || b?.rawDateTime || b?.date || b?.updatedAt || 0,
          ) -
          new Date(
            a?.createdAt || a?.rawDateTime || a?.date || a?.updatedAt || 0,
          ),
      )
      .map((item, index) => ({
        ...item,
        srNo: index + 1,
      }));
  }, [
    decodedItemName,
    decodedUnitNo,
    isOverallInventoryHistoryRoute,
    inventoryData,
    selectedCategoryFromState,
    selectedBuildingFromState,
  ]);

  const columns = useMemo(() => {
    const handleAssetClick = (params) => {
      setSelectedAsset(params.data);
      setIsViewModalOpen(true);
    };

    const renderClickableItem = (params) => (
      <span
        role="button"
        onClick={() => handleAssetClick(params)}
        className="text-primary cursor-pointer underline"
      >
        {params.value || "N/A"}
      </span>
    );

    const renderClickableBuilding = (params) => (
      <span
        role="button"
        onClick={() => handleAssetClick(params)}
        className="text-primary cursor-pointer underline"
      >
        {params.value || "N/A"}
      </span>
    );

    return [
      { field: "srNo", headerName: "Sr. No", width: 110 },
      ...(isOverallInventoryHistoryRoute
        ? [
            {
              field: "buildingName",
              headerName: "Building",
              minWidth: 190,
              flex: 1,
              cellRenderer: renderClickableBuilding,
            },
            {
              field: "remainingStock",
              headerName: "Remaining Stock",
              minWidth: 150,
              flex: 1,
              valueGetter: (params) =>
                params.data.newRemainingUnitValue ??
                params.data.remainingNewPurchaseInventoryUnits ??
                params.data.remainingOpeningInventoryUnits ??
                0,
              cellRenderer: (params) => {
                return inrFormat(params.value);
              },
            },
            {
              field: "itemName",
              headerName: "Item Name",
              flex: 1,
              minWidth: 180,
              cellRenderer: (params) => <span>{params.value || "N/A"}</span>,
            },
          ]
        : [
            {
              field: "itemName",
              headerName: "Item Name",
              flex: 1,
              minWidth: 180,
              cellRenderer: renderClickableItem,
            },
          ]),
      ...(!isOverallInventoryHistoryRoute
        ? [
            {
              field: "departmentName",
              headerName: "Department",
              hide: true,
            },
          ]
        : []),
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
      ...(isOverallInventoryHistoryRoute
        ? [
            {
              field: "remainingNewPurchaseInventoryUnits",
              headerName: "Closing Unit",
              flex: 1,
              minWidth: 150,
            },
          ]
        : []),
      {
        field: "lastConsumedUnitValue",
        headerName: "Last Consumed Unit Value",
        hide: true,
      },
      {
        field: "lastRemainingUnitValue",
        headerName: "Last Remaining Units",
        hide: true,
      },
      {
        field: "newConsumedUnitValue",
        headerName: "New Consumed Unit",
        hide: true,
      },
      {
        field: "newRemainingUnitValue",
        headerName: "New Remaining Units",
        hide: true,
      },
      {
        field: "addedByName",
        headerName: "Name",
        hide: true,
      },
      ...(!isOverallInventoryHistoryRoute
        ? [
            {
              field: "remainingNewPurchaseInventoryUnits",
              headerName: "Closing Unit",
              flex: 1,
              minWidth: 150,
            },
          ]
        : []),
      {
        field: "categoryName",
        headerName: "Category",
        flex: 1,
        minWidth: 160,
      },
      {
        field: "inventoryStamp",
        headerName: "Date",
        flex: 1,
        minWidth: 160,
        cellRenderer: (params) => params.value,
      },
    ];
  }, [isOverallInventoryHistoryRoute]);

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

  const tableTitle = isOverallInventoryHistoryRoute
    ? `Overall Inventory Item History - ${decodedItemName || "Item"} - ${resolvedCategoryName}`
    : `Inventory Item History - ${decodedItemName || "Item"} - ${resolvedCategoryName}`;

  return (
    <>
      <PageFrame>
        <AgTable
          data={historyRows}
          columns={columns}
          search={true}
          tableTitle={tableTitle}
          tableHeight={450}
         // hideFilter
          exportData
        />
      </PageFrame>

      <MuiModal
        open={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        title="View Details"
      >
        {selectedAsset &&
          (isOverallInventoryHistoryRoute ? (
            <div className="px-2 py-4 space-y-8">
              <div>
                <div className="font-bold mb-4">Item Information</div>
                <div className="space-y-4">
                  <DetalisFormatted
                    title="Item Name"
                    detail={selectedAsset.itemName || "N/A"}
                  />
                  <DetalisFormatted
                    title="Department"
                    detail={
                      selectedAsset.department?.name ||
                      selectedAsset.departmentName ||
                      selectedAsset.department ||
                      "N/A"
                    }
                  />
                  <DetalisFormatted
                    title="Building Name"
                    detail={selectedAsset.buildingName || "N/A"}
                  />
                  <DetalisFormatted
                    title="Category"
                    detail={selectedAsset.categoryName || "N/A"}
                  />
                  <DetalisFormatted
                    title="Date"
                    detail={formatDateTime(selectedAsset.rawDateTime)}
                  />
                </div>
              </div>

              <div>
                <div className="font-bold mb-4">Inventory Units</div>
                <div className="space-y-4">
                  <DetalisFormatted
                    title="Opening Units"
                    detail={
                      selectedAsset.openingInventoryUnits !== null &&
                      selectedAsset.openingInventoryUnits !== undefined
                        ? selectedAsset.openingInventoryUnits
                        : "NA"
                    }
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
                    detail={
                      selectedAsset.newPurchaseUnits !== null &&
                      selectedAsset.newPurchaseUnits !== undefined
                        ? selectedAsset.newPurchaseUnits
                        : "NA"
                    }
                  />
                  <DetalisFormatted
                    title="New Purchase Per Unit Price"
                    detail={
                      selectedAsset.newPurchasePerUnitPrice != null
                        ? `INR ${inrFormat(selectedAsset.newPurchasePerUnitPrice)}`
                        : "N/A"
                    }
                  />
                </div>
              </div>

              <div>
                <div className="font-bold mb-4">Inventory Value</div>
                <div className="space-y-4">
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
                </div>
              </div>

              <div>
                <div className="font-bold mb-4">Inventory Added By</div>
                <div className="space-y-4">
                  <DetalisFormatted
                    title="Name"
                    detail={selectedAsset.addedByName || "N/A"}
                  />
                </div>
              </div>
            </div>
          ) : (
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
                detail={formatDateTime(selectedAsset.rawDateTime)}
              />
              <DetalisFormatted
                title="Category"
                detail={selectedAsset.categoryName || "N/A"}
              />
              <br />

              <div className="font-bold">Inventory Units</div>

              <DetalisFormatted
                title="Opening Units"
                detail={
                  selectedAsset.openingInventoryUnits !== null &&
                  selectedAsset.openingInventoryUnits !== undefined
                    ? selectedAsset.openingInventoryUnits
                    : "NA"
                }
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
                detail={
                  selectedAsset.newPurchaseUnits !== null &&
                  selectedAsset.newPurchaseUnits !== undefined
                    ? selectedAsset.newPurchaseUnits
                    : "NA"
                }
              />
              <DetalisFormatted
                title="New Purchase Per Unit Price"
                detail={
                  selectedAsset.newPurchasePerUnitPrice != null
                    ? `INR ${inrFormat(selectedAsset.newPurchasePerUnitPrice)}`
                    : "N/A"
                }
              />
              {/* <DetalisFormatted
                            title="Closing Units"
                            detail={
                                selectedAsset?.remainingNewPurchaseInventoryUnits || 0
                            }
                        /> */}
              <DetalisFormatted
                title="Last Consumed Units"
                detail={
                  selectedAsset.lastConsumed ??
                  // selectedAsset.lastConsumedUnitValue ??
                  //selectedAsset.consumedOpenInventoryUnits ??
                  "0"
                }
              />
              <DetalisFormatted
                title="Last Remaining Units"
                detail={selectedAsset.remainingOpeningInventoryUnits ?? "0"}
              />
              <DetalisFormatted
                title="New Consumed Units"
                detail={
                  selectedAsset.totalConsumed ??
                  selectedAsset.consumedNewPurchaseInventoryUnits ??
                  "0"
                }
              />
              <DetalisFormatted
                title="New Remaining Units"
                detail={
                  selectedAsset.newRemainingUnitValue ??
                  selectedAsset.remainingNewPurchaseInventoryUnits ??
                  selectedAsset.closingInventoryUnits ??
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
          ))}
      </MuiModal>
    </>
  );
};

export default InventoryRecordHistory;
