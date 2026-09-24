export type UserRole = 'admin' | 'student';
export type AccountType = 'subscription' | 'drop_in';
export type PaymentStatus = 'paid' | 'overdue';
export type AttendanceStatus = 'going' | 'not_going' | 'unconfirmed';
export type StudentStatus = 'active' | 'pending' | 'rejected';
export type DropInStatus = 'pending' | 'approved' | 'rejected' | 'completed';

export interface GroupRow {
  id: string;
  name: string;
  age_category: string;
  schedule: string;
  time: string;
  days_of_week: string[];
  description?: string;
}

export interface ProfileRow {
  id: string;
  phone: string;
  full_name: string;
  role: UserRole;
  group_id: string | null;
  account_type: AccountType;
  payment_status: PaymentStatus;
  payment_due_date: string;
  status: StudentStatus;
  notes?: string;
  created_at?: string;
}

export interface LessonRow {
  id: string;
  group_id: string;
  date: string;
  date_formatted: string;
  time: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  cancellation_reason?: string;
}

export interface AttendanceRow {
  id: string;
  lesson_id: string;
  student_id: string;
  status: AttendanceStatus;
  confirmed_at?: string;
  actual_present?: boolean;
}

export interface DropInRequestRow {
  id: string;
  student_id: string | null;
  student_name: string;
  student_phone: string;
  group_id: string;
  visit_date: string;
  status: DropInStatus;
  notes?: string;
}
