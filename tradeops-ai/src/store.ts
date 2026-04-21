import { useSyncExternalStore } from 'react';
import { aiCalls as seedCalls, customers as seedCustomers, jobs as seedJobs, technicians as seedTechs } from './mockData';
import type { AICall, Customer, Job, JobStatus, LineItem, Technician } from './types';

interface State {
  jobs: Job[];
  customers: Customer[];
  technicians: Technician[];
  aiCalls: AICall[];
}

let state: State = {
  jobs: seedJobs,
  customers: seedCustomers,
  technicians: seedTechs,
  aiCalls: seedCalls,
};

const listeners = new Set<() => void>();
const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};
const emit = () => listeners.forEach((l) => l());
const setState = (updater: (s: State) => State) => {
  state = updater(state);
  emit();
};

export const useStore = <T,>(selector: (s: State) => T): T =>
  useSyncExternalStore(subscribe, () => selector(state), () => selector(state));

export const actions = {
  updateJobStatus(jobId: string, status: JobStatus) {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status } : j)),
    }));
  },
  addLineItem(jobId: string, item: Omit<LineItem, 'id'>) {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) =>
        j.id === jobId
          ? { ...j, lineItems: [...j.lineItems, { ...item, id: `li_${Date.now()}` }] }
          : j,
      ),
    }));
  },
  removeLineItem(jobId: string, lineItemId: string) {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) =>
        j.id === jobId ? { ...j, lineItems: j.lineItems.filter((li) => li.id !== lineItemId) } : j,
      ),
    }));
  },
  addNote(jobId: string, note: string) {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, notes: [...j.notes, note] } : j)),
    }));
  },
  markPaid(jobId: string) {
    setState((s) => ({
      ...s,
      jobs: s.jobs.map((j) => (j.id === jobId ? { ...j, status: 'paid' as JobStatus } : j)),
    }));
  },
};

export const selectors = {
  jobById: (id: string) => state.jobs.find((j) => j.id === id),
  customerById: (id: string) => state.customers.find((c) => c.id === id),
  technicianById: (id?: string) => (id ? state.technicians.find((t) => t.id === id) : undefined),
  callById: (id: string) => state.aiCalls.find((c) => c.id === id),
};
