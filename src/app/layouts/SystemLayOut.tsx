import { Outlet } from 'react-router';

// 키오스크 전용 레이아웃 — WorkStatusPanel이 자체 full-screen 레이아웃을 처리함
const SystemLayOut = () => {
  return <Outlet />;
};

export default SystemLayOut;
