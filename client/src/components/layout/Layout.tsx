import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';
import { ToastContainer } from '../ui/Toast';
import { useToast } from '../../hooks/useToast';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts';

export const ToastContext = ({ children }: { children: React.ReactNode }) => children;

export default function Layout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { toasts, showToast, closeToast } = useToast();

  useKeyboardShortcuts();

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className={`
        fixed lg:static inset-y-0 left-0 z-30
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <Sidebar onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} showToast={showToast} />
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          <div className="max-w-7xl mx-auto">
            <Outlet context={{ showToast }} />
          </div>
        </main>
      </div>

      <ToastContainer toasts={toasts} onClose={closeToast} />
    </div>
  );
}