export type JobStatus =
  | 'scheduled'
  | 'en_route'
  | 'in_progress'
  | 'completed'
  | 'invoiced'
  | 'paid';

export type JobPriority = 'emergency' | 'standard' | 'maintenance';

export type Trade = 'HVAC' | 'Plumbing' | 'Electrical';

export interface Customer {
  id: string;
  name: string;
  phone: string;
  email: string;
  address: string;
  notes?: string;
  lifetimeValue: number;
  jobCount: number;
}

export interface LineItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  taxable: boolean;
}

export interface Job {
  id: string;
  customerId: string;
  trade: Trade;
  title: string;
  description: string;
  status: JobStatus;
  priority: JobPriority;
  scheduledFor: string;
  technicianId?: string;
  estimatedMinutes: number;
  lineItems: LineItem[];
  notes: string[];
  createdVia: 'ai_voice' | 'web_form' | 'manual' | 'recurring';
}

export interface Technician {
  id: string;
  name: string;
  initials: string;
  color: string;
  trade: Trade;
  jobsToday: number;
}

export interface AICall {
  id: string;
  callerName: string;
  callerPhone: string;
  startedAt: string;
  durationSeconds: number;
  transcript: TranscriptTurn[];
  outcome: 'job_booked' | 'quote_requested' | 'transferred' | 'voicemail';
  jobId?: string;
  summary: string;
}

export interface TranscriptTurn {
  speaker: 'agent' | 'caller';
  text: string;
  at: number;
}
