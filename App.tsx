import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import PhotosView from './views/PhotosView';
import ExploreView from './views/ExploreView';
import PlacesView from './views/PlacesView';
import AuthView from './views/AuthView';
import TrashView from './views/TrashView';
import Lightbox from './components/Lightbox';
import { ViewState, Photo } from './types';
import { supabase } from './lib/supabase';
import { User } from '@supabase/supabase-js';

import { cleanupOldTrashItems } from './utils/cleanup';

const App: React.FC = () => {
  const [activeView, setActiveView] = useState<ViewState>(ViewState.PHOTOS);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  const handleUploadSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleRestore = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleDelete = () => {
    setRefreshKey(prev => prev + 1);
  };

  useEffect(() => {
    // SECURITY AUDIT: Verify environment configuration
    const url = import.meta.env.VITE_SUPABASE_URL;
    const key = import.meta.env.VITE_SUPABASE_ANON_KEY;
    
    if (!url || !key) {
      alert(`⚠️ CONFIGURATION ERROR ⚠️\n\nSupabase Keys are MISSING!\n\nURL: ${url ? 'OK' : 'MISSING'}\nKEY: ${key ? 'OK' : 'MISSING'}\n\nIf you are running online, add these to your Hosting Dashboard (Environment Variables). .env file is NOT uploaded via git.`);
    } else {
       // Optional: Notify success (can remove later)
       // console.log("Configuration OK");
    }

    // Check active session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Run auto-cleanup if user is logged in
      if (session?.user) {
        cleanupOldTrashItems();
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        cleanupOldTrashItems();
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-slate-50 dark:bg-slate-950">
        <div className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!user) {
    return <AuthView />;
  }

  const renderView = () => {
    switch (activeView) {
      case ViewState.PHOTOS:
        return <PhotosView onPhotoClick={setSelectedPhoto} refreshKey={refreshKey} searchTerm={searchTerm} />;
      case ViewState.EXPLORE:
        return <ExploreView onPhotoClick={setSelectedPhoto} onChangeView={() => setActiveView(ViewState.PLACES)} searchTerm={searchTerm} />;
      case ViewState.PLACES:
        return <PlacesView onPhotoClick={setSelectedPhoto} onClose={() => setActiveView(ViewState.PHOTOS)} />;
      case ViewState.TRASH:
        return <TrashView onPhotoClick={setSelectedPhoto} refreshKey={refreshKey} onRestore={handleRestore} searchTerm={searchTerm} />;
      default:
        return (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
            <span className="material-icons text-6xl mb-4 text-slate-200 dark:text-slate-700">construction</span>
            <p className="font-medium">Esta visualização está em desenvolvimento</p>
            <button
              onClick={() => setActiveView(ViewState.PHOTOS)}
              className="mt-4 text-primary font-semibold hover:underline"
            >
              Voltar para Fotos
            </button>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen w-full bg-white dark:bg-background-dark overflow-hidden">
      <Sidebar activeView={activeView} onChangeView={setActiveView} />

      <main className="flex-1 flex flex-col relative h-full w-full">
        <Header
          activeView={activeView}
          onNavigate={setActiveView}
          onUploadSuccess={handleUploadSuccess}
          onSearch={setSearchTerm}
          searchTerm={searchTerm}
        />

        <div className="flex-1 flex flex-col relative overflow-hidden">
          {renderView()}
        </div>

        {/* Floating Action Button for Mobile */}
        <button className="fixed bottom-6 right-6 w-14 h-14 bg-primary text-white rounded-full shadow-2xl flex items-center justify-center hover:scale-110 transition-transform md:hidden z-40">
          <span className="material-icons-outlined">add</span>
        </button>
      </main>

      {selectedPhoto && (
        <Lightbox
          photo={selectedPhoto}
          onClose={() => setSelectedPhoto(null)}
          onDelete={handleDelete}
        />
      )}
    </div>
  );
};

export default App;