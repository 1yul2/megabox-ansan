import { LockIcon } from 'lucide-react';

import LoginForm from './LoginForm';

import { Card, CardContent, CardHeader, CardTitle } from '@/shared/components/ui/card';

const FormCard = () => {
  return (
    <Card className="w-full max-w-sm">
      <CardHeader className=" grid-rows-[auto]">
        <CardTitle className=" flex gap-2 items-center text-xl text-mega">
          <LockIcon className=" text-mega" /> <h2>LOGIN</h2>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <LoginForm />
      </CardContent>
    </Card>
  );
};

export default FormCard;
