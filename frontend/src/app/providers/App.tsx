import { RouterProvider } from 'react-router';

import '../global/App.css';
import { router } from '../routes/router';

import QueryProvider from './QueryProvider';
import ToastProvider from './ToastProvider';

function App() {
  return (
    <QueryProvider>
      <ToastProvider>
        <RouterProvider router={router} />
      </ToastProvider>
    </QueryProvider>
  );
}

export default App;
