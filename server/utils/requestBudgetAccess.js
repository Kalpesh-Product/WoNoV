const PERMISSION_BY_DEPARTMENT = Object.freeze({
  "6798bab0e469e809084e249a": "finance_request_budget_button",
  "6798bab9e469e809084e249e": "hr_request_budget_button",
  "6798bacce469e809084e24a1": "sales_request_budget_button",
  "6798bae6e469e809084e24a4": "admin_request_budget_button",
  "6798bafbe469e809084e24a7": "maintenance_request_budget_button",
  "6798baa8e469e809084e2497": "it_request_budget_button",
  "6798ba9de469e809084e2494": "frontend_request_budget_button",
});

const getRequestBudgetPermission = (department) => {
  const mapped = PERMISSION_BY_DEPARTMENT[String(department?._id)];
  if (mapped) return mapped;
  const name = department?.name?.toLowerCase();
  if (name === "cafe") return "cafe_request_budget_button";
  if (name === "legal") return "legal_request_budget_button";
  return null;
};

// Dependencies are injected so authorization can be tested without a database.
const createRequestBudgetGuard = ({ Department, Permission, isValidObjectId }) =>
  async (req, res, next) => {
    if (!req.user || !req.company) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    const { departmentId } = req.params;
    if (!isValidObjectId(departmentId)) {
      return res.status(400).json({ message: "Invalid department ID" });
    }
    try {
      const department = await Department.findById(departmentId).select("name").lean().exec();
      if (!department) {
        return res.status(404).json({ message: "Department not found" });
      }
      const requiredPermission = getRequestBudgetPermission(department);
      const assigned = await Permission.findOne({ user: req.user }).select("permissions").lean().exec();
      if (!requiredPermission || !Array.isArray(assigned?.permissions) ||
          !assigned.permissions.includes(requiredPermission)) {
        return res.status(403).json({ message: "You do not have permission to request budget for this department" });
      }
      return next();
    } catch (error) {
      return next(error);
    }
  };

module.exports = { getRequestBudgetPermission, createRequestBudgetGuard };
