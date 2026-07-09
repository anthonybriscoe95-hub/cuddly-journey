export type JobStatus = "scheduled" | "in-progress" | "complete" | "cancelled" | "quote";
export type PaymentMethod = "card" | "apple-pay" | "google-pay" | "cash" | "check";
export type PaymentStatus = "paid" | "pending" | "overdue";
export type ServiceType = "residential" | "commercial" | "post-construction" | "high-rise";

export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  windowCount: number;
  pets: string;
  gateCode: string;
  referralSource: string;
  recurringSchedule: string;
  createdAt: string;
  totalSpent: number;
  jobCount: number;
  lastServiceDate: string;
  rating: number;
  tags: string[];
}

export interface Job {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  phone: string;
  date: string;
  time: string;
  duration: number;
  service: ServiceType;
  status: JobStatus;
  amount: number;
  notes: string;
  windowCount: number;
  paymentStatus: PaymentStatus;
  paymentMethod?: PaymentMethod;
}

export interface Invoice {
  id: string;
  jobId: string;
  customerId: string;
  customerName: string;
  amount: number;
  tax: number;
  total: number;
  status: PaymentStatus;
  dueDate: string;
  paidDate?: string;
  paymentMethod?: PaymentMethod;
  createdAt: string;
  lineItems: LineItem[];
}

export interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Booking {
  id: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  service: ServiceType;
  preferredDate: string;
  preferredTime: string;
  notes: string;
  status: "pending" | "confirmed" | "declined";
  createdAt: string;
  source: "website" | "phone" | "referral" | "google" | "direct";
}

export interface InventoryItem {
  id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  lowThreshold: number;
  cost: number;
  supplier: string;
  lastRestocked: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "owner" | "manager" | "technician";
  status: "active" | "inactive" | "clocked-in";
  clockedIn?: string;
  hoursThisWeek: number;
  jobsToday: number;
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export interface Notification {
  id: string;
  type: "booking" | "payment" | "review" | "reminder" | "message" | "missed-call";
  title: string;
  body: string;
  read: boolean;
  createdAt: string;
  link?: string;
}

export interface WeatherData {
  condition: string;
  temp: number;
  high: number;
  low: number;
  icon: string;
  windSpeed: number;
  humidity: number;
}

export interface RevenueDataPoint {
  date: string;
  revenue: number;
  jobs: number;
}

export interface AppState {
  theme: "light" | "dark" | "system";
  sidebarOpen: boolean;
  user: {
    name: string;
    email: string;
    company: string;
    avatar?: string;
  };
  notifications: Notification[];
  unreadCount: number;
}
