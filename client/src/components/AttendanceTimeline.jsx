import useAttendanceClock from "../hooks/useAttendanceClock";
import humanTime from "../utils/humanTime";
import { BsCup, BsCupHot } from "react-icons/bs";
import { IoEnterOutline, IoExitOutline } from "react-icons/io5";
import { MdAccessTime, MdOutlinePendingActions } from "react-icons/md";

const AttendanceTimeline = () => {
  const { data: record, clockState, isLoading } = useAttendanceClock();
  const todayAttendance = record && clockState.isCurrentSession ? {
    inTime: humanTime(record.inTime),
    outTime: record.outTime ? humanTime(record.outTime) : "0h:0m:0s",
    breaks: (record.breaks || [])
      .filter((brk) => brk.startBreak)
      .map((brk) => ({
        startBreak: humanTime(brk.startBreak),
        endBreak: brk.endBreak ? humanTime(brk.endBreak) : null,
      })),
  } : null;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-40">
        <span className="text-content text-gray-600">
          Loading attendance...
        </span>
      </div>
    );
  }

  
if (!todayAttendance) {
  return (
    <div className="flex min-h-[365px] flex-col items-center justify-center px-6 text-center">
      <div className="relative flex h-32 w-32 items-center justify-center rounded-full bg-[#f1f6ff]">
        <MdOutlinePendingActions
          size={72}
          className="text-[#b8d1fb]"
          aria-hidden="true"
        />
        <span className="absolute bottom-2 right-2 flex h-12 w-12 items-center justify-center rounded-full bg-[#8eb7f8] text-white shadow-md">
          <MdAccessTime size={27} aria-hidden="true" />
        </span>
      </div>
      <h3 className="mt-5 text-lg font-pbold text-[#1E3D73]">No activity yet</h3>
      <p className="mt-1 text-sm font-pregular text-[#1E3D73]">
        Your attendance activity will appear here.
      </p>
    </div>
  );
}

return (
  <div className="min-h-[365px] px-5 py-5">
    <div className="mx-auto flex max-h-[340px] w-full flex-col overflow-y-auto pr-1 text-sm text-[#1E3D73]">

        {/* Clock-in */}
        <div className="relative flex items-center justify-between gap-4 pb-5">
          <span className="absolute left-5 top-10 h-[calc(100%-28px)] w-px bg-[#dce5f1]" />
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e5f8ef] text-[#69ad2f]">
              <IoEnterOutline size={20} />
            </span>
            <div>
              <div className="font-pmedium text-[#1E3D73]">Clock-in Time</div>
              <div className="mt-0.5 text-xs text-[#1E3D73]">Workday started</div>
            </div>
          </div>
          <span className="font-pbold text-[#1E3D73]">
            {todayAttendance?.inTime || "--"}
          </span>
        </div>

        {/* Breaks */}
        {todayAttendance?.breaks?.map((brk, index) => (
          <div key={index} className="motion-preset-slide-up-sm">
            <div className="relative flex items-center justify-between gap-4 pb-5">
              <span className="absolute left-5 top-10 h-[calc(100%-28px)] w-px bg-[#dce5f1]" />
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff8e1] text-[#ffc400]">
                  <BsCupHot size={18} />
                </span>
                <div>
                  <div className="font-pmedium text-[#1E3D73]">Break Start</div>
                  <div className="mt-0.5 text-xs text-[#1E3D73]">Break activated</div>
                </div>
              </div>
              <span className="font-pbold text-[#1E3D73]">{brk.startBreak}</span>
            </div>

            {brk.endBreak && (
              <div className="relative flex items-center justify-between gap-4 pb-5 motion-preset-slide-up-sm">
                <span className="absolute left-5 top-10 h-[calc(100%-28px)] w-px bg-[#dce5f1]" />
                <div className="flex items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff8e1] text-[#ffc400]">
                    <BsCup size={18} />
                  </span>
                  <div>
                    <div className="font-pmedium text-[#1E3D73]">Break End</div>
                    <div className="mt-0.5 text-xs text-[#1E3D73]">Work resumed</div>
                  </div>
                </div>
                <span className="font-pbold text-[#1E3D73]">{brk.endBreak}</span>
              </div>
            )}
          </div>
        ))}

        {/* Clock-out */}
        {todayAttendance?.outTime &&
          todayAttendance.outTime !== "0h:0m:0s" && (
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#fff0f0] text-[#ef3e5c]">
                  <IoExitOutline size={20} />
                </span>
                <div>
                  <div className="font-pmedium text-[#1E3D73]">Clock-out Time</div>
                  <div className="mt-0.5 text-xs text-[#1E3D73]">Workday completed</div>
                </div>
              </div>
              <span className="font-pbold text-[#1E3D73]">
                {todayAttendance.outTime}
              </span>
            </div>
          )}
    </div>
  </div>
);

};

export default AttendanceTimeline;
