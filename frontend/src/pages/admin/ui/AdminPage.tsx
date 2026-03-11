import { HolidayManagement, InsuranceRateManagement, PendingUsersTab, UserManagement } from '@/features/admin';
import { usePendingUsersQuery } from '@/features/admin/api/queries';
import PageLogo from '@/shared/components/ui/PageLogo';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

const tabTriggerClass =
  'flex-1 rounded-full text-sm data-[state=active]:bg-mega-secondary data-[state=active]:text-white data-[state=active]:shadow-sm';

const AdminPage = () => {
  const { data: pendingData } = usePendingUsersQuery();
  const pendingCount = pendingData?.total ?? 0;

  return (
    <div className="w-full max-w-5xl mx-auto mb-5">
      <PageLogo color="purple" />
      <Tabs defaultValue="pending" className="pt-5">
        <TabsList className="w-full rounded-full bg-white border border-mega-gray-light p-1 mb-4">
          <TabsTrigger value="pending" className={tabTriggerClass}>
            가입 승인
            {pendingCount > 0 && (
              <span className="ml-1.5 inline-flex items-center justify-center w-4 h-4 text-[10px] font-bold rounded-full bg-destructive text-white">
                {pendingCount > 9 ? '9+' : pendingCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="holiday" className={tabTriggerClass}>
            공휴일 관리
          </TabsTrigger>
          <TabsTrigger value="users" className={tabTriggerClass}>
            직원 관리
          </TabsTrigger>
          <TabsTrigger value="insurance" className={tabTriggerClass}>
            4대 보험 요율
          </TabsTrigger>
        </TabsList>

        <div className="bg-white rounded-xl border border-mega-gray-light p-6">
          <TabsContent value="pending" className="mt-0">
            <PendingUsersTab />
          </TabsContent>
          <TabsContent value="holiday" className="mt-0">
            <HolidayManagement />
          </TabsContent>
          <TabsContent value="users" className="mt-0">
            <UserManagement />
          </TabsContent>
          <TabsContent value="insurance" className="mt-0">
            <InsuranceRateManagement />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

export default AdminPage;
