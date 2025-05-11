// src/controllers/trips.js
const supabase = require('../db/supabase');

exports.getAllTrips = async (req, res) => {
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .eq('owner_id', req.userId);

  if (error) throw error;
  res.json(data);
};

exports.createTrip = async (req, res) => {
  const { country, start_date, end_date, member_ids = [] } = req.body;

  // 1) Insert the trip and return it
  const { data: trip, error: e1 } = await supabase
    .from('trips')
    .insert({
      owner_id: req.userId,
      country,
      start_date,
      end_date,
    })
    .select()    
    .single();
  if (e1) throw e1;

  // 2) Upsert members (including owner)
  const uniqueIds = Array.from(new Set([req.userId, ...member_ids]));
  const members = uniqueIds.map((id) => ({
    trip_id: trip.id,
    member_id: id,
  }));
  const { error: e2 } = await supabase
    .from('trip_members')
    .insert(members);
  if (e2) throw e2;

  res.status(201).json(trip);
};

exports.getTripDetails = async (req, res) => {
  const { tripId } = req.params;

  // basic trip info
  const { data: trip, error: tErr } = await supabase
    .from('trips')
    .select('*')
    .eq('id', tripId)
    .single();
  if (tErr) throw tErr;

  // days + members + activities
  const { data: days, error: dErr } = await supabase
    .from('trip_days')
    .select(`
      *,
      day_members!inner(member_id),
      activities(*)
    `)
    .eq('trip_id', tripId)
    .order('day_date', { ascending: true });
  if (dErr) throw dErr;

  res.json({ trip, days });
};
