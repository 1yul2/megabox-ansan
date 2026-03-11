import { WorkStatus } from '@/features/work-status';

const WorkStatuspage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-2xl">
        <WorkStatus />
      </div>
    </div>
  );
};

export default WorkStatuspage;
