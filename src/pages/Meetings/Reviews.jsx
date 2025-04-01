import { useState } from "react";
import WidgetSection from "../../components/WidgetSection";
import DataCard from "../../components/DataCard";
import AgTable from "../../components/AgTable";
import { Chip } from "@mui/material";
import { PiArrowBendUpLeftBold } from "react-icons/pi";
import { PiArrowBendLeftDownBold } from "react-icons/pi";
import MuiAside from "../../components/MuiAside";
import PrimaryButton from "../../components/PrimaryButton";
import TextField from "@mui/material/TextField";
import { useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
 

const Reviews = () => {
  const axios = useAxiosPrivate()
  const [openSidebar, setOpenSidebar] = useState(false);
  const [reviewData, setReviewData] = useState({});

  const { data: reviews = [] } = useQuery({
    queryKey: ["reviews"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/meetings/get-reviews");
        return response.data
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const departmentsColumn = [
    { field: "srno", headerName: "SR No" },
    {
      field: "nameofreview",
      headerName: "Name of Review",
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
      headerName: "Rate",
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

        
        //         const {mutate}=useMutation({
        //           mutationFn:async(data)=>{
        //             const response= await axios.post("/api/meetings/add-reply");
        //           },
        //           onSuccess:()=>{
        //             toast.success("review added successfully");
        //           },onError:()=>{
        //             toast.error("could not add review")
        //           }
        //         })
        // const handleSubmitReview = (data) => {
        //   mutate(data)

        //   setOpenSidebar(false)
        // }

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



  const averageRatings = reviews.reduce((acc,curr)=> acc + curr.rate,0) / reviews.length

  // const averageRatings = rating

  return (
    <>
      <div>
        <WidgetSection layout={3}>
          <DataCard data={reviews.length} title="Total" description="Reviews Count" />
          <DataCard data={`${averageRatings} ⭐`} title="Average" description=" Ratings" />
          <DataCard data="10.0k" title="Total" description="Reviews Count" />
        </WidgetSection>

        <div className="p-6">
          <AgTable
            search={true}
            searchColumn={"Policies"}
            data={[
              ...reviews.map((review,index) => (
                {
                  id: index + 1,
                  srno: index + 1,
      nameofreview: review.reviewerName,
      date: new Intl.DateTimeFormat("en-GB",{day:"numeric",month:"long",year:"numeric"}).format(new Date(review.meeting.startDate)),
      rate: review.rate,
      Reviews: review.review,
      action: review?.reply ? "Replied" : "Reply Review",
                }
              ))
            ]}
            columns={departmentsColumn}
          />
        </div>
        <MuiAside
          open={openSidebar}
          onClose={() => setOpenSidebar(false)}
          title={"Reviews"}
        >
          <div className="p-2">
            <h1 className="font-pmedium text-subtitle">
              {reviewData.reviewerName}
            </h1>
            <div>
              ⭐ {reviewData.rate} <small> out of 5</small>
            </div>
            <div className="mt-10">
              <p>{reviewData.review}</p>
            </div>
            <div className="mt-5">
              <TextField
                type="text"
                id="outlined-multiline-flexible"
                label="Reply"
                fullWidth
                multiline
                rows={5}
              />
            </div>
            <PrimaryButton
              title={"Submit"}
              handleSubmit={() => setOpenSidebar(false)}
              externalStyles={"mt-10"}
            ></PrimaryButton>
          </div>
        </MuiAside>
      </div>
    </>
  );
};

export default Reviews;
