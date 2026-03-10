export type WorkAction = 'CHECK_IN' | 'CHECK_OUT' | 'BREAK_START' | 'BREAK_END'; // Attendance 공통 Request DTO

export interface WorkStatusRequestDTO {
  username: string;
  password: string;
}

export interface WorkStatusResponseDTO {
  work_date: string; // YYYY-MM-DD
  check_in: string; // ISO time string
  break_start: string;
  break_end: string;
  check_out: string;
  total_work_minutes: number;
  total_break_minutes: number;
  id: number;
  user_id: number;
  user_name: string;
}
