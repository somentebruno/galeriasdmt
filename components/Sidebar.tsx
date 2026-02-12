import React from 'react';
import { ViewState } from '../types';

interface SidebarProps {
  activeView: ViewState;
  onChangeView: (view: ViewState) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeView, onChangeView }) => {
  const navItemClass = (view: ViewState) =>
    `flex items-center gap-4 px-4 py-3 rounded-full transition-colors cursor-pointer ${activeView === view
      ? 'bg-primary/10 text-primary font-semibold'
      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
    }`;

  return (
    <aside className="w-64 bg-sidebar-light dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 flex flex-col z-20 shrink-0 hidden md:flex">
      <div
        className="py-6 px-2 flex items-center justify-center cursor-pointer transition-opacity hover:opacity-80"
        onClick={() => onChangeView(ViewState.PHOTOS)}
        title="Voltar para o início"
      >
        <img
          src="/logo.png"
          alt="Saúde Digital MT - Galeria"
          className="h-16 w-auto object-contain cursor-pointer hover:opacity-80 transition-opacity"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            e.currentTarget.parentElement?.classList.remove('justify-center');
            const fallback = document.getElementById('sidebar-fallback-logo');
            if (fallback) fallback.style.display = 'flex';
          }}
          onClick={() => onChangeView(ViewState.PHOTOS)}
        />
        <div
          id="sidebar-fallback-logo"
          className="hidden items-center gap-2 cursor-pointer"
          onClick={() => onChangeView(ViewState.PHOTOS)}
        >
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="material-icons text-white text-xl">cloud</span>
          </div>
          <span className="font-display font-bold text-xl text-slate-800 dark:text-white">Saúde Digital MT</span>
        </div>
      </div>

      <nav className="flex-1 px-4 py-2 space-y-1 overflow-y-auto">
        <button className={navItemClass(ViewState.PHOTOS)} onClick={() => onChangeView(ViewState.PHOTOS)}>
          <span className="material-icons-outlined">image</span>
          Fotos
        </button>
        <button className={navItemClass(ViewState.EXPLORE)} onClick={() => onChangeView(ViewState.EXPLORE)}>
          <span className="material-icons-outlined">explore</span>
          Explorar
        </button>
        <button className={navItemClass(ViewState.SHARING)} onClick={() => onChangeView(ViewState.SHARING)}>
          <span className="material-icons-outlined">group</span>
          Compartilhamento
        </button>

        <div className="pt-6 pb-2 px-4">
          <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Biblioteca</p>
        </div>

        <button className={navItemClass(ViewState.PLACES)} onClick={() => onChangeView(ViewState.PLACES)}>
          <span className="material-icons-outlined">place</span>
          Lugares
        </button>
        <button className={navItemClass(ViewState.ALBUMS)} onClick={() => onChangeView(ViewState.ALBUMS)}>
          <span className="material-icons-outlined">collections</span>
          Álbuns
        </button>
        <button className={navItemClass(ViewState.UTILITIES)} onClick={() => onChangeView(ViewState.UTILITIES)}>
          <span className="material-icons-outlined">auto_fix_high</span>
          Gerenciamento
        </button>
        <button className={navItemClass(ViewState.ARCHIVE)} onClick={() => onChangeView(ViewState.ARCHIVE)}>
          <span className="material-icons-outlined">archive</span>
          Arquivo
        </button>
        <button className={navItemClass(ViewState.TRASH)} onClick={() => onChangeView(ViewState.TRASH)}>
          <span className="material-icons-outlined">delete</span>
          Lixeira
        </button>
      </nav>

      <div className="p-6 border-t border-slate-200 dark:border-slate-800">
        <div className="flex items-center justify-between text-sm mb-2">
          <span className="font-medium text-slate-700 dark:text-slate-300">Armazenamento</span>
          <span className="text-slate-500">15 GB de 100 GB</span>
        </div>
        <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full mb-4">
          <div className="h-full bg-primary rounded-full w-[15%]"></div>
        </div>
        <button className="w-full py-2.5 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-primary font-semibold rounded-full hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-sm shadow-sm">
          Comprar Espaço
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;