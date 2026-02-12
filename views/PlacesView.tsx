import React, { useState } from 'react';
import { Photo } from '../types';
import Button from '../components/UI/Button';

interface PlacesViewProps {
  onPhotoClick: (photo: Photo) => void;
  onClose: () => void;
}

const SF_PHOTOS: Photo[] = [
  { id: 'sf1', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCpeRMAy1dYaQakN2CSFBLiLI_vOFjQITGaEn2aQ0e9nZl2PEsoFBIflbRKjM9bqKGb3NDHFs7H1rZQb3sP3QjbbC4uvQeR3BEaHlDNXmcGfa4Sb-yqBUJP8aN0vzy769N1qbLEBCvelmegS483eK2zPyu7mSqCB473i-pWDwXEJ4VS8q8WYgvWiJ0WjAUQbw4v6rbqoeb2RZP_A0m_WwTcs-0YLnI4PoDw0KU9v1v2QBE41O8rabiiA60vX_2Dwu8HoyGTUB0Ehvk", alt: "Golden Gate" },
  { id: 'sf2', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB79ip3CJXGnRuxsKU9PtlwsO0D9Gs1ilw7_9DfkA0Ynr5fhHZjqpnYabSFw7qQcjGhHO8fdsQXhlyOtkzilBfu7PTQ3CVfLBx1tHTXRResADPbsS6kthrR8STzoeR1wCVnf6RWflTzIOBW1wRKPwvZIaOm1zDUd90Xyn-5SfYPWdGiM9bUdyF2UEdXRY2yCIt5_x8DBq86lJlqYLlR0UyNzRwKv3Hk_F0V8UQkJfhGbfL-_FMa5g70eDfyvAjLLM4VrZ_2ti8MbQw", alt: "Skyline" },
  { id: 'sf3', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuC-9HiVeqmaTIgndteGCZhHZ0Iw1oq6PiTljyLNLTBM6cRIfHgJStvf33Mdbucn5T7ENCAIpI9c4M877gI0MWqjlrg4gCbPsaJlKNKSyWw-JqecO7rzTOTo_2sltPMfP29WB8Evz9FMknvOjph4dDdcbn2bgaMmf5XUKgZEVyyANoZvtR8J4xoddFDemmWF6-vwUgqa1pTWZ-oYcRyFaDpmhILV-1VmIvChf3a5EWQNkP_NWnqPluavt0UGNQY9_yju8sohu32nYHc", alt: "Houses" },
  { id: 'sf4', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDG5NVJ2SRQwGBw75R_zZ29Iu8_XLjYIGn7b_rLSEpYUZbdBW320qyk6JWuk8tMjzQKYn1-QdlbA3x3L25gHRuMBN2OTXhd9m0HPf3sFS0TwK-lmB-NXU8wUKCzxYjVd6ovP3KV14_Q7DCMA8sTsck1iU5pbSJG4sgfDWM8HOp7B_7iNvdbQ6b7EFRiUWo_BCXbky9uMAajBXg5CxUrL0aGUAME6719Q9IBar0m55lhqu7uPP4rPr5oe7ZhHfEEJd9gAGXcS9rf2xI", alt: "Lombard" },
  { id: 'sf5', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuAr_F9v9LPO4LgZNvqkJIV4WEFHWMb2U4i8YVZhPQmcS2B0n564OoDeFSRf9fG1QJgWpWRhZkkO9FxJYS3Vxv2vkVVKs-U-rGaGkdve6kkWBx916RBtiyJr45uipgYKlovFazFOgp1aw8afSmDgvVbal0Hz0xqG8-Lz-a-jE2A34DVYTNAq36eH88o-vnX0iDLBoiQqaB1RYR64AK0FvkhIRrC5AYnslby0iSREGZ5RbJjrJkHYa_iWI89jAS7nYLz6GwSv2d7i5FU", alt: "Cable Car" },
  { id: 'sf6', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuB9i1nfipsrLS8JvC510YaqkAosq7o1dtoZOLkhaCRwVp84HYD9V-W_3Q6fLJesPpzNXqVQR6tVzUXbHxT8PIdRN7wsTCPxNjCd5gBJgysNS3PiuH4jmgFwtUa5bRKiAvb40GfVIM8gvRDJCa7pnI-lrm1N2utrsNYSFvVf6thXD31_jsIq1kqkTuVVXItmcfSliynwrfQdPSAKe6I8B9jtMoGn0YYBhiEaWi6Qn7vaoeOEoXxkD0AFPzfnyRMvsAv--IRIKivVfwkmHonjE4hJ4vfcU", alt: "Ferry Building" },
  { id: 'sf7', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuCeumNfrQJi35ENh3m5XI6rcgKhBKz_y1q3iIwFAAm9fxwGAgs0SGBo1vIkKifgI0cuMVha99DmvB_UjvdBa4zNGSJO23DodYTRMXm3XHi1RuF-X1lh9JHojVHc95plZ27hFIArh7xIBydbO1a8YmMWx_C0NNzO5tTm22J01RY272uTXepPUlcba_lqPbrTDqQoE__-mpgoyRWAmx_ygk8xX_9cgK547zNrrgivBGmovSaErmld3jKMne2s16ookso2b3nf4aVYGxY", alt: "Ocean Beach" },
  { id: 'sf8', src: "https://lh3.googleusercontent.com/aida-public/AB6AXuDF9_JiK3x8tK5ZQBuyTFilVknnIFOKkKH7xe70wqqgGZCrRPn04uDhGF3ItlYJR-xxUa6TFMbDhA06CdCrssX-fNaCFNwwF3S6KNzqy36yU0IZ35d7bcPgma6QgIx_8M7M_hW7BnV0CVoO3aFzmE-XwM9qGvIfvsYfOxeu7ougoCggv72z0wXod5hgry6vqsj_9hwTrpKTzEU4atuSLW-7VlD0wr_i09Z1UwavQlJ_IyezhRx4J5ufdQZSEQexcoNaJb55-K1N4bw", alt: "Pyramid" },
];

const PlacesView: React.FC<PlacesViewProps> = ({ onPhotoClick, onClose }) => {
  const [activeLocation, setActiveLocation] = useState<string | null>('San Francisco');

  return (
    <div className="flex flex-1 relative h-full overflow-hidden">
      {/* Map Container */}
      <div className="flex-1 relative bg-[#e5e7eb] dark:bg-slate-900 overflow-hidden">
        {/* Simulated Map Background */}
        <div
          className="absolute inset-0 grayscale-[0.2] brightness-[1.05]"
          style={{
            backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDYu9ioFjemlZfQ_gozQw6G5HDut24917y9KA_wfJXKulzuv3jGNbdnUobYa6_Vd3kpTACvQGMMqDio-8AghYdds2Udx_Mpm7lPIBxc1yHSWxqQrhifM_DtKJm4nDQikliM8HW9tyUYqPBSrJgKwlvajvNJVzW80wAKNWBdBMv_BoUogygvbBo-cUrtNfHcirEKbwXB64qQtNg369AWObmvumQq-8nBDjYVlgj9Tuu47TXYA0HDeJGaAa5WIQQSYxR0jSq27MrorMc')",
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        ></div>

        {/* Controls */}
        <div className="absolute bottom-6 left-6 flex flex-col gap-2 z-10">
          <Button variant="secondary" icon="add" className="!p-3 !w-12 !h-12" />
          <Button variant="secondary" icon="remove" className="!p-3 !w-12 !h-12" />
          <Button variant="secondary" icon="my_location" className="!p-3 !w-12 !h-12 text-primary mt-2" />
        </div>

        {/* Map Cluster Pins */}
        {/* SF */}
        <div className="absolute top-[35%] left-[45%] group cursor-pointer z-10" onClick={() => setActiveLocation('San Francisco')}>
          <div className="relative">
            <div className={`w-16 h-16 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden transition-transform ring-4 ${activeLocation === 'San Francisco' ? 'scale-110 ring-primary' : 'scale-100 ring-primary/20 group-hover:scale-105'}`}>
              <img className="w-full h-full object-cover" src={SF_PHOTOS[0].src} alt="SF" />
            </div>
            <div className="absolute -top-2 -right-2 bg-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm">124</div>
          </div>
        </div>

        {/* Marin */}
        <div className="absolute top-[20%] left-[30%] group cursor-pointer z-10" onClick={() => setActiveLocation('Marin')}>
          <div className="relative">
            <div className={`w-12 h-12 rounded-full border-4 border-white dark:border-slate-800 shadow-xl overflow-hidden transition-transform ring-4 ${activeLocation === 'Marin' ? 'scale-110 ring-primary' : 'scale-100 ring-primary/20 group-hover:scale-105'}`}>
              <img className="w-full h-full object-cover" src="https://lh3.googleusercontent.com/aida-public/AB6AXuC_l8NNUMhcYG6uHzQBwAgDmF_JCWMLWFf4GJOlYb-eckpBqwGX_Oog32VXMKybmG5VbTic0seCYwZg9esVj4SwjmJRDIu1owDU-PzZhpRAsIX0p4nbefurHais84rnrCNZLd_O5CVmoRtJWuO2gx8JD2W25kze12wMs68ka_CapNvzosoAsod_uRta16lw8SRQbXwf_EY5d1LlTqwuBYeO1E4sel02FieeHIe8-OzrMN2WwbMYbI97A18rcsu1fSvXhiqY5H4Pvyc" alt="Marin" />
            </div>
            <div className="absolute -top-2 -right-2 bg-slate-700 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white dark:border-slate-800 shadow-sm">42</div>
          </div>
        </div>

        {/* Tooltip for active selection */}
        {activeLocation === 'San Francisco' && (
          <div className="absolute top-[48%] left-[45%] -translate-x-1/2 mt-4 bg-white dark:bg-slate-800 px-4 py-2 rounded-lg shadow-2xl border border-slate-100 dark:border-slate-700 animate-bounce z-20 pointer-events-none">
            <p className="text-xs font-bold">San Francisco</p>
            <p className="text-[10px] text-slate-500">Outubro 2023 - Presente</p>
            <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 bg-white dark:bg-slate-800 rotate-45 border-t border-l border-slate-100 dark:border-slate-700"></div>
          </div>
        )}
      </div>

      {/* Side Panel */}
      {activeLocation && (
        <aside className="w-[360px] bg-white dark:bg-background-dark border-l border-slate-200 dark:border-slate-800 flex flex-col shrink-0 z-20 shadow-xl absolute right-0 top-0 bottom-0 md:relative">
          <div className="p-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between mb-1">
              <h2 className="font-bold text-lg text-slate-800 dark:text-slate-100 tracking-tight">{activeLocation}, CA</h2>
              <button onClick={() => setActiveLocation(null)} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200">
                <span className="material-icons">close</span>
              </button>
            </div>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              <span className="material-icons text-sm">photo_library</span>
              <span>{activeLocation === 'San Francisco' ? 124 : 42} fotos nesta área</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
            {activeLocation === 'San Francisco' ? (
              <div className="grid grid-cols-2 gap-3">
                {SF_PHOTOS.map((photo) => (
                  <div key={photo.id} onClick={() => onPhotoClick({ ...photo, location: 'San Francisco, CA' })} className="aspect-square rounded-xl overflow-hidden cursor-pointer group relative">
                    <img src={photo.src} alt={photo.alt} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex items-center justify-center h-full text-slate-400 text-sm">
                Nenhuma prévia carregada para esta localização.
              </div>
            )}
          </div>
          <div className="p-4 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={onClose} className="w-full">
              Voltar para a Grade
            </Button>
          </div>
        </aside>
      )}
    </div>
  );
};

export default PlacesView;