import { useEffect, useState } from "react";
import dayjs from "dayjs";
import { MdAccessTime, MdFormatListBulleted, MdOutlineCalendarToday, MdOutlineLocationOn, MdWork } from "react-icons/md";
import AttendanceTimeline from "../../../components/AttendanceTimeline";
import ClockInOutAttendance from "../../../components/ClockInOutAttendance";
import useAuth from "../../../hooks/useAuth";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import { useQuery } from "@tanstack/react-query";

const MainDashboard = () => {
  const { auth } = useAuth();
  const axios = useAxiosPrivate();
  const empId = auth?.user?.empId;
  const { data: userProfile } = useQuery({
    queryKey: ["dashboardUserProfile", empId],
    queryFn: async () => {
      const response = await axios.get(`/api/users/fetch-single-user/${empId}`);
      return response.data;
    },
    enabled: Boolean(empId) && !auth?.user?.gender,
  });
  const [currentDateTime, setCurrentDateTime] = useState(() => new Date());
  const hour = currentDateTime.getHours();
  const greeting =
    hour < 12 ? "Good Morning" : hour < 17 ? "Good Afternoon" : "Good Evening";
  const userName =
    [auth?.user?.firstName, auth?.user?.lastName].filter(Boolean).join(" ") ||
    auth?.user?.name ||
    "there";

  const gender = (auth?.user?.gender || userProfile?.gender || "").trim().toLowerCase();
  const namePrefix = gender === "male" ? "Mr." : gender === "female" ? "Ms." : "";
  const displayName = userName === "there" ? userName : [namePrefix, userName].filter(Boolean).join(" ");

  useEffect(() => {
    const timer = window.setInterval(() => setCurrentDateTime(new Date()), 1000);

    return () => window.clearInterval(timer);
  }, []);

  const cardTitle = (Icon, title) => (
    <div className="flex items-center gap-3 rounded-t-xl border-2 border-b-0 border-[#1E3D73] bg-white px-4 py-3.5">
      <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-[#eaf2ff] text-[#1E3D73]">
        <Icon size={21} aria-hidden="true" />
      </span>
      <h2 className="text-base font-pbold uppercase text-[#1E3D73]">{title}</h2>
    </div>
  );

  return (
    <div className="p-4 sm:p-5">
      <section
        aria-label="Welcome and current date"
        className="relative mb-5 overflow-hidden rounded-2xl bg-gradient-to-r from-[#edf4ff] via-[#f7faff] to-[#e8f4fc] px-5 py-6 sm:px-8"
      >
        <svg aria-hidden="true" viewBox="0 0 460 160" preserveAspectRatio="xMaxYMid slice" className="pointer-events-none absolute inset-y-0 right-0 h-full w-[32%] opacity-40">
          <path d="M0 90 Q80 30 160 50 T330 20 L460 0 V160 H0Z" fill="#d5eafa" />
          <path d="M0 125 Q90 80 180 100 T350 70 L460 80 V160 H0Z" fill="#b9dced" />
          <path d="M100 126 Q230 110 340 120 T460 112 M160 145 Q280 133 460 144" fill="none" stroke="#f7fcff" strokeWidth="5" />
          <path d="M260 101 L305 74 L345 93 L390 67 L460 98 V114 H260Z" fill="#9dbdcb" />
          <g fill="#689b83" transform="translate(422 160)">
            <path d="M0 0 Q-25 -75 -8 -145 Q4 -65 0 0 M-3 -12 Q-65 -35 -66 -72 Q-22 -57 -3 -12 M-6 -43 Q-65 -72 -55 -111 Q-16 -83 -6 -43 M-9 -77 Q-46 -108 -33 -144 Q-8 -116 -9 -77 M-2 -16 Q45 -42 40 -81 Q9 -55 -2 -16 M-5 -51 Q35 -78 25 -119 Q1 -91 -5 -51 M-8 -91 Q19 -115 10 -150 Q-8 -123 -8 -91" />
          </g>
        </svg>
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:gap-8">
          <div className="flex items-center gap-5 xl:w-[32%] xl:shrink-0 xl:border-r xl:border-[#cfddf5] xl:pr-7">
            <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#dceaff] sm:h-24 sm:w-24">
              {auth?.user?.profilePicture?.url ? (
                <img src={auth.user.profilePicture.url} alt={userName} className="h-full w-full object-cover" />
              ) : (
                <svg aria-hidden="true" viewBox="0 0 100 100" className="h-full w-full">
                  <path d="M15 100 V86 Q18 73 37 69 H63 Q82 73 85 86 V100" fill="#4597ed" />
                  <path d="M40 59 H60 V74 L50 82 L40 74Z" fill="#f0b887" />
                  <ellipse cx="50" cy="43" rx="18" ry="24" fill="#ffd0a3" />
                  <path d="M32 44 Q25 22 39 21 Q45 12 59 19 Q74 20 68 45 L63 34 Q46 38 36 31 L36 46Z" fill="#234567" />
                  <path d="M38 69 L50 82 L42 90 L33 74 M62 69 L50 82 L58 90 L67 74" fill="#74b8fa" />
                </svg>
              )}
            </div>
            <div className="min-w-0">
              <p className="text-xl leading-tight text-[#5b606c] sm:text-[28px]">{greeting},</p>
              <h1 className="mt-1 break-words text-2xl font-pbold leading-tight text-[#163b73] sm:text-[32px]">{displayName}</h1>
              {auth?.user?.designation && (
                <span className="mt-3 inline-flex max-w-full items-center gap-2 rounded-full bg-[#d7e7ff] px-3 py-1.5 text-xs font-pbold text-[#557bb5] sm:text-sm">
                  <MdWork size={17} className="shrink-0" aria-hidden="true" />
                  {auth.user.designation}
                </span>
              )}
            </div>
          </div>
          <div className="grid flex-1 grid-cols-1 gap-5 sm:grid-cols-[1.3fr_1fr_1.2fr] sm:gap-4">
            {[
              { Icon: MdOutlineCalendarToday, value: dayjs(currentDateTime).format("dddd, D MMMM YYYY"), label: "Today's Date" },
              { Icon: MdAccessTime, value: dayjs(currentDateTime).format("hh:mm:ss A"), label: "Current Time" },
              { Icon: MdOutlineLocationOn, value: "Panaji, Goa, India", label: "Location" },
            ].map(({ Icon, value, label }) => (
              <div key={label} className="flex min-w-0 items-center gap-3">
                <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-[#dce9ff] text-[#1545a5]">
                  <Icon size={25} aria-hidden="true" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-pbold leading-snug text-[#14376f] sm:text-[15px]">{value}</p>
                  <p className="mt-1 text-xs text-[#7b8fb4] sm:text-sm">{label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <div className="grid grid-cols-1 gap-4 xl:grid-cols-[minmax(0,3fr)_minmax(320px,2fr)]">
        <section className="flex min-w-0 flex-col">
          {cardTitle(MdAccessTime, "Today's Attendance")}
          <div className="flex flex-1 flex-col rounded-b-xl border-2 border-[#9FB2CF] border-t-[#1E3D73] bg-white">
            <ClockInOutAttendance />
          </div>
        </section>

        <section className="flex min-w-0 flex-col">
          {cardTitle(MdFormatListBulleted, "Today's Timeline")}
          <div className="flex flex-1 flex-col rounded-b-xl border-2 border-[#9FB2CF] border-t-[#1E3D73] bg-white">
            <AttendanceTimeline />
          </div>
        </section>
      </div>
    </div>
  );
};

export default MainDashboard;
