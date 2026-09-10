export type Severity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED';

export type IncidentStatus = 
  | 'REPORTED'
  | 'PENDING VERIFICATION'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN PROGRESS'
  | 'RESOLVED'
  | 'CLOSED';

export type SosStatus = 'NEW' | 'ACKNOWLEDGED' | 'ASSIGNED' | 'RESOLVED';

export type ResourceStatus = 'AVAILABLE' | 'ASSIGNED' | 'DEPLOYED' | 'UNAVAILABLE' | 'MAINTENANCE';

export type ResourceType = 
  | 'ambulance'
  | 'rescue_team'
  | 'fire_unit'
  | 'police'
  | 'medical_team'
  | 'shelter'
  | 'supplies';

export type DisasterCategory = 
  | 'Flood'
  | 'Fire'
  | 'Earthquake'
  | 'Cyclone'
  | 'Landslide'
  | 'Building Collapse'
  | 'Road Accident'
  | 'Other';

export type DataSourceHealth = 'ONLINE' | 'DEGRADED' | 'OFFLINE';

export type UserRole = 'COORDINATOR' | 'CITIZEN' | 'NGO' | 'ADMIN';

export type NgoMissionStatus = 'PENDING_ACKNOWLEDGEMENT' | 'DISPATCHED' | 'ON_SITE' | 'COMPLETED';

export interface TimelineEvent {
  id: string;
  time: string;
  label: string;
  status: IncidentStatus;
  note?: string;
}

export interface Incident {
  id: string;
  title: string;
  type: DisasterCategory;
  description: string;
  latitude: number;
  longitude: number;
  locationName: string;
  severity: Severity;
  status: IncidentStatus;
  source: 'Citizen Report' | 'Government Agency' | 'Weather Feed' | 'Sensor Network' | 'Emergency Call' | 'Official Agency' | 'NGO Field Team';
  verified: boolean;
  verifiedBy?: string;
  affectedPeople: number;
  assignedResourceIds: string[];
  assignedNgoId?: string;
  assignedNgoName?: string;
  ngoMissionStatus?: NgoMissionStatus;
  ngoInstructions?: string;
  ngoSitrep?: string;
  timeline: TimelineEvent[];
  evidenceUrl?: string;
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

export interface NgoMission {
  id: string;
  incidentId: string;
  incidentTitle: string;
  disasterType: DisasterCategory;
  severity: Severity;
  locationName: string;
  latitude: number;
  longitude: number;
  assignedNgoId: string;
  assignedNgoName: string;
  dispatchedAt: string;
  status: NgoMissionStatus;
  instructions: string;
  fieldNotes?: string;
  affectedPeople: number;
}

export interface NgoOrganization {
  id: string;
  name: string;
  focus: string;
  contact: string;
  headquartersPoc: string;
  activeVolunteers: number;
  assignedMissionsCount: number;
  operationalZones: string[];
  headquartersZone?: string;
  activeSquads?: number;
  status?: string;
  specializations?: string[];
  phone?: string;
  contactPoc?: string;
}

export interface SosRequest {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  incidentId?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  disasterType: DisasterCategory;
  peopleCount: number;
  description?: string;
  status: SosStatus;
  createdAt: string;
  acknowledgedAt?: string;
  assignedTo?: string;
  assignedNgoId?: string;
  assignedNgoStatus?: NgoMissionStatus;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  latitude: number;
  longitude: number;
  locationZone: string;
  capacity: number;
  contact: string;
  assignedIncidentId?: string;
  updatedTime: string;
}

export interface EmergencyAlert {
  id: string;
  title: string;
  message: string;
  disasterType: DisasterCategory;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'INFO';
  geographicArea: string;
  instructions: string;
  issuedBy: string;
  issuedAt: string;
  expiresAt: string;
  status: 'ACTIVE' | 'EXPIRED' | 'DRAFT';
}

export interface LocalityInfo {
  name: string;
  latitude: number;
  longitude: number;
  zone?: string;
}

export interface CityInfo {
  id: string;
  name: string;
  state: string;
  center: [number, number];
  zoom: number;
  localities: LocalityInfo[];
}

export type HelpCategory = 'helpline' | 'medical' | 'food_water' | 'assembly_point';

export interface EmergencyHelp {
  id: string;
  name: string;
  category: HelpCategory;
  city: string;
  locality: string;
  address: string;
  phone: string;
  operationalHours: string;
  details: string;
  latitude: number;
  longitude: number;
}

export interface Shelter {
  id: string;
  name: string;
  locationName: string;
  city: string;
  locality: string;
  latitude: number;
  longitude: number;
  capacity: number;
  currentOccupancy: number;
  contact: string;
  status: 'OPEN' | 'FULL' | 'STANDBY';
  suppliesAvailable: string[];
}

export interface ExternalDataSource {
  id: string;
  name: string;
  sourceType: 'Weather Feed' | 'Disaster Feed' | 'Government Feed' | 'Citizen Reports';
  endpoint: string;
  status: DataSourceHealth;
  lastSuccessfulSync: string;
  message?: string;
  itemsSyncedCount?: number;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  role: string;
  action: string;
  targetId: string;
  details: string;
}
