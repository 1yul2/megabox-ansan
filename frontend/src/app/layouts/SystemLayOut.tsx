import { Outlet } from 'react-router';

const SystemLayOut = () => {
  return (
    <div className="relative w-screen h-screen flex flex-col justify-center items-center">
      <div
        className="
          hidden sm:block
          absolute inset-0
          z-0
          bg-[url('/images/main_bg_02.png')]
          bg-cover bg-bottom
          h-[55%]
        "
      >
        <div className="absolute inset-0 bg-black/40" />
      </div>

      <div
        className="
         relative z-10
          w-full
          px-4            /* 모바일 여백 */
          sm:px-6
          md:px-0
          max-w-md        /* 모바일 */
          sm:max-w-lg
          md:max-w-2xl    /* 태블릿, PC */
        "
      >
        <Outlet />
      </div>
    </div>
  );
};

export default SystemLayOut;
