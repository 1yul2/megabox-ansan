export interface PostModalProps {
  mode: 'create' | 'edit';
  category: '공지' | '자유게시판' | '근무교대' | '휴무신청';
  initialData?: {
    title: string;
    content: string;
  };
  onSubmit: (data: { title: string; content: string }) => Promise<void>;
  onClose: () => void;
}
