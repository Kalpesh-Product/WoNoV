import { useEffect, useMemo, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocation, useNavigate } from "react-router-dom";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import ViewPayroll from "../Finance/ViewPayroll";

const CompensationStructure = () => {
  const axios = useAxiosPrivate();
  const location = useLocation();
  const navigate = useNavigate();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [month, setMonth] = useState(
    location.state?.month || dayjs().format("YYYY-MM")
  );

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["compensationStructureEmployees"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return (response.data || []).filter((employee) => employee.isActive);
    },
  });

  useEffect(() => {
    const employeeId = location.state?.employeeId;
    if (!employeeId || selectedEmployee || employees.length === 0) return;
    const employee = employees.find((item) => item._id === employeeId);
    if (employee) setSelectedEmployee(employee);
  }, [employees, location.state?.employeeId, selectedEmployee]);

  const routeState = useMemo(() => {
    if (!selectedEmployee) return null;

    return {
      empId: selectedEmployee._id,
      month,
      status: "Pending",
      employeeName: `${selectedEmployee.firstName || ""} ${selectedEmployee.lastName || ""}`.trim(),
      departmentName:
        selectedEmployee.departments?.[0]?.name ||
        selectedEmployee.department?.name ||
        "",
      employeeId: selectedEmployee.empId,
      designation: selectedEmployee.designation || "",
    };
  }, [month, selectedEmployee]);

  return (
    <div className="flex flex-col gap-4">
      <PageFrame>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <Autocomplete
            options={employees}
            value={selectedEmployee}
            loading={isLoading}
            onChange={(_, employee) => setSelectedEmployee(employee)}
            getOptionLabel={(employee) =>
              `${employee.firstName || ""} ${employee.lastName || ""} (${employee.empId || "N/A"})`.trim()
            }
            isOptionEqualToValue={(option, value) => option._id === value._id}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Employee"
                placeholder="Search employee"
                InputProps={{
                  ...params.InputProps,
                  endAdornment: (
                    <>
                      {isLoading ? <CircularProgress size={18} /> : null}
                      {params.InputProps.endAdornment}
                    </>
                  ),
                }}
              />
            )}
          />
          <TextField
            label="Effective Pay Period"
            type="month"
            value={month}
            onChange={(event) => setMonth(event.target.value)}
            InputLabelProps={{ shrink: true }}
          />
        </div>
      </PageFrame>

      {routeState && (
        <ViewPayroll
          routeState={routeState}
          compensationOnly
          onCompensationSaved={
            location.state?.runPayroll
              ? async () => {
                  const { batchName, payPeriod } = location.state.runPayroll;
                  await navigate(
                    `/app/dashboard/HR-dashboard/mix-bag/payroll?resume=true&batchName=${encodeURIComponent(
                      batchName
                    )}&payPeriod=${encodeURIComponent(payPeriod)}`,
                    { state: { runPayroll: location.state.runPayroll } }
                  );
                }
              : undefined
          }
        />
      )}
    </div>
  );
};

export default CompensationStructure;
