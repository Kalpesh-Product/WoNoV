import { useMemo, useState } from "react";
import { Autocomplete, CircularProgress, TextField } from "@mui/material";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import PageFrame from "../../../../components/Pages/PageFrame";
import ViewPayroll from "../Finance/ViewPayroll";

const CompensationStructure = () => {
  const axios = useAxiosPrivate();
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [month, setMonth] = useState(dayjs().format("YYYY-MM"));

  const { data: employees = [], isLoading } = useQuery({
    queryKey: ["compensationStructureEmployees"],
    queryFn: async () => {
      const response = await axios.get("/api/users/fetch-users");
      return (response.data || []).filter((employee) => employee.isActive);
    },
  });

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
        <ViewPayroll routeState={routeState} compensationOnly />
      )}
    </div>
  );
};

export default CompensationStructure;
