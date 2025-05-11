// src/controllers/days.js
const supabase = require('../db/supabase');

exports.addDay = async (req, res) => {
  const { tripId } = req.params;
  const { day_date, city, hotel, member_ids = [] } = req.body;

  // 1) Insert the day and return it
  const { data: day, error: e1 } = await supabase
    .from('trip_days')
    .insert({
      trip_id: tripId,
      day_date,
      city,
      hotel,
    })
    .select()    
    .single();
  if (e1) throw e1;

  // 2) Add any members for that day
  const dayMembers = member_ids.map((id) => ({
    day_id: day.id,
    member_id: id,
  }));
  const { error: e2 } = await supabase
    .from('day_members')
    .insert(dayMembers);
  if (e2) throw e2;

  res.status(201).json(day);
};
