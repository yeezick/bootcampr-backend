import project from '../models/project.js';
import Tool from '../models/tool.js';

export const getAllTools = async (req, res) => {
  try {
    const tools = await Tool.find(); 
    res.json(tools);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const createTool = async (req, res) => {
  try {
    const newTool = new Tool(req.body);
    await newTool.save();
    res.status(201).json(newTool);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const updateTool = async (req, res) => {
  try {
    const { id } = req.body;
    const updatedTool = await Tool.findByIdAndUpdate(id, req.body, { new: true, })
    res.status(200).json(updatedTool);
  } catch (error) {
    console.log(error.message);
    res.status(500).json({ error: error.message });
  }
};

export const deleteTool = async (req, res) => {
  try {
    const { id } = req.body;
    const deletedTool = await project.findByIdAndDelete(id);
    if (deletedTool) {
      return res.status(200).send('Tool deleted.')
    }
    throw new Error('Tool not found.');
  } catch (error) {
    console.log(error.message);
    res.status(500).json({error: error.message });
  }
}; 