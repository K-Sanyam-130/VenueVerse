const Event = require("../models/Event");

exports.registerEvent = async (req, res) => {
  try {
    const newEvent = new Event(req.body);
    await newEvent.save();

    res.json({ msg: "Event registered successfully" });
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.getAllEvents = async (req, res) => {
  try {
    const events = await Event.find();
    res.json(events);
  } catch (err) {
    res.status(500).json(err);
  }
};

exports.updateEventStatus = async (req, res) => {
  try {
    const { status, cancelReason } = req.body;

    const updatedEvent = await Event.findByIdAndUpdate(
      req.params.id,
      { status, cancelReason },
      { new: true }
    );

    res.json(updatedEvent);
  } catch (err) {
    res.status(500).json(err);
  }
};
