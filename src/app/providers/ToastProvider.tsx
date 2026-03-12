import { Toaster } from '@/shared/components/ui/sonner';

interface ToastProviderProps {
  children: React.ReactNode;
}

const ToastProvider = ({ children }: ToastProviderProps) => {
  return (
    <>
      {children}
      <Toaster />
    </>
  );
};

export default ToastProvider;
