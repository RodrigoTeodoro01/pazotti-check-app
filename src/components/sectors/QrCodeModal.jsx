import React, { useState } from 'react';
import { QrCode, Camera, Printer, X, Check, ArrowRight, ScanLine, Sparkles } from 'lucide-react';

export default function QrCodeModal({ sector, isOpen, onClose, onScanSuccess }) {
  const [scanning, setScanning] = useState(false);
  const [simulatedScan, setSimulatedScan] = useState(false);

  if (!isOpen || !sector) return null;

  const handleSimulateScan = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      setSimulatedScan(true);
      setTimeout(() => {
        setSimulatedScan(false);
        onClose();
        if (onScanSuccess) onScanSuccess(sector.id);
      }, 700);
    }, 1200);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-sm px-4 animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200/80 w-full max-w-md overflow-hidden">
        {/* Cabeçalho */}
        <div className="bg-unit-primary text-white p-6 relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <QrCode className="w-7 h-7 text-unit-secondary" />
            </div>
            <div>
              <h3 className="text-xl font-extrabold tracking-tight">QR Code Studio</h3>
              <p className="text-xs opacity-90">Setor: {sector.name}</p>
            </div>
          </div>
        </div>

        {/* Corpo do Modal */}
        <div className="p-6 space-y-6 text-center">
          <p className="text-xs text-slate-600">
            Este QR Code oficial pode ser afixado na porta do setor <strong>{sector.name}</strong> para abertura direta do checklist sem erro de digitação.
          </p>

          {/* Cartão de QR Code Simulado Visualmente */}
          <div className="bg-slate-50 border-2 border-dashed border-slate-300 rounded-2xl p-6 max-w-[240px] mx-auto flex flex-col items-center justify-center shadow-inner">
            <div className="w-40 h-40 bg-white border border-slate-200 rounded-xl p-3 flex items-center justify-center shadow-sm relative overflow-hidden group">
              {/* Representação visual elegante em grade de QR Code */}
              <div className="grid grid-cols-7 gap-1 w-full h-full text-slate-900">
                <div className="col-span-2 row-span-2 bg-slate-900 rounded-md"></div>
                <div className="col-span-1 bg-slate-400"></div>
                <div className="col-span-2 bg-slate-900"></div>
                <div className="col-span-2 row-span-2 bg-slate-900 rounded-md"></div>
                <div className="col-span-1 bg-slate-900"></div>
                <div className="col-span-3 bg-slate-400"></div>
                <div className="col-span-1 bg-slate-900"></div>
                <div className="col-span-2 row-span-2 bg-slate-900 rounded-md"></div>
                <div className="col-span-2 bg-slate-400"></div>
                <div className="col-span-3 bg-slate-900"></div>
                <div className="col-span-7 bg-slate-200 h-1"></div>
                <div className="col-span-3 bg-slate-900"></div>
                <div className="col-span-2 bg-slate-400"></div>
                <div className="col-span-2 bg-slate-900"></div>
              </div>

              {scanning && (
                <div className="absolute inset-0 bg-unit-secondary/20 flex flex-col items-center justify-center backdrop-blur-[1px]">
                  <ScanLine className="w-10 h-10 text-unit-secondary animate-bounce" />
                  <span className="text-[10px] font-bold text-unit-primary bg-white px-2 py-0.5 rounded shadow mt-1">
                    Lendo QR...
                  </span>
                </div>
              )}

              {simulatedScan && (
                <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white">
                  <Check className="w-10 h-10" />
                  <span className="text-xs font-bold mt-1">Identificado!</span>
                </div>
              )}
            </div>

            <div className="mt-3 text-[11px] font-mono font-bold text-slate-600 bg-white px-3 py-1 rounded-full border border-slate-200">
              {sector.qrCodeValue}
            </div>
          </div>

          {/* Botões de Leitura / Simulação e Impressão */}
          <div className="space-y-3">
            <button
              type="button"
              onClick={handleSimulateScan}
              disabled={scanning || simulatedScan}
              className="w-full py-3.5 px-4 rounded-2xl bg-unit-primary text-white font-extrabold text-sm hover:bg-unit-secondary shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Camera className="w-5 h-5" />
              <span>{scanning ? 'Escaneando código...' : 'Simular Leitura (Abrir Setor Direto)'}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              className="w-full py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200"
            >
              <Printer className="w-4 h-4" />
              <span>Imprimir Etiqueta do Setor</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
