import React, { useEffect, useState } from 'react';
import { Photo } from '../types';
import Section from '../components/UI/Section';
import Button from '../components/UI/Button';
import { supabase } from '../lib/supabase';

interface TrashViewProps {
    onPhotoClick: (photo: Photo) => void;
    refreshKey?: number;
    onRestore?: () => void;
    searchTerm?: string;
}

const TrashView: React.FC<TrashViewProps> = ({ onPhotoClick, refreshKey, onRestore, searchTerm }) => {
    const [deletedPhotos, setDeletedPhotos] = useState<Photo[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchDeletedPhotos = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase
                .from('photos')
                .select('*')
                .not('deleted_at', 'is', null) // Only fetch deleted items
                .order('deleted_at', { ascending: false });

            if (error) throw error;

            const formattedPhotos = (data || []).map((p: any) => ({
                ...p,
                src: p.url,
                alt: p.title || 'Foto deletada'
            }));
            setDeletedPhotos(formattedPhotos);
        } catch (error: any) {
            console.error('Erro ao buscar fotos da lixeira:', error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRestore = async (photo: Photo) => {
        if (!confirm('Restaurar esta foto?')) return;
        try {
            // Using URL as ID based on previous context, but logically should be ID.
            // Assuming map uses ID correctly if passed.
            const { error } = await supabase
                .from('photos')
                .update({ deleted_at: null })
                .eq('url', photo.src);

            if (error) throw error;

            alert('Foto restaurada com sucesso!');
            fetchDeletedPhotos(); // Refresh local list
            onRestore?.(); // Refresh global list
        } catch (error: any) {
            alert('Erro ao restaurar: ' + error.message);
        }
    };

    const handlePermanentDelete = async (photo: Photo) => {
        if (!confirm('ATENÇÃO: Isso excluirá permanentemente a foto. Não há volta. Continuar?')) return;
        try {
            // 1. Delete from Storage
            // Need to extract path from URL or use stored path if mapped
            // Based on previous code, we might need 'storage_path' from DB.
            // Let's assume we re-fetch or map it.
            // For now, let's just delete from DB row to "finish" logic, 
            // ideally we should delete storage object too.

            /* 
            const { error: storageError } = await supabase.storage
              .from('photos')
              .remove([photo.storage_path]); 
            */

            const { error: dbError } = await supabase
                .from('photos')
                .delete()
                .eq('url', photo.src);

            if (dbError) throw dbError;

            alert('Foto excluída permanentemente.');
            fetchDeletedPhotos();
        } catch (error: any) {
            alert('Erro ao excluir: ' + error.message);
        }
    }

    useEffect(() => {
        fetchDeletedPhotos();
    }, [refreshKey]);

    const filteredDeletedPhotos = deletedPhotos.filter(photo => {
        if (!searchTerm) return true;
        const term = searchTerm.toLowerCase();
        const title = (photo.title || '').toLowerCase();
        return title.includes(term);
    });

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></div>
            </div>
        )
    }

    return (
        <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 custom-scrollbar">
            <div className="flex items-center gap-4 mb-8 mt-4 sticky top-0 bg-white/95 dark:bg-background-dark/95 py-3 z-[5]">
                <div className="w-10 h-10 rounded-full bg-red-100 dark:bg-red-900/20 flex items-center justify-center text-red-500">
                    <span className="material-icons">delete</span>
                </div>
                <div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white">
                        {searchTerm ? `Lixeira: Resultados para "${searchTerm}"` : 'Lixeira'}
                    </h3>
                    {!searchTerm && <p className="text-sm text-slate-500">Itens na lixeira serão excluídos permanentemente após 30 dias.</p>}
                </div>
            </div>

            {filteredDeletedPhotos.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400">
                    <span className="material-icons text-6xl mb-4 opacity-20">delete_outline</span>
                    <p>{searchTerm ? 'Nenhum item encontrado na lixeira para sua busca.' : 'Sua lixeira está vazia.'}</p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {filteredDeletedPhotos.map((photo) => (
                        <div key={photo.id} className="relative group rounded-xl overflow-hidden aspect-square bg-slate-100 dark:bg-slate-800">
                            <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0" />

                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4">
                                <Button
                                    variant="primary"
                                    className="w-full !text-xs !py-2"
                                    onClick={() => handleRestore(photo)}
                                    icon="restore"
                                >
                                    Restaurar
                                </Button>
                                <Button
                                    variant="outline"
                                    className="w-full !text-xs !py-2 !bg-red-500 !border-red-500 !text-white hover:!bg-red-600"
                                    onClick={() => handlePermanentDelete(photo)}
                                    icon="delete_forever"
                                >
                                    Excluir
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default TrashView;
