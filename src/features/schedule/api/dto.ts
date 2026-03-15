// Schedule
export interface ScheduleCreateDTO {
  start_date: string; // ISO datetime "YYYY-MM-DDTHH:mm:ss"
  end_date: string; // ISO datetime "YYYY-MM-DDTHH:mm:ss"
  target_id: number;
  week_number: number;
  year: number;
  month: number;
}

export interface ScheduleUpdateDTO {
  work_date?: string;
  start_time?: string;
  end_time?: string;
}

// Day Off
export interface DayOffCreateDTO {
  request_date: string; // YYYY-MM-DD
  reason: string;
}

/** 백엔드 스펙: DayOffDecisionRequest */
export interface DayOffDecisionDTO {
  status: 'APPROVED' | 'REJECTED';
}
