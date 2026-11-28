import { MdOutlineRemoveRedEye } from "react-icons/md";

export default function ViewMeetingButton({ onClick }) {
  return (
    <button
      type="button"
      aria-label="View meeting details"
      title="View meeting details"
      onClick={onClick}
      className="flex items-center p-2 text-subtitle rounded-full hover:bg-gray-200 transition-all"
    >
      <MdOutlineRemoveRedEye />
    </button>
  );
}
