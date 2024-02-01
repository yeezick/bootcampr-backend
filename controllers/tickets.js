import Ticket from '../models/tickets.js';
import Project from '../models/project.js';

export const createTicket = async (req, res) => {
  try {
    const newTicket = new Ticket(req.body);
    await newTicket.save();
    const project = await Project.findById(req.body.projectId);
    const concatenatedStatus = req.body.status.replace(/\s+/g, '');
    project.projectTracker[concatenatedStatus].push(newTicket);
    await project.save();
    res.status(200).send(newTicket);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
};

export const updateTicket = async (req, res) => {
  try {
    const { assignee, description, dueDate, link, oldStatus, projectId, status, title, _id: ticketId } = req.body;
    let updatePayload;
    if (!assignee || assignee === 'Unassigned') {
      updatePayload = {
        $unset: { assignee: '' },
        $set: {
          description,
          dueDate,
          link,
          status,
          title,
        },
      };
    } else {
      updatePayload = {
        assignee,
        description,
        dueDate,
        link,
        status,
        title,
      };
    }

    const ticket = await Ticket.findByIdAndUpdate(ticketId, updatePayload, { new: true });
    if (oldStatus && status !== oldStatus) {
      await updateTicketStatus(oldStatus, status, ticketId, projectId);
    }
    res.status(200).send(ticket);
  } catch (err) {
    console.log(err);
    res.status(400).json({ message: 'Error updating ticket status.', error: err.message });
  }
};

const updateTicketStatus = async (oldStatus, newStatus, ticketId, projectId) => {
  await Project.findByIdAndUpdate(
    projectId,
    {
      $pull: { [`projectTracker.${oldStatus}`]: ticketId },
      $push: { [`projectTracker.${newStatus}`]: ticketId },
    },
    { new: true },
  );
};

export const deleteTicket = async (req, res) => {
  try {
    const { ticketId } = req.params;
    const { ticketStatus, projectId } = req.body;
    await Ticket.findByIdAndDelete(ticketId);
    await Project.findByIdAndUpdate(projectId, {
      $pull: { [`projectTracker.${ticketStatus}`]: ticketId },
    });
    // TODO: Delete all comments
    res.sendStatus(200);
  } catch (error) {
    console.log(error);
    res.status(400).json({ message: 'Error deleting ticket.', error: error.message });
  }
};
