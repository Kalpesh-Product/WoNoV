const isMongoId = (value) =>
  typeof value === "string" && /^[a-f\d]{24}$/i.test(value);

const getUserName = (user) => {
  const direct = typeof user === "string" && !isMongoId(user) ? user : "";

  return (
    direct ||
    user?.employeeName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    user?.name ||
    user?.email ||
    "-"
  );
};

export default getUserName;
