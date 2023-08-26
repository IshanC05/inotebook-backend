const express = require('express');
const router = express.Router();
const fetchUser = require('../middleware/fetchuser');
const Note = require('../models/Note')
const { body, validationResult } = require('express-validator');

// Route 1: Get all the notes
router.get('/fetchallnotes', fetchUser, async (req, res) => {

    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json("Internal Server Error");
    }
})


// Route 2: Add a new note using POST
router.post('/addnote', fetchUser, [
    body('title', 'Enter a valid title').isLength({ min: 3 }),
    body('description', 'Description should be atleast 5 characters').isLength({ min: 5 })
], async (req, res) => {

    try {
        const { title, description, tag } = req.body;

        // If there are errors --> return Bad request  + errors

        const errors = validationResult(req)
        if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

        const note = new Note({
            title, description, tag, user: req.user.id
        })

        const savedNote = await note.save();

        res.json(savedNote);

    } catch (err) {
        console.log(err.message);
        return res.status(500).json("Internal Server Error");
    }
})


// Route 3: Update an existing note using PUT
router.put('/updatenote/:id', fetchUser, async (req, res) => {

    const { title, description, tag } = req.body;

    try {
        // Create a new notes object
        const newNote = {}

        if (title) { newNote.title = title }

        if (description) { newNote.description = description }

        if (tag) { newNote.tag = tag };

        // Find the note to be updated and update it

        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).send("Not Found")
        };

        if (note.user.toString() != req.user.id) {
            return res.status(401).send("Not allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, { $set: newNote }, { new: true });

        res.json(note);

    } catch (err) {
        console.log(err.message);
        return res.status(500).json("Internal Server Error");
    }
})


// Route 4: Delete an existing note using DELETE
router.delete('/deletenote/:id', fetchUser, async (req, res) => {

    try {

        // Find the note to be deleted and delete it

        let note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).send("Not Found");
        };

        // Allow deletion only by owner of the note
        if (note.user.toString() !== req.user.id) {
            return res.status(401).send("Not allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id);

        res.json({ "Success": "note has been deleted", "note": note });

    } catch (err) {
        console.log(err.message);
        return res.status(500).json("Internal Server Error");
    }
})


module.exports = router;