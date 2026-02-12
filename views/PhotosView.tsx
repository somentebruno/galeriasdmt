import React, { useEffect, useState } from 'react';
import { Photo, Memory } from '../types';
import Section from '../components/UI/Section';
import { supabase } from '../lib/supabase';

interface PhotosViewProps {
  onPhotoClick: (photo: Photo) => void;
}

const MEMORIES: Memory[] = [
  { id: 'm1', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBdqsg-MyQw9iJxnoQqOyD1iCoiPb07APcgZ-jnG-VNnlJb8_HnZsjFishZs6gh--bruWKPSNz7zcLQ4DsIeYbrrLZLxGr0gR8qsSLpfaegzC2c3q8En_xFBvNFNvzN13LKNXixlR0n8SdVlB0Cze_z5zeGiZFBlbhMJrWIs8SQMovqtZjUS_-3nvBdBvrolJJV9wmjH736OpF2m8qaKg-lAQwikq-UUIRcD-mgKH6QVOTDwhh2N2JsFYQDCOV0COiNltZWhxhAbTw", subtitle: "1 ano atrás", title: "Inverno nos Alpes" },
  { id: 'm2', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAavCr7qxIjnAFHY7meeXLxL3hSvVeQx2YdYLhD-f1xptfC7OMGRke2kfmZCi4V7mCaHuDn2-xuh6f06gzTrVhduUa4UmyYx2OV9FNV-QjfRwM-uIigzgzL0eImxfiBP1PegMqMrMpumKMMGSmOO3OcF5PCz7rCMGNO14xG4E1KZZRGcQYkQDqugDAN_7ECFC6-qr7mEqOflqzywAA-7W-5_IEO6k5w2-fryoRxAyBFPBZ5yoPSqe93msrDp_S3wlliPwwulC3_d-I", subtitle: "3 anos atrás", title: "Férias de Verão" },
  { id: 'm3', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB1rAacIoYGuMQEUDCS2EOSwQlfI8abE8-b1kqU4MnAuaRsPP_BwUn4I0w6gMk-mnSHmQo_EoMHfEHiR4QH33w-9figZ8lTC5hYFSZI5r4XaUIK0vQPDtL-5UeGzt_EFzOQdrdL1KXrooT_vThT5fzN73Qnd0Y0hxxN6L8tRKXBxb_FFIr174X_hZNkbHvjODzmxmIePA-vpp58MwTrPL6aqwZieLnjCSD7fcGYSe5xw42OTeGzZsrY1r7jnjNhWJxM9HWxYHoNo_Q", subtitle: "Outubro passado", title: "Jantar com Amigos" },
  { id: 'm4', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAziX87AxObnM-Q9ET4Vpa76k77-4mEHofbpuFE90DVZinEduPHzEOkt631O4t3DnBupnnMrKaPz_Jz-ojNEa6LkGFGv9htJMnlX6KyrSNVt1wv86YyNlARNJsJHn5yFmXKqImJsTFq6s6-OlgKp92KitaifAYc4wN5PM3y_bGuEbnWWCyCXreG9f2BNEnV3vGEbzflAq8VAmvcseGD5jJZDerpUn_ruEgvbaKDqq0KWD9fi1YKAf0dj-NwlS4ce9XDr0Wuqqp7Nlo", subtitle: "5 anos atrás", title: "Viagem para São Francisco" },
  { id: 'm5', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCNcMQNcm8n1frBcR7nC78WRtviXv7qMPcTL5o4y62wCoQ61kedQSlrQtvif-C5KkvhtqjkI0EeoUDy6gCOd1hDG4BMtUfhh5wgfBdf2d5G0RyIZIxuz-SZ7lJRBQ5eMTNb5AVaeGZY7YpTLhrCz9n8ecqrdxAEe827AMVmXPgz03vTLahMbjDj41HptB7PlCedIC1leTw4kp_p6uwUayV8iSJKPLgvaXm9VM6AUCK4hrjElSlCdnM91S7U_9yHAW4GTcMihdeucw4", subtitle: "Destaque", title: "Noites em Paris" },
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

  const fetchPhotos = async () => {
    try {
      const { data, error } = await supabase
        .from('photos')
        .select('*')
        .is('deleted_at', null) // Only fetch active photos
        .order('created_at', { ascending: false });

      if (error) throw error;
      const formattedPhotos = (data || []).map((p: any) => ({
        ...p,
        src: p.url, // Map 'url' from DB to 'src' for the UI
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

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 custom-scrollbar">
      {/* Memories Section - Only show when not searching or optional? Let's hide memories when searching to focus on results */}
      {!searchTerm && (
        <Section
          title="Lembranças Recentes"
          actionLabel="Ver tudo"
          onActionClick={() => { }}
          className="mt-4"
        >
          <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
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

      {/* Uploaded Photos Section */}
      {filteredPhotos.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center gap-4 mb-4 sticky top-0 bg-white/95 dark:bg-background-dark/95 py-3 z-[5]">
            <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">
              {searchTerm ? `Resultados para "${searchTerm}"` : 'Sua Galeria Unificada'}
            </h3>
            <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]">
            {filteredPhotos.map((photo: any) => (
              <div
                key={photo.id}
                onClick={() => onPhotoClick(photo)}
                className={`rounded-lg overflow-hidden group relative cursor-pointer bg-slate-100 dark:bg-slate-800 flex items-center justify-center ${photo.media_type === 'video' ? 'col-span-2 row-span-2 md:col-span-1 md:row-span-1 lg:col-span-2 lg:row-span-2 aspect-video' : ''
                  }`}
              >
                <img
                  src={photo.src}
                  alt={photo.alt || photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x400?text=Imagem+N%C3%A3o+Encontrada';
                  }}
                />

                {/* Gradient Overlay for Text */}
                <div className="absolute inset-x-0 bottom-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white text-xs font-medium truncate">{photo.title}</p>
                </div>

                {/* Video Play Icon Overlay */}
                {photo.media_type === 'video' && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="bg-black/30 backdrop-blur-sm p-3 rounded-full flex items-center justify-center group-hover:bg-primary/80 transition-colors">
                      <span className="material-icons text-white text-3xl">play_arrow</span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Today Section (Demo) */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-4 sticky top-0 bg-white/95 dark:bg-background-dark/95 py-3 z-[5]">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Hoje <span className="text-slate-400 font-normal ml-2">• Londres, UK</span></h3>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
          <button className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-icons-outlined text-xl">check_circle_outline</span>
          </button>
        </div>
        <p className="text-sm text-slate-400 mb-4 italic">Fotos de demonstração</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]">
          {TODAY_PHOTOS.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onPhotoClick(photo)}
              className={`rounded-lg overflow-hidden group relative cursor-pointer ${photo.aspect === 'wide' ? 'col-span-2' :
                photo.aspect === 'tall' ? 'row-span-2' : ''
                }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>
          ))}
        </div>
      </section>

      {/* Yesterday Section */}
      <section className="mb-12">
        <div className="flex items-center gap-4 mb-4 sticky top-0 bg-white/95 dark:bg-background-dark/95 py-3 z-[5]">
          <h3 className="text-base font-semibold text-slate-700 dark:text-slate-200">Ontem <span className="text-slate-400 font-normal ml-2">• Brighton, UK</span></h3>
          <div className="h-px flex-1 bg-slate-100 dark:bg-slate-800"></div>
          <button className="text-slate-400 hover:text-primary transition-colors">
            <span className="material-icons-outlined text-xl">check_circle_outline</span>
          </button>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 auto-rows-[200px]">
          {YESTERDAY_PHOTOS.map((photo) => (
            <div
              key={photo.id}
              onClick={() => onPhotoClick(photo)}
              className={`rounded-lg overflow-hidden group relative cursor-pointer ${photo.aspect === 'wide' ? 'col-span-2' : ''
                }`}
            >
              <img
                src={photo.src}
                alt={photo.alt}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
              />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors"></div>
            </div>
          ))}
        </div>
      </section>

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