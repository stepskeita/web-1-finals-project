import Example from '../models/exampleModel.js';

// Get all examples
export const getAllExamples = async (req, res) => {
  try {
    const examples = await Example.find();
    res.json({ success: true, count: examples.length, data: examples });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Get single example by ID
export const getExampleById = async (req, res) => {
  try {
    const example = await Example.findById(req.params.id);
    if (!example) {
      return res.status(404).json({ success: false, error: 'Example not found' });
    }
    res.json({ success: true, data: example });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};

// Create new example
export const createExample = async (req, res) => {
  try {
    const { name, email, description } = req.body;

    const example = await Example.create({
      name,
      email,
      description,
    });

    res.status(201).json({ success: true, data: example });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already exists' });
    }
    res.status(400).json({ success: false, error: error.message });
  }
};

// Update example
export const updateExample = async (req, res) => {
  try {
    const example = await Example.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!example) {
      return res.status(404).json({ success: false, error: 'Example not found' });
    }

    res.json({ success: true, data: example });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

// Delete example
export const deleteExample = async (req, res) => {
  try {
    const example = await Example.findByIdAndDelete(req.params.id);

    if (!example) {
      return res.status(404).json({ success: false, error: 'Example not found' });
    }

    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
};
