import { ChevronLeft, ChevronRight, Plus, Search, Users } from 'lucide-react';
import React, { useState } from 'react';
import { toast } from 'sonner';

import {
  useAdminUserDetailQuery,
  useAdminUsersQuery,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation,
  useUpdateAdminUserMutation,
} from '../api/queries';

import UserFormDialog from './UserFormDialog';
import UserTable from './UserTable';

import type {
  AdminUserDTO,
  CreateAdminUserRequestDTO,
  UpdateAdminUserRequestDTO,
} from '../api/dto';

import { Button } from '@/shared/components/ui/button';
import ConfirmDialog from '@/shared/components/ui/confirm-dialog';
import { Input } from '@/shared/components/ui/input';
import { Spinner } from '@/shared/components/ui/spinner';

const PAGE_SIZE = 20;

const UserManagement = () => {
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [offset, setOffset] = useState(0);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<AdminUserDTO | null>(null);
  const [pendingDelete, setPendingDelete] = useState<AdminUserDTO | null>(null);
  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const { data, isLoading, isError } = useAdminUsersQuery({
    q: debouncedSearch || undefined,
    limit: PAGE_SIZE,
    offset,
  });

  const createMutation = useCreateAdminUserMutation();
  const updateMutation = useUpdateAdminUserMutation();
  const deleteMutation = useDeleteAdminUserMutation();

  const { data: editUserDetail, isLoading: isDetailLoading } = useAdminUserDetailQuery(
    editTarget?.id ?? 0,
  );

  const users = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.ceil(total / PAGE_SIZE);
  const currentPage = Math.floor(offset / PAGE_SIZE) + 1;

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearch(value);
    setOffset(0);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => setDebouncedSearch(value), 300);
  };

  const handleCreate = (data: CreateAdminUserRequestDTO) => {
    createMutation.mutate(data, {
      onSuccess: () => {
        toast.success('직원이 추가되었습니다.');
        setIsCreateOpen(false);
      },
      onError: () => toast.error('직원 추가에 실패했습니다.'),
    });
  };

  const handleUpdate = (memberId: number, data: UpdateAdminUserRequestDTO) => {
    updateMutation.mutate(
      { memberId, data },
      {
        onSuccess: () => {
          toast.success('직원 정보가 수정되었습니다.');
          setEditTarget(null);
        },
        onError: () => toast.error('직원 정보 수정에 실패했습니다.'),
      },
    );
  };

  const handleDeleteRequest = (user: AdminUserDTO) => {
    setPendingDelete(user);
  };

  const handleDeleteConfirm = () => {
    if (!pendingDelete) return;
    deleteMutation.mutate(pendingDelete.id, {
      onSuccess: () => {
        toast.success('직원이 삭제되었습니다.');
        setPendingDelete(null);
      },
      onError: () => {
        toast.error('직원 삭제에 실패했습니다.');
        setPendingDelete(null);
      },
    });
  };

  return (
    <>
      {/* 헤더 */}
      <div className="flex items-start justify-between mb-5">
        <div className="flex gap-2">
          <Users className="size-5 text-mega-secondary mt-0.5" />
          <div>
            <h2 className="text-base font-semibold">직원 관리</h2>
            <p className="text-sm text-muted-foreground">직원 계정을 생성하고 정보를 관리합니다.</p>
          </div>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus />
          직원 추가
        </Button>
      </div>

      {/* 검색 */}
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="이름, 부서로 검색..."
          value={search}
          onChange={handleSearchChange}
        />
      </div>

      {/* 테이블 */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner />
        </div>
      )}
      {isError && (
        <p className="text-destructive text-sm py-8 text-center">
          직원 목록을 불러오지 못했습니다.
        </p>
      )}
      {!isLoading && !isError && (
        <>
          {users.length > 0 ? (
            <>
              <UserTable
                users={users}
                onEdit={setEditTarget}
                onDelete={handleDeleteRequest}
                isDeletePending={deleteMutation.isPending}
              />
              {/* 페이지네이션 */}
              {totalPages > 1 && (
                <div className="flex items-center justify-end gap-2 mt-4">
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setOffset((prev) => Math.max(0, prev - PAGE_SIZE))}
                    disabled={currentPage === 1}
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <span className="text-sm text-muted-foreground">
                    {currentPage} / {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="icon"
                    className="size-8"
                    onClick={() => setOffset((prev) => prev + PAGE_SIZE)}
                    disabled={currentPage >= totalPages}
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              )}
            </>
          ) : (
            <p className="text-muted-foreground text-sm py-12 text-center">
              {debouncedSearch ? '검색 결과가 없습니다.' : '등록된 직원이 없습니다.'}
            </p>
          )}
        </>
      )}

      <UserFormDialog
        mode="create"
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        onSubmit={handleCreate}
        isPending={createMutation.isPending}
      />

      <UserFormDialog
        mode="edit"
        open={editTarget !== null}
        user={editUserDetail ?? editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleUpdate}
        isPending={updateMutation.isPending || isDetailLoading}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="직원을 삭제하시겠습니까?"
        description={
          pendingDelete ? `'${pendingDelete.name}' 직원을 삭제하면 복구할 수 없습니다.` : undefined
        }
        confirmLabel="삭제"
        variant="destructive"
        isPending={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setPendingDelete(null)}
      />
    </>
  );
};

export default UserManagement;
