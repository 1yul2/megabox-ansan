import { z } from 'zod';

export const holidaySchema = z.object({
  label: z.string().min(1, '공휴일 이름을 입력해주세요.'),
  date: z.string().min(1, '날짜를 선택해주세요.'),
});

export type HolidayFormValues = z.infer<typeof holidaySchema>;
