import { useState } from 'react';
import { Outlet } from 'react-router';

import { Header } from '../../widgets/ui/Header';

import { SideNav } from '@/widgets/nav';

export const Layout = () => {
  const [isSideNavOpen, setIsSideNavOpen] = useState(false);

  return (
    <div className="flex flex-col h-screen">
      <Header onMenuClick={() => setIsSideNavOpen((prev) => !prev)} />
      <div className="flex flex-1 pt-14 md:ml-18 overflow-hidden">
        <SideNav isOpen={isSideNavOpen} onClose={() => setIsSideNavOpen(false)} />
        <main className="flex-1 px-4 pt-4 md:px-6 lg:px-10 lg:pt-8 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
