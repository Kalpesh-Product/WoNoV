import React, { useEffect, useState } from "react";
import AgTable from "../../../../components/AgTable";
import ThreeDotMenu from "../../../../components/ThreeDotMenu";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { Box, CircularProgress, IconButton, TextField } from "@mui/material";
import PrimaryButton from "../../../../components/PrimaryButton";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import { useMutation, useQuery } from "@tanstack/react-query";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import humanDate from "../../../../utils/humanDateForamt";
import { inrFormat } from "../../../../utils/currencyFormat";
import { toast } from "sonner";
import { queryClient } from "../../../../main";
import { IoCloseCircleOutline } from "react-icons/io5";
import { useNavigate } from "react-router-dom";
import { useDispatch } from "react-redux";
import { setVoucherDetails } from "../../../../redux/slices/financeSlice";
import PageFrame from "../../../../components/Pages/PageFrame";
import YearWiseTable from "../../../../components/Tables/YearWiseTable";

const PendingApprovals = () => {
  const navigate = useNavigate();
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const [selectedBudget, setSelectedBudget] = useState([]);
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const cellClasses = "border border-black p-2 text-xs align-top";
  const tableClasses = "w-full border border-black border-collapse mb-5";
  const { data: pendingApprovals = [], isPending: isPendingLoading } = useQuery(
    {
      queryKey: ["pendingApprovals"],
      queryFn: async () => {
        try {
          const response = await axios.get(`/api/budget/pending-approvals`);
          const budgets = response.data.allBudgets;
          return Array.isArray(budgets) ? budgets : [];
        } catch (error) {
          console.error("Error fetching budget:", error);
          return [];
        }
      },
    }
  );
  const {
    handleSubmit: reasonSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reason: "",
    },
  });
  const onSubmit = (data) => {
    rejectRequest(data);
    setModalOpen(false);
  };
  const { mutate: rejectRequest, isPending: isRejectPending } = useMutation({
    mutationKey: ["rejectRequest"],
    mutationFn: async (data) => {
      const response = await axios.patch(
        `/api/budget/reject-budget/${selectedBudget._id}`,
        data
      );
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message || "REQUEST REJECTED");
      queryClient.invalidateQueries({ queryKey: ["pendingApprovals"] });
      reset();
    },
    onError: (error) => {
      toast.error(error.message || "FAILED TO REJECT REQUEST");
    },
  });

  const { mutate: submitRequest, isPending: isSubmitRequest } = useMutation({
    mutationKey: ["approve"],
    mutationFn: async (formData) => {
      const response = await axios.patch(`/api/budget/approve-budget`, {
        budgetId: formData,
      });
      return response.data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      reset();
      navigate("/app/dashboard/finance-dashboard/billing/pending-approvals");
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  useEffect(() => {
    console.log("selected budget : ", selectedBudget);
  }, [selectedBudget]);

  const kraColumn = [
    { field: "srno", headerName: "Sr No", width: 100 },
    { field: "expanseName", headerName: "Expense Name ", width: 200 },
    { field: "department", headerName: "Department", width: 150 },
    { field: "expanseType", headerName: "Expense Type " },
    { field: "projectedAmount", headerName: "Amount (INR)" },
    { field: "reimbursementDate", headerName: "Date" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => {
        return (
          <>
            {isRejectPending ? (
              <div className="h-10 flex justify-center items-center">
                <CircularProgress />
              </div>
            ) : (
              <ThreeDotMenu
                rowId={params.data.id}
                menuItems={[
                  {
                    label: "View",
                    onClick: () => {
                      setSelectedBudget(params.data);
                      setModalType("view");
                      setModalOpen(true);
                    },
                  },
                  params.data.expanseType === "Reimbursement"
                    ? {
                        label: "Review",
                        onClick: () => {
                          dispatch(setVoucherDetails(params.data));
                          setSelectedBudget(params.data);
                          navigate(
                            `/app/dashboard/finance-dashboard/billing/pending-approvals/review-request`
                          );
                        },
                      }
                    : {
                        label: "Accept",
                        onClick: () => {
                          submitRequest(params.data._id);
                        },
                      },
                  {
                    label: "Reject",
                    onClick: () => {
                      setSelectedBudget(params.data);
                      setModalType("reject");
                      setModalOpen(true);
                    },
                  },
                ]}
              />
            )}
          </>
        );
      },
    },
  ];

  return (
    <div>
      <PageFrame>
        <YearWiseTable
          dateColumn={"date"}
          search={true}
          tableTitle={"Pending Approvals"}
          data={pendingApprovals.map((item, index) => {
            return {
              ...item,
              srNo: item.srNo,
              srno: index + 1,
              department: item.department?.name,
              reimbursementDate: humanDate(item.reimbursementDate),
              projectedAmount: inrFormat(item.projectedAmount),
            };
          })}
          columns={kraColumn}
        />
      </PageFrame>
      <div>
        <MuiModal
          open={modalOpen}
          onClose={() => setModalOpen(false)}
          title={"Invoice Details"}
        >
          {modalType === "reject" && (
            <form
              onSubmit={reasonSubmit(onSubmit)}
              className="flex flex-col gap-4"
            >
              <Controller
                name="reason"
                control={control}
                rules={{ required: "Reason is required" }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    label={"Reason"}
                    placeholder="Enter the reason"
                    multiline
                    fullWidth
                    rows={4}
                    error={!!errors.reason}
                    helperText={errors.reason?.message}
                  />
                )}
              />
              <PrimaryButton title={"Submit"} type={"submit"} />
            </form>
          )}

          {modalType === "view" && selectedBudget && (
            <div className="flex flex-col gap-4">
              {/* <DetalisFormatted title="Sr No" detail={selectedBudget.srNo} /> */}
              <DetalisFormatted
                title="Department"
                detail={selectedBudget.department}
              />
              <DetalisFormatted
                title="Expense Name"
                detail={selectedBudget.expanseName}
              />
              <DetalisFormatted
                title="Expense Type"
                detail={selectedBudget.expanseType}
              />
              <DetalisFormatted
                title="Amount (INR)"
                detail={selectedBudget.projectedAmount?.toLocaleString()}
              />
              <DetalisFormatted title="GSTIN" detail={selectedBudget.gstIn} />
              <DetalisFormatted title="Status" detail={selectedBudget.status} />
              <DetalisFormatted
                title="Paid Status"
                detail={selectedBudget.isPaid}
              />
              <DetalisFormatted
                title="Extra Budget"
                detail={selectedBudget.isExtraBudget ? "Yes" : "No"}
              />
              <DetalisFormatted
                title="Pre-Approved"
                detail={selectedBudget.preApproved}
              />
              <DetalisFormatted
                title="Emergency Approval"
                detail={selectedBudget.emergencyApproval}
              />
              <DetalisFormatted
                title="Budget Approval"
                detail={selectedBudget.budgetApproval}
              />
              <DetalisFormatted
                title="L1 Approval"
                detail={selectedBudget.l1Approval}
              />
              <DetalisFormatted
                title="Invoice Attached"
                detail={selectedBudget.invoiceAttached ? "Yes" : "No"}
              />
              <DetalisFormatted
                title="Invoice Name"
                detail={selectedBudget.invoice?.name}
              />
              <DetalisFormatted
                title="Invoice Link"
                detail={
                  <a
                    href={selectedBudget.invoice?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    View Invoice
                  </a>
                }
              />
              <DetalisFormatted
                title="Invoice Date"
                detail={humanDate(selectedBudget.invoiceDate)}
              />
              <DetalisFormatted
                title="Voucher Name"
                detail={selectedBudget.voucher?.name}
              />
              <DetalisFormatted
                title="Voucher Link"
                detail={
                  <a
                    href={selectedBudget.voucher?.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline cursor-pointer"
                  >
                    View Voucher
                  </a>
                }
              />

              <DetalisFormatted
                title="Reimbursement Date"
                detail={selectedBudget.reimbursementDate}
              />
              <DetalisFormatted
                title="Due Date"
                detail={humanDate(selectedBudget.dueDate)}
              />
            </div>
          )}
          {modalType === "review" && (
            <Box className="absolute top-1/2 left-1/2 bg-white p-4 rounded shadow max-h-screen overflow-y-auto w-[53%] -translate-x-1/2 -translate-y-1/2">
              <div className="flex justify-between items-center mb-2">
                <span className="text-title text-primary font-pbold uppercase">
                  Preview
                </span>
                <IconButton onClick={() => setModalOpen(false)}>
                  <IoCloseCircleOutline />
                </IconButton>
              </div>
              <div
                className="flex-1 p-4 border"
                style={{ width: "794px" }} // A4 width in pixels
              >
                <div className="text-center font-bold text-lg">
                  MUSTARO TECHNOSERVE PRIVATE LIMITED
                </div>
                <div className="text-center text-sm font-semibold">
                  FY{" "}
                  {new Date().getMonth() + 1 >= 4
                    ? `${String(new Date().getFullYear()).slice(2)}-${String(
                        new Date().getFullYear() + 1
                      ).slice(2)}`
                    : `${String(new Date().getFullYear() - 1).slice(
                        2
                      )}-${String(new Date().getFullYear()).slice(2)}`}
                </div>

                <div className="text-right text-xs text-gray-500">
                  Original for finance
                </div>

                {/* Department Info */}
                <div className="text-center text-sm mt-2">
                  DEPARTMENT - {selectedBudget?.department}
                </div>
                <div className="flex w-full justify-end items-end flex-col gap-2 text-sm my-2">
                  <div className="flex gap-2 items-end">
                    <p>S.No.</p>
                    <span className="w-28 border-b-default border-black py-1">
                      {/* {values.sNo || "DB"} */} DB
                    </span>
                  </div>
                  <div className="flex gap-2 items-end">
                    <p>Date</p>
                    <span className="w-28 border-b-default border-black py-1">
                      {humanDate(selectedBudget?.reimbursementDate)}
                    </span>
                  </div>
                </div>

                {/* First Voucher Table */}
                <div className="text-center font-bold text-base mb-4">
                  VOUCHER
                </div>
                <table className={tableClasses}>
                  <thead>
                    <tr>
                      <td className={cellClasses} colSpan={6}>
                        PARTICULARS (Details of Expenses)
                      </td>
                      <td className={cellClasses} colSpan={2}>
                        INR.
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedBudget.particulars?.map((item, idx) => (
                      <tr key={idx}>
                        <td className={cellClasses} colSpan={6}>
                          {item.particularName}
                        </td>
                        <td className={cellClasses} colSpan={2}>
                          {item.particularAmount}
                        </td>
                      </tr>
                    ))}
                    <tr>
                      <td className={cellClasses + " font-bold"} colSpan={6}>
                        Total
                      </td>
                      <td className={cellClasses + " font-bold"} colSpan={2}>
                        {selectedBudget?.particulars
                          ?.reduce(
                            (sum, item) =>
                              sum + Number(item.particularAmount || 0),
                            0
                          )
                          .toFixed(0)}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <table className={tableClasses}>
                  <tbody>
                    <tr>
                      <td className={cellClasses}>
                        Original Invoice is Attached with Voucher
                      </td>
                      <td className={cellClasses}>
                        {selectedBudget.invoiceAttached ? "Yes" : "No"}
                      </td>
                    </tr>
                    <tr>
                      <td className={cellClasses}>
                        Expenses is Pre Approved in Budget
                      </td>
                      <td className={cellClasses}>
                        {selectedBudget?.preApproved ? "Yes" : "No"}
                      </td>
                    </tr>
                    <tr>
                      <td className={cellClasses}>Date of Invoice Received</td>
                      <td className={cellClasses}>
                        {selectedBudget?.invoiceDate}
                      </td>
                    </tr>
                    <tr>
                      <td className={cellClasses}>Invoice No</td>
                      <td className={cellClasses}>
                        {selectedBudget?.invoiceNo}
                      </td>
                    </tr>
                    <tr>
                      <td className={cellClasses + " font-semibold"}>
                        (IF INVOICE IS NOT ATTACHED WITH VOUCHER) Date on which
                        the Invoice to be delivered to Finance Department.
                      </td>
                      <td className={cellClasses}>
                        {selectedBudget?.deliveryDate}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between text-xs mt-20 mb-4">
                  <div className="flex flex-col gap-20">
                    <span>(Signature)</span>
                    <span>(Department Manager)</span>
                  </div>
                  <div>(Signature) & Dept. Stamp</div>
                </div>

                <table className={tableClasses}>
                  <tbody>
                    <tr>
                      <td className={cellClasses}>
                        Expenses is Approved in Budget or other Approval
                      </td>
                      <td className={cellClasses}>
                        {selectedBudget?.emergencyApproval ? "Yes" : "No"}
                      </td>
                    </tr>
                    <tr>
                      <td className={cellClasses + " font-semibold"}>
                        If expenses is not Approved/Emergency Expenses (NEED
                        APPROVAL OF L1 Authority)
                      </td>
                      <td className={cellClasses}>
                        {selectedBudget?.budgetApproval ? "Yes" : "No"}
                      </td>
                    </tr>
                  </tbody>
                </table>

                <div className="flex justify-between text-xs mt-20 mb-4">
                  <div className="flex flex-col gap-20">
                    <span>(L1 Authority)</span>
                    <span>(Signature) & L1 Stamp</span>
                  </div>
                  <div>(Signature) & Dept. Stamp</div>
                </div>
              </div>
              <div className="mt-4 text-right flex gap-4 items-center justify-center">
                <PrimaryButton
                  title="Submit"
                  // handleSubmit={onUpload}
                  // disabled={isSubmitRequest}
                  // isLoading={isSubmitRequest}
                />

                <PrimaryButton
                  title="Export to PDF"
                  // handleSubmit={exportToPDF}
                />
              </div>
            </Box>
          )}
        </MuiModal>
      </div>
    </div>
  );
};

export default PendingApprovals;
