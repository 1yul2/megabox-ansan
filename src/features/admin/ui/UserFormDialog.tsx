import { zodResolver } from '@hookform/resolvers/zod';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';

import { usePhoneInput } from '../model/usePhoneInput';
import {
  createUserFormSchema,
  DAYS_OF_WEEK,
  EMPLOYMENT_STATUS_OPTIONS,
  GENDER_OPTIONS,
  POSITION_OPTIONS,
  userFormSchema,
} from '../model/user.schema';

import type {
  AdminUserDTO,
  CreateAdminUserRequestDTO,
  UpdateAdminUserRequestDTO,
} from '../api/dto';
import type { UserFormValues } from '../model/user.schema';

import { Button } from '@/shared/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/components/ui/dialog';
import { Input } from '@/shared/components/ui/input';
import { Label } from '@/shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/shared/components/ui/select';
import { Spinner } from '@/shared/components/ui/spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/shared/components/ui/tabs';

type UserFormDialogProps = {
  open: boolean;
  onClose: () => void;
  isPending: boolean;
} & (
  | {
      mode: 'create';
      user?: never;
      onSubmit: (data: CreateAdminUserRequestDTO) => void;
    }
  | {
      mode: 'edit';
      user: AdminUserDTO | null;
      onSubmit: (memberId: number, data: UpdateAdminUserRequestDTO) => void;
    }
);

const UserFormDialog = ({
  open,
  mode,
  user,
  onClose,
  onSubmit,
  isPending,
}: UserFormDialogProps) => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<UserFormValues>({
    resolver: zodResolver(mode === 'create' ? createUserFormSchema : userFormSchema),
    defaultValues:
      mode === 'create'
        ? {
            username: '',
            password: '',
            name: '',
            position: '',
            gender: '',
            birth_date: '',
            ssn: '',
            phone: '',
            email: '',
            bank_name: '',
            account_number: '',
            hire_date: '',
            wage: undefined,
            health_cert_expire: '',
            unavailable_days: [],
          }
        : {},
  });

  const position = watch('position');
  const gender = watch('gender');
  const isActive = watch('is_active');
  const phone = watch('phone');
  const unavailableDays = watch('unavailable_days') ?? [];

  const handlePhoneChange = usePhoneInput(setValue);

  useEffect(() => {
    if (mode === 'edit' && user) {
      reset({
        name: user.name,
        position: user.position,
        gender: user.gender ?? '',
        birth_date: user.birth_date ?? '',
        ssn: user.ssn ?? '',
        phone: user.phone ?? '',
        email: user.email ?? '',
        bank_name: user.bank_name ?? '',
        account_number: user.account_number ?? '',
        hire_date: user.hire_date ?? '',
        retire_date: user.retire_date ?? '',
        is_active: user.is_active,
        wage: user.wage,
        health_cert_expire: user.health_cert_expire ?? '',
        unavailable_days: user.unavailable_days ?? [],
      });
    }
  }, [mode, user, reset]);

  const handleClose = () => {
    reset();
    onClose();
  };

  const handleUnavailableDayToggle = (dayValue: number) => {
    const current = unavailableDays;
    const updated = current.includes(dayValue)
      ? current.filter((d) => d !== dayValue)
      : [...current, dayValue];
    setValue('unavailable_days', updated, { shouldValidate: true });
  };

  const handleFormSubmit = (values: UserFormValues) => {
    if (mode === 'create') {
      onSubmit({
        username: values.username!,
        password: values.password!,
        name: values.name,
        position: values.position,
        gender: values.gender || undefined,
        birth_date: values.birth_date || undefined,
        ssn: values.ssn || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        bank_name: values.bank_name || undefined,
        account_number: values.account_number || undefined,
        hire_date: values.hire_date || undefined,
        retire_date: values.retire_date || undefined,
        wage: values.wage,
        unavailable_days: values.unavailable_days,
        health_cert_expire: values.health_cert_expire || undefined,
      });
    } else {
      if (!user) return;
      onSubmit(user.id, {
        name: values.name,
        position: values.position,
        gender: values.gender || undefined,
        birth_date: values.birth_date || undefined,
        ssn: values.ssn || undefined,
        phone: values.phone || undefined,
        email: values.email || undefined,
        bank_name: values.bank_name || undefined,
        account_number: values.account_number || undefined,
        hire_date: values.hire_date || undefined,
        retire_date: values.retire_date || undefined,
        is_active: values.is_active,
        wage: values.wage,
        unavailable_days: values.unavailable_days,
        health_cert_expire: values.health_cert_expire || undefined,
        ...(values.password ? { password: values.password } : {}),
      } as UpdateAdminUserRequestDTO);
    }
  };

  const isCreate = mode === 'create';

  return (
    <Dialog open={open} onOpenChange={(isOpen) => !isOpen && handleClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isCreate ? '직원 추가' : '직원 정보 수정'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={(e) => void handleSubmit(handleFormSubmit)(e)}>
          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="w-full mb-4">
              <TabsTrigger value="basic" className="flex-1">
                기본정보
              </TabsTrigger>
              <TabsTrigger value="contact" className="flex-1">
                연락처/계좌
              </TabsTrigger>
              <TabsTrigger value="work" className="flex-1">
                근무정보
              </TabsTrigger>
              <TabsTrigger value="schedule" className="flex-1">
                스케줄설정
              </TabsTrigger>
            </TabsList>

            {/* 기본정보 탭 */}
            <TabsContent value="basic">
              <div className="grid grid-cols-2 gap-4">
                {/* 계정 (생성 전용) */}
                {isCreate && (
                  <div className="flex flex-col gap-1.5">
                    <Label htmlFor="username">아이디 *</Label>
                    <Input id="username" placeholder="아이디" {...register('username')} />
                    {errors.username && (
                      <p className="text-destructive text-xs">{errors.username.message}</p>
                    )}
                  </div>
                )}

                {/* 비밀번호 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="password">
                    비밀번호{isCreate ? ' *' : ' (변경 시에만 입력)'}
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder={isCreate ? '비밀번호' : '변경할 비밀번호 입력'}
                    {...register('password')}
                    className="font-sans"
                  />
                  {errors.password && (
                    <p className="text-destructive text-xs">{errors.password.message}</p>
                  )}
                </div>

                {/* 이름 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="name">이름 *</Label>
                  <Input id="name" placeholder="이름" {...register('name')} />
                  {errors.name && <p className="text-destructive text-xs">{errors.name.message}</p>}
                </div>

                {/* 직급 */}
                <div className="flex flex-col gap-1.5">
                  <Label>직급 *</Label>
                  <Select
                    value={position}
                    onValueChange={(v) => setValue('position', v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="직급 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {POSITION_OPTIONS.map((p) => (
                        <SelectItem key={p} value={p}>
                          {p}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.position && (
                    <p className="text-destructive text-xs">{errors.position.message}</p>
                  )}
                </div>

                {/* 성별 */}
                <div className="flex flex-col gap-1.5">
                  <Label>성별</Label>
                  <Select
                    value={gender}
                    onValueChange={(v) => setValue('gender', v, { shouldValidate: true })}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="성별 선택" />
                    </SelectTrigger>
                    <SelectContent>
                      {GENDER_OPTIONS.map((g) => (
                        <SelectItem key={g.value} value={g.value}>
                          {g.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 생년월일 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="birth_date">생년월일</Label>
                  <Input id="birth_date" type="date" {...register('birth_date')} />
                </div>

                {/* 주민번호 */}
                <div className="flex flex-col gap-1.5 col-span-2">
                  <Label htmlFor="ssn">주민번호</Label>
                  <Input
                    id="ssn"
                    placeholder="000000-0000000"
                    maxLength={14}
                    {...register('ssn')}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 연락처/계좌 탭 */}
            <TabsContent value="contact">
              <div className="grid grid-cols-2 gap-4">
                {/* 연락처 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="phone">연락처</Label>
                  <Input
                    id="phone"
                    placeholder="010-0000-0000"
                    value={phone ?? ''}
                    onChange={handlePhoneChange}
                  />
                </div>

                {/* 이메일 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="email">이메일</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="example@email.com"
                    {...register('email')}
                  />
                  {errors.email && (
                    <p className="text-destructive text-xs">{errors.email.message}</p>
                  )}
                </div>

                {/* 은행명 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="bank_name">은행명</Label>
                  <Input id="bank_name" placeholder="예) 국민은행" {...register('bank_name')} />
                </div>

                {/* 계좌번호 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="account_number">계좌번호</Label>
                  <Input
                    id="account_number"
                    placeholder="계좌번호 입력"
                    {...register('account_number')}
                  />
                </div>
              </div>
            </TabsContent>

            {/* 근무정보 탭 */}
            <TabsContent value="work">
              <div className="grid grid-cols-2 gap-4">
                {/* 입사일 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="hire_date">입사일</Label>
                  <Input id="hire_date" type="date" {...register('hire_date')} />
                </div>

                {/* 퇴사일 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="retire_date">퇴사일</Label>
                  <Input id="retire_date" type="date" {...register('retire_date')} />
                </div>

                {/* 재직상태 (수정 전용) */}
                {!isCreate && (
                  <div className="flex flex-col gap-1.5">
                    <Label>재직상태</Label>
                    <Select
                      value={isActive === undefined ? '' : String(isActive)}
                      onValueChange={(v) =>
                        setValue('is_active', v === 'true', { shouldValidate: true })
                      }
                    >
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="재직상태 선택" />
                      </SelectTrigger>
                      <SelectContent>
                        {EMPLOYMENT_STATUS_OPTIONS.map((s) => (
                          <SelectItem key={s.value} value={s.value}>
                            {s.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                {/* 시급 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="wage">시급</Label>
                  <Input
                    id="wage"
                    type="number"
                    placeholder="시급 입력"
                    {...register('wage', { valueAsNumber: true })}
                  />
                  {errors.wage && <p className="text-destructive text-xs">{errors.wage.message}</p>}
                </div>

                {/* 보건증 만료일 */}
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="health_cert_expire">보건증 만료일</Label>
                  <Input id="health_cert_expire" type="date" {...register('health_cert_expire')} />
                </div>
              </div>
            </TabsContent>

            {/* 스케줄설정 탭 */}
            <TabsContent value="schedule">
              <div className="flex flex-col gap-4">
                <div className="flex flex-col gap-2">
                  <Label>고정 불가 요일</Label>
                  <p className="text-muted-foreground text-xs">
                    해당 요일에는 스케줄을 배정하지 않습니다.
                  </p>
                  <div className="flex gap-2 flex-wrap mt-1">
                    {DAYS_OF_WEEK.map((day) => {
                      const isChecked = unavailableDays.includes(day.value);
                      return (
                        <button
                          key={day.value}
                          type="button"
                          onClick={() => handleUnavailableDayToggle(day.value)}
                          className={`w-10 h-10 rounded-full text-sm font-medium border transition-colors cursor-pointer ${
                            isChecked
                              ? 'bg-primary text-primary-foreground border-primary'
                              : 'bg-background text-foreground border-border hover:bg-muted'
                          }`}
                          aria-pressed={isChecked}
                          aria-label={`${day.label}요일 고정 불가`}
                        >
                          {day.label}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="mt-4 pt-4 border-t">
            <Button type="button" variant="outline" onClick={handleClose} disabled={isPending}>
              취소
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? <Spinner className="size-4" /> : isCreate ? '추가' : '저장'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default UserFormDialog;
