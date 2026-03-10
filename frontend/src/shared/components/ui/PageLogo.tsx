import Logo from '@/shared/assets/logo/Logo_white.png';
import LogoPurple from '@/shared/assets/logo/Megabox_Logo_Indigo.png';

interface PageLogoProps {
  color?: 'white' | 'purple';
}

const PageLogo = ({ color = 'white' }: PageLogoProps) => {
  const Logos = {
    white: Logo,
    purple: LogoPurple,
  };

  return (
    <div className=" w-full flex flex-col gap-4 justify-center items-center ">
      <img src={Logos[color]} alt="mega-logo" className=" w-[120px] md:w-[180px]" />
      {/* <h2 className=" md:text-xl md:text-md text-white">M SYSTEM에 오신 것을 환영합니다.</h2> */}
    </div>
  );
};

export default PageLogo;
