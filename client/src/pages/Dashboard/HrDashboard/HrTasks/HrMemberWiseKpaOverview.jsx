import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useDispatch } from "react-redux";
import { useParams } from "react-router-dom";

import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import {
  setSelectedDepartment,
  setSelectedDepartmentName,
} from "../../../../redux/slices/performanceSlice";
import PerformanceMemberWiseKraKpa from "../../../Performance/PerformanceMemberWiseKraKpa";

const HrMemberWiseKpaOverview = () => {
  const axios = useAxiosPrivate();
  const dispatch = useDispatch();
  const { department } = useParams();
  const [isDepartmentSynchronized, setIsDepartmentSynchronized] =
    useState(false);

  const { data: fetchedDepartments = [], isFetched } = useQuery({
    queryKey: ["hrKraDepartments"],
    queryFn: async () => {
      const response = await axios.get("/api/performance/get-depts-tasks");
      return Array.isArray(response.data) ? response.data : [];
    },
  });

  const departmentId = useMemo(() => {
    const matchedDepartment = fetchedDepartments.find(
      (item) => item?.department?.name === department,
    );
    return matchedDepartment?.department?._id || "";
  }, [department, fetchedDepartments]);

  useEffect(() => {
    if (!isFetched) return;

    dispatch(setSelectedDepartment(departmentId));
    dispatch(setSelectedDepartmentName(department));
    setIsDepartmentSynchronized(true);
  }, [department, departmentId, dispatch, isFetched]);

  if (!isDepartmentSynchronized) return null;

  const memberDetailsBasePath = `/app/dashboard/HR-dashboard/mix-bag/department-kpa-kra/department-KPA/${encodeURIComponent(department)}/member-wise`;

  return (
    <PerformanceMemberWiseKraKpa memberDetailsBasePath={memberDetailsBasePath} />
  );
};

export default HrMemberWiseKpaOverview;
