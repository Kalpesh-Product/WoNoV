import { useState } from "react";
import AgTable from "../../components/AgTable";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import useAuth from "../../hooks/useAuth";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import PageFrame from "../../components/Pages/PageFrame";
import usePageDepartment from "../../hooks/usePageDepartment";

const DepartmentAssetCommon = (disabled) => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const department = usePageDepartment();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);

  const assetColumns = [
    { field: "id", headerName: "Sr No", width: 100 },
    { field: "department", headerName: "Department" },
    { field: "inventoryNumber", headerName: "Inventory Number" },
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
        <div
          onClick={() => {
            handleDetailsClick(params.data);
          }}
          className="hover:bg-gray-200 cursor-pointer p-2 px-0 rounded-full transition-all w-1/4 flex justify-center"
        >
          <span className="text-subtitle">
            <MdOutlineRemoveRedEye />
          </span>
        </div>
      ),
    },
  ];

  const assetsList = [
    {
      department: "Maintenance",
      inventoryNumber: "0001",
      category: "Chair",
      brand: "Ergosphere",
      price: 45000,
      quantity: 2,
      purchaseDate: "11-11-2024",
      warranty: 12,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0002",
      category: "Chair",
      brand: "Ergosphere",
      price: 50000,
      quantity: 3,
      purchaseDate: "10-10-2024",
      warranty: 24,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0003",
      category: "Chair",
      brand: "Ergosphere",
      price: 120000,
      quantity: 1,
      purchaseDate: "12-09-2024",
      warranty: 36,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0004",
      category: "Chair",
      brand: "Ergosphere",
      price: 40000,
      quantity: 4,
      purchaseDate: "01-08-2024",
      warranty: 12,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0005",
      category: "Chair",
      brand: "Ergosphere",
      price: 60000,
      quantity: 5,
      purchaseDate: "15-07-2024",
      warranty: 18,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0001",
      category: "Chair",
      brand: "Ergosphere",
      price: 65000,
      quantity: 2,
      purchaseDate: "27-11-2024",
      warranty: 12,
    },
    {
      department: "Maintenance",
      inventoryNumber: "0001",
      category: "Chair",
      brand: "Ergosphere",
      price: 65000,
      quantity: 2,
      purchaseDate: "21-11-2024",
      warranty: 12,
    },
    {
      department: "IT",
      inventoryNumber: "0006",
      category: "Laptop",
      brand: "Dell",
      price: 75000,
      quantity: 5,
      purchaseDate: "05-12-2024",
      warranty: 36,
    },
    {
      department: "Finance",
      inventoryNumber: "0007",
      category: "Printer",
      brand: "HP",
      price: 25000,
      quantity: 2,
      purchaseDate: "18-11-2024",
      warranty: 12,
    },
  ];

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

  return (
    <>
      <PageFrame>
        <AgTable
          key={assetsList.length}
          search={true}
          searchColumn={"Asset Number"}
          tableTitle={"Department Asset List"}
          buttonTitle={"Add Asset"}
          disabled={disabled}
          data={[]}
          columns={assetColumns}
          handleClick={handleAddAsset}
        />
      </PageFrame>
    </>
  );
};

export default DepartmentAssetCommon;
