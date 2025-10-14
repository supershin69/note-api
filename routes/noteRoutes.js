const Note = require('../models/noteModel');
const express = require('express');
const authMiddleware = require('../middlewares/authMiddleware');
const adminMiddleware = require('../middlewares/adminMiddleware');

const router = express.Router();

router.use(authMiddleware)

router.get('/', async (req, res) => {
  try {
    let notes;
    if (req.user.role === 'admin') {
      notes = await Note.find().sort({ createdAt: -1});
    } else {
      notes = await Note.find({ owner: req.user._id}).sort({createdAt: -1});
    }

    if (notes.length === 0) {
      return res.status(200).json({message: 'You have no notes yet'});
    }

    return res.status(200).json(notes);

  } catch(err) {
    return res.status(500).json({ message: 'Internal server error'});
  }
 
});

router.post('/', async (req, res) => {
  const { title, content } = req.body
  if (!title || !content) {
    return res.status(400).json({ message: 'You need to fill all fields.'});
  }

  try {
    const note = await Note.create({
      title,
      content,
      owner: req.user._id
    });

    return res.status(201).json({ message: 'Note successfully created', note});
  } catch(err) {
    return res.status(500).json({ error: 'Unexcpected error occured'});
  }
});

router.put('/:id', async (req, res) => {
  const { title, content } = req.body;
  if (!title && !content) {
    return res.status(400).json({ message: 'You need at least one field to be filled'});
  } 
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note cannot be found'});
    }
    if (!note.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Not your note. Forbidden.'});
    }

    note.title = title || note.title;
    note.content = content || note.content;

    await note.save();
    return res.status(200).json({ message: 'Note successfully updated.', note});

  } catch(err) {
    return res.status(500).json({ error: 'Unexpected error occured' });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const note = await Note.findById(req.params.id);
    if (!note) {
      return res.status(404).json({ message: 'Note not found'});
    }
    if (!note.owner.equals(req.user._id) && req.user.role !== 'admin') {
      return res.status(403).json({message: 'Not your note. Forbidden.'});
    }

    await note.deleteOne();
    return res.status(200).json({message: 'Note successfully deleted.'});
  } catch (err) {
    return res.status(500).json('Unexpected error occured');
  }
});

module.exports = router;