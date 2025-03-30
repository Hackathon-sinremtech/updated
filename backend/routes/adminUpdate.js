const express = require("express");
const supabase = require("../config/supabase")
const router = express.Router();

router.get('/doctor', async (req, res) => {
    const { data, error } = await supabase.from('doctor').select('*');
    if (error) return res.status(400).json({ error: error.message });
    res.json(data);
});

router.post('/doctor-add', async (req, res) => {
    const { name, specialty, experience, available, timeSlots } = req.body;
    console.log(name);

    try {
        const { error } = await supabase.from('doctor')
            .insert([{
                doctor_name: name,
                doctor_specialization: specialty,
                doctor_experience: experience,
                doctor_available: available,
                available_slot: timeSlots
            }]);

        if (error) throw error;
        res.status(201).json({ message: 'Doctor added successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

router.delete('/delete-doctor/:id', async (req, res) => {
    const { id } = req.params; // Get ID from URL

    try {
        const { data, error } = await supabase.from('doctor').delete().eq('id', id);

        if (error) throw error;
        res.status(200).json({ message: 'User deleted successfully', data });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
})

module.exports = router;