import { z } from 'zod';

// ── 로그인 스키마 ─────────────────────────────────────────────────────────
const loginSchema = z.object({
  username: z.string().min(3, { message: '아이디를 입력해주세요' }),
  password: z.string().min(4, { message: '비밀번호를 입력해주세요' }),
});

export default loginSchema;
export type LoginSchemaType = z.infer<typeof loginSchema>;

// ── 회원가입 스키마 (Step 별) ─────────────────────────────────────────────

const passwordSchema = z
  .string()
  .min(8, '비밀번호는 8자 이상이어야 합니다.')
  .regex(/[A-Z]/, '영문 대문자를 포함해야 합니다.')
  .regex(/[0-9]/, '숫자를 포함해야 합니다.')
  .regex(/[!@#$%^&*]/, '특수문자(!@#$%^&*)를 포함해야 합니다.');

export const registerStep1Schema = z
  .object({
    username: z
      .string()
      .min(3, '아이디는 3자 이상이어야 합니다.')
      .max(50, '아이디는 50자 이하여야 합니다.')
      .regex(/^[a-zA-Z0-9_]+$/, '아이디는 영문, 숫자, _만 사용 가능합니다.'),
    password: passwordSchema,
    passwordConfirm: z.string(),
    name: z
      .string()
      .min(2, '이름은 2자 이상이어야 합니다.')
      .max(20, '이름은 20자 이하여야 합니다.'),
    gender: z.enum(['남', '여'], { message: '성별을 선택해주세요.' }),
    birth_date: z.string().min(1, '생년월일을 입력해주세요.'),
  })
  .refine((data) => data.password === data.passwordConfirm, {
    message: '비밀번호가 일치하지 않습니다.',
    path: ['passwordConfirm'],
  });

export type RegisterStep1Type = z.infer<typeof registerStep1Schema>;

export const registerStep2Schema = z.object({
  ssn: z.string().regex(/^\d{6}-\d{7}$/, '주민등록번호 형식이 올바르지 않습니다. (XXXXXX-XXXXXXX)'),
  phone: z
    .string()
    .min(10, '연락처를 입력해주세요.')
    .regex(/^[0-9-]+$/, '숫자와 하이픈(-)만 입력 가능합니다.'),
  email: z.string().email('올바른 이메일 형식이 아닙니다.'),
});

export type RegisterStep2Type = z.infer<typeof registerStep2Schema>;

export const registerStep3Schema = z.object({
  bank_name: z.string().optional(),
  account_number: z.string().optional(),
  hire_date: z.string().optional(),
  health_cert_expire: z.string().optional(),
  unavailable_days: z.array(z.number()).optional(),
});

export type RegisterStep3Type = z.infer<typeof registerStep3Schema>;

// 전체 회원가입 폼 타입
export type RegisterFormData = RegisterStep1Type & RegisterStep2Type & RegisterStep3Type;
