import React, { useEffect, useState } from "react";
import WidgetSection from "../../components/WidgetSection";
import DataCard from "../../components/DataCard";
import AgTable from "../../components/AgTable";
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

const VisitorReviews = () => {
  const axios = useAxiosPrivate();
  const [openSidebar, setOpenSidebar] = useState(false);
  const [reviewData, setReviewData] = useState({});
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      reply: "",
    },
  });
  const { auth } = useAuth();

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
      setOpenSidebar(false);
      queryClient.invalidateQueries(["reviews"]);
    },
    onError: function (error) {
      toast.error(error.message);
    },
  });

  const departmentsColumn = [
    { field: "srno", headerName: "SR No" },
    {
      field: "nameofreview",
      headerName: "User",
      cellRenderer: (params) => {
        return (
          <Chip label={params.value} style={{ backgroundColor: "white" }} />
        );
      },
      flex: 1,
    },
    { field: "date", headerName: "Date" },
    {
      field: "rate",
      headerName: "Rating",
      cellRenderer: (params) => {
        return (
          <div>
            ⭐ {params.value} <small>Out of 5</small>
          </div>
        );
      },
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
      cellRenderer: (params) => {
        const statusColorMap = {
          "Reply Review": { backgroundColor: "#E8FEF1", color: "#527160" }, // Light orange bg, dark orange font
          Replied: { backgroundColor: "#EAEAEA", color: "#868686" }, // Light green bg, dark green font
        };

        const { backgroundColor, color } = statusColorMap[params.value] || {
          backgroundColor: "gray",
          color: "white",
        };

        const handleClick = () => {
          if (params.value === "Reply Review") {
            // Trigger modal open when "Reply Review" is clicked
            setOpenSidebar(true);
            setReviewData(params.data); // Optional: You can pass the row data to the modal
          }
        };

        return (
          <>
            <Chip
              label={
                params.value === "Reply Review" ? (
                  <div
                    className="flex flex-row items-center justify-center gap-2"
                    onClick={handleClick}
                  >
                    <PiArrowBendLeftDownBold />
                    {params.value}
                  </div>
                ) : (
                  <div className="flex flex-row items-center justify-center gap-2">
                    <PiArrowBendUpLeftBold />
                    {params.value}
                  </div>
                )
              }
              style={{
                backgroundColor,
                color,
              }}
            />
          </>
        );
      },
      flex: 1,
    },
  ];
  const averageRatings =
    reviews.length > 0
      ? (
          reviews.reduce((acc, curr) => acc + curr.rate, 0) / reviews.length
        ).toFixed(2)
      : "0.00";

  // const averageRatings =
  //   reviews.reduce((acc, curr) => acc + curr.rate, 0) / reviews.length;

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
        </WidgetSection>

        <div className="p-4">
          <PageFrame>
            <AgTable
              search={true}
              searchColumn={"Policies"}
              data={[
                ...reviews.map((review, index) => ({
                  id: review._id,
                  srno: index + 1,
                  nameofreview: review.reviewerName,
                  date: humanDate(review.createdAt),
                  rate: review.rate,
                  Reviews: review.review,
                  action: review?.reply ? "Replied" : "Reply Review",
                })),
              ]}
              columns={departmentsColumn}
            />
          </PageFrame>
        </div>
        <MuiAside
          open={openSidebar}
          onClose={() => setOpenSidebar(false)}
          title={"Reviews"}
        >
          <div className="p-2 space-y-6">
            <h1 className="font-pmedium text-subtitle">
              {reviewData.nameofreview}
            </h1>
            <div>
              ⭐ {reviewData.rate} <small> out of 5</small>
            </div>
            <div>
              <p>{reviewData.Reviews}</p>
            </div>
            <div className="mt-5">
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
          </div>
        </MuiAside>
      </div>
    </>
  );
};

export default VisitorReviews;
