import React, { useEffect, useState } from 'react';
import { Photo, Memory } from '../types';
import Section from '../components/UI/Section';
import { supabase } from '../lib/supabase';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';
import Button from '../components/UI/Button';

interface PhotosViewProps {
  onPhotoClick: (photo: Photo) => void;
  refreshKey?: number;
  searchTerm?: string;
}

const MEMORIES: Memory[] = [
  { id: 'm1', src: "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?auto=format&fit=crop&w=500&q=60", subtitle: "Conectando Vidas", title: "Telemedicina Rural" },
  { id: 'm2', src: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=500&q=60", subtitle: "Gestão Inteligente", title: "Monitoramento em Tempo Real" },
  { id: 'm3', src: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?auto=format&fit=crop&w=500&q=60", subtitle: "Cuiabá", title: "Hospital Digital" },
  { id: 'm4', src: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?auto=format&fit=crop&w=500&q=60", subtitle: "Inovação", title: "Tecnologia e Cuidado" },
  { id: 'm5', src: "https://images.unsplash.com/photo-1581056771107-24ca5f033842?auto=format&fit=crop&w=500&q=60", subtitle: "Humanização", title: "Equipe Multidisciplinar" },
];

const TODAY_PHOTOS: Photo[] = [
  { id: 't1', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCZWrkQTy6KqjiP3LEhy567HybToKFJE_KAY-0jeMStL5TTinZRZdnpwJdJE7TJGQNfS1L3ya6h8yUAYfcNPte7TETOmWvqz45p2R-zJ4wBdOLofiWsKmN0x1ea1iu_BXEUEM-BgvZpeGIpV7Oi1-wbI5b8u0gJ-CBOQRmvvLiPdhIioXsQs2XzutNbLP0Gi4UFczcJBN7m5wLO_8pXqV-Rjtfwc42QNuDdfJeNjZztEafw4Qil5CMHyf-6oToUlddMPIYQkaJY0zc", alt: "Architecture", aspect: 'wide', title: "Office Building", location: "London, UK" },
  { id: 't2', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCgM-90ihPE5g4CVDmj8DvASnonHU80Qw4T5Kw2McNL1cHtT--MANPYHWLnFRq_zTmldBFUH7BDAR3C5UgQOaPpPFN5EFXPrAjrxtNGMlPII7QwHKLeFcPFiLKVOwR2cBi3zpKNqqPq9PejkFhbMHrxhFwiY9dFp8S1tP4RhhzeODuwCFdbDumMNkAIfG4rR5-jLksA9dATzhhWOaTih2-_ocskQsIYQE_1mNKNOgxJ-5hiEZXlxP472-uM16a9FdWbizf3hfFKlcw", alt: "Tech", title: "Circuit Board" },
  { id: 't3', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9FGqbpc_udwsQL2bK185ZpXEXCB-Q5Gg7Og5G6zbdRiTqIrBi9TQLetydHS2i71GTfTBqDe1hhJRySzkVilN_GMQyoyEwb-ELIm2Gz-M1OwkngLsQvG7q9q3EenUMR4cIIJZ83GaiDa8xIOYMAMcqcd3BYup4sfMiRRJxpfWHHDatbDwkRrjeNEzAVGP1r9MgnW8IyNFK3-GQlPXuKfJvWuzQ2njkDzPHEjOjhIbSux5xft5RQXoQxcY55sFQFjx3TBeLS0_ue1A", alt: "Coding", title: "Laptop Code" },
  { id: 't4', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdzNJs3vxy4Ll7_CS8smp3tnCcSiPPHqNtEHDA2G4hqYRRNWmBaT2gUD63AmpdXvPW0-m83FoOo-7WDAjna2LqS_1OEn-xryzYicG2oQ-E6Tt2eejSAp2tLqKfLygm6eD3F0byGYx_9CKE4su2Y7ILFIlHtjVVlSJLeSmPWC0OxBAOC-bFBZka1gCJoQBOC7kg_U8I_4rYIpeNmSLMDzmDncRekUO6WYdd55MJhpZppFtFGJGfhJyMi0GcCumSOzj2Bf35BGC5b10", alt: "Office", aspect: 'tall', title: "Meeting Space" },
  { id: 't5', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAX3OD1JkUKiO2aMqrcMhAFaRs023PSRMy7yJ04u-8kljlExZMdODVjwJotbauwCQ8tAniK256RIfASwwRw-1dc3y4aLZgzMM2hZMO7nh-iMAsTIAlut72ZKobk5xWwjj1tiRxu2HkIGY7Rtkxfe4noFpiXbQO4g74KAOF2cLObezQB1Hx-9KJrRk48Q6WyV8cyDgo3BCX2slm1a9XGVKDJz1PtoDB2kwoSIq9-dJ1PWUxZELoBAD6P2fZKuwwST_WrgPYdnW8tmTE", alt: "People", title: "Team Meeting" },
];

const YESTERDAY_PHOTOS: Photo[] = [
  { id: 'y1', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDTIY_5hbL0vnTZqT0UhHZ0IV0VQtWchcp9fAC2dWMWgR6nC1eGgwwz9Nsa7znJtbFDTUJgvgAju_vAmDdzmt1Dk84fX0vYnsLEipuiFHO8RHDlxsU2hQg1vaHvfH22GjuHNLR-JBWQeiwLPiFSjjzerocgtuvMYdBcVwTjV8HvRTYMj9DaZ238lzpBe9xBdrTrk3yeioNLotw6K_0axoGlH3tbt7VqHobyjWe9AQ8fzhTJdtePyZ656XkQ9Uu71-viYsW54eCJdsI", alt: "Beach", title: "Sunrise", location: "Brighton, UK" },
  { id: 'y2', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDhfliIwPQhqbqRg_02FtTMnHkFI3jDhQUswN5vu-ZjQL2x2D_CKNZIpRF4im4XV1OlB4tCrbk2LRzaPdnFk0lC_G1axz7mTb-1nw2iL9QmckrVr3FuBDpmwIZBxthUfdn6y294G6zDxQMo4PqSGhJpN8tKurH1fahRARWMHD5FJfzjJuvqsMVZ1XiBLufg5SFl_hQ9M6Tsk7w8LykDw6403ehF0EAMbHktNsE6Mu0O0QV0HxhTUAcblnFhDw9f9N_j6Av25z4SzrI", alt: "Coast", aspect: 'wide', title: "Coastal Waves" },
  { id: 'y3', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCTHje-naCGygSGWnXV6hOVnkSq-bDU05jqtNnIG6TcpgM6zR6D2_oessJXcwGDTMIJsuRZlJ3aNT3d3u5ImHUfNkgSC01Zua-uQVC5EjA1tBj37A6_T1OFyVAqMWWldZCksN0nB0D3PjwGvr3ylXKr9483QKc_aMy10RVNJbrTaCYAL3O0g2lEh72CKFD34ouE5_j_BmimeHfDIxWm01sp7IUDCfeV_7Ee-YcUojn9LJ773yqq2h5Y8htGQabNJJbpfJfl3LESLOs", alt: "Car", title: "Classic Drive" },
  { id: 'y4', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdWoHyx70MmENdpE712ed2FA_yMwd3jgH-g7wiCy8MDZiZBySSuHX4rtax-1shof6khS485icJixj3oYjoCpbzNuwI4JlQKeuJhVVR4MiCg-pXisC3f3QeFTkv43QEU3KKau_xrqMoEafBS79nThZNZnvX-CPSLCJGCJ1DHbFRFC-dCpzi_Go6vVedB7lBP0V0TST8pgJ-HqMyUNQgzvzcPrnsvaRlW9sDoJF5OxUTKu0wUGkr2UHZs7oTLVVLzcERxOgYFyuOPL4", alt: "Lighthouse", title: "The Beacon" },
  { id: 'y4', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAdWoHyx70MmENdpE712ed2FA_yMwd3jgH-g7wiCy8MDZiZBySSuHX4rtax-1shof6khS485icJixj3oYjoCpbzNuwI4JlQKeuJhVVR4MiCg-pXisC3f3QeFTkv43QEU3KKau_xrqMoEafBS79nThZNZnvX-CPSLCJGCJ1DHbFRFC-dCpzi_Go6vVedB7lBP0V0TST8pgJ-HqMyUNQgzvzcPrnsvaRlW9sDoJF5OxUTKu0wUGkr2UHZs7oTLVVLzcERxOgYFyuOPL4", alt: "Lighthouse", title: "The Beacon" },
];

const PhotosView: React.FC<PhotosViewProps> = ({ onPhotoClick, refreshKey, searchTerm }) => {
  const [uploadedPhotos, setUploadedPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .is('deleted_at', null)
        .order('taken_at', { ascending: false });

      if (error) throw error;
      const formattedPhotos = (data || []).map((p: any) => ({
        ...p,
        src: p.url,
        alt: p.title || 'Foto do usuário'
      }));
      setUploadedPhotos(formattedPhotos);
    } catch (error: any) {
      console.error('Erro ao buscar fotos:', error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPhotos();
  }, [refreshKey]);

  // Filter photos based on search term
  const filteredPhotos = uploadedPhotos.filter(photo => {
    if (!searchTerm) return true;
    const term = searchTerm.toLowerCase();
    const title = (photo.title || '').toLowerCase();
    const description = (photo.subtitle || '').toLowerCase(); // Mapping description? subtitle is often undefined in fetched photos
    // Actually fetched photos might have description in DB but mapped to... currently not mapped in fetchPhotos to subtitle explicitly?
    // Let's check fetchPhotos map logic. It maps ...p directly. So photo.description should exist if in DB.
    // Let's use any for now to access potential description or just check title.
    const desc = ((photo as any).description || '').toLowerCase();

    return title.includes(term) || desc.includes(term);
  });

  const toggleSelection = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    const allIds = filteredPhotos.map(p => p.id);
    setSelectedIds(new Set(allIds));
  };

  const clearSelection = () => {
    setSelectedIds(new Set());
  };

  const handleBulkDelete = async () => {
    if (selectedIds.size === 0) return;
    if (!confirm(`Deseja mover ${selectedIds.size} itens para a lixeira?`)) return;

    setIsProcessing(true);
    try {
      const { error } = await supabase
        .from('photos')
        .update({ deleted_at: new Date().toISOString() })
        .in('id', Array.from(selectedIds));

      if (error) throw error;

      alert(`${selectedIds.size} itens movidos para a lixeira.`);
      setIsSelectionMode(false);
      setSelectedIds(new Set());
      fetchPhotos();
    } catch (error: any) {
      alert('Erro ao excluir itens: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleBulkDownload = async () => {
    if (selectedIds.size === 0) return;

    setIsProcessing(true);
    try {
      const zip = new JSZip();
      const selectedPhotos = filteredPhotos.filter(p => selectedIds.has(p.id));

      const downloadPromises = selectedPhotos.map(async (photo) => {
        try {
          const response = await fetch(photo.src);
          const blob = await response.blob();
          const cleanTitle = (photo.title || 'foto').replace(/[^a-z0-9]/gi, '_').toLowerCase();
          const fileName = `${cleanTitle}_${photo.id}.jpg`;
          zip.file(fileName, blob);
        } catch (err) {
          console.error(`Erro ao baixar ${photo.src}:`, err);
        }
      });

      await Promise.all(downloadPromises);

      const content = await zip.generateAsync({ type: 'blob' });
      saveAs(content, 'fotos_selecionadas.zip');
    } catch (error: any) {
      alert('Erro ao gerar arquivo ZIP: ' + error.message);
    } finally {
      setIsProcessing(false);
    }
  };

  // Helper to format date headers
  const formatDateHeader = (dateStr: string) => {
    const date = new Date(dateStr);
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(today.getDate() - 1);

    if (date.toDateString() === today.toDateString()) return 'Hoje';
    if (date.toDateString() === yesterday.toDateString()) return 'Ontem';

    return date.toLocaleDateString('pt-BR', { day: 'numeric', month: 'long', year: today.getFullYear() !== date.getFullYear() ? 'numeric' : undefined });
  };

  // Group photos by date
  const groupedPhotos = filteredPhotos.reduce((groups: { [key: string]: Photo[] }, photo) => {
    const date = photo.date || (photo as any).taken_at || (photo as any).created_at || new Date().toISOString();
    const dateKey = date.split('T')[0];
    if (!groups[dateKey]) {
      groups[dateKey] = [];
    }
    groups[dateKey].push(photo);
    return groups;
  }, {});

  const sortedDateKeys = Object.keys(groupedPhotos).sort((a, b) => b.localeCompare(a));

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 custom-scrollbar relative">
      {/* Floating Selection Toolbar */}
      {isSelectionMode && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 bg-white dark:bg-slate-800 shadow-2xl rounded-2xl border border-slate-100 dark:border-slate-700 p-2 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="px-4 border-r border-slate-100 dark:border-slate-700 mr-2 flex flex-col items-center">
            <span className="text-sm font-bold text-primary">{selectedIds.size}</span>
            <span className="text-[10px] text-slate-400 uppercase font-medium">Selecionados</span>
          </div>

          <Button variant="ghost" size="sm" onClick={selectAll} icon="done_all" className="hidden md:flex">Tudo</Button>
          <Button variant="ghost" size="sm" onClick={clearSelection} icon="close">Limpar</Button>

          <div className="w-px h-8 bg-slate-100 dark:bg-slate-700 mx-1"></div>

          <Button
            variant="primary"
            size="sm"
            onClick={handleBulkDownload}
            disabled={selectedIds.size === 0 || isProcessing}
            icon={isProcessing ? 'sync' : 'download'}
            className={isProcessing ? 'animate-pulse' : ''}
          >
            Baixar
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={handleBulkDelete}
            disabled={selectedIds.size === 0 || isProcessing}
            icon="delete"
          >
            Excluir
          </Button>

          <button
            onClick={() => { setIsSelectionMode(false); setSelectedIds(new Set()); }}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 ml-2"
          >
            <span className="material-icons">close</span>
          </button>
        </div>
      )}
      {/* Memories Section */}
      {!searchTerm && (
        <Section
          title="Lembranças Recentes"
          actionLabel="Ver tudo"
          onActionClick={() => { }}
          className="mt-4"
        >
          <div className="flex gap-6 overflow-x-auto pb-4 custom-scrollbar">
            {MEMORIES.map((memory) => (
              <div
                key={memory.id}
                onClick={() => onPhotoClick({ id: memory.id, src: memory.src, alt: memory.title, title: memory.title, subtitle: memory.subtitle })}
                className="relative flex-none w-48 h-64 rounded-xl overflow-hidden cursor-pointer group shadow-md"
              >
                <img
                  src={memory.src}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  alt={memory.title}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <p className="text-white text-xs font-medium uppercase tracking-widest opacity-80 mb-1">{memory.subtitle}</p>
                  <p className="text-white font-bold leading-tight">{memory.title}</p>
                </div>
              </div>
            ))}
          </div>
        </Section>
      )}

      {/* Dynamic Grouped Photos Sections */}
      {sortedDateKeys.length > 0 ? (
        sortedDateKeys.map((dateKey) => (
          <section key={dateKey} className="mb-12">
            <div className="flex items-center gap-4 mb-4 sticky top-0 bg-white/95 dark:bg-background-dark/95 py-3 z-[5]">
              <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
                {formatDateHeader(dateKey)}
              </h3>
              <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>

              <button
                onClick={() => setIsSelectionMode(!isSelectionMode)}
                className={`p-1.5 rounded-lg transition-colors flex items-center gap-2 border ${isSelectionMode
                  ? 'bg-primary/10 border-primary text-primary'
                  : 'text-slate-400 border-transparent hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
              >
                <span className="material-icons-outlined text-xl">{isSelectionMode ? 'check_circle' : 'library_add_check'}</span>
                <span className="text-xs font-medium hidden md:block">{isSelectionMode ? 'Concluir Seleção' : 'Selecionar'}</span>
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]">
              {groupedPhotos[dateKey].map((photo: any) => (
                <div
                  key={photo.id}
                  onClick={() => {
                    if (isSelectionMode) {
                      toggleSelection(photo.id);
                    } else {
                      onPhotoClick(photo);
                    }
                  }}
                  className={`rounded-lg overflow-hidden group relative cursor-pointer bg-slate-100 dark:bg-slate-800 flex items-center justify-center transition-all ${isSelectionMode && selectedIds.has(photo.id) ? 'ring-4 ring-primary ring-inset' : ''
                    } ${photo.media_type === 'video' ? 'col-span-2 row-span-2 md:col-span-1 md:row-span-1 lg:col-span-2 lg:row-span-2 aspect-video' : ''
                    }`}
                >
                  <img
                    src={photo.src}
                    alt={photo.alt || photo.title}
                    className={`w-full h-full object-cover transition-transform duration-700 ${isSelectionMode ? '' : 'group-hover:scale-105'
                      }`}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Imagem+N%C3%A3o+Encontrada';
                    }}
                  />

                  {/* Selection Checkbox */}
                  {isSelectionMode && (
                    <div className={`absolute top-3 left-3 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors ${selectedIds.has(photo.id) ? 'bg-primary border-primary' : 'bg-black/20 border-white'
                      }`}>
                      {selectedIds.has(photo.id) && <span className="material-icons text-white text-[16px]">check</span>}
                    </div>
                  )}

                  {!isSelectionMode && (
                    <>
                      <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                        <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                      </div>

                      {photo.media_type === 'video' && (
                        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                          <div className="bg-black/30 backdrop-blur-sm p-3 rounded-full flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                            <span className="material-icons text-white text-3xl">play_arrow</span>
                          </div>
                        </div>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>
          </section>
        ))
      ) : (
        <section className="mt-20 text-center">
          <div className="w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
            <span className="material-icons text-4xl">photo_library</span>
          </div>
          <h3 className="text-lg font-bold text-slate-700 dark:text-slate-200">Sua galeria está vazia</h3>
          <p className="text-slate-400">Comece enviando algumas fotos ou vídeos.</p>
        </section>
      )}

      {/* Location Preview (Static) */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-6">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Localização em Destaque</h3>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
        </div>
        <div className="w-full h-48 rounded-xl overflow-hidden relative group cursor-pointer hover:ring-2 ring-primary transition-all">
          <img
            className="w-full h-full object-cover opacity-60"
            alt="Map"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCh5ejWSN9VG856-f68IK6lXP_RYDoO_lqYrS06tMk1TczXqyiYQQjauLA8lSbMse00B-lIwrJ6ZwejcoGNwue9HZDhjHQRGLbmXWRUvFbwsiw2h-xR_kWukTIrt-cN5dfDbxmuF2B8shdB8tJ_SzK7h1nZEDiKCMDZf2taOKEEMwPEvqcksHBGYn0-qZ7m_AkNoBGLs-hVyyxoRFzU98f_Vu_MSU9-mhbicZ3ZY-00LNaN-rhR4PJXw7QfwNhwYTHRfXq4pNO5CM"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-sm p-4 rounded-xl shadow-xl flex items-center gap-3 border border-white/20">
              <span className="material-icons-outlined text-primary">place</span>
              <div>
                <p className="font-bold text-slate-800 dark:text-white">Califórnia, USA</p>
                <p className="text-xs text-slate-500">2.450 fotos nesta área</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PhotosView;