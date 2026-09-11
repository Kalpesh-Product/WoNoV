import { useMemo, useState } from "react";
import { CircularProgress, TextField } from "@mui/material";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { HiPencilSquare } from "react-icons/hi2";
import { MdDeleteForever } from "react-icons/md";
import AgTable from "../../components/AgTable";
import MuiModal from "../../components/MuiModal";
import ConfirmationModal from "../../components/ConfirmationModal";
import PrimaryButton from "../../components/PrimaryButton";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

const DepartmentTicketSettings = () => {
  const axios = useAxiosPrivate();
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const { departmentName, departmentId: legacyDepartmentId } = useParams();
  const [modal, setModal] = useState(null);
  const [title, setTitle] = useState("");

  const { data: departments = [], isLoading } = useQuery({
    queryKey: ["department-ticket-settings"],
    queryFn: async () => {
      const { data } = await axios.get(
        "/api/company/get-company-data?field=selectedDepartments"
      );
      return data?.selectedDepartments || [];
    },
  });

  const selectedDepartment = useMemo(
    () => departments.find((item) =>
      departmentName
        ? item.department?.name === departmentName || item.department?._id === departmentName
        : legacyDepartmentId && item.department?._id === legacyDepartmentId
    ),
    [departments, departmentName, legacyDepartmentId]
  );
  const departmentId = selectedDepartment?.department?._id;

  const mutation = useMutation({
    mutationFn: async ({ method, issueId, issueTitle }) => {
      const url = `/api/tickets/department-ticket-issues/${departmentId}${
        issueId ? `/${issueId}` : ""
      }`;
      const { data } = await axios({
        method,
        url,
        data: method === "delete" ? undefined : { title: issueTitle },
      });
      return data;
    },
    onSuccess: (data) => {
      toast.success(data.message);
      queryClient.invalidateQueries({ queryKey: ["department-ticket-settings"] });
      setModal(null);
      setTitle("");
    },
    onError: (error) =>
      toast.error(error.response?.data?.message || "Unable to save ticket issue"),
  });

  const openForm = (mode, issue) => {
    setTitle(issue?.title || "");
    setModal({ mode, issue });
  };

  const departmentColumns = [
    { headerName: "Sr No", field: "srNo", flex: 1 },
    {
      headerName: "Department",
      field: "department",
      flex: 1,
      cellRenderer: ({ data, value }) => (
        <button
          className="text-primary font-pregular hover:underline"
          onClick={() => navigate(`/app/tickets/ticket-settings/${encodeURIComponent(value)}`)}
        >
          {value}
        </button>
      ),
    },
    { headerName: "Ticket Issue Count", field: "issueCount", width: 200 },
  ];

  const issueColumns = [
    { headerName: "Sr No", field: "srNo",flex: 1 },
    { headerName: "Ticket Issue", field: "title", flex: 1 },
    {
      headerName: "Actions",
      field: "actions",
      pinned: "right",
      cellRenderer: ({ data }) => (
        <div className="flex items-center gap-3 h-full">
          <button
            type="button"
            title="Edit Ticket Issue"
            aria-label={`Edit ${data.title}`}
            disabled={mutation.isPending}
            onClick={() => openForm("edit", data)}
            className="p-1 h-7 w-7 flex items-center justify-center disabled:cursor-not-allowed"
          >
            <HiPencilSquare size={22} className="shrink-0" color={mutation.isPending ? "#9ca3af" : "#111827"} />
          </button>
          <button
            type="button"
            title="Delete Ticket Issue"
            aria-label={`Delete ${data.title}`}
            disabled={mutation.isPending}
            onClick={() => setModal({ mode: "delete", issue: data })}
            className="p-1 h-7 w-7 flex items-center justify-center disabled:cursor-not-allowed"
          >
            <MdDeleteForever size={22} className="shrink-0" color={mutation.isPending ? "gray" : "red"} />
          </button>
        </div>
      ),
    },
  ];

  if (selectedDepartment && (legacyDepartmentId || departmentName === departmentId)) {
    return (
      <Navigate
        to={`/app/tickets/ticket-settings/${encodeURIComponent(selectedDepartment.department.name)}`}
        replace
      />
    );
  }

  if (isLoading) {
    return <div className="flex justify-center p-20"><CircularProgress /></div>;
  }

  const departmentRows = departments.map((item, index) => ({
    id: item.department?._id,
    srNo: index + 1,
    department: item.department?.name,
    issueCount: item.ticketIssues?.length || 0,
  }));
  const issueRows = (selectedDepartment?.ticketIssues || []).map((issue, index) => ({
    id: issue._id,
    srNo: index + 1,
    title: issue.title,
  }));
  const totalIssues = selectedDepartment
    ? issueRows.length
    : departmentRows.reduce((total, department) => total + department.issueCount, 0);

  return (
    <div className={`flex flex-col p-4 ${
      selectedDepartment ? "h-[calc(80vh-4px)] min-h-[360px]" : "gap-4"
    }`}>
      <div className={`flex flex-col gap-4 p-4 border-default border-borderGray rounded-xl ${
        selectedDepartment ? "flex-1 min-h-0" : ""
      }`}>
          {!selectedDepartment && <div className="w-full pb-3">
            <div className="flex justify-between items-center gap-3 flex-wrap">
              <span className="text-title text-primary font-pmedium uppercase">
                Department Wise Tickets Issues
              </span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <div className="flex gap-1 justify-center items-center uppercase bg-[#dbe4ff] text-sm text-[#274784] font-pmedium px-3 py-1.5 rounded-lg border border-[#aec6fb]">
                  <div>Total Issues :</div>
                  <div>{totalIssues}</div>
                </div>
              </div>
            </div>
          </div>}
          <AgTable
            key={departmentId || "departments"}
            data={selectedDepartment ? issueRows : departmentRows}
            columns={selectedDepartment ? issueColumns : departmentColumns}
            tableTitle={selectedDepartment
              ? `${selectedDepartment.department.name} Ticket Issues`
              : "Department Wise Tickets Issues"}
            hideTitle={!selectedDepartment}
            search={Boolean(selectedDepartment)}
            headerActions={selectedDepartment ? (
              <>
                <div className="flex gap-1 justify-center items-center uppercase bg-[#dbe4ff] text-sm text-[#274784] font-pmedium px-3 py-1.5 rounded-lg border border-[#aec6fb]">
                  <span>Total Issues :</span>
                  <span>{totalIssues}</span>
                </div>
                <PrimaryButton title="Add Ticket Issues" handleSubmit={() => openForm("add")} />
              </>
            ) : undefined}
            exportData={Boolean(selectedDepartment)}
            fillAvailableHeight={Boolean(selectedDepartment)}
            hideFilter
          />
      </div>

      <MuiModal
        open={modal?.mode === "add" || modal?.mode === "edit"}
        onClose={() => setModal(null)}
        title={`${modal?.mode === "edit" ? "Edit" : "Add"} Ticket Issue`}
      >
        <form
          className="flex flex-col gap-4"
          onSubmit={(event) => {
            event.preventDefault();
            mutation.mutate({
              method: modal.mode === "edit" ? "patch" : "post",
              issueId: modal.issue?.id,
              issueTitle: title.trim(),
            });
          }}
        >
          <TextField
            autoFocus
            required
            size="small"
            fullWidth
            label="Ticket Issue"
            InputLabelProps={{ sx: { "& .MuiFormLabel-asterisk": { display: "none" } } }}
            value={title}
            onChange={(event) => setTitle(event.target.value)}
          />
          <PrimaryButton title={modal?.mode === "edit" ? "Update" : "Submit"} type="submit" isLoading={mutation.isPending} />
        </form>
      </MuiModal>

      <ConfirmationModal
        open={modal?.mode === "delete"}
        title="Delete Issues"
        onClose={() => setModal(null)}
        isLoading={mutation.isPending}
        onConfirm={() => mutation.mutate({ method: "delete", issueId: modal.issue.id })}
      />
    </div>
  );
};

export default DepartmentTicketSettings;
