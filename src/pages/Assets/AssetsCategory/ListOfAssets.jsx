import { useState } from "react";
import AgTable from "../../../components/AgTable";
import PrimaryButton from "../../../components/PrimaryButton";
import AssetModal from "./AssetModal";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";

const ListOfAssets = () => {
  const axios = useAxiosPrivate()
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);

  const assetColumns = [
    { field: "id", headerName: "ID" },
    { field: "department", headerName: "Department" },
    // { field: "assetNumber", headerName: "Asset Number" },
    { field: "category", headerName: "Category" },
    { field: "brand", headerName: "Brand" },
    { field: "price", headerName: "Price" },
    { field: "quantity", headerName: "Quantity" },
    { field: "purchaseDate", headerName: "Purchase Date" },
    { field: "warranty", headerName: "Warranty (Months)" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <PrimaryButton
          title="Details"
          handleSubmit={() => handleDetailsClick(params.data)}
        />
      ),
    },
  ];

  const { data: assetsList = [] } = useQuery({
    queryKey: "assetsList",
    queryFn: async () => {
      try {
        const response = await axios.get("/api/assets/get-assets");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
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

  const handleSubmit = async () => {
    if (modalMode === "add") {
      // Logic to add new asset
      try {
        // await axios.post('/api/assets', assetData);
      } catch (error) {
        console.error("Error adding asset:", error);
      }
    } else if (modalMode === "edit") {
      // Logic to update existing asset
      try {
        // await axios.put(`/api/assets/${assetData.id}`, assetData);
      } catch (error) {
        console.error("Error updating asset:", error);
      }
    }
  };

  return (
    <>
      <AgTable
        key={assetsList.length}
        search={true}
        searchColumn={"Asset Number"}
        tableTitle={"List of Assets"}
        buttonTitle={"Add Asset"}
        data={[...assetsList.map((asset,index) => ({
          id : index +1,
          department : asset.department.name,
          category : asset.name,
          brand : asset.brand,
          price : asset.price,
          quantity : asset.quantity,
          purchaseDate : new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"short",year:"numeric"}).format(new Date(asset.purchaseDate)),
          warranty : asset.warranty,
          vendorName : asset.vendor.name
        }))]}
        columns={assetColumns}
        handleClick={handleAddAsset}
      />

      <AssetModal
        mode={modalMode}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSubmit}
        assetData={selectedAsset}
        onModeChange={setModalMode}
      />
    </>
  );
};

export default ListOfAssets;
