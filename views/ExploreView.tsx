import React from 'react';
import { Photo } from '../types';
import Section from '../components/UI/Section';
import Avatar from '../components/UI/Avatar';
import Button from '../components/UI/Button';

interface ExploreViewProps {
  onPhotoClick: (photo: Photo) => void;
  onChangeView: () => void; // To switch to map view
}

const PEOPLE = [
  { name: 'Mãe', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDxpbUWUD2s3aXpfZOQsEvXOQibuuOQrzKq3m9GYcX25IO7jQZvdM6mB_42yS3DczqAmRBVP4dBbvIRP0tbklJvcBhfP4J6vKOXLxIJ_sQkuTlMJBPGLNeuhFbSfKb89kxcgAXB8lwU4ImedlKQ6GXOtr-dgaiOBvqRw9q_9U2H1MTYigs_FuSLTOuIczQ3YG_Z8dn4V-xvIV-9CkHhxE0Z6hw0xJhryA5kmNftBwRVYoqX-io8H6aZgpdqQONavSSR9CVCeNpZnEU" },
  { name: 'Pai', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBhK4Df8H36GdHBzIyq27In6bslxIQDVBmfn4BLJ8MBjYKMSJHqxX96Po2gJ4ejTiURGfAyHq6NYzRSvM8PKPTwvEI6NcMM6EeP4lnZxY99yGm5DvKKciJqXyrD6MJXGl1YDghiX6WmdPYmJpNErzswAbChuE8H7KSWiCtbO7nXsb0qa0gmlvkqWhqKDX4ONy3gIBXtRLHgd1k5i0iTs1TRDF9OVW32nDJoWILBl7floAaHMcKRNC31T6DyE3gEfFABiGbz8wKMZQU" },
  { name: 'Rex', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB5xYu34_kIolbt7ejzNzOTZMt6QXGjj-HshSO4XWXrcXPlVtnH_Ixt3HUTBKQkEeQwK08IX3HLK9MVhn6csiGTXOk-nw_ches-W465qCoKb3cGD5mNd0hrlmsucCsYz5WGjR10ARtJkbqhbmFHPv8GOfep3YV1pM62xsYgpGBSfkAhju30slkWHHFzncS1mjLn9BVOa2Pgq_dBLy7KWsvcTwfDzd9MlYrO54_6t9X4LRSxn-UD7EYY44D66oYHLJNkLc4CAVczCYU" },
  { name: 'Sarah', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDnx7EBhCkld9n6xtu2UaAaeOqQRNnS1HAOCEp7xxeS71Ba5vTLOn_1ZTL2BXEP-zPqqrw_Epqzq8AZI3Qt51V-tMDVfCpJQYo0gFpuGVp-RIOGD9iZ7gzMdBsenkkpHcuT91f5hDutkSROSiKARRv6Qkyx4mulKb5nxZTfiNmVkWCfNMhch4i1Qn6R1c_TwuhoyAe2SS8NKx2_ELoA0bwR6Pxfsw_m7snk0_qHAQcggsfKeq3dHDfqaDe5h2v_zAm59-6VmMHsmuY" },
  { name: 'James', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCM4ySfxbWXU7ZDQYhkLtGXuDGU21zpDvgj-M3YSedwwkKJRy19be9HfFwC9st3Ccsq8zP1OMUrxIjOIYBhczfP2nurLbxeuuw4Ibf6FBb2MFfZjSIG49dt14ysnYPbc9HgLQMk-DiNLbJ79mjmDSHvq9xvSF0InjT-5ULP2nFITeODDyJvqVml04dkhE9Xm4OzgqVsyabP0sampv140bb1TP4mls08qrjleJuSNLHFSdsvBgEIcLH8h4Ga0_Jxq4chFuWzGzRdtDw" },
];

const PLACES = [
  { name: 'Londres', count: '1.204', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCKiQUg7DsSrB0Lp4DkUomSBhECqCWScmP5EygvsaVUAiCVTtmtm8mYcrMojKMCKdgbhC7W3jQSLPMICcbRAYSA2ZuYERFxNWpXJ4sRAZSqKBWLMHPSImz2nN1WD5ETJEkCorelRL9NINEUeKTw56XVox6TCod5xnvV2Ggy7kwgBIZq7uJcUXLI_pwOxCrKfyiuZSCPTDq0-jyWF40A1fTTouQubbl6CcUGDxUZRhLLSAsdOSveXMQ6yMApOkCGo4mdesIC0F2LNcs" },
  { name: 'Nova York', count: '842', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDVzzqFI2XxW6lVWxmkfx1pZlUP5mmbFe2BfFYZi4q-J0jY9oxX5CYr3l6epMBfQjXqbNKIGz08UR6Aht4g7T10Ys_Y-aoWtSyCprHkZoCrIDMiFZi3GEfmHZ7GIMSJde9k7of7dX6E4-XB6x9UrdbRAJ-AmeX6cqnogN9T1Xs5X9AxC8ugCfdX6MamrgQ59uJBZpHcduMuTKM_75GzkrFGAJGdrBOEZ6OyNK3C3yuzzMP1FfAUmDnhRQUkSDkZCzQ15bKjKX_du_Q" },
  { name: 'Tóquio', count: '530', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAW26Z_8YUaaE_b4kLsdWXPKXXt_sgNJaX6PDanJXiNq1OH-LvGGoL53THt2Q64kHIJZTge29_P_U2ACr4jX55mE3yg5INVB2ingFlatqC77HWSCMNBu1aI-Qvie8T9PMKa7pnI-lrm1N2utrsNYSFvVf6thXD31_jsIq1kqkTuVVXItmcfSliynwrfQdPSAKe6I8B9jtMoGn0YYBhiEaWi6Qn7vaoeOEoXxkD0AFPzfnyRMvsAv--IRIKivVfwkmHonjE4hJ4vfcU" },
  { name: 'Paris', count: '315', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuA7Itih1Ddju2c3uSKtmkPfepLLGt8hDKsf0ODsgy3RAgN181AU_kqhUZXEc5SiD8dokZmeIQMBDctS87iz1C28ohmSxBOC-RPEwyB1HSnnuJvML0wv1_fYTkM5HdaaFmlEqXwnguCtn4_H10vFvQ0C72pX9yDBoSSujaRy9ioiiFgPoLPKWnqQnKi-aCUCGQQIl4zCZsoCHpOC4MWndSMo67EMg47R-FKgdetj7h4MJgE7cENya3DU3LoA1KtC5TfWnBxyO3rwnts" },
];

const THINGS = [
  { name: 'Culinária', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuBZ1qGSjJvZwzSpiwcPjdlCXmldIChZr7N67Hg172czS6fwJtrhy_2dzvf4p8U7rM3ul_diV3U4-JPQpcrWuen4NVjvRNyLFNUPENM-Vt6fwxSbTnEBJ732A3Ws5Z8V9ibrhUwTXHKpqy5TyUFipP8igIEaDCtGvquIm8UZ8NOppORy29I_Ja7rMIMopPI1UnKCzawrjMcutiJSjjvXCK9VxuXs7oQe-Hs55p3Aob_QTw0IbLEP8klrhU8bTB8BCJa5oboEkokM5ak" },
  { name: 'Pôr do Sol', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCfEue8oeePzxaxipPyx9JHl2Abxg1pS6pyNTpwJcU9XsO4dtAcOUiRogsLjO2KUDnEz18r3NsS8Un8vWnglhv9O1e1Av9ZDQoQEXDTetCK4QQKPwfsKeKH4NSdPLKpwz7JAZljf_ETh4qB3qDYM8EAI_le_Gxl9dEn-9ZkXBN7dx71mKebGbt60t1u_CR2v69YnCfJA4P3TV0_IMVDQZEkfupvhVNrZfAXaKvRW6ovEZRS5AARWiQfAVrC1sZVVIIQuVw1KYZretM" },
  { name: 'Carros', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB-2QFWkenQHagG8X9qpZ8cShKAWD3TF27skFjbk8pBxL2rgJWQofMEZjJayboEWd8fqJW856xKcifvRufm9XcCt7oZmFseDLVzVE0xtT9uKCI3KJ1yYYvrLr-zhzklTiRULTHI9PIBWgCePTMWGzp9Wtvxpd0DAKcHRTU62789UKFjff6_hk7lIREhCw7c6qjOtS_UJFLOT_2R3xWKxSeS3RnlErJVu4mdYCOZxwac7GTAIFieAzw7i2FrIgC5PPl_OhNUu12COwk" },
  { name: 'Parques', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuARmV0drZQn-UdrjHMw-EvFKftKc4MTvIU9N3KmXxzsQpudMQcXljn_3rlBMstBH_XpZzSdSn73P6Ckg0Cczd5TAQJaGxy5R0CqF-oBriBTp4Hle4M-CNphGUKMzwWWxwm-pcDUxKwfaq-SAk7KDsKvlaDDr2xvVobUTGPpLk8ywPKlOndSbW6FNsTRDZN6xyehvWC8tWgWjtTB_f238HPCEDS3RAa2a9ZE15xTB_Eq-V4LqpM58IFgJ2gtR2dCFxdqxbuwgKs17yk" },
];

const ExploreView: React.FC<ExploreViewProps> = ({ onPhotoClick, onChangeView, searchTerm }) => {
  const filterItems = (items: any[]) => {
    if (!searchTerm) return items;
    const term = searchTerm.toLowerCase();
    return items.filter(item => item.name.toLowerCase().includes(term));
  };

  const filteredPeople = filterItems(PEOPLE);
  const filteredPlaces = filterItems(PLACES);
  const filteredThings = filterItems(THINGS);

  // If searching, only show sections that have results
  const showPeople = filteredPeople.length > 0;
  const showPlaces = filteredPlaces.length > 0;
  const showThings = filteredThings.length > 0;
  const hasResults = showPeople || showPlaces || showThings;

  return (
    <div className="flex-1 overflow-y-auto px-4 md:px-8 pb-20 custom-scrollbar">
      <div className="max-w-6xl mx-auto py-8 space-y-12">

        {searchTerm && !hasResults && (
          <div className="flex flex-col items-center justify-center py-20 text-slate-400">
            <span className="material-icons text-6xl mb-4 opacity-20">search_off</span>
            <p>Nenhum resultado encontrado para "{searchTerm}" em Explorar.</p>
          </div>
        )}

        {/* People & Pets Section */}
        {showPeople && (
          <Section
            title="Pessoas e Pets"
            actionLabel="Ver tudo"
            onActionClick={() => { }}
          >
            <div className="flex items-center gap-8 overflow-x-auto pb-4 no-scrollbar">
              {filteredPeople.map((person) => (
                <div key={person.name} className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer" onClick={() => onPhotoClick({ id: person.name, src: person.src, alt: person.name, title: person.name })}>
                  <Avatar src={person.src} alt={person.name} size="lg" className="group-hover:border-primary" />
                  <span className="text-sm font-medium">{person.name}</span>
                </div>
              ))}
              {!searchTerm && (
                <div className="flex-shrink-0 flex flex-col items-center gap-2 group cursor-pointer">
                  <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-transparent group-hover:border-primary transition-all duration-300 text-slate-400 bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                    <span className="material-icons text-3xl">add</span>
                  </div>
                  <span className="text-sm font-medium">Adicionar mais</span>
                </div>
              )}
            </div>
          </Section>
        )}

        {/* Places Section */}
        {showPlaces && (
          <Section
            title="Lugares"
            actionLabel="Ver mapa"
            onActionClick={onChangeView}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {filteredPlaces.map((place) => (
                <div key={place.name} onClick={onChangeView} className="relative aspect-[16/10] rounded-xl overflow-hidden group cursor-pointer">
                  <img src={place.src} alt={place.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"></div>
                  <div className="absolute bottom-4 left-4 text-white">
                    <p className="font-bold">{place.name}</p>
                    <p className="text-xs text-white/80">{place.count} fotos</p>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Documentos Section - Static for now, hidden on search or valid if we want to search it too? 
            Let's hide on search for now as it wasn't explicitly requested to be searchable dynamic content yet 
            OR we can leave it static. User asked to filter 'categories', implying the dynamic lists. 
            Let's hide it during search to focus results, unless we filter it too. 
            For simplicity and focus, I'll hide it if there is a search term, 
            or we can simply leave it. 
            Given the instruction "filter static categories", I'll filter logic for Documentos too if possible, 
            but the code structure requires mapping. 
            The current Documentos section is hardcoded divs. 
            I'll hide Documentos and Suggestion Banner during search to clean up the view.
        */}
        {!searchTerm && (
          <Section
            title="Documentos"
            actionLabel="Ver tudo"
            onActionClick={() => { }}
          >
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center">
                  <span className="material-icons">description</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Capturas de Tela</p>
                  <p className="text-xs text-slate-500">242 itens</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-green-100 dark:bg-green-900/40 text-green-600 dark:text-green-400 flex items-center justify-center">
                  <span className="material-icons">receipt_long</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Recibos</p>
                  <p className="text-xs text-slate-500">56 itens</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/40 text-purple-600 dark:text-purple-400 flex items-center justify-center">
                  <span className="material-icons">edit_note</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Quadros Brancos</p>
                  <p className="text-xs text-slate-500">12 itens</p>
                </div>
              </div>
              <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow cursor-pointer">
                <div className="w-12 h-12 rounded-lg bg-orange-100 dark:bg-orange-900/40 text-orange-600 dark:text-orange-400 flex items-center justify-center">
                  <span className="material-icons">badge</span>
                </div>
                <div>
                  <p className="font-semibold text-sm">Identidade</p>
                  <p className="text-xs text-slate-500">4 itens</p>
                </div>
              </div>
            </div>
          </Section>
        )}

        {/* Things Section */}
        {showThings && (
          <Section
            title="Coisas"
            actionLabel="Ver tudo"
            onActionClick={() => { }}
          >
            <div className="grid grid-cols-2 gap-4">
              {filteredThings.map((thing) => (
                <div key={thing.name} onClick={() => onPhotoClick({ id: thing.name, src: thing.src, alt: thing.name, title: thing.name })} className="group relative aspect-video rounded-xl overflow-hidden cursor-pointer">
                  <img src={thing.src} alt={thing.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-100 group-hover:bg-black/20 transition-all">
                    <span className="text-white font-bold">{thing.name}</span>
                  </div>
                </div>
              ))}
            </div>
          </Section>
        )}

        {/* Suggestion Banner */}
        {!searchTerm && (
          <section className="mt-8">
            <div className="bg-primary/5 dark:bg-primary/10 rounded-2xl p-8 border border-primary/10 flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-full bg-primary flex items-center justify-center text-white shrink-0">
                  <span className="material-icons text-3xl">auto_awesome</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100">Melhor agrupamento com reconhecimento facial</h3>
                  <p className="text-slate-600 dark:text-slate-400">Ajude o PhotoCloud a identificar pessoas na sua biblioteca para uma melhor organização.</p>
                </div>
              </div>
              <Button onClick={() => { }} className="shrink-0">
                Começar agora
              </Button>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default ExploreView;