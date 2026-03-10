import type React from 'react';

import { FormCard } from '@/features/login';
import BackgroundImage from '@/shared/assets/img/main_bg.png';
import Logo from '@/shared/assets/logo/LogowithText_white.png';

const LoginPage = () => {
  return (
    <div
      className={`flex flex-col gap-10 relative w-full h-screen items-center justify-center 
        after:absolute after:bg-(image:--bg) after:bg-cover after:bg-center after:h-[60%] after:w-full after:-z-10 after:top-0 after:left-0`}
      style={
        {
          ['--bg']: `url(${BackgroundImage})`,
        } as React.CSSProperties
      }
    >
      <img src={Logo} alt="megabox_logo" className=" md:w-[200px] w-[150px] " />
      <FormCard />
      <p className=" text-sm text-mega-gray ">copyright megabox, all right resolved</p>
    </div>
  );
};

export default LoginPage;
