import { MenuItem, Skeleton } from "@mui/material";
import TableLoadingSkeleton from "../../../components/Tables/TableLoadingSkeleton";

const defaultColumns = [
  { field: "first", flex: 1 },
  { field: "second", flex: 1.5 },
  { field: "third", flex: 1 },
  { field: "fourth", flex: 1 },
];

const AdminLoadingSkeleton = ({
  variant = "details",
  columns = defaultColumns,
  rowCount = 6,
  cardCount = 6,
}) => {
  if (variant === "table") {
    return (
      <div
        className="w-full min-w-0 overflow-hidden rounded-lg border border-gray-200"
        aria-busy="true"
      >
        <TableLoadingSkeleton columns={columns} rowCount={rowCount} />
      </div>
    );
  }

  if (variant === "chart") {
    return (
      <div className="w-full min-w-0 p-4" aria-busy="true">
        <Skeleton variant="text" width="38%" height={32} />
        <Skeleton variant="rounded" width="100%" height={250} />
      </div>
    );
  }

  if (variant === "cards") {
    return (
      <div
        className="grid w-full min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
        aria-busy="true"
      >
        {Array.from({ length: cardCount }, (_, index) => (
          <Skeleton
            key={index}
            variant="rounded"
            width="100%"
            height={120}
          />
        ))}
      </div>
    );
  }

  if (variant === "calendar") {
    return (
      <div className="w-full min-w-0 p-4" aria-busy="true">
        <Skeleton variant="text" width="30%" height={28} />
        <div className="mt-3 grid grid-cols-7 gap-2">
          {Array.from({ length: 35 }, (_, index) => (
            <Skeleton
              key={index}
              variant="rounded"
              className="h-16 w-full"
            />
          ))}
        </div>
      </div>
    );
  }

  if (variant === "option") {
    return (
      <MenuItem disabled aria-busy="true">
        <Skeleton variant="text" width={120} height={20} />
      </MenuItem>
    );
  }

  return (
    <div className="w-full min-w-0 space-y-3 p-4" aria-busy="true">
      {Array.from({ length: 5 }, (_, index) => (
        <div
          key={index}
          className="grid grid-cols-[minmax(0,1fr)_minmax(0,2fr)] gap-4"
        >
          <Skeleton variant="text" height={28} />
          <Skeleton variant="text" height={28} />
        </div>
      ))}
    </div>
  );
};

export default AdminLoadingSkeleton;
