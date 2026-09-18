import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import {
  Incident,
  SosRequest,
  Resource,
  EmergencyAlert,
  Shelter,
  ExternalDataSource,
  AuditLog,
  UserRole,
  Severity,
  IncidentStatus,
  DisasterCategory,
  CityInfo,
  LocalityInfo,
  EmergencyHelp,
  NgoMissionStatus,
  TimelineEvent,
} from '../types';
import {
  INITIAL_INCIDENTS,
  INITIAL_SOS_REQUESTS,
  INITIAL_RESOURCES,
  INITIAL_ALERTS,
  INITIAL_SHELTERS,
  INITIAL_DATA_SOURCES,
  INITIAL_AUDIT_LOGS,
  SUPPORTED_CITIES,
  INITIAL_EMERGENCY_HELPS,
  NGO_ORGANIZATIONS,
  NgoOrganization,
  getLocalityEvidenceImage,
} from '../mockData';

export interface UserCoordinates {
  latitude: number;
  longitude: number;
  accuracy: number;
  timestamp: number;
  source?: 'locality' | 'gps' | 'network' | 'ip' | 'manual';
}

export type GeoAccuracyStatus = 'high' | 'approximate' | 'calibrating' | 'error' | 'manual';

interface DisasterContextType {
  role: UserRole;
  setRole: (role: UserRole) => void;
  hasSelectedRole: boolean;
  selectAndLockRole: (role: UserRole) => void;
  logoutRole: () => void;
  
  // City & Locality Management
  selectedCity: string;
  selectedLocality: string;
  setSelectedCity: (city: string) => void;
  setSelectedLocality: (locality: string) => void;
  supportedCities: CityInfo[];
  activeCityInfo: CityInfo;
  activeLocalityInfo: LocalityInfo;
  emergencyHelps: EmergencyHelp[];

  // Compatibility fields (coordinates bound to selected locality, no hardware GPS polling)
  userCoordinates: UserCoordinates | null;
  isTrackingGeo: boolean;
  isLocating: boolean;
  geoAccuracyStatus: GeoAccuracyStatus;
  refreshUserLocation: () => Promise<void>;
  setUserLocationManually: (lat: number, lng: number, accuracy?: number) => void;

  activeNav: string;
  setActiveNav: (nav: string) => void;
  incidents: Incident[];
  sosRequests: SosRequest[];
  resources: Resource[];
  alerts: EmergencyAlert[];
  shelters: Shelter[];
  dataSources: ExternalDataSource[];
  auditLogs: AuditLog[];
  selectedIncidentId: string | null;
  selectedIncident: Incident | null;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  selectIncident: (id: string | null) => void;
  verifyIncident: (id: string, severity: Severity) => void;
  rejectIncident: (id: string) => void;
  updateIncidentStatus: (id: string, status: IncidentStatus, note?: string) => void;
  updateIncidentSeverity: (id: string, severity: Severity) => void;
  assignResourceToIncident: (incidentId: string, resourceId: string) => void;
  releaseResource: (resourceId: string) => void;
  submitCitizenSos: (data: {
    userName: string;
    userPhone: string;
    disasterType: DisasterCategory;
    peopleCount: number;
    description?: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    city?: string;
    locality?: string;
  }) => string;
  acknowledgeSos: (id: string) => void;
  assignSos: (id: string, resourceName: string) => void;
  resolveSos: (id: string) => void;
  submitCitizenReport: (report: {
    type: DisasterCategory;
    description: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    city?: string;
    locality?: string;
    affectedPeople: number;
    evidenceUrl?: string;
  }) => string;
  publishAlert: (alertData: Omit<EmergencyAlert, 'id' | 'issuedAt' | 'status'>) => void;
  updateDataSourceStatus: (id: string, status: 'ONLINE' | 'DEGRADED' | 'OFFLINE', message?: string) => void;
  updateShelterOccupancy: (id: string, count: number) => void;
  runScenario: (scenario: 'flood_surge' | 'resolve_104' | 'govt_outage' | 'reset_all') => void;
  
  // Direct Headquarters-to-NGO Connection Methods
  ngoOrganizations: NgoOrganization[];
  selectedNgoId: string;
  setSelectedNgoId: (id: string) => void;
  dispatchIncidentToNgo: (incidentId: string, ngoId: string, ngoName: string, instructions?: string) => void;
  updateNgoMissionStatus: (incidentId: string, status: NgoMissionStatus, fieldNote?: string) => void;
  sendSitrepToHq: (incidentId: string, sitrepText: string) => void;
  dispatchSosToNgo: (sosId: string, ngoName: string, ngoId?: string) => void;

  // KPI counts
  activeIncidentsCount: number;
  criticalIncidentsCount: number;
  pendingVerificationCount: number;
  activeSosCount: number;
  availableResourcesCount: number;
  activeAlertsCount: number;
}

const DisasterContext = createContext<DisasterContextType | undefined>(undefined);

// Web Audio API emergency tone synthesizer
const playEmergencyTone = () => {
  try {
    const AudioContext = window.AudioContext || (window as unknown as { webkitAudioContext: typeof window.AudioContext }).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'sine';
    osc.frequency.setValueAtTime(880, ctx.currentTime); // A5
    osc.frequency.exponentialRampToValueAtTime(440, ctx.currentTime + 0.3);
    gain.gain.setValueAtTime(0.15, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch {
    // AudioContext blocked or not supported
  }
};

export const DisasterProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Role & First-Time Mandatory Lock Persistence
  const [role, setRole] = useState<UserRole>(() => {
    const saved = localStorage.getItem('disaster_mandatory_role_locked');
    if (saved === 'RESPONDER') return 'NGO';
    return (saved as UserRole) || 'COORDINATOR';
  });

  const [hasSelectedRole, setHasSelectedRole] = useState<boolean>(() => {
    const saved = localStorage.getItem('disaster_mandatory_role_locked');
    return Boolean(saved && ['COORDINATOR', 'CITIZEN', 'NGO'].includes(saved === 'RESPONDER' ? 'NGO' : saved));
  });

  // Supported Cities & Municipal Localities
  const supportedCities = SUPPORTED_CITIES;

  const [selectedCity, setSelectedCityState] = useState<string>(() => {
    return localStorage.getItem('disaster_selected_city') || 'Ahmedabad';
  });

  const activeCityInfo = useMemo(() => {
    return supportedCities.find((c) => c.name === selectedCity) || supportedCities[0];
  }, [supportedCities, selectedCity]);

  const [selectedLocality, setSelectedLocalityState] = useState<string>(() => {
    const saved = localStorage.getItem('disaster_selected_locality');
    if (saved && activeCityInfo.localities.some((l) => l.name === saved)) {
      return saved;
    }
    return activeCityInfo.localities[0]?.name || 'Paldi';
  });

  const activeLocalityInfo = useMemo(() => {
    const found = activeCityInfo.localities.find((l) => l.name === selectedLocality);
    if (found) return found;
    return activeCityInfo.localities[0] || {
      name: activeCityInfo.name,
      latitude: activeCityInfo.center[0],
      longitude: activeCityInfo.center[1],
      zone: 'Central',
    };
  }, [activeCityInfo, selectedLocality]);

  const [emergencyHelps] = useState<EmergencyHelp[]>(INITIAL_EMERGENCY_HELPS);

  // Derived location coordinates bound to selected locality (No hardware GPS polling)
  const userCoordinates = useMemo<UserCoordinates>(() => ({
    latitude: activeLocalityInfo.latitude,
    longitude: activeLocalityInfo.longitude,
    accuracy: 10,
    timestamp: Date.now(),
    source: 'locality',
  }), [activeLocalityInfo]);

  const isLocating = false;
  const isTrackingGeo = false;
  const geoAccuracyStatus: GeoAccuracyStatus = 'high';

  const refreshUserLocation = useCallback(async () => {
    // City & Locality selector is used instead of live GPS
  }, []);

  const setUserLocationManually = useCallback((_lat: number, _lng: number) => {
    // Locality coordinates are set via setSelectedLocality
  }, []);

  const [selectedIncidentId, setSelectedIncidentId] = useState<string | null>('104');

  const setSelectedCity = useCallback((cityName: string) => {
    const targetCity = supportedCities.find((c) => c.name === cityName);
    if (!targetCity) return;
    setSelectedCityState(cityName);
    localStorage.setItem('disaster_selected_city', cityName);
    const firstLocality = targetCity.localities[0]?.name || '';
    setSelectedLocalityState(firstLocality);
    localStorage.setItem('disaster_selected_locality', firstLocality);
    setSelectedIncidentId('104');
    addAuditLog('CITY_CHANGED', cityName, `Operational city switched to ${cityName} (Locality: ${firstLocality}).`);
  }, [supportedCities]);

  const setSelectedLocality = useCallback((localityName: string) => {
    setSelectedLocalityState(localityName);
    localStorage.setItem('disaster_selected_locality', localityName);
    setSelectedIncidentId('104');
    addAuditLog('LOCALITY_CHANGED', localityName, `Operational locality updated to ${localityName} (${selectedCity}).`);
  }, [selectedCity]);

  const setRoleAndPersist = (newRole: UserRole) => {
    setRole(newRole);
    setHasSelectedRole(true);
    localStorage.setItem('disaster_mandatory_role_locked', newRole);
    localStorage.removeItem('disaster_selected_role');
    addAuditLog('ROLE_SWITCHED', newRole, `Operational role switched to: ${newRole}.`);
  };

  const selectAndLockRole = (newRole: UserRole) => {
    setRoleAndPersist(newRole);
  };

  const logoutRole = () => {
    localStorage.removeItem('disaster_mandatory_role_locked');
    localStorage.removeItem('disaster_selected_role');
    setHasSelectedRole(false);
    setRole('COORDINATOR');
    addAuditLog('ROLE_RESET', 'ALL', 'Role selection reset. Reopening selection gateway.');
  };

  const [activeNav, setActiveNav] = useState<string>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Core collections initialized from mock data and synchronized to active locality
  const [incidents, setIncidents] = useState<Incident[]>(() => {
    const saved = localStorage.getItem('disaster_incidents');
    const raw: Incident[] = saved ? JSON.parse(saved) : INITIAL_INCIDENTS;
    const initialLocName = `${activeLocalityInfo.name}, ${selectedCity}, ${activeCityInfo?.state || 'Gujarat'}`;
    const initialEvidenceUrl = getLocalityEvidenceImage(activeLocalityInfo.name, selectedCity);
    return raw.map((inc) => {
      if (inc.id === '104') {
        return {
          ...inc,
          locationName: initialLocName,
          latitude: activeLocalityInfo.latitude,
          longitude: activeLocalityInfo.longitude,
          evidenceUrl: initialEvidenceUrl,
          ngoInstructions: `Deploy 2 inflatable rescue boats to ${activeLocalityInfo.name}; evacuate 12 stranded residents and provide immediate hot meals.`,
        };
      }
      return inc;
    });
  });

  const [sosRequests, setSosRequests] = useState<SosRequest[]>(() => {
    const saved = localStorage.getItem('disaster_sos');
    const raw: SosRequest[] = saved ? JSON.parse(saved) : INITIAL_SOS_REQUESTS;
    return raw.map((sos) => {
      if (sos.id === 'SOS-891') {
        return {
          ...sos,
          locationName: `${activeLocalityInfo.name} Shivalik Park, Flat 201, ${selectedCity}`,
          latitude: activeLocalityInfo.latitude + 0.001,
          longitude: activeLocalityInfo.longitude - 0.001,
        };
      }
      return sos;
    });
  });

  const [resources, setResources] = useState<Resource[]>(() => {
    const saved = localStorage.getItem('disaster_resources');
    const raw: Resource[] = saved ? JSON.parse(saved) : INITIAL_RESOURCES;
    return raw.map((res) => {
      if (res.assignedIncidentId === '104') {
        return {
          ...res,
          latitude: activeLocalityInfo.latitude + (res.id === 'res-amb-02' ? 0.0005 : -0.0005),
          longitude: activeLocalityInfo.longitude + (res.id === 'res-amb-02' ? 0.0005 : -0.0005),
          locationZone: `${activeLocalityInfo.name} Sector`,
        };
      }
      return res;
    });
  });

  const [alerts, setAlerts] = useState<EmergencyAlert[]>(() => {
    const saved = localStorage.getItem('disaster_alerts');
    return saved ? JSON.parse(saved) : INITIAL_ALERTS;
  });

  const [ngoOrganizations] = useState<NgoOrganization[]>(NGO_ORGANIZATIONS);
  const [selectedNgoId, setSelectedNgoId] = useState<string>('ngo-redcross-01');

  const [shelters, setShelters] = useState<Shelter[]>(() => {
    const saved = localStorage.getItem('disaster_shelters');
    return saved ? JSON.parse(saved) : INITIAL_SHELTERS;
  });

  const [dataSources, setDataSources] = useState<ExternalDataSource[]>(() => {
    const saved = localStorage.getItem('disaster_sources');
    return saved ? JSON.parse(saved) : INITIAL_DATA_SOURCES;
  });

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>(() => {
    const saved = localStorage.getItem('disaster_logs');
    return saved ? JSON.parse(saved) : INITIAL_AUDIT_LOGS;
  });

  // Sync to local storage for persistence across reloads
  useEffect(() => {
    localStorage.setItem('disaster_incidents', JSON.stringify(incidents));
  }, [incidents]);

  useEffect(() => {
    localStorage.setItem('disaster_sos', JSON.stringify(sosRequests));
  }, [sosRequests]);

  useEffect(() => {
    localStorage.setItem('disaster_resources', JSON.stringify(resources));
  }, [resources]);

  useEffect(() => {
    localStorage.setItem('disaster_alerts', JSON.stringify(alerts));
  }, [alerts]);

  useEffect(() => {
    localStorage.setItem('disaster_shelters', JSON.stringify(shelters));
  }, [shelters]);

  useEffect(() => {
    localStorage.setItem('disaster_sources', JSON.stringify(dataSources));
  }, [dataSources]);

  useEffect(() => {
    localStorage.setItem('disaster_logs', JSON.stringify(auditLogs));
  }, [auditLogs]);

  // Dynamically synchronize Incident #104, SOS-891, and assigned resources to active locality & city
  useEffect(() => {
    if (!activeLocalityInfo) return;
    const targetLocName = `${activeLocalityInfo.name}, ${selectedCity}, ${activeCityInfo?.state || 'Gujarat'}`;
    const targetEvidenceUrl = getLocalityEvidenceImage(activeLocalityInfo.name, selectedCity);

    setIncidents((prev) => {
      const target = prev.find((i) => i.id === '104');
      if (
        target &&
        target.locationName === targetLocName &&
        target.evidenceUrl === targetEvidenceUrl &&
        Math.abs(target.latitude - activeLocalityInfo.latitude) < 0.0001 &&
        Math.abs(target.longitude - activeLocalityInfo.longitude) < 0.0001
      ) {
        return prev;
      }
      return prev.map((inc) => {
        if (inc.id === '104') {
          return {
            ...inc,
            locationName: targetLocName,
            latitude: activeLocalityInfo.latitude,
            longitude: activeLocalityInfo.longitude,
            evidenceUrl: targetEvidenceUrl,
            ngoInstructions: `Deploy 2 inflatable rescue boats to ${activeLocalityInfo.name}; evacuate 12 stranded residents and provide immediate hot meals.`,
          };
        }
        return inc;
      });
    });

    setSosRequests((prev) => {
      const target = prev.find((s) => s.id === 'SOS-891');
      const targetSosLocName = `${activeLocalityInfo.name} Shivalik Park, Flat 201, ${selectedCity}`;
      if (
        target &&
        target.locationName === targetSosLocName &&
        Math.abs(target.latitude - activeLocalityInfo.latitude) < 0.0001
      ) {
        return prev;
      }
      return prev.map((sos) => {
        if (sos.id === 'SOS-891') {
          return {
            ...sos,
            locationName: targetSosLocName,
            latitude: activeLocalityInfo.latitude + 0.001,
            longitude: activeLocalityInfo.longitude - 0.001,
          };
        }
        return sos;
      });
    });

    setResources((prev) => {
      return prev.map((res) => {
        if (res.assignedIncidentId === '104') {
          return {
            ...res,
            latitude: activeLocalityInfo.latitude + (res.id === 'res-amb-02' ? 0.0005 : -0.0005),
            longitude: activeLocalityInfo.longitude + (res.id === 'res-amb-02' ? 0.0005 : -0.0005),
            locationZone: `${activeLocalityInfo.name} Sector`,
          };
        }
        return res;
      });
    });
  }, [activeLocalityInfo, selectedCity, activeCityInfo]);

  // Selected incident object
  const selectedIncident = incidents.find((i) => i.id === selectedIncidentId) || null;

  const addAuditLog = (action: string, targetId: string, details: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    const newLog: AuditLog = {
      id: `log-${Date.now()}`,
      timestamp: timeStr,
      actor: role === 'COORDINATOR' ? 'Riya Sharma (Coordinator)' : `${role} User`,
      role,
      action,
      targetId,
      details,
    };
    setAuditLogs((prev) => [newLog, ...prev]);
  };

  const selectIncident = (id: string | null) => {
    setSelectedIncidentId(id);
  };

  const verifyIncident = (id: string, severity: Severity) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updatedTimeline = [
            ...inc.timeline,
            {
              id: `t-${Date.now()}`,
              time: timeStr,
              label: 'Verified',
              status: 'VERIFIED' as IncidentStatus,
              note: `Verified by coordinator with severity: ${severity}`,
            },
          ];
          return {
            ...inc,
            verified: true,
            verifiedBy: 'Riya Sharma (Coordinator)',
            severity,
            status: 'VERIFIED',
            timeline: updatedTimeline,
            updatedAt: now.toISOString(),
          };
        }
        return inc;
      })
    );
    addAuditLog('VERIFY_INCIDENT', `Incident #${id}`, `Report verified with ${severity} severity.`);
  };

  const rejectIncident = (id: string) => {
    setIncidents((prev) => prev.filter((inc) => inc.id !== id));
    if (selectedIncidentId === id) setSelectedIncidentId(null);
    addAuditLog('REJECT_REPORT', `Incident #${id}`, 'Report rejected as duplicate or unverifiable.');
  };

  const updateIncidentStatus = (id: string, status: IncidentStatus, note?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === id) {
          const updatedTimeline = [
            ...inc.timeline,
            {
              id: `t-${Date.now()}`,
              time: timeStr,
              label: status,
              status,
              note: note || `Status updated to ${status}`,
            },
          ];
          return {
            ...inc,
            status,
            timeline: updatedTimeline,
            updatedAt: now.toISOString(),
            resolvedAt: status === 'RESOLVED' || status === 'CLOSED' ? now.toISOString() : inc.resolvedAt,
          };
        }
        return inc;
      })
    );
    addAuditLog('STATUS_CHANGE', `Incident #${id}`, `Incident status updated to ${status}.`);
  };

  const updateIncidentSeverity = (id: string, severity: Severity) => {
    setIncidents((prev) =>
      prev.map((inc) => (inc.id === id ? { ...inc, severity, updatedAt: new Date().toISOString() } : inc))
    );
    addAuditLog('SEVERITY_CHANGE', `Incident #${id}`, `Incident severity updated to ${severity}.`);
  };

  const assignResourceToIncident = (incidentId: string, resourceId: string) => {
    const res = resources.find((r) => r.id === resourceId);
    if (!res) return;

    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, status: 'DEPLOYED', assignedIncidentId: incidentId } : r))
    );

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id === incidentId) {
          const now = new Date();
          const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
          const newResources = Array.from(new Set([...inc.assignedResourceIds, resourceId]));
          return {
            ...inc,
            assignedResourceIds: newResources,
            status: inc.status === 'REPORTED' || inc.status === 'PENDING VERIFICATION' || inc.status === 'VERIFIED' ? 'ASSIGNED' : inc.status,
            timeline: [
              ...inc.timeline,
              {
                id: `t-${Date.now()}`,
                time: timeStr,
                label: 'Assigned',
                status: 'ASSIGNED',
                note: `Assigned ${res.name}`,
              },
            ],
            updatedAt: now.toISOString(),
          };
        }
        return inc;
      })
    );

    addAuditLog('RESOURCE_ASSIGN', `Incident #${incidentId}`, `Assigned ${res.name} (${res.type}).`);
  };

  const releaseResource = (resourceId: string) => {
    const res = resources.find((r) => r.id === resourceId);
    if (!res) return;
    const prevIncidentId = res.assignedIncidentId;

    setResources((prev) =>
      prev.map((r) => (r.id === resourceId ? { ...r, status: 'AVAILABLE', assignedIncidentId: undefined } : r))
    );

    if (prevIncidentId) {
      setIncidents((prev) =>
        prev.map((inc) =>
          inc.id === prevIncidentId
            ? { ...inc, assignedResourceIds: inc.assignedResourceIds.filter((id) => id !== resourceId) }
            : inc
        )
      );
    }

    addAuditLog('RESOURCE_RELEASE', resourceId, `Released ${res.name} back to available pool.`);
  };

  const submitCitizenSos = (data: {
    userName: string;
    userPhone: string;
    disasterType: DisasterCategory;
    peopleCount: number;
    description?: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    city?: string;
    locality?: string;
  }): string => {
    const randomId = `SOS-${Math.floor(100 + Math.random() * 900)}`;
    const now = new Date();
    
    const city = data.city || selectedCity;
    const locality = data.locality || selectedLocality;
    const lat = data.latitude !== undefined ? data.latitude : activeLocalityInfo.latitude;
    const lng = data.longitude !== undefined ? data.longitude : activeLocalityInfo.longitude;
    const loc = data.locationName || `${locality}, ${city}`;

    const newSos: SosRequest = {
      id: randomId,
      userId: `usr-cit-${Date.now()}`,
      userName: data.userName || 'Citizen in Danger',
      userPhone: data.userPhone || '+91 98000 00000',
      disasterType: data.disasterType,
      peopleCount: data.peopleCount,
      description: data.description,
      latitude: lat,
      longitude: lng,
      locationName: loc,
      status: 'NEW',
      createdAt: now.toISOString(),
    };

    setSosRequests((prev) => [newSos, ...prev]);

    // Automatically register as an active community incident
    const newIncident: Incident = {
      id: `${Math.floor(200 + Math.random() * 800)}`,
      title: `Live SOS: ${data.peopleCount} citizens trapped in ${data.disasterType} (${locality})`,
      type: data.disasterType,
      description: data.description || `Emergency SOS beacon triggered in ${locality}, ${city}. Immediate intervention needed.`,
      latitude: lat,
      longitude: lng,
      locationName: loc,
      severity: 'CRITICAL',
      status: 'REPORTED',
      source: 'Citizen Report',
      verified: false,
      affectedPeople: data.peopleCount,
      assignedResourceIds: [],
      timeline: [
        {
          id: `t-${Date.now()}`,
          time: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }),
          label: 'SOS Beacon Received',
          status: 'REPORTED',
          note: `SOS ID: ${randomId}. Location: ${locality}, ${city} (${lat.toFixed(4)}° N, ${lng.toFixed(4)}° E).`,
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };
    setIncidents((prev) => [newIncident, ...prev]);

    if (soundEnabled) {
      playEmergencyTone();
    }

    addAuditLog('SOS_SUBMITTED', randomId, `Citizen ${data.userName} triggered SOS for ${data.peopleCount} people at ${loc}.`);
    return randomId;
  };

  const acknowledgeSos = (id: string) => {
    const now = new Date();
    setSosRequests((prev) =>
      prev.map((sos) => (sos.id === id ? { ...sos, status: 'ACKNOWLEDGED', acknowledgedAt: now.toISOString() } : sos))
    );
    addAuditLog('SOS_ACKNOWLEDGED', id, 'Coordinator acknowledged receipt of SOS request.');
  };

  const assignSos = (id: string, resourceName: string) => {
    setSosRequests((prev) =>
      prev.map((sos) => (sos.id === id ? { ...sos, status: 'ASSIGNED', assignedTo: resourceName } : sos))
    );
    addAuditLog('SOS_ASSIGNED', id, `Assigned ${resourceName} to SOS request.`);
  };

  const resolveSos = (id: string) => {
    setSosRequests((prev) =>
      prev.map((sos) => (sos.id === id ? { ...sos, status: 'RESOLVED' } : sos))
    );
    addAuditLog('SOS_RESOLVED', id, 'SOS rescue verified and closed.');
  };

  const dispatchIncidentToNgo = (incidentId: string, ngoId: string, ngoName: string, instructions?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newTimelineEvent: TimelineEvent = {
          id: `t-ngo-${Date.now()}`,
          time: timeStr,
          label: 'Dispatched to NGO',
          status: 'ASSIGNED',
          note: `Assigned directly to ${ngoName}. Directives: ${instructions || 'Immediate relief, medical triage and rescue support.'}`
        };
        return {
          ...inc,
          status: inc.status === 'REPORTED' || inc.status === 'VERIFIED' ? 'ASSIGNED' : inc.status,
          assignedNgoId: ngoId,
          assignedNgoName: ngoName,
          ngoMissionStatus: 'DISPATCHED',
          ngoInstructions: instructions || 'Immediate relief, medical triage and rescue support.',
          timeline: [...inc.timeline, newTimelineEvent],
          updatedAt: now.toISOString()
        };
      })
    );
    addAuditLog('INCIDENT_ASSIGNED', incidentId, `Dispatched incident directly to NGO: ${ngoName}`);
  };

  const updateNgoMissionStatus = (incidentId: string, status: NgoMissionStatus, fieldNote?: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    let lifecycleStatus: IncidentStatus = 'IN PROGRESS';
    let label = 'NGO Mission Update';
    if (status === 'COMPLETED') {
      lifecycleStatus = 'RESOLVED';
      label = 'NGO Mission Completed';
    } else if (status === 'ON_SITE') {
      lifecycleStatus = 'IN PROGRESS';
      label = 'NGO Squad On-Site';
    } else if (status === 'DISPATCHED') {
      lifecycleStatus = 'IN PROGRESS';
      label = 'NGO Squad En Route';
    } else if (status === 'PENDING_ACKNOWLEDGEMENT') {
      lifecycleStatus = 'ASSIGNED';
      label = 'NGO Order Acknowledged';
    }

    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newTimelineEvent: TimelineEvent = {
          id: `t-ngostat-${Date.now()}`,
          time: timeStr,
          label,
          status: lifecycleStatus,
          note: fieldNote || `NGO updated mission status to ${status}`
        };
        return {
          ...inc,
          status: lifecycleStatus,
          ngoMissionStatus: status,
          ngoSitrep: fieldNote || inc.ngoSitrep,
          timeline: [...inc.timeline, newTimelineEvent],
          updatedAt: now.toISOString(),
          resolvedAt: status === 'COMPLETED' ? now.toISOString() : inc.resolvedAt
        };
      })
    );
    addAuditLog('STATUS_CHANGED', incidentId, `NGO updated status to ${status}: ${fieldNote || ''}`);
  };

  const sendSitrepToHq = (incidentId: string, sitrepText: string) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    
    setIncidents((prev) =>
      prev.map((inc) => {
        if (inc.id !== incidentId) return inc;
        const newTimelineEvent: TimelineEvent = {
          id: `t-sitrep-${Date.now()}`,
          time: timeStr,
          label: 'NGO SITREP Received',
          status: inc.status,
          note: `[DIRECT SITREP / ${inc.assignedNgoName || 'NGO'}]: ${sitrepText}`
        };
        return {
          ...inc,
          ngoSitrep: sitrepText,
          timeline: [...inc.timeline, newTimelineEvent],
          updatedAt: now.toISOString()
        };
      })
    );
    addAuditLog('SITREP_RECEIVED', incidentId, `Received NGO SITREP: ${sitrepText}`);
  };

  const dispatchSosToNgo = (sosId: string, ngoName: string, ngoId?: string) => {
    setSosRequests((prev) =>
      prev.map((sos) => (sos.id === sosId ? { ...sos, status: 'ASSIGNED', assignedTo: ngoName, assignedNgoId: ngoId, assignedNgoStatus: 'DISPATCHED' } : sos))
    );
    addAuditLog('SOS_ASSIGNED', sosId, `Dispatched SOS request directly to NGO ${ngoName}.`);
  };

  const submitCitizenReport = (report: {
    type: DisasterCategory;
    description: string;
    latitude?: number;
    longitude?: number;
    locationName?: string;
    city?: string;
    locality?: string;
    affectedPeople: number;
    evidenceUrl?: string;
  }): string => {
    const newId = `${Math.floor(200 + Math.random() * 800)}`;
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const city = report.city || selectedCity;
    const locality = report.locality || selectedLocality;
    const lat = report.latitude !== undefined ? report.latitude : activeLocalityInfo.latitude;
    const lng = report.longitude !== undefined ? report.longitude : activeLocalityInfo.longitude;
    const loc = report.locationName || `${locality}, ${city}`;

    const newIncident: Incident = {
      id: newId,
      title: `Citizen Report: ${report.type} at ${locality}, ${city}`,
      type: report.type,
      description: report.description,
      latitude: lat,
      longitude: lng,
      locationName: loc,
      severity: 'UNVERIFIED',
      status: 'PENDING VERIFICATION',
      source: 'Citizen Report',
      verified: false,
      affectedPeople: report.affectedPeople,
      assignedResourceIds: [],
      evidenceUrl: report.evidenceUrl,
      timeline: [
        {
          id: `t-${Date.now()}`,
          time: timeStr,
          label: 'Reported',
          status: 'PENDING VERIFICATION',
          note: `Submitted through Citizen Report flow for ${locality}, ${city}.`,
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    setIncidents((prev) => [newIncident, ...prev]);
    addAuditLog('CITIZEN_REPORT', `Incident #${newId}`, `Citizen reported ${report.type} at ${loc}.`);
    return newId;
  };

  const publishAlert = (alertData: Omit<EmergencyAlert, 'id' | 'issuedAt' | 'status'>) => {
    const now = new Date();
    const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const newAlert: EmergencyAlert = {
      ...alertData,
      id: `ALT-${Math.floor(200 + Math.random() * 800)}`,
      issuedAt: timeStr,
      status: 'ACTIVE',
    };
    setAlerts((prev) => [newAlert, ...prev]);
    addAuditLog('PUBLISH_ALERT', newAlert.id, `Official alert broadcasted: "${newAlert.title}" for ${newAlert.geographicArea}.`);
  };

  const updateDataSourceStatus = (id: string, status: 'ONLINE' | 'DEGRADED' | 'OFFLINE', message?: string) => {
    setDataSources((prev) =>
      prev.map((src) =>
        src.id === id
          ? {
              ...src,
              status,
              message: message || src.message,
              lastSuccessfulSync: status === 'ONLINE' ? 'Just now' : src.lastSuccessfulSync,
            }
          : src
      )
    );
    addAuditLog('DATASOURCE_UPDATE', id, `Feed status updated to ${status}.`);
  };

  const updateShelterOccupancy = (id: string, count: number) => {
    setShelters((prev) =>
      prev.map((sh) => {
        if (sh.id === id) {
          const newStatus = count >= sh.capacity ? 'FULL' : 'OPEN';
          return { ...sh, currentOccupancy: count, status: newStatus };
        }
        return sh;
      })
    );
  };

  const runScenario = (scenario: 'flood_surge' | 'resolve_104' | 'govt_outage' | 'reset_all') => {
    if (scenario === 'flood_surge') {
      submitCitizenSos({
        userName: 'Pooja Bhatt',
        userPhone: '+91 98250 88990',
        disasterType: 'Flood',
        peopleCount: 7,
        description: 'Water breached ground floor of hospital ward. 7 patients need boat extraction immediately!',
        latitude: 23.0380,
        longitude: 72.5710,
        locationName: 'Ashram Road Civil Transit Point, Ahmedabad',
      });
      submitCitizenSos({
        userName: 'Vikram Joshi',
        userPhone: '+91 98980 44221',
        disasterType: 'Flood',
        peopleCount: 4,
        description: 'Rapid water velocity near bridge. 4 family members standing on car roof.',
        latitude: 23.0290,
        longitude: 72.5730,
        locationName: 'Nehru Bridge East Bank, Ahmedabad',
      });
    } else if (scenario === 'resolve_104') {
      updateIncidentStatus('104', 'RESOLVED', 'All 23 residents successfully extracted by Rescue Team 4; flood pumps operating.');
      releaseResource('res-amb-02');
      releaseResource('res-rescue-04');
    } else if (scenario === 'govt_outage') {
      updateDataSourceStatus('src-gov', 'OFFLINE', 'Emergency maintenance: API server timed out (503 Gateway Error). Fallback to local sensor network.');
    } else if (scenario === 'reset_all') {
      localStorage.clear();
      setIncidents(INITIAL_INCIDENTS);
      setSosRequests(INITIAL_SOS_REQUESTS);
      setResources(INITIAL_RESOURCES);
      setAlerts(INITIAL_ALERTS);
      setShelters(INITIAL_SHELTERS);
      setDataSources(INITIAL_DATA_SOURCES);
      setAuditLogs(INITIAL_AUDIT_LOGS);
      setSelectedIncidentId('104');
      setActiveNav('overview');
      setHasSelectedRole(false);
      setRole('COORDINATOR');
    }
  };

  // KPI Calculations
  const activeIncidentsCount = incidents.filter((i) => i.status !== 'RESOLVED' && i.status !== 'CLOSED').length;
  const criticalIncidentsCount = incidents.filter(
    (i) => i.severity === 'CRITICAL' && i.status !== 'RESOLVED' && i.status !== 'CLOSED'
  ).length;
  const pendingVerificationCount = incidents.filter(
    (i) => (i.status === 'REPORTED' || i.status === 'PENDING VERIFICATION') && !i.verified
  ).length;
  const activeSosCount = sosRequests.filter((s) => s.status === 'NEW' || s.status === 'ACKNOWLEDGED').length;
  const availableResourcesCount = resources.filter((r) => r.status === 'AVAILABLE').length;
  const activeAlertsCount = alerts.filter((a) => a.status === 'ACTIVE').length;

  return (
    <DisasterContext.Provider
      value={{
        role,
        setRole: setRoleAndPersist,
        hasSelectedRole,
        selectAndLockRole,
        logoutRole,
        selectedCity,
        selectedLocality,
        setSelectedCity,
        setSelectedLocality,
        supportedCities,
        activeCityInfo,
        activeLocalityInfo,
        emergencyHelps,
        userCoordinates,
        isTrackingGeo,
        isLocating,
        geoAccuracyStatus,
        refreshUserLocation,
        setUserLocationManually,
        activeNav,
        setActiveNav,
        incidents,
        sosRequests,
        resources,
        alerts,
        shelters,
        dataSources,
        auditLogs,
        selectedIncidentId,
        selectedIncident,
        searchQuery,
        setSearchQuery,
        soundEnabled,
        setSoundEnabled,
        selectIncident,
        verifyIncident,
        rejectIncident,
        updateIncidentStatus,
        updateIncidentSeverity,
        assignResourceToIncident,
        releaseResource,
        submitCitizenSos,
        acknowledgeSos,
        assignSos,
        resolveSos,
        submitCitizenReport,
        publishAlert,
        updateDataSourceStatus,
        updateShelterOccupancy,
        runScenario,
        ngoOrganizations,
        selectedNgoId,
        setSelectedNgoId,
        dispatchIncidentToNgo,
        updateNgoMissionStatus,
        sendSitrepToHq,
        dispatchSosToNgo,
        activeIncidentsCount,
        criticalIncidentsCount,
        pendingVerificationCount,
        activeSosCount,
        availableResourcesCount,
        activeAlertsCount,
      }}
    >
      {children}
    </DisasterContext.Provider>
  );
};

export const useDisaster = () => {
  const context = useContext(DisasterContext);
  if (!context) {
    throw new Error('useDisaster must be used within a DisasterProvider');
  }
  return context;
};
