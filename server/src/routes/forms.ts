import express from 'express';
import Form from '../models/Form';
import Response from '../models/Response';
import { requireAuth, AuthRequest } from '../middleware/auth';

const router = express.Router();

// Get all forms for logged in user
router.get('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const forms = await Form.find({ userId: req.userId }).sort({ createdAt: -1 });
    res.json(forms);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching forms' });
  }
});

// Get a single form by ID
router.get('/:id', async (req, res) => {
  try {
    const form = await Form.findById(req.params.id);
    if (!form) return res.status(404).json({ message: 'Form not found' });
    res.json(form);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching form' });
  }
});

// Create a new form
router.post('/', requireAuth, async (req: AuthRequest, res) => {
  try {
    const newForm = new Form({ ...req.body, userId: req.userId });
    const savedForm = await newForm.save();
    res.status(201).json(savedForm);
  } catch (error) {
    res.status(500).json({ message: 'Error creating form' });
  }
});

// Update a form
router.put('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const updatedForm = await Form.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId }, 
      req.body, 
      { new: true }
    );
    if (!updatedForm) return res.status(404).json({ message: 'Form not found or unauthorized' });
    res.json(updatedForm);
  } catch (error) {
    res.status(500).json({ message: 'Error updating form' });
  }
});

// Delete a form
router.delete('/:id', requireAuth, async (req: AuthRequest, res) => {
  try {
    const deletedForm = await Form.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    if (!deletedForm) return res.status(404).json({ message: 'Form not found or unauthorized' });
    res.json({ message: 'Form deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting form' });
  }
});

// Increment views
router.post('/:id/view', async (req, res) => {
  try {
    await Form.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ message: 'Error incrementing view' });
  }
});

// Submit a response
router.post('/:id/responses', async (req, res) => {
  try {
    const formId = req.params.id;
    const { answers, respondentEmail } = req.body;
    
    // Check if the form requires Google Sign In
    const form = await Form.findById(formId);
    if (!form) return res.status(404).json({ message: 'Form not found' });

    if (form.requireGoogleSignIn) {
      if (!respondentEmail) {
        return res.status(401).json({ message: 'Google Sign-In required' });
      }
      
      // Limit to 1 response per email
      const existing = await Response.findOne({ formId, respondentEmail });
      if (existing) {
        return res.status(400).json({ message: 'You have already submitted a response to this form.' });
      }
    }

    const newResponse = new Response({ formId, answers, respondentEmail });
    await newResponse.save();
    
    res.status(201).json({ message: 'Response submitted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error submitting response' });
  }
});

// Get responses for a form
router.get('/:id/responses', requireAuth, async (req: AuthRequest, res) => {
  try {
    const form = await Form.findOne({ _id: req.params.id, userId: req.userId });
    if (!form) return res.status(403).json({ message: 'Unauthorized' });

    const responses = await Response.find({ formId: req.params.id }).sort({ createdAt: -1 });
    res.json(responses);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching responses' });
  }
});

export default router;
