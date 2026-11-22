import { Camera, RotateCcw } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

import { useDeleteAdminUserAvatarMutation, useUploadAdminUserAvatarMutation } from '../api/queries';

import type { AdminUserDTO } from '../api/dto';

import { Spinner } from '@/shared/components/ui/spinner';
import { getAvatarSrc } from '@/shared/lib/avatar';
import { cn } from '@/shared/lib/utils';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';
const MAX_SIZE = 5 * 1024 * 1024;

type AdminAvatarEditorProps = {
  user: AdminUserDTO;
};

/**
 * 관리자 직원 수정 다이얼로그 상단의 프로필 사진 편집 영역
 * - 사진 클릭 / 카메라 버튼 → 파일 선택 즉시 업로드
 * - 기본 이미지로 되돌리기 (업로드된 사진이 있을 때만)
 */
const AdminAvatarEditor = ({ user }: AdminAvatarEditorProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  // 업로드/삭제 직후 다이얼로그를 닫지 않아도 즉시 반영되도록 로컬 상태로 관리
  const [profileImage, setProfileImage] = useState<string | null>(user.profile_image ?? null);

  useEffect(() => {
    setProfileImage(user.profile_image ?? null);
  }, [user.id, user.profile_image]);

  const uploadMutation = useUploadAdminUserAvatarMutation();
  const deleteMutation = useDeleteAdminUserAvatarMutation();
  const isBusy = uploadMutation.isPending || deleteMutation.isPending;

  const avatarUrl = getAvatarSrc(profileImage, user.gender);

  const openFilePicker = () => {
    if (!isBusy) fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!ACCEPT.split(',').includes(file.type)) {
      toast.error('jpg, png, webp, gif 파일만 업로드 가능합니다.');
      return;
    }
    if (file.size > MAX_SIZE) {
      toast.error('파일 크기는 5MB 이하만 가능합니다.');
      return;
    }
    uploadMutation.mutate(
      { memberId: user.id, file },
      { onSuccess: (res) => setProfileImage(res.profile_image) },
    );
  };

  const handleReset = () => {
    deleteMutation.mutate(user.id, { onSuccess: () => setProfileImage(null) });
  };

  return (
    <div className="flex flex-col items-center gap-3 rounded-lg border border-border bg-muted/30 px-4 py-5 sm:flex-row sm:items-center sm:gap-5">
      <div className="relative shrink-0">
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isBusy}
          aria-label={`${user.name} 프로필 사진 변경`}
          className={cn(
            'relative flex size-20 items-center justify-center overflow-hidden rounded-full',
            'bg-mega-secondary/10 ring-4 ring-white shadow-md transition-opacity',
            'focus-visible:outline-none focus-visible:ring-mega/40 disabled:cursor-not-allowed',
          )}
        >
          {avatarUrl ? (
            <img src={avatarUrl} alt={user.name} className="size-full object-cover bg-mega-soft" />
          ) : (
            <span className="text-2xl font-bold text-mega-secondary">{user.name.charAt(0)}</span>
          )}
          {isBusy && (
            <span className="absolute inset-0 flex items-center justify-center bg-black/40">
              <Spinner className="size-5 text-white" />
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={openFilePicker}
          disabled={isBusy}
          aria-label="사진 선택"
          className="absolute -right-1 -bottom-1 flex size-8 items-center justify-center rounded-full bg-mega text-white shadow-md transition-colors hover:bg-mega-hover disabled:opacity-60"
        >
          <Camera className="size-4" />
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept={ACCEPT}
          className="hidden"
          onChange={handleFileChange}
        />
      </div>

      <div className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:items-start sm:text-left">
        <p className="text-sm font-semibold text-gray-900">프로필 사진</p>
        <p className="text-xs text-muted-foreground">
          jpg · png · webp · gif, 최대 5MB. 선택 즉시 저장됩니다.
        </p>
        {profileImage && (
          <button
            type="button"
            onClick={handleReset}
            disabled={isBusy}
            className="mt-0.5 inline-flex items-center gap-1 text-xs font-medium text-gray-500 hover:text-red-500 disabled:opacity-60"
          >
            <RotateCcw className="size-3" />
            기본 이미지로 변경
          </button>
        )}
      </div>
    </div>
  );
};

export default AdminAvatarEditor;
