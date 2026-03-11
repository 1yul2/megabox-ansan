import { PostListPage } from '@/features/community/ui/PostListPage';

export default function ShiftPage() {
  return (
    <PostListPage
      category="근무교대"
      canWrite={true}
      fixedCategory="근무교대"
    />
  );
}
