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
  created_at: string;
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
