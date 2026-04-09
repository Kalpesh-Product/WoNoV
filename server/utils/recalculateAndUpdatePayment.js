const recalculateAndUpdatePayment = async ({
  meeting,
  startTime,
  endTime,
  paymentPayload = {},
  company,
}) => {
  const durationInMs = endTime - startTime;
  const durationInHours = durationInMs / (1000 * 60 * 60);

  const perHourCost = meeting.bookedRoom.perHourPrice || 0;

  const baseAmount = durationInHours * perHourCost;
  const gstAmount = baseAmount * 0.18;
  const totalAmount = baseAmount + gstAmount;

  const updatedFields = {
    paymentBaseAmount: Number(baseAmount.toFixed(2)),
    paymentGstAmount: Number(gstAmount.toFixed(2)),
    paymentAmount: Number(totalAmount.toFixed(2)),
    ...paymentPayload, // overrides if manual values passed
  };

  // ✅ Update Meeting
  const updatedMeeting = await Meeting.findByIdAndUpdate(
    meeting._id,
    { $set: updatedFields },
    { new: true },
  );

  // ✅ Upsert Meeting Revenue (IMPORTANT)
  await MeetingRevenue.findOneAndUpdate(
    { meeting: meeting._id },
    {
      $set: {
        date: updatedMeeting.startDate,
        company,
        client: updatedMeeting.externalClient?.registeredClientCompany || "",
        particulars: "Meeting room booking",
        unitsOrHours: "Hours",
        costPerHour: meeting.bookedRoom.perHourPrice,
        meetingRoomName: meeting.bookedRoom?.name,
        taxable: updatedFields.paymentBaseAmount,
        gst: updatedFields.paymentGstAmount,
        totalAmount: updatedFields.paymentAmount,
        paymentDate: updatedMeeting.startDate,
        status: updatedMeeting.paymentStatus ? "Paid" : "Unpaid",
        remarks: updatedMeeting.paymentMode,
        meeting: updatedMeeting._id,
        hoursBooked: durationInHours,
      },
    },
    { upsert: true, new: true },
  );

  return updatedMeeting;
};
