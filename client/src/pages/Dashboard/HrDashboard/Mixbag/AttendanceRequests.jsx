import React, { useState } from "react";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import { useQuery } from "@tanstack/react-query";
import humanDate from "../../../../utils/humanDateForamt";
import MuiModal from "../../../../components/MuiModal";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import { HiOutlinePencilSquare } from "react-icons/hi2";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";

const AttendanceRequests = () => {
  const axios = useAxiosPrivate();
  const [selectedEntry, setSelectedEntry] = useState([]);
  const [openModal, setOpenModal] = useState();
  const { data, isLoading } = useQuery({
    queryKey: ["attendance-requests"],
    queryFn: async () => {
      try {
        const response = await axios.get(
          "/api/attendance/get-attendance-requests"
        );
        const filtered = response.data.filter(
          (item) => item.status !== "Approved"
        );
        return filtered;
      } catch (error) {
        console.warn(error.mesage);
      }
    },
  });

  const handleViewUser = (data) => {
    setSelectedEntry(data);
    setOpenModal(true);
  };
  const columns = [
    { field: "srNo", headerName: "SrNo", width: 100 },
    { field: "name", headerName: "Name", flex: 1 },
    { field: "date", headerName: "Date" },
    { field: "inTime", headerName: "Start Time" },
    { field: "outTime", headerName: "End Time" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <div className="flex items-center gap-4 py-2">
          <ThreeDotMenu
            rowId={params.data.id}
            menuItems={[
              {
                label: "Accept",
                onClick: () => handleViewUser(params.data),
                isLoading: isLoading,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const tableData = isLoading
    ? []
    : data.map((item) => ({
        ...item,
        empId: item.user?.empId,
        name: `${item.user?.firstName} ${item.user?.lastName}`,
        date: item.inTime,
      }));
      console.log(tableData)
  return (
    <div className="flex flex-col">
      <PageFrame>
        <YearWiseTable
          dateColumn={"date"}
          columns={columns}
          data={tableData}
          tableTitle={"ATTENDANCE REQUESTS"}
        />
      </PageFrame>
      <MuiModal
        title={"Review Request"}
        open={openModal}
        onClose={() => setOpenModal(false)}
      >
        hello
      </MuiModal>
    </div>
  );
};

export default AttendanceRequests;
