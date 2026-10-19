export interface EventItem {
  id: string;
  title: string;
  description: string;
  date: string; // ISO string, e.g., "2026-10-25"
  displayDate: string; // e.g., "Sunday, Oct 25, 2026"
  time: string; // e.g., "10:00 AM - 12:00 PM"
  locationId: string; // ID matching location collection, e.g. "pinole", "san-ramon", "south-bay"
  locationName: string; // e.g., "Pinole Campus"
  locationAddress?: string; // e.g., "2800 Pinole Valley Rd, Pinole, CA"
  imageUrl?: string; // Optional image banner URL
  category?: string; // e.g., "Worship Service", "Prayer & Discipleship"
  featured?: boolean; // When true, highlighted card
  rsvpUrl?: string; // Optional RSVP link (e.g. Google Form)
}

export interface CampusOption {
  id: string;
  name: string;
}

export interface CampusFilterBarProps {
  campuses: CampusOption[];
  selectedCampusId: string; // "all" or specific locationId
  onSelectCampus: (campusId: string) => void;
  eventCountByCampus?: Record<string, number>;
}

export interface EventCardProps {
  event: EventItem;
  onViewDetails: (event: EventItem) => void;
}

export interface EventDetailsModalProps {
  isOpen: boolean;
  event: EventItem | null;
  onClose: () => void;
}

export interface EventsEmptyStateProps {
  selectedCampusName: string;
  onResetFilter: () => void;
}

export interface EventsErrorStateProps {
  errorMessage?: string;
  onRetry: () => void;
}
