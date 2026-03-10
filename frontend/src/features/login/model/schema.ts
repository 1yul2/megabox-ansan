import { z } from 'zod';

const loginSchema = z.object({
  username: z.string().min(4, {
    message: '아이디를 입력해주세요',
  }), // userID에 대한 스키마 정의
  password: z.string().min(4, {
    message: '비밀번호를 입력해주세요',
  }), // userPassword에 대한 스키마 정의
});

export default loginSchema;

export type LoginSchemaType = z.infer<typeof loginSchema>;
