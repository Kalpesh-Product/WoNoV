const {
  meetingCreationEvent,
  meetingExtensionEvent,
  meetingCancellationEvent,
} = require("./meetingEvents");

function registerEventListeners() {
  meetingCreationEvent();
  meetingExtensionEvent();
  meetingCancellationEvent();
}

module.exports = registerEventListeners;
