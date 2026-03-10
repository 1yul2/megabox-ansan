import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';

import LoginForm from './LoginForm';
import '@testing-library/jest-dom'; // jest-dom 매처 사용을 위해

// ----------------------------------------------------
// 1. Mock 설정 (외부 종속성 격리)
// ----------------------------------------------------

// console.log 목업: onSubmit 함수가 올바른 인수로 호출되었는지 검증하기 위해 필요합니다.
const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {});

// 참고: RHFInput, loginSchema는 이미 프로젝트에 있으므로 별도 vi.mock은 생략합니다.
// (단, LoginForm의 테스트 격리를 위해 하위 컴포넌트 목업이 필요하다면 여기에 추가합니다.)

describe('LoginForm Component', () => {
  // 각 테스트에서 userEvent를 사용하기 위한 setup (비동기 처리)
  const user = userEvent.setup();

  // 1. 렌더링 검증
  it('ID, Password 입력 필드 및 로그인 버튼을 올바르게 렌더링해야 합니다.', () => {
    render(<LoginForm />);

    // ID 입력 필드 확인 (placeholder로 접근)
    expect(screen.getByPlaceholderText(/ID/i)).toBeInTheDocument();

    // Password 입력 필드 확인 (placeholder로 접근)
    expect(screen.getByPlaceholderText(/Password/i)).toBeInTheDocument();

    // 버튼 확인 (role과 텍스트로 접근)
    expect(screen.getByRole('button', { name: /로그인/i })).toBeInTheDocument();
  });

  // 2. 성공적인 폼 제출 검증
  it('유효한 데이터로 폼 제출 시 onSubmit 핸들러가 호출되어야 합니다.', async () => {
    render(<LoginForm />);

    const userIdInput = screen.getByPlaceholderText(/ID/i);
    const passwordInput = screen.getByPlaceholderText(/Password/i);
    const submitButton = screen.getByRole('button', { name: /로그인/i });

    // 1. 값 입력
    await user.type(userIdInput, 'cinema_admin');
    await user.type(passwordInput, 'securepassword123');

    // 2. 제출 버튼 클릭
    await user.click(submitButton);

    // 3. onSubmit 핸들러 호출 검증 (console.log를 통해)
    await waitFor(() => {
      // console.log에 정확한 값이 전달되었는지 확인
      expect(consoleLogSpy).toHaveBeenCalledWith('Login values:', {
        userId: 'cinema_admin',
        password: 'securepassword123',
      });
    });
  });

  // 3. 유효성 검사 실패 검증
  it('필드를 비우고 제출 시 유효성 검사 오류 메시지를 표시해야 합니다.', async () => {
    render(<LoginForm />);

    const submitButton = screen.getByRole('button', { name: /로그인/i });

    // 1. 빈 상태로 제출
    await user.click(submitButton);

    // 2. Zod 스키마에 정의된 오류 메시지가 표시될 때까지 기다립니다.
    await waitFor(
      () => {
        expect(screen.getByText(/아이디를 입력해주세요/i)).toBeInTheDocument();
        expect(screen.getByText(/비밀번호를 입력해주세요/i)).toBeInTheDocument();
      },
      { timeout: 3000 },
    );
  });
});
