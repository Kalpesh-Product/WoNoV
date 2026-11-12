import DetalisFormatted from "./DetalisFormatted";
import humanTime from "../utils/humanTime";

const getTimestamp = (value) => {
  if (!value) return null;

  const timestamp = new Date(value).getTime();
  return Number.isNaN(timestamp) ? null : timestamp;
};

const formatExtensionDuration = (durationInMinutes) => {
  const hours = Math.floor(durationInMinutes / 60);
  const minutes = durationInMinutes % 60;

  return [hours ? `${hours} hr` : "", minutes ? `${minutes} min` : ""]
    .filter(Boolean)
    .join(" ");
};

const MeetingTimeDetails = ({ startTime, endTime, extendTime, duration, bookingSlots, gap }) => {
  const hasMultipleSlots = Array.isArray(bookingSlots) && bookingSlots.length > 1;
  const startTimestamp = getTimestamp(startTime);
  const endTimestamp = getTimestamp(endTime);
  const extendTimestamp = getTimestamp(extendTime);
  const hasExtension =
    endTimestamp !== null &&
    extendTimestamp !== null &&
    extendTimestamp > endTimestamp;
  const effectiveEndTime = hasExtension ? extendTime : endTime;
  const effectiveEndTimestamp = hasExtension ? extendTimestamp : endTimestamp;
  const computedDurationInMinutes = hasMultipleSlots
    ? bookingSlots.reduce((total, slot) => {
        const slotStart = getTimestamp(slot.startTime);
        const slotEnd = getTimestamp(slot.endTime);
        return total + (slotStart !== null && slotEnd !== null && slotEnd > slotStart
          ? Math.round((slotEnd - slotStart) / (1000 * 60)) : 0);
      }, 0)
    : startTimestamp !== null && effectiveEndTimestamp !== null && effectiveEndTimestamp > startTimestamp
      ? Math.round((effectiveEndTimestamp - startTimestamp) / (1000 * 60))
      : 0;
  const displayDuration =
    duration ||
    (computedDurationInMinutes
      ? formatExtensionDuration(computedDurationInMinutes)
      : "");
  const extensionDurationInMinutes = hasExtension
    ? Math.round((extendTimestamp - endTimestamp) / (1000 * 60))
    : 0;

  return (
    <>
      <DetalisFormatted
        title="Time"
        gap={gap}
        detail={
          startTime && effectiveEndTime
            ? `${humanTime(startTime)} - ${humanTime(effectiveEndTime)}`
            : "N/A"
        }
      />
      {displayDuration && (
        <DetalisFormatted title="Duration" detail={displayDuration} gap={gap} />
      )}
      {hasExtension && (
        <>
          <DetalisFormatted
            title="Extended Time"
            gap={gap}
            detail={`${humanTime(endTime)} - ${humanTime(extendTime)}`}
          />
          <DetalisFormatted
            title="Extended Duration"
            gap={gap}
            detail={formatExtensionDuration(extensionDurationInMinutes)}
          />
        </>
      )}
    </>
  );
};

export default MeetingTimeDetails;
