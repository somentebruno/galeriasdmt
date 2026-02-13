import React, { useState } from 'react';
import { ViewState } from '../types';
import Avatar from './UI/Avatar';
import Button from './UI/Button';
import { supabase } from '../lib/supabase';

import UploadModal from './UploadModal';

interface HeaderProps {
  activeView?: ViewState;
  onNavigate?: (view: ViewState) => void;
  onSearch?: (term: string) => void;
  searchTerm?: string;
  onUploadSuccess?: () => void;
}

const Header: React.FC<HeaderProps> = ({ activeView, onNavigate, onSearch, searchTerm, onUploadSuccess }) => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  const handleUploadSuccess = () => {
    setShowUploadModal(false);
    onUploadSuccess?.();
  };

  const getBreadcrumbs = () => {
    if (activeView === ViewState.PLACES) {
      return (
        <nav className="flex items-center gap-2">
          <button
            onClick={() => onNavigate?.(ViewState.EXPLORE)}
            className="text-slate-500 text-sm hover:text-primary transition-colors"
          >
            Explorar
          </button>
          <span className="material-icons text-slate-400 text-sm">chevron_right</span>
          <span className="font-semibold text-sm">Lugares</span>
        </nav>
      );
    }
    return null;
  };

  return (
    <>
      <header className="h-16 flex items-center justify-between px-4 md:px-8 py-4 sticky top-0 bg-white/80 dark:bg-background-dark/80 backdrop-blur-md z-50 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-4 flex-1 max-w-2xl">
          <div className="flex items-center gap-2 px-2 md:hidden">
            <span className="material-icons text-primary text-3xl">photo_library</span>
          </div>

          {!getBreadcrumbs() && (
            <div className="relative group w-full">
              <span className="material-icons-outlined absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">search</span>
              <input
                className="w-full h-12 pl-12 pr-4 bg-slate-100 dark:bg-slate-800 border-none rounded-full focus:ring-2 focus:ring-primary/50 focus:bg-white dark:focus:bg-slate-700 transition-all text-slate-800 dark:text-white outline-none placeholder-slate-500"
                placeholder="Pesquise suas fotos, pessoas ou lugares"
                type="text"
                value={searchTerm}
                onChange={(e) => onSearch?.(e.target.value)}
              />
            </div>
          )}

          {getBreadcrumbs()}
        </div>

        <div className="flex items-center gap-2 md:gap-4 ml-4">
            
          {/* Upload Button */}
          <Button 
            className="hidden sm:flex bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-full font-medium transition-colors shadow-lg shadow-primary/20"
            onClick={() => setShowUploadModal(true)}
            icon="cloud_upload"
          >
            <span className="hidden lg:inline ml-2">Fazer Upload</span>
          </Button>

          <div className="flex items-center gap-1 text-slate-500 dark:text-slate-400">
            <Button variant="ghost" icon="help_outline" />
            <Button variant="ghost" icon="settings" />
            <Button variant="ghost" icon="notifications" className="md:hidden" />
          </div>

          <div className="relative">
            <div
              className="cursor-pointer hover:ring-2 ring-primary/20 rounded-full transition-all"
              onClick={() => setShowProfileMenu(!showProfileMenu)}
            >
              <Avatar />
            </div>

            {showProfileMenu && (
              <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-slate-900 rounded-xl shadow-2xl border border-slate-100 dark:border-slate-800 py-2 animate-in fade-in slide-in-from-top-2">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 flex items-center gap-2 transition-colors"
                >
                  <span className="material-icons text-sm">logout</span>
                  Sair da Galeria
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {showUploadModal && (
        <UploadModal 
            onClose={() => setShowUploadModal(false)}
            onSuccess={handleUploadSuccess}
        />
      )}
    </>
  );
};

export default Header;