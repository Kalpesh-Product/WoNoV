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

    const handleMemberClick = (department) => {
        dispatch(setSelectedDepartment(department?._id));
        dispatch(setSelectedDepartmentName(department?.name));
        navigate(`/app/performance/${department?.name}/team-Daily-KRA`);
    };

    return (
        <PageFrame>
            <WidgetSection border title="DEPARTMENT">
                {departmentMembers.length === 0 ? (
                    <p className="text-sm text-gray-500">No departments found.</p>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
                        {departmentMembers.map((department) => {
                            const members = department?.employees || [];

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
                                            {members.length} member{members.length === 1 ? "" : "s"}
                                        </span>
                                    </div>

                                    {members.length === 0 ? (
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
        </PageFrame>
    );
};

export default PerformanceAssignKraKpa;