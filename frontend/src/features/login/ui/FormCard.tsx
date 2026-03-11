import { useState } from 'react';

import { LockIcon, UserPlus } from 'lucide-react';

import LoginForm from './LoginForm';
import { RegisterFunnel } from './RegisterFunnel';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const FormCard = () => {
  const [mode, setMode] = useState<'login' | 'register'>('login');

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="grid-rows-[auto]">
        <CardTitle className="flex gap-2 items-center text-xl text-mega">
          {mode === 'login' ? (
            <>
              <LockIcon className="text-mega" />
              <h2>LOGIN</h2>
            </>
          ) : (
            <>
              <UserPlus className="text-mega" />
              <h2>가입 신청</h2>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {mode === 'login' ? (
          <div className="flex flex-col gap-4">
            <LoginForm />
            <button
              type="button"
              onClick={() => setMode('register')}
              className="text-xs text-mega-gray hover:text-mega transition-colors text-center underline underline-offset-2"
            >
              계정이 없으신가요? 가입 신청하기
            </button>
          </div>
        ) : (
          <RegisterFunnel onBack={() => setMode('login')} />
        )}
      </CardContent>
    </Card>
  );
};

export default FormCard;
