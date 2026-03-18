import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import ErrorBoundary from './components/ErrorBoundary';
import { 
  LayoutDashboard, 
  MapPin, 
  Users, 
  PlusCircle, 
  Settings, 
  Search, 
  Bell, 
  Menu, 
  X,
  ChevronRight,
  TrendingUp,
  MessageSquare,
  LogOut,
  AlertCircle,
  Cloud,
  CloudOff,
  Database,
  Download
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Dashboard from './components/Dashboard';
import VillageList from './components/VillageList';
import VillageDetail from './components/VillageDetail';
import MemberList from './components/MemberList';
import Login from './components/Login';
import FirestoreError from './components/FirestoreError';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { dataService } from './services/dataService';
import { missingConfigKeys } from './services/firebaseConfig';
import { firebaseConfig } from './services/firebaseConfig';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function Sidebar() {
  const location = useLocation();
  const { role, logout } = useAuth();
  
  const navItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/' },
    { icon: MapPin, label: 'Villages', path: '/villages' },
    { icon: Users, label: 'All Members', path: '/members' },
    ...(role === 'admin' ? [{ icon: MessageSquare, label: 'Messaging', path: '/messaging' }] : []),
  ];

  const handleBackup = async () => {
    try {
      const data = await dataService.getAllDataForBackup();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `census_backup_${new Date().toISOString().split('T')[0]}.json`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (err: any) {
      alert("Backup failed: " + err.message);
    }
  };

  return (
    <aside className="w-64 bg-white border-r border-slate-200 h-screen sticky top-0 hidden md:flex flex-col">
      <div className="p-6">
        <div className="flex items-center gap-2 text-brand-600 font-bold text-xl">
          <div className="w-8 h-8 bg-brand-600 rounded-lg flex items-center justify-center text-white">
            <Users size={20} />
          </div>
          <span>CensusPro</span>
        </div>
      </div>
      
      <nav className="flex-1 px-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200",
                isActive 
                  ? "bg-brand-50 text-brand-700 font-semibold" 
                  : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
              )}
            >
              <item.icon size={20} />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-100">
        {dataService.isDemo && (
          <div className="mb-4 p-3 bg-amber-50 border border-amber-100 rounded-xl">
            <p className="text-[10px] font-bold text-amber-800 uppercase tracking-wider mb-1">Demo Mode</p>
            <p className="text-[10px] text-amber-700 leading-tight">Data is saved to your browser only.</p>
            <button 
              onClick={() => dataService.setDemo(false)}
              className="mt-2 text-[10px] font-bold text-amber-900 underline"
            >
              Switch to Firebase
            </button>
          </div>
        )}
        <div className="bg-slate-50 rounded-2xl p-4">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">
            {role === 'admin' ? 'Admin Panel' : 'User Panel'}
          </p>
          
          {role === 'admin' && (
            <button 
              onClick={handleBackup}
              className="flex items-center gap-2 text-sm text-slate-700 hover:text-brand-600 transition-colors w-full mb-3"
            >
              <Database size={16} />
              <span>Full Backup (JSON)</span>
            </button>
          )}

          <button 
            onClick={logout}
            className="flex items-center gap-2 text-sm text-slate-700 hover:text-red-600 transition-colors w-full"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </aside>
  );
}

function TopBar() {
  const { role } = useAuth();
  const isConnected = !dataService.isDemo;

  return (
    <header className="h-16 bg-white/80 backdrop-blur-md border-bottom border-slate-200 sticky top-0 z-10 px-6 flex items-center justify-between">
      <div className="flex items-center gap-4 flex-1">
        <div className="relative max-w-md w-full hidden sm:block">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Search members or villages..." 
            className="w-full pl-10 pr-4 py-2 bg-slate-100 border-none rounded-xl focus:ring-2 focus:ring-brand-500 transition-all outline-none text-sm"
          />
        </div>
        
        <div className={cn(
          "flex items-center gap-2 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all",
          isConnected 
            ? "bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm shadow-emerald-100/50" 
            : "bg-amber-50 text-amber-600 border border-amber-100 shadow-sm shadow-amber-100/50"
        )}>
          {isConnected ? <Cloud size={14} /> : <AlertCircle size={14} />}
          <span>{isConnected ? 'Cloud Connected' : 'Local Demo Mode'}</span>
          {isConnected ? (
            <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
          ) : (
            missingConfigKeys.length > 0 && (
              <span className="ml-1 text-[9px] lowercase font-medium opacity-80 decoration-dotted underline cursor-help" title={`Missing: ${missingConfigKeys.join(', ')}`}>
                ({missingConfigKeys.length} keys missing)
              </span>
            )
          )}
        </div>
      </div>
      
      <div className="flex items-center gap-4">
        <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-full transition-colors relative">
          <Bell size={20} />
          <span className="absolute top-2 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
        </button>
        <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-slate-900">
              {role === 'admin' ? 'Admin User' : 'Standard User'}
            </p>
            <p className="text-xs text-slate-500">Community Lead</p>
          </div>
          <div className={cn(
            "w-10 h-10 rounded-full flex items-center justify-center font-bold border",
            role === 'admin' 
              ? "bg-brand-100 text-brand-700 border-brand-200" 
              : "bg-blue-100 text-blue-700 border-blue-200"
          )}>
            {role === 'admin' ? 'AD' : 'US'}
          </div>
        </div>
      </div>
    </header>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { role } = useAuth();
  if (!role) return <Navigate to="/login" />;
  return <>{children}</>;
}

function AppContent() {
  const { role, authError, isAuthReady } = useAuth();
  const [firestoreError, setFirestoreError] = useState<'api' | 'permission' | 'auth' | null>(null);
  const [showAutoDemoBanner, setShowAutoDemoBanner] = useState(false);

  console.log("[AppContent] Rendering with state:", { 
    role, 
    authError, 
    isAuthReady, 
    firestoreError,
    isDemo: dataService.isDemo,
    isAutoDemo: dataService.isAutoDemo
  });

  useEffect(() => {
    if (!isAuthReady) return;

    if (authError === 'auth-provider-disabled') {
      setFirestoreError('auth');
      return;
    }
    
    const checkFirestore = async () => {
      if (dataService.isDemo) return;
      try {
        await dataService.getVillages();
        setFirestoreError(null);
        setShowAutoDemoBanner(false);
      } catch (err: any) {
        console.error("Initial Firestore check failed:", err);
        
        const isPermissionError = err.message?.includes('Missing or insufficient permissions') || err.code === 'permission-denied';
        const isApiError = err.message?.includes('Cloud Firestore API has not been used') || err.message?.includes('disabled');
        
        if (isPermissionError) {
          setFirestoreError('permission');
        } else if (isApiError) {
          setFirestoreError('api');
        } else if (dataService.isAutoDemo) {
          setShowAutoDemoBanner(true);
        }
      }
    };
    checkFirestore();
  }, [role, isAuthReady, authError]);

  if (!isAuthReady) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-brand-200 border-t-brand-600 rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium animate-pulse">Initializing CensusPro...</p>
        </div>
      </div>
    );
  }

  if (firestoreError && !dataService.isDemo) {
    return <FirestoreError 
      projectId={firebaseConfig.projectId || 'MISSING_PROJECT_ID'} 
      type={firestoreError} 
    />;
  }

  if (!role) {
    return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        {showAutoDemoBanner && (
          <div className="bg-amber-600 text-white px-6 py-2 flex items-center justify-between text-sm font-medium">
            <div className="flex items-center gap-2">
              <AlertCircle size={16} />
              <span>Firebase connection failed (Permissions/API). Running in Demo Mode with Local Storage.</span>
            </div>
            <button 
              onClick={() => setShowAutoDemoBanner(false)}
              className="hover:bg-white/10 p-1 rounded transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
        <TopBar />
        <main className="p-6 max-w-7xl mx-auto w-full">
          <Routes>
            <Route path="/" element={<Dashboard />} />
            <Route path="/villages" element={<VillageList />} />
            <Route path="/villages/:id" element={<VillageDetail />} />
            <Route path="/members" element={<MemberList />} />
            <Route path="/messaging" element={<div className="p-8 text-center text-slate-500">Messaging module coming soon...</div>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}
