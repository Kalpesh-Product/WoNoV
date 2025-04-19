import { useState } from "react";
import AgTable from "../../../../components/AgTable";
import PrimaryButton from "../../../../components/PrimaryButton";
// import AssetModal from "./AssetModal";
import { useMutation, useQuery } from "@tanstack/react-query";
import useAxiosPrivate from "../../../../hooks/useAxiosPrivate";
import MuiModal from "../../../../components/MuiModal";
import { Controller, useForm } from "react-hook-form";
import { DatePicker, LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { Accordion, AccordionDetails, AccordionSummary, Button, FormHelperText, MenuItem, TextField } from "@mui/material";
import { toast } from "sonner";
import useAuth from "../../../../hooks/useAuth";
import humanDate from "../../../../utils/humanDateForamt";
import dayjs from "dayjs";
import { MdOutlineRemoveRedEye } from "react-icons/md";
import DetalisFormatted from "../../../../components/DetalisFormatted";
import { IoIosArrowDown } from "react-icons/io";
import WidgetSection from "../../../../components/WidgetSection";
import { inrFormat } from "../../../../utils/currencyFormat";

const AdminElectricityExpenses = () => {

  const electricityData = [
    {
      "month": "Apr-24",
      "units": [
        {
          "location": "ST-701A",
          "month": "Apr-24",
          "expense": 25883,
          "consumptionKWh": 3416.93,
          "billingDate": "2024-04-05T00:00:00",
          "paidDate": "2024-04-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Apr-24",
          "expense": 21702,
          "consumptionKWh": 3025.62,
          "billingDate": "2024-04-05T00:00:00",
          "paidDate": "2024-04-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Apr-24",
          "expense": 21691,
          "consumptionKWh": 2572.69,
          "billingDate": "2024-04-05T00:00:00",
          "paidDate": "2024-04-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Apr-24",
          "expense": 24156,
          "consumptionKWh": 2665.8,
          "billingDate": "2024-04-05T00:00:00",
          "paidDate": "2024-04-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Apr-24",
          "expense": 23964,
          "consumptionKWh": 2942.13,
          "billingDate": "2024-04-05T00:00:00",
          "paidDate": "2024-04-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Apr-24",
          "expense": 24392,
          "consumptionKWh": 3067.27,
          "billingDate": "2024-04-05T00:00:00",
          "paidDate": "2024-04-07T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "May-24",
      "units": [
        {
          "location": "ST-701A",
          "month": "May-24",
          "expense": 24911,
          "consumptionKWh": 2581.05,
          "billingDate": "2024-05-05T00:00:00",
          "paidDate": "2024-05-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "May-24",
          "expense": 24956,
          "consumptionKWh": 3114.81,
          "billingDate": "2024-05-05T00:00:00",
          "paidDate": "2024-05-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "May-24",
          "expense": 23582,
          "consumptionKWh": 3182.29,
          "billingDate": "2024-05-05T00:00:00",
          "paidDate": "2024-05-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "May-24",
          "expense": 24834,
          "consumptionKWh": 3223.74,
          "billingDate": "2024-05-05T00:00:00",
          "paidDate": "2024-05-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "May-24",
          "expense": 20197,
          "consumptionKWh": 2645.97,
          "billingDate": "2024-05-05T00:00:00",
          "paidDate": "2024-05-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "May-24",
          "expense": 25252,
          "consumptionKWh": 2626.21,
          "billingDate": "2024-05-05T00:00:00",
          "paidDate": "2024-05-02T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Jun-24",
      "units": [
        {
          "location": "ST-701A",
          "month": "Jun-24",
          "expense": 23952,
          "consumptionKWh": 3105.64,
          "billingDate": "2024-06-05T00:00:00",
          "paidDate": "2024-06-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Jun-24",
          "expense": 25166,
          "consumptionKWh": 2548.33,
          "billingDate": "2024-06-05T00:00:00",
          "paidDate": "2024-06-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Jun-24",
          "expense": 25274,
          "consumptionKWh": 3363.92,
          "billingDate": "2024-06-05T00:00:00",
          "paidDate": "2024-06-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Jun-24",
          "expense": 21624,
          "consumptionKWh": 2800.8,
          "billingDate": "2024-06-05T00:00:00",
          "paidDate": "2024-06-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Jun-24",
          "expense": 23245,
          "consumptionKWh": 2698.42,
          "billingDate": "2024-06-05T00:00:00",
          "paidDate": "2024-06-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Jun-24",
          "expense": 20866,
          "consumptionKWh": 2659.11,
          "billingDate": "2024-06-05T00:00:00",
          "paidDate": "2024-06-03T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Jul-24",
      "units": [
        {
          "location": "ST-701A",
          "month": "Jul-24",
          "expense": 23407,
          "consumptionKWh": 3283.76,
          "billingDate": "2024-07-05T00:00:00",
          "paidDate": "2024-07-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Jul-24",
          "expense": 23851,
          "consumptionKWh": 2996.74,
          "billingDate": "2024-07-05T00:00:00",
          "paidDate": "2024-07-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Jul-24",
          "expense": 21782,
          "consumptionKWh": 3492.78,
          "billingDate": "2024-07-05T00:00:00",
          "paidDate": "2024-07-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Jul-24",
          "expense": 24798,
          "consumptionKWh": 3051.44,
          "billingDate": "2024-07-05T00:00:00",
          "paidDate": "2024-07-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Jul-24",
          "expense": 22233,
          "consumptionKWh": 2881.52,
          "billingDate": "2024-07-05T00:00:00",
          "paidDate": "2024-07-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Jul-24",
          "expense": 24132,
          "consumptionKWh": 3320.76,
          "billingDate": "2024-07-05T00:00:00",
          "paidDate": "2024-07-08T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Aug-24",
      "units": [
        {
          "location": "ST-701A",
          "month": "Aug-24",
          "expense": 24792,
          "consumptionKWh": 2745.53,
          "billingDate": "2024-08-05T00:00:00",
          "paidDate": "2024-08-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Aug-24",
          "expense": 25136,
          "consumptionKWh": 3383.5,
          "billingDate": "2024-08-05T00:00:00",
          "paidDate": "2024-08-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Aug-24",
          "expense": 23732,
          "consumptionKWh": 3441.02,
          "billingDate": "2024-08-05T00:00:00",
          "paidDate": "2024-08-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Aug-24",
          "expense": 24447,
          "consumptionKWh": 3000.76,
          "billingDate": "2024-08-05T00:00:00",
          "paidDate": "2024-08-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Aug-24",
          "expense": 24232,
          "consumptionKWh": 3141.45,
          "billingDate": "2024-08-05T00:00:00",
          "paidDate": "2024-08-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Aug-24",
          "expense": 23861,
          "consumptionKWh": 3189.46,
          "billingDate": "2024-08-05T00:00:00",
          "paidDate": "2024-08-02T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Sep-24",
      "units": [
        {
          "location": "ST-701A",
          "month": "Sep-24",
          "expense": 25123,
          "consumptionKWh": 3216.92,
          "billingDate": "2024-09-05T00:00:00",
          "paidDate": "2024-09-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Sep-24",
          "expense": 20501,
          "consumptionKWh": 3355.76,
          "billingDate": "2024-09-05T00:00:00",
          "paidDate": "2024-09-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Sep-24",
          "expense": 23647,
          "consumptionKWh": 2915.62,
          "billingDate": "2024-09-05T00:00:00",
          "paidDate": "2024-09-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Sep-24",
          "expense": 25179,
          "consumptionKWh": 2878.68,
          "billingDate": "2024-09-05T00:00:00",
          "paidDate": "2024-09-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Sep-24",
          "expense": 22863,
          "consumptionKWh": 3257.91,
          "billingDate": "2024-09-05T00:00:00",
          "paidDate": "2024-09-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Sep-24",
          "expense": 20910,
          "consumptionKWh": 3052.32,
          "billingDate": "2024-09-05T00:00:00",
          "paidDate": "2024-09-03T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Oct-24",
      "units": [
        {
          "location": "ST-701A",
          "month": "Oct-24",
          "expense": 20007,
          "consumptionKWh": 2564.15,
          "billingDate": "2024-10-05T00:00:00",
          "paidDate": "2024-10-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Oct-24",
          "expense": 20622,
          "consumptionKWh": 3076.51,
          "billingDate": "2024-10-05T00:00:00",
          "paidDate": "2024-10-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Oct-24",
          "expense": 25778,
          "consumptionKWh": 2941.17,
          "billingDate": "2024-10-05T00:00:00",
          "paidDate": "2024-10-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Oct-24",
          "expense": 24973,
          "consumptionKWh": 3417.49,
          "billingDate": "2024-10-05T00:00:00",
          "paidDate": "2024-10-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Oct-24",
          "expense": 20800,
          "consumptionKWh": 3230.54,
          "billingDate": "2024-10-05T00:00:00",
          "paidDate": "2024-10-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Oct-24",
          "expense": 22957,
          "consumptionKWh": 2813.76,
          "billingDate": "2024-10-05T00:00:00",
          "paidDate": "2024-10-08T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Nov-24",
      "units": [
        {
          "location": "ST-701A",
          "month": "Nov-24",
          "expense": 22138,
          "consumptionKWh": 2511.32,
          "billingDate": "2024-11-05T00:00:00",
          "paidDate": "2024-11-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Nov-24",
          "expense": 20194,
          "consumptionKWh": 2959.78,
          "billingDate": "2024-11-05T00:00:00",
          "paidDate": "2024-11-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Nov-24",
          "expense": 24832,
          "consumptionKWh": 3426.19,
          "billingDate": "2024-11-05T00:00:00",
          "paidDate": "2024-11-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Nov-24",
          "expense": 24897,
          "consumptionKWh": 3165.35,
          "billingDate": "2024-11-05T00:00:00",
          "paidDate": "2024-11-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Nov-24",
          "expense": 24660,
          "consumptionKWh": 3072.33,
          "billingDate": "2024-11-05T00:00:00",
          "paidDate": "2024-11-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Nov-24",
          "expense": 23531,
          "consumptionKWh": 3077.86,
          "billingDate": "2024-11-05T00:00:00",
          "paidDate": "2024-11-02T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Dec-24",
      "units": [
        {
          "location": "ST-701A",
          "month": "Dec-24",
          "expense": 22414,
          "consumptionKWh": 3392.79,
          "billingDate": "2024-12-05T00:00:00",
          "paidDate": "2024-12-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Dec-24",
          "expense": 24814,
          "consumptionKWh": 3105.83,
          "billingDate": "2024-12-05T00:00:00",
          "paidDate": "2024-12-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Dec-24",
          "expense": 24418,
          "consumptionKWh": 2837.08,
          "billingDate": "2024-12-05T00:00:00",
          "paidDate": "2024-12-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Dec-24",
          "expense": 25332,
          "consumptionKWh": 3184.22,
          "billingDate": "2024-12-05T00:00:00",
          "paidDate": "2024-12-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Dec-24",
          "expense": 25536,
          "consumptionKWh": 3484.49,
          "billingDate": "2024-12-05T00:00:00",
          "paidDate": "2024-12-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Dec-24",
          "expense": 23842,
          "consumptionKWh": 2921.69,
          "billingDate": "2024-12-05T00:00:00",
          "paidDate": "2024-12-03T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Jan-25",
      "units": [
        {
          "location": "ST-701A",
          "month": "Jan-25",
          "expense": 21917,
          "consumptionKWh": 2631.11,
          "billingDate": "2025-01-05T00:00:00",
          "paidDate": "2025-01-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Jan-25",
          "expense": 21235,
          "consumptionKWh": 3039.46,
          "billingDate": "2025-01-05T00:00:00",
          "paidDate": "2025-01-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Jan-25",
          "expense": 21447,
          "consumptionKWh": 2643.31,
          "billingDate": "2025-01-05T00:00:00",
          "paidDate": "2025-01-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Jan-25",
          "expense": 21736,
          "consumptionKWh": 3204.82,
          "billingDate": "2025-01-05T00:00:00",
          "paidDate": "2025-01-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Jan-25",
          "expense": 22772,
          "consumptionKWh": 2806.86,
          "billingDate": "2025-01-05T00:00:00",
          "paidDate": "2025-01-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Jan-25",
          "expense": 21225,
          "consumptionKWh": 2973.86,
          "billingDate": "2025-01-05T00:00:00",
          "paidDate": "2025-01-08T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Feb-25",
      "units": [
        {
          "location": "ST-701A",
          "month": "Feb-25",
          "expense": 22874,
          "consumptionKWh": 3018.42,
          "billingDate": "2025-02-05T00:00:00",
          "paidDate": "2025-02-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Feb-25",
          "expense": 24154,
          "consumptionKWh": 3213.0,
          "billingDate": "2025-02-05T00:00:00",
          "paidDate": "2025-02-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Feb-25",
          "expense": 23675,
          "consumptionKWh": 2754.56,
          "billingDate": "2025-02-05T00:00:00",
          "paidDate": "2025-02-03T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Feb-25",
          "expense": 22406,
          "consumptionKWh": 3045.56,
          "billingDate": "2025-02-05T00:00:00",
          "paidDate": "2025-02-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Feb-25",
          "expense": 24749,
          "consumptionKWh": 2926.1,
          "billingDate": "2025-02-05T00:00:00",
          "paidDate": "2025-02-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Feb-25",
          "expense": 20537,
          "consumptionKWh": 2970.81,
          "billingDate": "2025-02-05T00:00:00",
          "paidDate": "2025-02-08T00:00:00",
          "paid": true
        }
      ]
    },
    {
      "month": "Mar-25",
      "units": [
        {
          "location": "ST-701A",
          "month": "Mar-25",
          "expense": 25968,
          "consumptionKWh": 3439.02,
          "billingDate": "2025-03-05T00:00:00",
          "paidDate": "2025-03-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-701B",
          "month": "Mar-25",
          "expense": 23163,
          "consumptionKWh": 3168.81,
          "billingDate": "2025-03-05T00:00:00",
          "paidDate": "2025-03-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601A",
          "month": "Mar-25",
          "expense": 21729,
          "consumptionKWh": 3428.42,
          "billingDate": "2025-03-05T00:00:00",
          "paidDate": "2025-03-08T00:00:00",
          "paid": true
        },
        {
          "location": "ST-601B",
          "month": "Mar-25",
          "expense": 23148,
          "consumptionKWh": 2530.14,
          "billingDate": "2025-03-05T00:00:00",
          "paidDate": "2025-03-07T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501A",
          "month": "Mar-25",
          "expense": 24445,
          "consumptionKWh": 3351.49,
          "billingDate": "2025-03-05T00:00:00",
          "paidDate": "2025-03-02T00:00:00",
          "paid": true
        },
        {
          "location": "ST-501B",
          "month": "Mar-25",
          "expense": 21160,
          "consumptionKWh": 2631.29,
          "billingDate": "2025-03-05T00:00:00",
          "paidDate": "2025-03-03T00:00:00",
          "paid": true
        }
      ]
    }
  ]
  
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const [modalMode, setModalMode] = useState("add");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
    // const [selectedMonth, setSelectedMonth] = useState(
    //   electricityData[0].month
    // );
  
  const {
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      assetType: "",
      vendor: "",
      purchaseDate: null,
      quantity: null,
      price: null,
      warranty: null,
      image: null,
      brand: "",
      department: "",
      status: "",
      assignedTo: "",
    },
  });

  const { data: assetsCategories = [], isPending: assetPending } = useQuery({
    queryKey: ["assetsCategories"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/assets/get-category");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });
  const { data: vendorDetials = [], isPending: isVendorDetails } = useQuery({
    queryKey: ["vendorDetials"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/vendors/get-vendors");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const { mutate: addAsset, isPending: isAddingAsset } = useMutation({
    mutationKey: ["addAsset"],
    mutationFn: async (data) => {
      const formData = new FormData();

      formData.append("name", data.name);
      formData.append("assetType", data.assetType);
      formData.append("vendor", data.vendor);
      formData.append("purchaseDate", data.purchaseDate);
      formData.append("quantity", Number(data.quantity));
      formData.append("price", Number(data.price));
      formData.append("warranty", Number(data.warranty));
      if (data.image) {
        formData.append("image", data.image);
      }
      formData.append("brand", data.brand);
      formData.append("department", data.department);
      formData.append("status", data.status);
      formData.append("assignedTo", data.assignedTo);

      const response = await axios.post("/api/assets/create-asset");
      return response.data;
    },
    onSuccess: function (data) {
      toast.success(data.message);
      setIsModalOpen(false);
    },
    onError: function (error) {
      toast.error(error.message);
    },
  });

  const assetColumns = [
    { field: "id", headerName: "Sr No" },
    { field: "location", headerName: "Location", },
  { field: "totalExpense", headerName: "Expense (INR)"},
  { field: "paid", headerName: "Status",flex:"1" },
    {
      field: "actions",
      headerName: "Actions",
      cellRenderer: (params) => (
        <span
                   className="text-subtitle cursor-pointer"
                   onClick={() => handleDetailsClick(params.data)}
                 >
                   <MdOutlineRemoveRedEye />
                 </span>
      ),
    },
  ];

  const { data: assetsList = [] } = useQuery({
    queryKey: ["assetsList"],
    queryFn: async () => {
      try {
        const response = await axios.get("/api/assets/get-assets");
        return response.data;
      } catch (error) {
        throw new Error(error.response.data.message);
      }
    },
  });

  const handleDetailsClick = (asset) => {
    setSelectedAsset(asset);
    setModalMode("view");
    setIsModalOpen(true);
  };

  const handleAddAsset = () => {
    setModalMode("add");
    setSelectedAsset(null);
    setIsModalOpen(true);
  };

  const handleFormSubmit = (data) => {
    if (modalMode === "add") {
      addAsset(data);
    }
  };

 
  const transformedElectricityData = electricityData.map((data)=>{
    let totalExpense 
    // if(selectedMonth === data.month){
       totalExpense = data.units.reduce((acc,curr)=>acc+curr.expense,0)
    // }

    return {...data,totalExpense}
   

   
  })
  

      return (
        <div className="p-4 flex flex-col gap-8">
         
         <WidgetSection
        layout={1}
        title={"Electricity Consumption And Expenses"}
        titleLabel={"FY 2024-25"}
        border
      >
          <div className="px-4 py-2 border-b border-borderGray bg-gray-50">
          <div className="flex flex-wrap justify-between items-center py-2 text-sm text-muted font-pmedium text-title">
            <span className="w-1/2 sm:w-1/5">FINANCIAL YEAR</span>
            <span className="w-1/2 sm:w-1/5 flex items-center gap-1">
              EXPENSE
            </span>
          </div>
        </div>
        {transformedElectricityData.length > 0 && transformedElectricityData.map((electricity,index)=>(
          <Accordion key={index} className="py-2">
                  <AccordionSummary
                    expandIcon={<IoIosArrowDown />}
                    aria-controls={`panel-${index}-content`}
                    id={`panel-${index}-header`}>
                    <div className="flex justify-between items-center w-full px-2">
                      <span className="text-subtitle font-pmedium  ">
                      {electricity.month}
                      </span>
                      <span className="w-1/2 sm:w-1/5 px-4 text-subtitle font-pmedium">
                        INR {inrFormat(electricity.totalExpense)}
                      </span>
                    </div>
                  </AccordionSummary>
                  <AccordionDetails sx={{ borderTop: "1px solid  #d1d5db" }}>
                   
                    <AgTable
            key={electricity.units.length}
            search={true}
            searchColumn={"Asset Number"}
           
            buttonTitle={"Add Expense"}
            data={[
              ...electricity.units.map((item, index) => ({
                id: index + 1,
                location: item.location,
                month: item.month,
                totalExpense: `${item.expense.toLocaleString("en-IN")}`,
                consumptionKWh: item.consumptionKWh,
                billingDate: humanDate(item.billingDate),
                paidDate: humanDate(item.paidDate),
                paid: item.paid ? "Paid" : "Unpaid",
              })),
            ]}        
            columns={assetColumns}
            handleClick={handleAddAsset}
          />
                    <div className="flex items-center gap-4 mt-4">
                      <div className="flex items-center gap-4">
                        <span className="text-primary font-pregular">
                          Total Expense for {electricity.month}:{" "}
                        </span>
                        <span className="text-black font-pmedium">
                          INR {electricity.totalExpense.toLocaleString()}
                        </span>{" "}
                      </div>
                    </div>
                  </AccordionDetails>
                </Accordion>
      
  
))}
  
          <MuiModal open={isModalOpen} onClose={() => setIsModalOpen(false)}>
            {modalMode === "add" && (
              <div>
                <form onSubmit={handleSubmit(handleFormSubmit)}>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="col-span-2">
                      <Controller
                        name="image"
                        control={control}
                        rules={{ required: "Asset image is required" }}
                        render={({ field }) => (
                          <div
                            {...field}
                            className={`w-full flex justify-center border-2 rounded-md p-2 relative ${
                              errors.assetImage
                                ? "border-red-500"
                                : "border-gray-300"
                            } `}>
                            <div
                              className="w-full h-48 flex justify-center items-center relative"
                              style={{
                                backgroundImage: previewImage
                                  ? `url(${previewImage})`
                                  : "none",
                                backgroundSize: "contain",
                                backgroundPosition: "center",
                                backgroundRepeat: "no-repeat",
                              }}>
                              <Button
                                variant="outlined"
                                component="label"
                                sx={{
                                  position: "absolute",
                                  bottom: 8,
                                  right: 8,
                                  backgroundColor: "rgba(255, 255, 255, 0.7)",
                                  color: "#000",
                                  fontSize: "16px",
                                  fontWeight: "bold",
                                  padding: "8px 16px",
                                  borderRadius: "8px",
                                  boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.3)",
                                }}>
                                Select Image
                                <input
                                  type="file"
                                  accept="image/*"
                                  hidden
                                  onChange={(e) => {
                                    if (e.target.files.length > 0) {
                                      field.onChange(e.target.files);
                                      setPreviewImage(previewImage);
                                    } else {
                                      field.onChange(null);
                                    }
                                  }}
                                />
                              </Button>
                            </div>
                            {errors.assetImage && (
                              <FormHelperText
                                error
                                sx={{
                                  position: "absolute",
                                  top: "50%",
                                  left: "50%",
                                  transform: "translate(-50%, -50%)",
                                  margin: 0,
                                }}>
                                {errors.assetImage.message}
                              </FormHelperText>
                            )}
                          </div>
                        )}
                      />
                    </div>
                    <Controller
                      name="assetType"
                      control={control}
                      rules={{ required: "Department is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          label="Asset Type"
                          helperText={!!errors.assetType?.message}
                          select>
                          <MenuItem value="">Select an Asset Type</MenuItem>
                          <MenuItem value="Physical">Physical</MenuItem>
                          <MenuItem value="Digital">Digital</MenuItem>
                        </TextField>
                      )}
                    />
    
                    <Controller
                      name="department"
                      control={control}
                      rules={{ required: "Department is required" }}
                      render={({ field }) => (
                        <TextField
                          error={!!errors.department}
                          helperText={errors.department?.message}
                          fullWidth
                          {...field}
                          select
                          label="Department"
                          size="small">
                          {auth.user.company.selectedDepartments?.map((dept) => (
                            <MenuItem key={dept._id} value={dept._id}>
                              {dept.name}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
    
                    <Controller
                      name="categoryId"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Category is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          select
                          label="Category"
                          size="small">
                          {assetsCategories.map((category) => (
                            <MenuItem key={category._id} value={category._id}>
                              {category.categoryName}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
                    <Controller
                      name="subCategoryId"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Sub-Category is required" }}
                      render={({ field }) => (
                        <TextField
                          {...field}
                          fullWidth
                          select
                          label="Sub-Category"
                          size="small">
                          {assetsCategories.subCategories?.map((subCategory) => (
                            <MenuItem key={subCategory._id} value={subCategory._id}>
                              {subCategory.categoryName}
                            </MenuItem>
                          ))}
                        </TextField>
                      )}
                    />
    
                    {/* Department & Category */}
                    <Controller
                      name="brand"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Brand is required" }}
                      render={({ field }) => (
                        <TextField
                          size="small"
                          {...field}
                          label="Brand Name"
                          error={!!errors.brand}
                          helperText={errors.brand?.message}
                        />
                      )}
                    />
                    {/* Quantity & Price */}
                    <Controller
                      name="quantity"
                      control={control}
                      rules={{ required: "Quantity is required" }}
                      render={({ field }) => (
                        <TextField
                          size="small"
                          {...field}
                          label="Quantity"
                          type="number"
                          error={!!errors.quantity}
                          helperText={errors.quantity?.message}
                        />
                      )}
                    />
    
                    <Controller
                      name="price"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Price is required" }}
                      render={({ field }) => (
                        <TextField
                          size="small"
                          {...field}
                          label="Price"
                          type="number"
                          className=""
                          error={!!errors.price}
                          helperText={errors.price?.message}
                        />
                      )}
                    />
    
                    {/* <Controller
                  name="vendor"
                  control={control}
                  defaultValue=""
                  rules={{ required: "Vendor Name is required" }}
                  render={({ field }) => (
                    <TextField
                      select
                      {...field}
                      label="Vendor Name"
                      size="small"
                      error={!!errors.department}
                      helperText={errors.department?.message}
                      fullWidth>
                      {vendorDetials.map((vendor) => (
                        <MenuItem key={vendor} value={vendor}>
                          {vendor}
                        </MenuItem>
                      ))}
                    </TextField>
                  )}
                /> */}
                    {/* Purchase Date & Warranty */}
    
                    <LocalizationProvider dateAdapter={AdapterDayjs}>
                      <Controller
                        name="purchaseDate"
                        control={control}
                        defaultValue={null}
                        rules={{ required: "Purchase Date is required" }}
                        render={({ field }) => (
                          <DatePicker
                            {...field}
                            label="Purchase Date"
                            slotProps={{
                              textField: {
                                size: "small",
                                error: !!errors.purchaseDate,
                                helperText: errors?.purchaseDate?.message,
                              },
                            }}
                            className="w-full"
                          />
                        )}
                      />
                    </LocalizationProvider>
    
                    <Controller
                      name="warranty"
                      control={control}
                      defaultValue=""
                      rules={{ required: "Warranty is required" }}
                      render={({ field }) => (
                        <TextField
                          size="small"
                          {...field}
                          label="Warranty (Months)"
                          type="number"
                          error={!!errors.warranty}
                          helperText={errors.warranty?.message}
                        />
                      )}
                    />
                    <FormHelperText>{errors.category?.message}</FormHelperText>
                  </div>
                  {/* Main end div*/}
                  {/* Conditionally render submit/edit button */}
                  <div className="flex gap-4 justify-center items-center mt-4">
                    <PrimaryButton
                      title={modalMode === "add" ? "Submit" : "Update"}
                    />
                    {/* Cancel button for edit mode */}
                  </div>
                </form>
              </div>
            )}
            {modalMode === "view" && selectedAsset && (
      <div className="p-4">
        <div className="grid grid-cols-2 gap-4">
          <DetalisFormatted title="Location" detail={selectedAsset.location} />
          <DetalisFormatted title="Month" detail={selectedAsset.month} />
          <DetalisFormatted title="Total Expense" detail={`INR ${selectedAsset.totalExpense.toLocaleString("en-IN")}`} />
          <DetalisFormatted title="Consumption (kWh)" detail={selectedAsset.consumptionKWh.toLocaleString()} />
          <DetalisFormatted
            title="Paid Date"
            detail={
              selectedAsset.paidDate
                ? dayjs(selectedAsset.paidDate, "DD-MM-YYYY").format("DD-MM-YYYY")
                : "Not Paid"
            }
          />
          <DetalisFormatted
            title="Billing Date"
            detail={dayjs(selectedAsset.billingDate, "DD-MM-YYYY").format("DD-MM-YYYY")}
          />
         
          <DetalisFormatted title="Paid Status" detail={selectedAsset.paid ? "Paid" : "Unpaid"} />
        </div>
      </div>
    )}
    
          </MuiModal>

          </WidgetSection>
        </div>
      );
    
  
 
};

export default AdminElectricityExpenses;
