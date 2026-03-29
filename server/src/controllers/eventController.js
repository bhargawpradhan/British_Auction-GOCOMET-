const Event = require('../models/Event');
const logger = require('../utils/logger');

exports.createEvent = async (req, res) => {
    try {
        const { title, description, date, type } = req.body;
        
        const newEvent = await Event.create({
            title,
            description,
            date: new Date(date),
            type,
            createdBy: req.user._id
        });

        logger.info(`[EVENT] New event created by ${req.user.name}: ${title}`);
        res.status(201).json(newEvent);
    } catch (error) {
        logger.error(`Error creating event: ${error.message}`);
        res.status(500).json({ message: error.message });
    }
};

exports.getEvents = async (req, res) => {
    try {
        const events = await Event.find()
            .populate('createdBy', 'name email role')
            .sort({ date: 1 }); // Sort chronologically
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

exports.deleteEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedEvent = await Event.findByIdAndDelete(id);
        
        if (!deletedEvent) return res.status(404).json({ message: 'Event not found.' });

        logger.info(`[EVENT] Event deleted by ${req.user.name}: ${id}`);
        res.json({ message: 'Event deleted successfully.' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
