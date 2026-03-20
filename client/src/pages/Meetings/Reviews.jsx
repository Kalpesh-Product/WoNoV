import React, { useEffect, useMemo, useState } from "react";
import { Tabs, Tab } from "@mui/material";
import WidgetSection from "../../components/WidgetSection";
import DataCard from "../../components/DataCard";
import AgTable from "../../components/AgTable";
import MuiModal from "../../components/MuiModal";
import TextField from "@mui/material/TextField";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { Controller, useForm } from "react-hook-form";
import useAuth from "../../hooks/useAuth";
import { toast } from "sonner";
import { queryClient } from "../../main";
import humanDate from "../../utils/humanDateForamt";
import PageFrame from "../../components/Pages/PageFrame";
import { noOnlyWhitespace } from "../../utils/validators";
import ThreeDotMenu from "../../components/ThreeDotMenu";
import DetalisFormatted from "../../components/DetalisFormatted";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import PrimaryButton from "../../components/PrimaryButton";
import { PERMISSIONS } from "../../constants/permissions";
import { useLocation, useNavigate } from "react-router-dom";

const Reviews = () => {
  const axios = useAxiosPrivate();
  const navigate = useNavigate();
  const location = useLocation();
  const { auth } = useAuth();
  // const [activeTab, setActiveTab] = useState("clientCredit");
  const [openModal, setOpenModal] = useState(false);
  const [modalType, setModalType] = useState("creditView");
  const [selectedData, setSelectedData] = useState({});
  const [creditEdits, setCreditEdits] = useState({});

  const userPermissions = useMemo(
    () => auth?.user?.permissions?.permissions || [],
    [auth?.user?.permissions?.permissions]
  );

  const tabItems = useMemo(
    () => [
      {
        key: "clientCredit",
        label: "Client Credit",
        path: "/app/meetings/client-credit",
        permission: PERMISSIONS.MEETINGS_CLIENT_CREDIT.value,
      },
      {
        key: "clientReview",
        label: "Client Review",
        path: "/app/meetings/client-review",
        permission: PERMISSIONS.MEETINGS_CLIENT_REVIEW.value,
      },
    ],
    []
  );

  const visibleTabs = useMemo(
    () => tabItems.filter((tab) => userPermissions.includes(tab.permission)),
    [tabItems, userPermissions]
  );

  const activeTabIndex = Math.max(
    visibleTabs.findIndex((tab) => tab.path === location.pathname),
    0
  );

  const activeTabKey = visibleTabs[activeTabIndex]?.key || null;

  useEffect(() => {
    if (visibleTabs.length === 0) return;

    const isPathAllowed = visibleTabs.some((tab) => tab.path === location.pathname);
    if (!isPathAllowed) {
      navigate(visibleTabs[0].path, { replace: true });
    }
  }, [location.pathname, navigate, visibleTabs]);

  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      reply: "",
      monthlyCredit: "",
      consumedCredit: "",
    },
  });

  const handleOpenModal = (data, type) => {
    setSelectedData(data || {});
    setModalType(type);
    setOpenModal(true);

    if (type === "reviewReply") {
      reset({
        reply: data?.replyText || "",
        monthlyCredit: "",
        consumedCredit: "",
      });
      return;
    }

    if (type === "creditEdit") {
      reset({
        reply: "",
        monthlyCredit: data?.monthlyCredit || "",
        consumedCredit: data?.consumedCredit || "",
      });
      return;
    }

    reset({ reply: "", monthlyCredit: "", consumedCredit: "" });
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedData({});
    setModalType("reviewView");
    reset({ reply: "", monthlyCredit: "", consumedCredit: "" });
  };

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      const response = await axios.get("/api/meetings/get-reviews");
      return response.data;
    },
    enabled: activeTabKey === "clientReview",
  });

  const { data: clientsData = [], isLoading: isClientsLoading } = useQuery({
    queryKey: ["co-working-clients"],
    queryFn: async () => {
      const response = await axios.get("/api/sales/co-working-clients");
      return response.data.filter((client) => client.isActive);
    },
    enabled: activeTabKey === "clientCredit",
  });

  const { mutate: replyReview, isPending: isReplyReviewPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/meetings/create-reply", {
        reviewId: selectedData.id,
        reply: data.reply,
        replierEmail: auth.user.email,
        replierName: auth.user.firstName,
      });
      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      handleCloseModal();
      queryClient.invalidateQueries(["reviews"]);
    },
    onError: function (error) {
      toast.error(error?.response?.data?.message || error.message);
    },
  });

  const submitCreditEdit = (formValues) => {
    const monthlyCredit = Number(formValues.monthlyCredit);
    const consumedCredit = Number(formValues.consumedCredit);

    if (consumedCredit > monthlyCredit) {
      toast.error("Consumed credit cannot be greater than monthly credit");
      return;
    }

    setCreditEdits((prev) => ({
      ...prev,
      [selectedData.clientId]: { monthlyCredit, consumedCredit },
    }));

    toast.success("Client credit updated in UI");
    handleCloseModal();
  };

  const reviewColumns = [
    { field: "srno", headerName: "Sr No" },
    { field: "nameofreview", headerName: "User", flex: 1 },
    { field: "date", headerName: "Date" },
    {
      field: "rate",
      headerName: "Rating",
      cellRenderer: (params) => (
        <div>
          ⭐ {typeof params.value === "number" ? params.value.toFixed(2) : params.value}{" "}
          <small>Out of 5</small>
        </div>
      ),
    },
    {
      field: "Reviews",
      headerName: "Review",
      flex: 2,
      cellStyle: {
        whiteSpace: "nowrap",
        overflow: "hidden",
        textOverflow: "ellipsis",
      },
      tooltipField: "Reviews",
    },
    {
      field: "action",
      headerName: "Actions",
      flex: 1,
      cellRenderer: (params) => (
        <div className="flex gap-2 items-center">
          <div
            onClick={() => handleOpenModal(params.data, "reviewView")}
            className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all"
          >
            <span className="text-subtitle">
              <MdOutlineRemoveRedEye />
            </span>
          </div>

          <ThreeDotMenu
            rowId={params.data.id}
            menuItems={[
              {
                label: !params.data.replyText ? "Reply to Review" : "Replied",
                onClick: () => handleOpenModal(params.data, "reviewReply"),
                disabled: !!params.data.replyText,
              },
            ]}
          />
        </div>
      ),
    },
  ];

  const clientCreditRows = useMemo(
    () =>
      clientsData.map((client, index) => {
        const clientId = client?._id;
        const fallbackMonthly = Number(client?.totalMeetingCredits || 0);
        const fallbackBalance = Number(client?.meetingCreditBalance || 0);
        const fallbackConsumed = Math.max(fallbackMonthly - fallbackBalance, 0);

        const editedValues = creditEdits[clientId];
        const monthlyCredit = editedValues?.monthlyCredit ?? fallbackMonthly;
        const consumedCredit = editedValues?.consumedCredit ?? fallbackConsumed;

        return {
          id: index + 1,
          srNo: index + 1,
          clientId,
          clientName: client?.clientName || "-",
          monthlyCredit: Number(monthlyCredit).toFixed(2),
          consumedCredit: Number(consumedCredit).toFixed(2),
          remainingCredit: Math.max(monthlyCredit - consumedCredit).toFixed(2),
        };
      }),
    [clientsData, creditEdits]
  );

  const clientCreditColumns = [
    { field: "srNo", headerName: "Sr No", width: 90 },
    { field: "clientName", headerName: "Client Name", flex: 1 },
    { field: "monthlyCredit", headerName: "Monthly Credit", flex: 1 },
    { field: "consumedCredit", headerName: "Consumed Credit", flex: 1 },
    { field: "remainingCredit", headerName: "Remaining Credit", flex: 1 },
    {
      field: "action",
      headerName: "Action",
      flex: 1,
      cellRenderer: (params) => (
        <div className="flex gap-2 items-center">
          <div
            onClick={() => handleOpenModal(params.data, "creditView")}
            className="hover:bg-gray-200 cursor-pointer p-2 rounded-full transition-all"
          >
            <span className="text-subtitle">
              <MdOutlineRemoveRedEye />
            </span>
          </div>

          {/* <ThreeDotMenu
            rowId={`credit-${params.data.clientId}`}
            menuItems={[
              {
                label: "Edit",
                onClick: () => handleOpenModal(params.data, "creditEdit"),
              },
            ]}
          /> */}
        </div>
      ),
    },
  ];

  const averageRatings =
    reviews.length > 0
      ? (
        reviews.reduce((acc, curr) => acc + curr.rate, 0) / reviews.length
      ).toFixed(2)
      : "0.00";

  return (
    <div className="p-4">
      {visibleTabs.length > 0 && (
        <Tabs
          value={activeTabIndex}
          variant="fullWidth"
          TabIndicatorProps={{ style: { display: "none" } }}
          sx={{
            backgroundColor: "white",
            borderRadius: 2,
            border: "1px solid #d1d5db",
            overflow: "hidden",
            "& .MuiTab-root": {
              textTransform: "none",
              fontWeight: "medium",
              color: "#1E3D73",
              borderRight: "0.1px solid #d1d5db",
            },
            "& .Mui-selected": {
              backgroundColor: "#1E3D73",
              color: "white !important",
            },
          }}
        >
          {visibleTabs.map((tab) => (
            <Tab key={tab.key} label={tab.label} onClick={() => navigate(tab.path)} />
          ))}
        </Tabs>
      )}

      <div className="py-4">
        {activeTabKey === "clientReview" ? (
          <>
            <WidgetSection layout={2}>
              <DataCard data={reviews.length} title="Total" description="Reviews Count" />
              <DataCard data={`${averageRatings} ⭐`} title="Average" description=" Ratings" />
            </WidgetSection>

            <div className="pt-4">
              <PageFrame>
                <AgTable
                  search={true}
                  tableTitle="Client Reviews"
                  searchColumn={"nameofreview"}
                  data={reviews.map((review, index) => {
                    const replyText =
                      typeof review.reply === "string"
                        ? review.reply
                        : review.reply?.text || "";
                    const hasReply = !!replyText;

                    return {
                      id: review._id,
                      srno: index + 1,
                      nameofreview: review.reviewerName,
                      date: humanDate(review.createdAt),
                      rate: review.rate,
                      Reviews: review.review,
                      replyText,
                      action: hasReply ? "Replied" : "Reply Review",
                    };
                  })}
                  columns={reviewColumns}
                />
              </PageFrame>
            </div>
          </>
        ) : activeTabKey === "clientCredit" ? (
          <PageFrame>
            <AgTable
              search={true}
              tableTitle="Client Credits"
              searchColumn={"clientName"}
              data={clientCreditRows}
              columns={clientCreditColumns}
              loading={isClientsLoading}
            />
          </PageFrame>
        ) : null}
      </div>

      <MuiModal
        open={openModal}
        onClose={handleCloseModal}
        title={
          modalType === "reviewReply"
            ? "Reply to Review"
            : modalType === "creditView"
              ? "Client Credit Details"
              : modalType === "creditEdit"
                ? "Edit Client Credit"
                : "Review Details"
        }
      >
        {modalType === "reviewView" && (
          <div className="space-y-4">
            <DetalisFormatted title="User" detail={selectedData.nameofreview} />
            <DetalisFormatted title="Date" detail={selectedData.date} />
            <DetalisFormatted
              title="Rating"
              detail={
                typeof selectedData.rate === "number"
                  ? `${selectedData.rate.toFixed(2)} / 5`
                  : selectedData.rate || "—"
              }
            />
            <DetalisFormatted title="Review" detail={selectedData.Reviews} />
            <DetalisFormatted title="Reply" detail={selectedData.replyText || "No reply yet"} />
          </div>
        )}

        {modalType === "reviewReply" && (
          <div className="space-y-5">
            <div className="p-2 space-y-6">
              <p className="font-pmedium text-subtitle">{selectedData.nameofreview || "—"}</p>
              <p>
                ⭐ {selectedData.rate} <small> out of 5</small>
              </p>
              <p className="text-sm text-content">{selectedData.Reviews || "—"}</p>
            </div>

            <form onSubmit={handleSubmit(replyReview)} className="flex flex-col gap-4">
              <Controller
                name="reply"
                control={control}
                rules={{
                  required: "Please add a review",
                  validate: {
                    noOnlyWhitespace,
                  },
                }}
                render={({ field }) => (
                  <TextField
                    {...field}
                    type="text"
                    label="Reply"
                    fullWidth
                    error={!!errors.reply}
                    helperText={errors.reply?.message}
                    multiline
                    rows={5}
                  />
                )}
              />

              <PrimaryButton
                title={"Submit"}
                type={"submit"}
                isLoading={isReplyReviewPending}
                disabled={isReplyReviewPending}
              />
            </form>
          </div>
        )}

        {modalType === "creditView" && (
          <div className="space-y-4">
            <DetalisFormatted title="Client Name" detail={selectedData.clientName} />
            <DetalisFormatted title="Monthly Credit" detail={selectedData.monthlyCredit} />
            <DetalisFormatted title="Consumed Credit" detail={selectedData.consumedCredit} />
            <DetalisFormatted title="Remaining Credit" detail={selectedData.remainingCredit} />
          </div>
        )}

        {modalType === "creditEdit" && (
          <form onSubmit={handleSubmit(submitCreditEdit)} className="flex flex-col gap-4">
            <Controller
              name="monthlyCredit"
              control={control}
              rules={{ required: "Monthly credit is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Monthly Credit"
                  fullWidth
                  error={!!errors.monthlyCredit}
                  helperText={errors.monthlyCredit?.message}
                />
              )}
            />

            <Controller
              name="consumedCredit"
              control={control}
              rules={{ required: "Consumed credit is required" }}
              render={({ field }) => (
                <TextField
                  {...field}
                  type="number"
                  label="Consumed Credit"
                  fullWidth
                  error={!!errors.consumedCredit}
                  helperText={errors.consumedCredit?.message}
                />
              )}
            />

            <PrimaryButton title={"Save"} type={"submit"} />
          </form>
        )}
      </MuiModal>
    </div>
  );
};

export default Reviews;