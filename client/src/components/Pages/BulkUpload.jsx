import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import usePageDepartment from "../../hooks/usePageDepartment";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "../../main";
import YearWiseTable from "../Tables/YearWiseTable";
import PrimaryButton from "../PrimaryButton";
import { MdUpload } from "react-icons/md";
import { IoMdDownload } from "react-icons/io";
import WidgetSection from "../WidgetSection";
import { useMemo } from "react";
import { Chip } from "@mui/material";

export default function BulkUpload() {
  const axios = useAxiosPrivate();
  const deptDetails = usePageDepartment();

  const { data: departmentDocuments, isPending: isTemplatesPending } = useQuery(
    {
      queryKey: ["department-templates"],
      queryFn: async () => {
        const response = await axios.get(
          `/api/company/department-templates/${deptDetails._id}`
        );
        return response.data;
      },
    }
  );

  const formattedTemplates = useMemo(() => {
    if (!departmentDocuments?.templates) return [];
    return departmentDocuments.templates.map((template, index) => ({
      srNo: index + 1,
      name: template.name,
      documentLink: template.documentLink,
      isActive: template.isActive ? "Active" : "Inactive",
      date: template.createdAt,
      updatedAt: template.updatedAt,
    }));
  }, [departmentDocuments]);

  const templateColumns = [
    {
      headerName: "S.No.",
      field: "srNo",
      maxWidth: 80,
    },
    {
      headerName: "Template Name",
      field: "name",
      flex: 1,
    },
    {
      headerName: "Status",
      field: "isActive",
      cellRenderer: () => {
        const statusColorMap = {
          Inactive: { backgroundColor: "#FFECC5", color: "#CC8400" }, // Light orange bg, dark orange font
          Active: { backgroundColor: "#90EE90", color: "#006400" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap["Active"] || {
          backgroundColor: "gray",
          color: "white",
        };
        return (
          <>
            <Chip
              label={"Active"}
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
    },
    {
      headerName: "Date",
      field: "date",
    },
    {
      headerName: "Last Modified",
      field: "updatedAt",
    },
    {
      headerName: "Download",
      field: "documentLink",
      cellRenderer: (params) => (
        <div className="p-2">
          <a href={params.data.documentLink}>
            <IoMdDownload size={20} />
          </a>
        </div>
      ),
    },
  ];

  return (
    <div className=" flex flex-col gap-4">

      <div>
        <WidgetSection border title="Bulk Upload Data templates">
          <YearWiseTable
            data={formattedTemplates}
            columns={templateColumns}
            dateColumn="date"
            formatDate={true}
          />
        </WidgetSection>
      </div>
    </div>
  );
}
