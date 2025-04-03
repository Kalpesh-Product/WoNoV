const schedule = require("node-schedule");
const emitter = require("./eventEmmiter");
const Meeting = require("../models/meetings/Meetings");
const Room = require("../models/meetings/Rooms");
const jobRegistry = require("./jobRegestry");

const meetingCreationEvent = () => {
  emitter.on(
    "meeting-creation",
    ({ roomId, meetingId, startTime, endTime }) => {
      console.log(`[Scheduler] Scheduling jobs for Meeting: ${meetingId}`);

      // Cancel any existing jobs (just to be safe)
      if (jobRegistry.startJobs.has(meetingId)) {
        jobRegistry.startJobs.get(meetingId).cancel();
        jobRegistry.startJobs.delete(meetingId);
      }
      if (jobRegistry.endJobs.has(meetingId)) {
        jobRegistry.endJobs.get(meetingId).cancel();
        jobRegistry.endJobs.delete(meetingId);
      }

      // START JOB
      const startJob = schedule.scheduleJob(new Date(startTime), async () => {
        try {
          await Meeting.findByIdAndUpdate(meetingId, { status: "Ongoing" });
          await Room.findByIdAndUpdate(roomId, { status: "Occupied" });

          console.log(`[Scheduler] Meeting ${meetingId} is now Ongoing`);
        } catch (error) {
          console.error(
            `[Scheduler] Error in start job for ${meetingId}`,
            error
          );
        }
      });

      jobRegistry.startJobs.set(meetingId, startJob);

      // END JOB
      const endJob = schedule.scheduleJob(new Date(endTime), async () => {
        try {
          await Meeting.findByIdAndUpdate(meetingId, { status: "Completed" });
          await Room.findByIdAndUpdate(roomId, { status: "Available" });

          console.log(
            `[Scheduler] Meeting ${meetingId} completed and Room ${roomId} is now Available`
          );
        } catch (error) {
          console.error(`[Scheduler] Error in end job for ${meetingId}`, error);
        }
      });

      jobRegistry.endJobs.set(meetingId, endJob);
    }
  );
};

const meetingExtensionEvent = () => {
  emitter.on("meeting-extended", ({ meetingId, newEndTime }) => {
    if (jobRegistry.endJobs.has(meetingId)) {
      const oldJob = jobRegistry.endJobs.get(meetingId);
      oldJob.cancel();
      jobRegistry.endJobs.delete(meetingId);
    }

    const newEndJob = schedule.scheduleJob(new Date(newEndTime), async () => {
      try {
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) return;

        await Meeting.findByIdAndUpdate(meetingId, { status: "Completed" });
        await Room.findByIdAndUpdate(meeting.bookedRoom, {
          status: "Available",
        });

        console.log(`[Scheduler] Extended Meeting ${meetingId} completed`);
      } catch (error) {
        console.error(
          `[Scheduler] Error in extended end job for ${meetingId}`,
          error
        );
      }
    });

    jobRegistry.endJobs.set(meetingId, newEndJob);
    console.log(
      `[Scheduler] Rescheduled end job for extended Meeting ${meetingId}`
    );
  });
};

const meetingCancellationEvent = () => {
  emitter.on("meeting-cancelled", async ({ meetingId }) => {
    try {
      // Cancel start job if exists
      if (jobRegistry.startJobs.has(meetingId)) {
        jobRegistry.startJobs.get(meetingId).cancel();
        jobRegistry.startJobs.delete(meetingId);
        console.log(`[Scheduler] Cancelled start job for meeting ${meetingId}`);
      }

      // Cancel end job if exists
      if (jobRegistry.endJobs.has(meetingId)) {
        jobRegistry.endJobs.get(meetingId).cancel();
        jobRegistry.endJobs.delete(meetingId);
        console.log(`[Scheduler] Cancelled end job for meeting ${meetingId}`);
      }

      console.log(`[Scheduler] Meeting ${meetingId} successfully cancelled`);
    } catch (error) {
      console.error(
        `[Scheduler] Error cancelling meeting ${meetingId}:`,
        error
      );
    }
  });
};

module.exports = {
  meetingCreationEvent,
  meetingExtensionEvent,
  meetingCancellationEvent,
};
