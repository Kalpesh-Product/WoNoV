import dayjs from "dayjs";

const buildDateFilterPayload = ({
  startDate = dayjs().startOf("month"),
  endDate = dayjs().endOf("month"),
  field = "createdAt",
} = {}) => {
  if (!field) return { dateFilter: {} };

  return {
    dateFilter: {
      [field]: {
        $gte: dayjs(startDate).startOf("day").toISOString(),
        $lte: dayjs(endDate).endOf("day").toISOString(),
      },
    },
  };
};

export default buildDateFilterPayload;
