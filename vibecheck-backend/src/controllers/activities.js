// src/controllers/activities.js
const supabase = require('../db/supabase');

exports.addActivity = async (req, res) => {
  const { dayId } = req.params;
  const { description, points = 0 } = req.body;

  // Insert the activity and return it
  const { data, error } = await supabase
    .from('activities')
    .insert({
      day_id: dayId,
      description,
      points,
    })
    .select()    
    .single();
  if (error) throw error;

  res.status(201).json(data);
};
