// Database types
export interface Friend {
  id: string;
  name: string;
  color: string;
  created_at: string;
}

export interface Incident {
  id: string;
  friend_id: string;
  location: string | null;
  scheduled_time: string | null;
  minutes_late: number | null;
  photo_url: string | null;
  video_url: string | null;
  media_type: 'photo' | 'video' | null;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

// Badge types
export type BadgeConditionType =
  | 'consecutive_late'
  | 'total_late'
  | 'minutes_late_single'
  | 'minutes_late_avg'
  | 'no_evidence'
  | 'always_evidence'
  | 'on_time_streak'
  | 'first_late'
  | 'custom';

export type BadgeRarity = 'common' | 'rare' | 'epic' | 'legendary';

export interface Badge {
  id: string;
  name: string;
  description: string;
  icon: string;
  image_url: string | null;
  condition_type: BadgeConditionType;
  condition_value: number | null;
  rarity: BadgeRarity;
  is_system: boolean;
  created_at: string;
}

export interface FriendBadge {
  id: string;
  friend_id: string;
  badge_id: string;
  badge?: Badge;
  earned_at: string;
  earned_incident_id: string | null;
}

// Streak types
export type StreakType = 'late' | 'on_time';

export interface Streak {
  id: string;
  friend_id: string;
  streak_type: StreakType;
  current_count: number;
  best_count: number;
  last_incident_id: string | null;
  last_updated: string;
}

// Team trip types
export interface TeamTrip {
  id: string;
  name: string;
  description: string | null;
  latitude: number;
  longitude: number;
  address: string | null;
  photo_url: string | null;
  trip_date: string | null;
  created_by: string | null;
  creator?: Friend;
  created_at: string;
}

// Location types for map
export interface IncidentLocation {
  incident_id: string;
  latitude: number;
  longitude: number;
  incident: Incident;
  friend: Friend;
}

// Stats types
export interface LeaderboardEntry {
  friend: Friend;
  value: number;
  rank: number;
  change?: number;
}

export type LeaderboardType = 'most_late' | 'least_late' | 'avg_minutes' | 'current_streak' | 'best_streak';
export type LeaderboardPeriod = 'all_time' | 'month' | 'week';

export interface GroupStats {
  total_incidents: number;
  total_minutes_late: number;
  avg_minutes_late: number;
  most_common_day: string;
  most_common_hour: number;
  total_with_evidence: number;
}

export interface FunStat {
  label: string;
  value: string | number;
  icon: string;
  description?: string;
}

export interface GroupSetting {
  id: string;
  milestone_count: number;
  penalty_text: string;
  emoji: string;
  updated_at: string;
}

// Computed types
export interface Milestone {
  count: number;
  emoji: string;
  penalty: string;
}

export interface FriendWithStats extends Friend {
  incident_count: number;
  current_milestone: Milestone | null;
  next_milestone: Milestone | null;
  progress_percentage: number;
  incidents_until_next: number;
  last_incident: Incident | null;
  badges?: FriendBadge[];
  current_streak?: number;
  on_time_streak?: number;
}

// Media item for multiple uploads
export interface MediaItem {
  file: File;
  type: 'photo' | 'video';
  preview: string;
}

// Form types
export interface IncidentFormData {
  friend_id: string;
  location: string;
  scheduled_time: string;
  minutes_late: string;
  note: string;
  media: File | null;
  mediaType: 'photo' | 'video' | null;
  mediaItems: MediaItem[];
  latitude: number | null;
  longitude: number | null;
}

// On-time incident type
export interface OnTimeIncident {
  id: string;
  friend_id: string;
  location: string | null;
  photo_url: string | null;
  video_url: string | null;
  media_type: 'photo' | 'video' | null;
  note: string | null;
  latitude: number | null;
  longitude: number | null;
  created_at: string;
}

export interface OnTimeFormData {
  friend_id: string;
  location: string;
  note: string;
  media: File | null;
  mediaType: 'photo' | 'video' | null;
  mediaItems: MediaItem[];
  latitude: number | null;
  longitude: number | null;
}

// Team trip form
export interface TeamTripFormData {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  address: string;
  photo: File | null;
  trip_date: string;
}

// Custom badge form
export interface CustomBadgeFormData {
  name: string;
  description: string;
  icon: string;
  image: File | null;
  rarity: BadgeRarity;
}

// Gallery types
export interface IncidentWithFriend extends Incident {
  friend: Friend;
}

// Event types
export interface MilestoneReachedEvent {
  friend: Friend;
  milestone: Milestone;
  incidents: Incident[];
}

// Gallery types for milestone slideshows
export interface ReachedMilestone {
  milestone: Milestone;
  incidents: Incident[];  // Only incidents between previous milestone and this one
  reachedAt: string;      // Date when milestone was reached
}

export interface FriendMilestoneGallery {
  friend: Friend;
  totalIncidents: number;
  reachedMilestones: ReachedMilestone[];
}

// GIF Reaction types
export interface GifReaction {
  id: string;
  gif_id: string;
  gif_url: string;
  category: 'laugh' | 'shame' | 'shocked' | 'applause' | 'drama';
}

export interface IncidentReaction {
  id: string;
  incident_id: string;
  friend_id: string;
  gif_id: string;
  created_at: string;
}

// Season types
export interface Season {
  id: string;
  name: string | null;
  start_date: string;
  end_date: string | null;
  is_active: boolean;
}

export interface Reset {
  id: string;
  triggered_by: string | null;
  reset_at: string;
  stats_snapshot: {
    total_incidents: number;
    friends: Array<{ id: string; name: string; count: number }>;
  };
}

// Hall of Fame types
export interface HallOfFameRecord {
  type: 'longest_streak' | 'most_minutes_single' | 'total_minutes' | 'most_monthly' | 'longest_ontime';
  friend: Friend;
  value: number;
  incident?: Incident;
  date: string;
}

export interface IconicMoment {
  incident: Incident;
  friend: Friend;
}

// Extend Incident type
export interface IncidentExtended extends Incident {
  is_iconic: boolean;
  archived_at: string | null;
  season_id: string | null;
}

// Team Memories types
export interface MemoryAlbum {
  id: string;
  title: string;
  description: string | null;
  cover_url: string | null;
  event_date: string | null;
  created_at: string;
}

export interface MemoryPhoto {
  id: string;
  album_id: string;
  photo_url: string;
  video_url: string | null;
  caption: string | null;
  is_cover: boolean;
  created_at: string;
}

export interface MemoryAlbumWithPhotos extends MemoryAlbum {
  photos: MemoryPhoto[];
  photo_count: number;
}

export interface MemoryAlbumFormData {
  title: string;
  description: string;
  event_date: string;
  photos: File[];
}

// Task Board types
export type TaskPriority = 'P1' | 'P2' | 'P3';

export interface TaskAttachment {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
}

export interface ChecklistItem {
  id: string;
  text: string;
  completed: boolean;
}

export interface TaskComment {
  id: string;
  author_id: string;
  author_name: string;
  text: string;
  created_at: string;
}

export interface TaskColumn {
  id: string;
  name: string;
  color: string;
  position: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  column_id: string;
  priority: TaskPriority;
  position: number;
  assignee_ids: string[];
  attachments: TaskAttachment[];
  checklist: ChecklistItem[];
  comments: TaskComment[];
  created_at: string;
  updated_at: string;
}

export interface TaskWithColumn extends Task {
  column?: TaskColumn;
}

export interface TaskFormData {
  title: string;
  description: string;
  priority: TaskPriority;
  column_id: string;
  assignee_ids: string[];
  attachments: TaskAttachment[];
  checklist: ChecklistItem[];
  comments: TaskComment[];
}
