import React, { useState } from 'react';
import { Download, Share2, X } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (isInstalled) {
    return null;
  }

  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-2 rounded-xl bg-[#2C2824] text-[#FAF7F2] px-3 py-1.5 text-xs font-medium hover:bg-[#433D37] transition-colors shadow-2xs"
        title="Instalar RotinAPP no seu dispositivo"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Instalar App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-xl border border-[#EAE3D6] bg-[#FAF7F2] text-[#2C2824] px-2.5 py-1 text-xs font-medium hover:bg-[#F3EDE2] transition-colors"
        >
          <Share2 className="w-3.5 h-3.5" />
          <span>Instalar no iPhone</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-[#FAF7F2] p-6 shadow-xl border border-[#EAE3D6]">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-semibold text-[#2C2824] font-display">Instalar no iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-[#8A8175] hover:text-[#2C2824] hover:bg-[#EAE3D6]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="text-sm text-[#4A443D] space-y-2">
                1. Toque no botão de <strong>Compartilhar</strong> (quadrado com seta para cima) na barra do Safari.<br />
                2. Role para baixo e selecione <strong>Adicionar à Tela de Início</strong>.<br />
                3. Pronto! O RotinAPP funcionará como um aplicativo nativo.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#2C2824] py-2.5 text-sm font-medium text-white hover:bg-[#433D37] transition-colors"
              >
                Entendi
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
