import React, { useState } from 'react';
import { Photo } from '../types';
import Button from './UI/Button';
import { supabase } from '../lib/supabase';

interface LightboxProps {
  photo: Photo | null;
  onClose: () => void;
  onDelete?: () => void; // Callback to refresh parent list
}

const Lightbox: React.FC<LightboxProps> = ({ photo, onClose, onDelete }) => {
  const [zoom, setZoom] = useState(false);
  const [showInfo, setShowInfo] = useState(false);
  const [showSharePopup, setShowSharePopup] = useState(false);

  if (!photo) return null;

  const handleShare = () => {
    setShowSharePopup(true);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(photo.src);
    alert('Link copiado para a área de transferência!');
    setShowSharePopup(false);
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja mover esta foto para a lixeira?')) return;

    try {
      const { error } = await supabase
        .from('photos')
        .update({ deleted_at: new Date().toISOString() })
        .eq('url', photo.src); // Using URL as ID since that's what we mapped, ideally use ID

      if (error) throw error;

      onDelete?.();
      onClose();
    } catch (error: any) {
      alert('Erro ao deletar: ' + error.message);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 backdrop-blur-md animate-in fade-in duration-300">

      {/* Top Right Close Button */}
      <div className="absolute top-6 right-6 z-20">
        <Button
          variant="secondary"
          icon="close"
          onClick={onClose}
          className="!bg-white/10 !text-white hover:!bg-white/20 !border-none !w-12 !h-12 shadow-2xl backdrop-blur-sm rounded-full"
        />
      </div>

      <div className="relative w-full h-full flex flex-col items-center justify-center p-4">

        {/* Main Content */}
        <div className={`transition-all duration-300 ${zoom ? 'scale-150 cursor-zoom-out' : 'cursor-zoom-in'}`} onClick={() => photo.media_type !== 'video' && setZoom(!zoom)}>
          {photo.media_type === 'video' ? (
            <iframe
              className="w-[80vw] h-[80vh] shadow-2xl"
              src={`https://www.youtube.com/embed/${photo.video_id}?autoplay=1`}
              title={photo.title}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            ></iframe>
          ) : (
            <img
              src={photo.src}
              alt={photo.alt}
              className="max-w-full max-h-[85vh] object-contain shadow-2xl select-none"
            />
          )}
        </div>

        {/* Info Panel Overlay */}
        {showInfo && (
          <div className="absolute top-20 left-6 bg-black/80 backdrop-blur-md text-white/90 p-4 rounded-xl max-w-xs animate-in slide-in-from-left-4 fade-in">
            <h3 className="font-bold text-lg mb-1">{photo.title || 'Sem Título'}</h3>
            <p className="text-sm opacity-70 mb-2">{photo.location || 'Localização desconhecida'}</p>
            <div className="h-px bg-white/20 my-2"></div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs opacity-60">
              <span>Data:</span> <span>{new Date().toLocaleDateString()}</span>
              <span>Tamanho:</span> <span>2.4 MB</span>
              <span>Resolução:</span> <span>4032 x 3024</span>
              <span>ISO:</span> <span>400</span>
            </div>
          </div>
        )}

        {/* Share Popup Overlay */}
        {showSharePopup && (
          <div className="absolute bottom-24 flex flex-col items-center bg-white dark:bg-slate-800 p-4 rounded-xl shadow-2xl animate-in slide-in-from-bottom-4 fade-in z-30 min-w-[300px]">
            <h3 className="font-bold text-slate-800 dark:text-white mb-2">Compartilhar Foto</h3>
            <p className="text-sm text-slate-500 mb-4 text-center">Crie um link público para compartilhar esta foto com amigos.</p>
            <button
              onClick={handleCopyLink}
              className="w-full bg-primary text-white py-2 rounded-lg font-semibold hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <span className="material-icons text-sm">link</span>
              Copiar Link Público
            </button>
            <button
              onClick={() => setShowSharePopup(false)}
              className="mt-2 text-xs text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Cancelar
            </button>
          </div>
        )}

        {/* Bottom Toolbar */}
        <div className="absolute bottom-8 flex items-center gap-4 bg-black/60 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-2xl z-20 transition-transform hover:scale-105">

          <button
            onClick={handleShare}
            className="flex items-center gap-2 text-white/80 hover:text-white hover:bg-white/10 px-3 py-2 rounded-lg transition-all group"
            title="Compartilhar"
          >
            <span className="material-icons-outlined group-hover:text-primary transition-colors">share</span>
            <span className="text-sm font-medium">Compartilhar</span>
          </button>

          <div className="w-px h-6 bg-white/20"></div>

          <button
            onClick={() => setZoom(!zoom)}
            className="p-2 text-white/80 hover:text-white hover:bg-white/10 rounded-full transition-all"
            title={zoom ? "Reduzir" : "Ampliar"}
          >
            <span className="material-icons-outlined">{zoom ? 'zoom_out' : 'zoom_in'}</span>
          </button>

          <button
            onClick={() => setShowInfo(!showInfo)}
            className={`p-2 rounded-full transition-all ${showInfo ? 'text-primary bg-white/10' : 'text-white/80 hover:text-white hover:bg-white/10'}`}
            title="Informações"
          >
            <span className="material-icons-outlined">info</span>
          </button>

          <div className="w-px h-6 bg-white/20"></div>

          <button
            onClick={handleDelete}
            className="p-2 text-white/80 hover:text-red-400 hover:bg-red-500/20 rounded-full transition-all"
            title="Deletar"
          >
            <span className="material-icons-outlined">delete</span>
          </button>

        </div>

      </div>
    </div>
  );
};

export default Lightbox;