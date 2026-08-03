import React, { useState, useEffect } from 'react';
import { QrCode, Camera, Printer, X, Check, ScanLine, Download } from 'lucide-react';
import QRCode from 'qrcode';

export default function QrCodeModal({ sector, isOpen, onClose, onScanSuccess }) {
  const [scanning, setScanning] = useState(false);
  const [simulatedScan, setSimulatedScan] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState(null);

  // Gera o QR Code real quando o modal abre
  useEffect(() => {
    if (isOpen && sector) {
      const baseUrl = window.location.origin + import.meta.env.BASE_URL;
      const qrData = `${baseUrl}?sector=${encodeURIComponent(sector.id)}`;
      
      QRCode.toDataURL(qrData, {
        width: 400,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
        errorCorrectionLevel: 'M',
      })
        .then((url) => setQrDataUrl(url))
        .catch((err) => console.error('Erro ao gerar QR Code:', err));
    }
  }, [isOpen, sector]);

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
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>QR Code — ${sector.name}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { 
            display: flex; align-items: center; justify-content: center; 
            min-height: 100vh; font-family: 'Segoe UI', Arial, sans-serif;
            background: white;
          }
          .etiqueta {
            border: 3px solid #0f172a; border-radius: 16px;
            padding: 24px; text-align: center; max-width: 320px;
          }
          .etiqueta h2 { font-size: 14px; color: #1e3a8a; margin-bottom: 4px; }
          .etiqueta h1 { font-size: 20px; color: #0f172a; margin-bottom: 16px; }
          .etiqueta img { width: 200px; height: 200px; display: block; margin: 0 auto 12px; }
          .etiqueta .code { 
            font-family: monospace; font-size: 11px; color: #475569; 
            background: #f1f5f9; padding: 4px 12px; border-radius: 20px;
            display: inline-block;
          }
          .etiqueta .instrucao {
            margin-top: 12px; font-size: 10px; color: #94a3b8;
          }
          @media print { body { margin: 0; } }
        </style>
      </head>
      <body>
        <div class="etiqueta">
          <h2>Grupo Pazotti — Portal Check</h2>
          <h1>${sector.name}</h1>
          <img src="${qrDataUrl}" alt="QR Code ${sector.name}" />
          <div class="code">${sector.qrCodeValue}</div>
          <p class="instrucao">Escaneie para abrir o checklist deste setor</p>
        </div>
        <script>
          window.onload = function() { 
            setTimeout(function() { window.print(); }, 300); 
          };
        <\/script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleDownload = () => {
    if (!qrDataUrl) return;
    const link = document.createElement('a');
    link.download = `qrcode-${sector.id}.png`;
    link.href = qrDataUrl;
    link.click();
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

          {/* QR Code Real */}
          <div className="bg-white border-2 border-slate-200 rounded-2xl p-5 max-w-[260px] mx-auto flex flex-col items-center justify-center shadow-sm">
            <div className="w-48 h-48 flex items-center justify-center relative">
              {qrDataUrl ? (
                <img 
                  src={qrDataUrl} 
                  alt={`QR Code para ${sector.name}`}
                  className="w-full h-full object-contain"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-50 rounded-xl">
                  <div className="animate-spin w-8 h-8 border-3 border-unit-primary border-t-transparent rounded-full" />
                </div>
              )}

              {scanning && (
                <div className="absolute inset-0 bg-unit-secondary/20 flex flex-col items-center justify-center backdrop-blur-[1px] rounded-xl">
                  <ScanLine className="w-10 h-10 text-unit-secondary animate-bounce" />
                  <span className="text-[10px] font-bold text-unit-primary bg-white px-2 py-0.5 rounded shadow mt-1">
                    Lendo QR...
                  </span>
                </div>
              )}

              {simulatedScan && (
                <div className="absolute inset-0 bg-emerald-600/90 flex flex-col items-center justify-center text-white rounded-xl">
                  <Check className="w-10 h-10" />
                  <span className="text-xs font-bold mt-1">Identificado!</span>
                </div>
              )}
            </div>

            <div className="mt-3 text-[11px] font-mono font-bold text-slate-600 bg-slate-50 px-3 py-1 rounded-full border border-slate-200">
              {sector.qrCodeValue}
            </div>
          </div>

          <p className="text-[10px] text-slate-400 leading-tight">
            ✅ QR Code válido e escaneável • Contém link direto para o checklist deste setor
          </p>

          {/* Botões de Ação */}
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

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleDownload}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                <Download className="w-4 h-4" />
                <span>Baixar PNG</span>
              </button>

              <button
                type="button"
                onClick={handlePrint}
                className="py-2.5 px-4 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 font-bold text-xs transition-colors flex items-center justify-center gap-2 border border-slate-200"
              >
                <Printer className="w-4 h-4" />
                <span>Imprimir</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
