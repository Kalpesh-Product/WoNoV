import DetalisFormatted from "../../../components/DetalisFormatted";

const dateAndTime = (date, time) => {
  const parts = [date, time].filter((value) => value && value !== "N/A");
  return parts.length ? parts.join(", ") : "-";
};

const TaskReportViewDetails = ({ task }) => (
  <div className="grid grid-cols-1 gap-4">
    <DetalisFormatted title="Task" detail={task.taskName || "-"} />
    <DetalisFormatted title="Description" detail={task.description || "-"} />
    <DetalisFormatted title="Start Date" detail={task.startDate || "-"} />
    <DetalisFormatted title="Added By" detail={task.assignedBy || "-"} />
    <DetalisFormatted title="Assign To" detail={task.assignedTo || "-"} />
    <DetalisFormatted
      title="Building Name"
      detail={task.location?.building?.buildingName || "-"}
    />
    <DetalisFormatted title="Unit No" detail={task.location?.unitNo || "-"} />
    <DetalisFormatted
      title="Completed Date"
      detail={dateAndTime(task.completedDate, task.completedTime)}
    />
    <DetalisFormatted title="Completed By" detail={task.completedBy || "-"} />
    <DetalisFormatted
      title="Due Date"
      detail={dateAndTime(task.dueDate, task.dueTime)}
    />
    <DetalisFormatted title="Status" detail={task.status || "-"} />
    <DetalisFormatted title="Assigned Date" detail={task.assignedDate || "-"} />
    <DetalisFormatted title="Department" detail={task.department || "-"} />
    <DetalisFormatted title="Comment" detail={task.comment || "-"} />
  </div>
);

export default TaskReportViewDetails;
