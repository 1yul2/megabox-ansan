export type DayOffStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

export interface ScheduleResponse {
  id: number;
  user_id: number;
  user_name: string;
  position: string;
  work_date: string; // YYYY-MM-DD
  start_time: string; // HH:MM
  end_time: string; // HH:MM
}

export interface DayOffResponse {
  id: number;
  user_id: number;
  user_name: string;
  request_date: string;
  reason: string;
  status: DayOffStatus;
  remaining_days?: number;
  created_at: string;
}

export interface ShiftResponse {
  id: number;
  requester_id: number;
  requester_name: string;
  requester_schedule_date: string;
  target_user_id: number;
  target_user_name: string;
  target_schedule_date: string;
  reason: string;
  status: DayOffStatus;
  created_at: string;
}

export interface ScheduleUserOption {
  id: number;
  username: string;
  name: string;
}
