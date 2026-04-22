-- ============================================
-- LateTable: Meer Badges!
-- Run this in your Supabase SQL Editor
-- ============================================

-- Extra badges toevoegen
INSERT INTO badges (name, description, icon, condition_type, condition_value, rarity) VALUES
  -- Totaal te laat badges
  ('Beginner', '5x te laat geweest', 'star', 'total_late', 5, 'common'),
  ('Vaste Klant', '15x te laat geweest', 'medal', 'total_late', 15, 'rare'),
  ('Veteraan', '35x te laat geweest', 'shield', 'total_late', 35, 'epic'),
  ('Grootmeester', '75x te laat geweest', 'gem', 'total_late', 75, 'legendary'),
  ('Onstopbaar', '100x te laat geweest', 'rocket', 'total_late', 100, 'legendary'),

  -- Consecutive late badges (tussenstappen)
  ('Herhaler', '3x achter elkaar te laat', 'repeat', 'consecutive_late', 3, 'common'),
  ('Hardleers', '7x achter elkaar te laat', 'target', 'consecutive_late', 7, 'rare'),
  ('Hopeloos', '15x achter elkaar te laat', 'flame', 'consecutive_late', 15, 'epic'),

  -- Minutes late single (extreme cases)
  ('Slaapkop', 'Meer dan 15 minuten te laat', 'alarm-clock-off', 'minutes_late_single', 15, 'common'),
  ('Tijdreiziger', 'Meer dan 45 minuten te laat', 'rocket', 'minutes_late_single', 45, 'rare'),
  ('Verdwaald', 'Meer dan 90 minuten te laat', 'target', 'minutes_late_single', 90, 'epic'),
  ('Dag Later', 'Meer dan 120 minuten te laat (2 uur!)', 'gem', 'minutes_late_single', 120, 'legendary'),

  -- Average minutes late
  ('Beetje Laat', 'Gemiddeld meer dan 5 minuten te laat', 'star', 'minutes_late_avg', 5, 'common'),
  ('Best Laat', 'Gemiddeld meer dan 10 minuten te laat', 'medal', 'minutes_late_avg', 10, 'rare'),
  ('Echt Laat', 'Gemiddeld meer dan 20 minuten te laat', 'crown', 'minutes_late_avg', 20, 'epic'),
  ('Extreem Laat', 'Gemiddeld meer dan 30 minuten te laat', 'trophy', 'minutes_late_avg', 30, 'legendary'),

  -- No evidence badges (meer levels)
  ('Mysterieus', '3 incidents zonder bewijs', 'ghost', 'no_evidence', 3, 'common'),
  ('Spookverschijning', '10 incidents zonder bewijs', 'ghost', 'no_evidence', 10, 'epic'),
  ('Onzichtbaar', '20 incidents zonder bewijs', 'ghost', 'no_evidence', 20, 'legendary'),

  -- Always evidence badges (meer levels)
  ('Eerlijk', '5 incidents met bewijs', 'camera', 'always_evidence', 5, 'common'),
  ('Documentalist', '15 incidents met bewijs', 'camera', 'always_evidence', 15, 'epic'),
  ('Archivaris', '25 incidents met bewijs', 'camera', 'always_evidence', 25, 'legendary'),

  -- On time streak badges (meer levels)
  ('Beloftevol', '3x op tijd achter elkaar', 'heart', 'on_time_streak', 3, 'common'),
  ('Betrouwbaar', '7x op tijd achter elkaar', 'shield', 'on_time_streak', 7, 'rare'),
  ('Perfectionist', '15x op tijd achter elkaar', 'star', 'on_time_streak', 15, 'epic'),
  ('Tijdsgod', '20x op tijd achter elkaar', 'trophy', 'on_time_streak', 20, 'legendary')

ON CONFLICT DO NOTHING;

-- Done! 26 nieuwe badges toegevoegd
