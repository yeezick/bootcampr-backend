import Comment from '../../models/comment.js'
import Ticket from '../../models/tickets.js'

export const createComment = async (req, res) => {
        try {
        const { author, content, parentComment, ticketId, isReply } = req.body;
        const comment = await new Comment({ author, content, isReply });
        await comment.save();

        if (parentComment) {
            Comment.findByIdAndUpdate(parentComment, {$push: {"replies": comment._id}})
        }

        const parentTicket = await Ticket.findByIdAndUpdate(ticketId, {$push: {"comments": comment._id}})

        res.status(200).json(comment)
        } catch (err) {
            console.error(err)
            res.status(400).json({error: err.message })
        }
};

export const getAllComments = async (req, res) => {
    try {
        const comments = await Comment.find()
        res.status(200).json(comments)
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err.message})
    }
};

export const getTicketComments = async (req, res) => {
    try {
        const { ticketId } = req.params

    const ticket = await Ticket.findById(ticketId)
    console.log(ticket)

    let commentsWithData;

    if (ticket) {
    commentsWithData = await Comment.find({_id: { $in: ticket.comments }})
    } else {
        throw Error('ticket not found')
    }

    res.status(200).json({comments: commentsWithData})
    } catch (err) {
        console.error(err)
        res.status(400).json({error: err.message})
    }
    
}

export const deleteComment = async (req, res) => {
    try {
      const { id } = req.params;
      const deletedComment = await Comment.findByIdAndDelete(id);
      if (deletedComment) {
        return res.status(200).send('Comment deleted.');
      }
      throw new Error('Comment not found.');
    } catch (error) {
      console.error(error.message);
      res.status(500).json({ error: error.message });
    }
  }; 

