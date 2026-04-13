import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import PageFrame from "../../components/Pages/PageFrame";
import WidgetSection from "../../components/WidgetSection";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import {
    setSelectedDepartment,
    setSelectedDepartmentName,
} from "../../redux/slices/performanceSlice";

const PerformanceAssignKraKpa = () => {
    const axios = useAxiosPrivate();
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const { data: departmentMembers = [] } = useQuery({
        queryKey: ["performanceAccessibleDepartments"],
        queryFn: async () => {
            const response = await axios.get("/api/access/department-wise-employees");
            return response.data?.data || [];
        },
    });

    // Sort departments by number of members in descending order
    const sortedDepartments = [...departmentMembers].sort((a, b) => {
        const countA = a?.employees?.length || 0;
        const countB = b?.employees?.length || 0;
        return countB - countA; // Descending order
    });

    const handleMemberClick = (department) => {
        dispatch(setSelectedDepartment(department?._id));
        dispatch(setSelectedDepartmentName(department?.name));
          navigate("/app/performance/assign-kra-kpa/team-Daily-KRA");
    };

    return (
        <WidgetSection border title="DEPARTMENT">
            {sortedDepartments.length === 0 ? (
                <p className="text-sm text-gray-500">No departments found.</p>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                    {sortedDepartments.map((department) => {
                        const members = department?.employees || [];
                        const memberCount = members.length;

                        return (
                            <div
                                key={department?._id || department?.name}
                                className="rounded-xl border border-gray-200 p-4 bg-white"
                            >
                                <div className="flex items-center justify-between gap-2 mb-3">
                                    <h3 className="text-base font-semibold text-gray-800">
                                        {department?.name || "Unknown Department"}
                                    </h3>
                                    <span className="text-xs font-medium text-gray-500">
                                        {memberCount} member{memberCount === 1 ? "" : "s"}
                                    </span>
                                </div>

                                {memberCount === 0 ? (
                                    <p className="text-sm text-gray-500">
                                        No active members in this department.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {members.map((member) => {
                                            const fullName =
                                                `${member?.firstName || ""} ${member?.lastName || ""}`.trim();

                                            return (
                                                <li
                                                    key={member?._id || `${department?._id}-${fullName}`}
                                                    className="text-sm text-gray-700 text-primary font-pregular hover:underline cursor-pointer"
                                                    onClick={() => handleMemberClick(department)}
                                                >
                                                    • {fullName || member?.email || "Unknown member"}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </div>
                        );
                    })}
                </div>
            )}
        </WidgetSection>
    );
};

export default PerformanceAssignKraKpa;