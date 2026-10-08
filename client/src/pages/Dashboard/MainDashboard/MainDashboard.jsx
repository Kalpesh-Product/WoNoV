import dayjs from "dayjs";
import { MdAccessTime, MdFormatListBulleted } from "react-icons/md";
import AttendanceTimeline from "../../../components/AttendanceTimeline";
import ClockInOutAttendance from "../../../components/ClockInOutAttendance";
import useAuth from "../../../hooks/useAuth";

const MainDashboard = () => {
  const { auth } = useAuth();
  const hour = new Date().getHours();
  const greeting =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const userName =
    [auth?.user?.firstName, auth?.user?.lastName].filter(Boolean).join(" ") ||
    auth?.user?.name ||
    "there";

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
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-2xl font-pbold capitalize text-[#1E3D73] sm:text-3xl">
            {greeting}, {userName}
          </h1>
        </div>
        <div className="text-left sm:text-right">
          <div className="text-sm font-pbold text-[#1E3D73]">
            {dayjs().format("dddd, DD MMMM YYYY")}
          </div>
          <div className="mt-2 ml-auto h-1 w-10 rounded-full bg-[#2f6fed]" />
        </div>
      </div>

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
