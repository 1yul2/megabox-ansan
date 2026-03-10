import PageLogo from '@/shared/components/ui/PageLogo';
import { CommunityCard, PayOverviewCard, UserCalendarCard } from '@/widgets/home';

const HomePage = () => {
  return (
    <div className="w-full max-w-5xl mx-auto mb-5">
      <PageLogo color="purple" />
      <div className="pt-5 flex flex-col gap-6 lg:flex-row">
        <UserCalendarCard />
        <div className="w-full flex flex-col gap-6">
          <PayOverviewCard />
          <CommunityCard />
        </div>
      </div>
    </div>
  );
};

export default HomePage;
