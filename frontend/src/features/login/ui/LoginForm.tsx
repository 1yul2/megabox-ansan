import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { useLoginMutation } from '../api/queries';
import loginSchema, { type LoginSchemaType } from '../model/schema';

import RHFInput from './RHFinput';

import { isApiError } from '@/shared/api/error';
import { Button } from '@/shared/components/ui/button';
import { Form } from '@/shared/components/ui/form';

const LoginForm = () => {
  const form = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: '', password: '' },
  });

  const { mutate: login, isPending } = useLoginMutation();

  const onSubmit = (values: LoginSchemaType) => {
    login(values, {
      onError: (error) => {
        if (isApiError(error)) {
          switch (error.status) {
            case 401:
              form.setError('username', {
                message: '아이디 또는 비밀번호가 올바르지 않습니다.',
              });
              form.setError('password', {
                message: '아이디 또는 비밀번호가 올바르지 않습니다.',
              });
              return;

            case 403:
              // 서버 메시지 그대로 표시 (pending/rejected/suspended)
              toast.error(error.message);
              return;

            case 429:
              toast.error(error.message);
              return;

            case 422:
              toast.error(error.message);
              return;

            case 500:
              toast.error('서버 오류가 발생했습니다.');
              return;

            default:
              toast.error(error.message ?? '알 수 없는 오류가 발생했습니다.');
              return;
          }
        }
        toast.error('네트워크 오류가 발생했습니다.');
      },
    });
  };

  return (
    <Form {...form}>
      <form
        id="login-form"
        onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
        className="flex flex-col gap-4"
      >
        <RHFInput form={form} name="username" placeholder="ID" />
        <RHFInput
          type="password"
          form={form}
          name="password"
          placeholder="Password"
          className="font-sans"
        />
        <Button type="submit" className="mt-2 w-full bg-mega">
          {isPending ? '로그인중...' : '로그인'}
        </Button>
      </form>
    </Form>
  );
};

export default LoginForm;
