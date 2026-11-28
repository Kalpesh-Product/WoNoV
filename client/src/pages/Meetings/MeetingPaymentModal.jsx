import { useEffect } from "react";
import { MenuItem, TextField } from "@mui/material";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Controller, useForm } from "react-hook-form";
import { toast } from "sonner";
import MuiModal from "../../components/MuiModal";
import PrimaryButton from "../../components/PrimaryButton";
import UploadFileInput from "../../components/UploadFileInput";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const calculatePaymentDetails = (meeting, meetingRoom, discount, isBatch) => {
  const isInternal = meeting.meetingType === "Internal";
  if (!isInternal && !meetingRoom?.perHourPrice) return null;

  const slots = meeting.bookingSlots?.length ? meeting.bookingSlots : [meeting];
  const durationInHours = slots.reduce((hours, slot) =>
    hours + (new Date(slot.endTime) - new Date(slot.startTime)) / (1000 * 60 * 60), 0);

  const amount = isInternal ? meeting.paymentBaseAmount : meetingRoom.perHourPrice * durationInHours;
  const safeDiscount = Number.isFinite(discount) ? discount : 0;
  const discountedAmount = Math.max(amount - safeDiscount, 0);
  const gstAmount = isBatch
    ? safeDiscount
      ? Math.round(Math.max(Math.round(amount * 100) - Math.round(safeDiscount * 100), 0) * 0.18) / 100
      : meeting.paymentGstAmount
    : discountedAmount * 0.18;
  const finalAmount = discountedAmount + gstAmount;
  const discountPercentage = amount
    ? ((safeDiscount / amount) * 100).toFixed(2)
    : "0.00";

  return {
    amount: amount.toFixed(2),
    gstAmount: gstAmount.toFixed(2),
    finalAmount: finalAmount.toFixed(2),
    discountPercentage,
  };
};

export default function MeetingPaymentModal({ meeting: paymentMeeting, batch, onClose, onSaved }) {
  const axios = useAxiosPrivate();
  const isInternal = paymentMeeting.meetingType === "Internal";
  const isBatch = Boolean(batch);
  const paymentModes = [
    "UPI",
    "Cash",
    "Cheque",
    "NEFT",
    "RTGS",
    "IMPS",
    "Credit Card",
    "ETC",
  ];

  const {
    handleSubmit: handlePaymentSubmit,
    control: paymentControl,
    formState: { errors: paymentErrors },
    setValue: setPaymentValue,
    watch: paymentWatch,
  } = useForm({
    defaultValues: {
      amount: "",
      paymentType: paymentMeeting.paymentMode || "",
      paymentStatus: isBatch ? "Paid" : paymentMeeting.paymentStatus === true ? "Paid" : paymentMeeting.paymentStatus || "",
      paymentProof: "",
      discountAmount: paymentMeeting.discountAmount ?? paymentMeeting.paymnetDiscountAmount ?? 0,
      discountPercentage: "",
      gstAmount: "",
      finalAmount: "",
    },
  });

  const watchedDiscountAmount = paymentWatch("discountAmount");

  const { data: room } = useQuery({
    queryKey: ["room", paymentMeeting?.roomName],
    queryFn: async () => {
      const response = await axios.get(
        `/api/meetings/get-room/${paymentMeeting.roomName}`,
      );
      return response.data;
    },
    enabled: !isInternal && !!paymentMeeting?.roomName,
  });

  const { isPending: isPaymentPending, mutate: updatePayment } = useMutation({
    mutationKey: ["meeting-payment"],
    mutationFn: async (data) => {
      if (batch) {
        const response = await axios.post("/api/meetings/client-credit-payment", data);
        return response.data;
      }
      const response = await axios.patch(
        `/api/meetings/update-meeting/${data.get("meetingId")}`,
        data,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        },
      );
      return response.data;
    },
    onSuccess: () => {
      toast.success("Payment details updated successfully");
      onSaved();
      onClose();
    },
    onError: (error) => {
      if (isBatch && error.response?.status === 409) {
        onSaved();
        onClose();
      }
      toast.error(
        error?.response?.data?.message ||
          error?.response?.data?.error ||
          error?.message ||
          "Payment update failed",
      );
    },
  });

  useEffect(() => {
    const details = calculatePaymentDetails(paymentMeeting, room, Number(watchedDiscountAmount), isBatch);
    if (!details) return;

    setPaymentValue("amount", details.amount);
    setPaymentValue("discountPercentage", details.discountPercentage);
    setPaymentValue("gstAmount", details.gstAmount);
    setPaymentValue("finalAmount", details.finalAmount);
  }, [watchedDiscountAmount, room, paymentMeeting, setPaymentValue, isBatch]);

  return (
    <MuiModal
      open
      onClose={onClose}
      title={isBatch ? "Payment Details" : "Update Payment Details"}
    >
      <form
        className="flex flex-col gap-4"
        onSubmit={handlePaymentSubmit((data) => {
          const formData = new FormData();

          if (batch) {
            formData.append("clientId", batch.clientId);
            formData.append("startDate", batch.startDate);
            formData.append("endDate", batch.endDate);
            formData.append("meetingIds", JSON.stringify(batch.meetingIds));
            formData.append("paymentGstQuoted", paymentMeeting.paymentGstAmount);
          }

          formData.append("paymentAmount", data?.finalAmount);
          formData.append("paymentMode", data?.paymentType);
          formData.append("paymentStatus", data?.paymentStatus);
          formData.append("meetingId", paymentMeeting?._id);
          formData.append("discountAmount", data?.discountAmount || 0);
          formData.append("paymentBaseAmount", data?.amount || 0);
          formData.append("paymentGstAmount", data?.gstAmount || 0);
          formData.append("unitsOrHours", "Hours");
          formData.append("taxable", data?.amount || 0);
          formData.append("gst", data?.gstAmount || 0);
          formData.append("status", data?.paymentStatus);
          formData.append(
            "client",
            paymentMeeting?.externalClient || paymentMeeting?.client || "",
          );
          formData.append("meetingRoomName", paymentMeeting?.roomName || "");

          if (data?.paymentProof) {
            formData.append("paymentProof", data.paymentProof);
          }
          updatePayment(formData);
        })}
      >
        {batch && <p>{batch.dateLabel} ({batch.meetingIds.length} outstanding meetings)</p>}
        {isInternal && <p>Uncovered credits: {paymentMeeting.overageCredits}</p>}
        <div className="flex gap-4 items-center">
          <Controller
            name="amount"
            control={paymentControl}
            rules={{ required: "Amount is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                disabled
                label="Amount"
                type="number"
                size="small"
                fullWidth
                error={!!paymentErrors.amount}
                helperText={paymentErrors.amount?.message}
              />
            )}
          />
          <Controller
            name="gstAmount"
            control={paymentControl}
            rules={{ required: "GST Amount is required" }}
            render={({ field }) => (
              <TextField
                {...field}
                disabled
                label="GST Amount"
                type="number"
                size="small"
                fullWidth
                error={!!paymentErrors.gstAmount}
                helperText={paymentErrors.gstAmount?.message}
              />
            )}
          />
        </div>

        <div className="flex gap-4 items-center">
          <Controller
            name="discountAmount"
            control={paymentControl}
            render={({ field }) => (
              <TextField
                {...field}
                label="Discount Amount"
                type="number"
                size="small"
                fullWidth
                inputProps={{ step: "0.01" }}
                onBlur={(event) => {
                  field.onBlur();
                  const value = event.target.value;
                  if (value !== "" && Number.isFinite(Number(value))) {
                    field.onChange(Number(value).toFixed(2));
                  }
                }}
                error={!!paymentErrors.discountAmount}
                helperText={paymentErrors.discountAmount?.message}
              />
            )}
          />
          <Controller
            name="discountPercentage"
            control={paymentControl}
            render={({ field }) => (
              <TextField
                {...field}
                disabled
                label="Discount %"
                type="string"
                size="small"
                fullWidth
                error={!!paymentErrors.discountPercentage}
                helperText={paymentErrors.discountPercentage?.message}
              />
            )}
          />
        </div>
        <Controller
          name="finalAmount"
          control={paymentControl}
          rules={{ required: "Final Amount is required" }}
          render={({ field }) => (
            <TextField
              {...field}
              disabled
              label="Final Amount"
              type="number"
              size="small"
              fullWidth
              error={!!paymentErrors.finalAmount}
              helperText={paymentErrors.finalAmount?.message}
            />
          )}
        />
        <div className="flex gap-4 items-center">
          <Controller
            name="paymentType"
            control={paymentControl}
            render={({ field }) => (
              <TextField
                {...field}
                size="small"
                label="Payment Type"
                select
                fullWidth
              >
                <MenuItem value="" disabled>
                  Select Payment Type
                </MenuItem>
                {paymentModes.map((p) => {
                  return <MenuItem key={p} value={p}>{p}</MenuItem>;
                })}
              </TextField>
            )}
          />
          {!isBatch && (
            <Controller
              name="paymentStatus"
              control={paymentControl}
              rules={{ required: "Payment status is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  select
                  label="Payment Status"
                  size="small"
                  fullWidth
                  error={!!paymentErrors.paymentStatus}
                  helperText={paymentErrors.paymentStatus?.message}
                >
                  <MenuItem value="Paid">Paid</MenuItem>
                  <MenuItem value="Unpaid">Unpaid</MenuItem>
                </TextField>
              )}
            />
          )}
        </div>
        <Controller
          name="paymentProof"
          control={paymentControl}
          render={({ field }) => (
            <UploadFileInput
              value={field.value}
              label="Add Payment Proof"
              onChange={field.onChange}
              allowedExtensions={["pdf", "jpg", "jpeg", "png"]}
              previewType="pdf"
            />
          )}
        />
        <div>
          <p className="text-xs">
            Add payment proof as : ( "Add Payment Proof in PDF, jpg, jpeg, png
            format & Name as : DD-MM-YYYY_(Customer Name)" )
          </p>
        </div>
        <div className="flex justify-center">
          <PrimaryButton
            disabled={isPaymentPending}
            className="w-full"
            title={"Save Payment Details"}
            type={"submit"}
          />
        </div>
      </form>
    </MuiModal>
  );
}
