import React, { useState } from 'react';
import { Camera, ImagePlus, Trash2, CheckCircle2, Loader2, Sparkles } from 'lucide-react';
import { compressImage, formatBytes } from '../../utils/imageCompression';

export default function PhotoUploader({ label, photos, onAddPhoto, onRemovePhoto }) {
  const [compressing, setCompressing] = useState(false);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    setCompressing(true);
    try {
      for (const file of files) {
        const result = await compressImage(file);
        onAddPhoto({
          id: `photo-${Date.now()}-${Math.random()}`,
          dataUrl: result.dataUrl,
          originalSize: result.originalSize,
          compressedSize: result.compressedSize,
          name: file.name,
        });
      }
    } catch (err) {
      console.error('Erro ao comprimir imagem:', err);
    } finally {
      setCompressing(false);
    }
  };

  // Simulação rápida para teste sem precisar selecionar imagem real no disco
  const handleAddSimulatedPhoto = () => {
    // Retorna uma imagem SVG em base64 com peso leve representando foto Antes/Depois
    const canvas = document.createElement('canvas');
    canvas.width = 400;
    canvas.height = 300;
    const ctx = canvas.getContext('2d');
    
    // Fundo cinza escuro ou colorido
    ctx.fillStyle = label.includes('Antes') ? '#334155' : '#065F46';
    ctx.fillRect(0, 0, 400, 300);

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 24px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(label.toUpperCase(), 200, 140);
    ctx.font = '14px sans-serif';
    ctx.fillText(`Auditoria Pazotti — ${new Date().toLocaleTimeString('pt-BR')}`, 200, 180);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
    onAddPhoto({
      id: `sim-${Date.now()}`,
      dataUrl,
      originalSize: 85400, // ~85KB
      compressedSize: 24300, // ~24KB comprimida
      name: `auditoria_${label.toLowerCase()}_${Date.now()}.jpg`,
    });
  };

  return (
    <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-200">
      <div className="flex items-center justify-between mb-3">
        <label className="text-xs font-extrabold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-unit-secondary" />
          <span>{label}</span>
          <span className="text-[10px] bg-slate-200 text-slate-700 px-1.5 py-0.5 rounded-full font-bold">
            {photos.length} foto(s)
          </span>
        </label>

        <button
          type="button"
          onClick={handleAddSimulatedPhoto}
          className="text-[11px] font-bold text-unit-secondary hover:underline flex items-center gap-1"
          title="Adiciona foto simulada para teste imediato sem precisar carregar arquivo"
        >
          <Sparkles className="w-3 h-3" />
          <span>Simular Foto</span>
        </button>
      </div>

      {/* Grade de Fotos Carregadas */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-3">
        {photos.map((photo) => (
          <div key={photo.id} className="relative rounded-xl overflow-hidden border border-slate-300 bg-white group shadow-sm">
            <img
              src={photo.dataUrl}
              alt={photo.name}
              className="w-full h-24 object-cover"
            />
            <button
              type="button"
              onClick={() => onRemovePhoto(photo.id)}
              className="absolute top-1.5 right-1.5 p-1 rounded-full bg-rose-600/90 text-white opacity-90 group-hover:opacity-100 hover:bg-rose-700 transition-all"
              title="Remover foto"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
            <div className="p-1.5 bg-slate-900/80 text-white text-[9px] font-mono flex items-center justify-between">
              <span className="truncate max-w-[70px]">{photo.name}</span>
              <span className="text-emerald-400 font-bold">{formatBytes(photo.compressedSize)}</span>
            </div>
          </div>
        ))}

        {/* Botão de Upload com Input de Arquivo */}
        <label className="border-2 border-dashed border-slate-300 hover:border-unit-secondary rounded-xl h-24 flex flex-col items-center justify-center cursor-pointer bg-white hover:bg-slate-50 transition-colors text-slate-500">
          <input
            type="file"
            accept="image/*"
            multiple
            capture="environment"
            onChange={handleFileChange}
            className="hidden"
          />
          {compressing ? (
            <div className="flex flex-col items-center gap-1 text-unit-secondary">
              <Loader2 className="w-6 h-6 animate-spin" />
              <span className="text-[10px] font-bold">Comprimindo...</span>
            </div>
          ) : (
            <>
              <ImagePlus className="w-6 h-6 mb-1 text-slate-400" />
              <span className="text-[11px] font-bold">Adicionar Foto</span>
              <span className="text-[9px] text-slate-400">Otimizado 3G/4G</span>
            </>
          )}
        </label>
      </div>
    </div>
  );
}
