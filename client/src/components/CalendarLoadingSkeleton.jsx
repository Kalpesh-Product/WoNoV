import { Skeleton } from "@mui/material";

const CalendarLoadingSkeleton = ({ label = "calendar" }) => (
  <div className="w-full min-w-0" role="status" aria-label={`Loading ${label}`}>
    <Skeleton variant="text" width="42%" height={44} className="mx-auto" />
    <div className="grid grid-cols-7 gap-2 overflow-hidden">
      {Array.from({ length: 35 }, (_, index) => (
        <Skeleton key={index} variant="rectangular" height={62} className="rounded-sm" />
      ))}
    </div>
  </div>
);

export default CalendarLoadingSkeleton;
