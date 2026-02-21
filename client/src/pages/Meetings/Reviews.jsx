import React, { useEffect, useState } from "react";
import WidgetSection from "../../components/WidgetSection";
import DataCard from "../../components/DataCard";
import AgTable from "../../components/AgTable";
import MuiModal from "../../components/MuiModal";
import { Chip } from "@mui/material";
import { PiArrowBendUpLeftBold } from "react-icons/pi";
import { PiArrowBendLeftDownBold } from "react-icons/pi";
import MuiAside from "../../components/MuiAside";
import PrimaryButton from "../../components/PrimaryButton";
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

const Reviews = () => {
  const axios = useAxiosPrivate();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [sidebarMode, setSidebarMode] = useState("view");
  const [reviewData, setReviewData] = useState({});
  const {
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    mode: "onChange",
    defaultValues: {
      reply: "",
    },
  });
  const { auth } = useAuth();

  const handleOpenSidebar = (data, mode = "view") => {
    setReviewData(data);
    setSidebarMode(mode);
    setOpenSidebar(true);
    reset({ reply: mode === "reply" ? data?.replyText || "" : "" });
  };

  const handleCloseSidebar = () => {
    setOpenSidebar(false);
    setSidebarMode("view");
    reset({ reply: "" });
  };

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/meetings/get-reviews");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { mutate: replyReview, isPending: isReplyReviewPending } = useMutation({
    mutationFn: async (data) => {
      const response = await axios.post("/api/meetings/create-reply", {
        reviewId: reviewData.id,
        reply: data.reply,
        replierEmail: auth.user.email,
        replierName: auth.user.firstName,
      });
      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      handleCloseSidebar();
      setOpenSidebar(false);
      queryClient.invalidateQueries(["reviews"]);
    },
    onError: function (error) {
      toast.error(error.message);
    },
  });

  const departmentsColumn = [
    { field: "srno", headerName: "Sr No" },
    {
      field: "nameofreview",
      headerName: "User",
      flex: 1,
    },
    { field: "date", headerName: "Date" },
    {
      field: "rate",
      headerName: "Rating",
      cellRenderer: (params) => (
        <div>
          ⭐{" "}
          {typeof params.value === "number"
            ? params.value.toFixed(2)
            : params.value}{" "}
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
      // cellRenderer: (params) => {
      //   const statusColorMap = {
      //     "Reply Review": { backgroundColor: "#E8FEF1", color: "#527160" }, // Light orange bg, dark orange font
      //     Replied: { backgroundColor: "#EAEAEA", color: "#868686" }, // Light green bg, dark green font
      //   };

      //   const { backgroundColor, color } = statusColorMap[params.value] || {
      //     backgroundColor: "gray",
      //     color: "white",
      //   };

      //   const handleClick = () => {
      //     if (params.value === "Reply Review") {
      //       // Trigger modal open when "Reply Review" is clicked
      //       setOpenSidebar(true);
      //       setReviewData(params.data); // Optional: You can pass the row data to the modal
      //     }
      //   };

      //   return (
      //     <>
      //       <Chip
      //         label={
      //           params.value === "Reply Review" ? (
      //             <div
      //               className="flex flex-row items-center justify-center gap-2"
      //               onClick={handleClick}
      //             >
      //               <PiArrowBendLeftDownBold />
      //               {params.value}
      //             </div>
      //           ) : (
      //             <div className="flex flex-row items-center justify-center gap-2">
      //               <PiArrowBendUpLeftBold />
      //               {params.value}
      //             </div>
      //           )
      //         }
      //         style={{
      //           backgroundColor,
      //           color,
      //         }}
      //       />
      //     </>
      //   );
      // },
      cellRenderer: (params) => (
        <div className="flex gap-2 items-center">
          <div
            onClick={() => handleOpenSidebar(params.data, "view")}
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
                onClick: () => handleOpenSidebar(params.data, "reply"),
                disabled: !!params.data.replyText,
              },
            ]}
          />
        </div>
      ),
      flex: 1,
    },
  ];

  const averageRatings =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rate, 0) / reviews.length
        ).toFixed(2)
      : "0.00";

  // const averageRatings = rating

  return (
    <>
      <div>
        <WidgetSection layout={2}>
          <DataCard
            data={reviews.length}
            title="Total"
            description="Reviews Count"
          />
          <DataCard
            data={`${averageRatings} ⭐`}
            title="Average"
            description=" Ratings"
          />
          {/* <DataCard data="10.0k" title="Total" description="Reviews Count" /> */}
        </WidgetSection>

        <div className="p-6">
          <PageFrame>
            <AgTable
              search={true}
              searchColumn={"Policies"}
              // data={[
              //   ...reviews.map((review, index) => ({
              //     id: review._id,
              //     srno: index + 1,
              //     nameofreview: review.reviewerName,
              //     date: humanDate(review.createdAt),
              //     rate: review.rate,
              //     Reviews: review.review,
              //     reply: review.reply,
              //     action: review?.reply ? "Replied" : "Reply Review",
              //   })),
              // ]}
              data={[
                ...reviews.map((review, index) => {
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
                    replierName: review.reply?.replierName || "",
                    replierEmail: review.reply?.replierEmail || "",
                    action: hasReply ? "Replied" : "Reply Review",
                  };
                }),
              ]}
              columns={departmentsColumn}
            />
          </PageFrame>
        </div>

        <MuiModal
          open={openSidebar}
          // onClose={() => setOpenSidebar(false)}
          // title={"Reviews"}
          onClose={handleCloseSidebar}
          title={sidebarMode === "reply" ? "Reply to Review" : "Review Details"}
        >
          {sidebarMode === "view" ? (
            <div className="space-y-4">
              <DetalisFormatted title="User" detail={reviewData.nameofreview} />
              <DetalisFormatted title="Date" detail={reviewData.date} />
              <DetalisFormatted
                title="Rating"
                detail={
                  typeof reviewData.rate === "number"
                    ? `${reviewData.rate.toFixed(2)} / 5`
                    : reviewData.rate || "—"
                }
              />
              <DetalisFormatted title="Review" detail={reviewData.Reviews} />

              <DetalisFormatted
                title="Reply"
                detail={reviewData.replyText || "No reply yet"}
              />
            </div>
          ) : (
            <div className="space-y-5">
              <div className="p-2 space-y-6">
                <p className="font-pmedium text-subtitle">
                  {reviewData.nameofreview || "—"}
                </p>
                <p>
                  ⭐ {reviewData.rate} <small> out of 5</small>
                </p>
                <p className="text-sm text-content">
                  {reviewData.Reviews || "—"}
                </p>
              </div>

              <form
                onSubmit={handleSubmit(replyReview)}
                className="flex flex-col gap-4"
              >
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
                      id="outlined-multiline-flexible"
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
        </MuiModal>
      </div>
    </>
  );
};

export default Reviews;
