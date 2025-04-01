const EventEmitter = require("events");

const emitter = new EventEmitter();

emitter.setMaxListeners(20);
module.exports = emitter;
