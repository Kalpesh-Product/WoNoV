+13 - 0;

import dayjs from "dayjs";

const formatDateTime = (value) => {
  if (!value) return "N/A";

  const parsed = dayjs(value);

  if (!parsed.isValid()) return "N/A";

  return parsed.format("DD-MM-YYYY, hh:mm A");
};

export default formatDateTime;
