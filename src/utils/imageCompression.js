/**
 * Comprime e redimensiona uma imagem usando Canvas API para otimizar conexões 3G/4G (<150KB).
 * @param {File|Blob|string} fileOrDataUrl Arquivo ou URL base64 da imagem
 * @param {number} maxWidth Largura máxima em pixels
 * @param {number} maxHeight Altura máxima em pixels
 * @param {number} quality Qualidade JPEG (0.1 a 1.0)
 * @returns {Promise<{ dataUrl: string, originalSize: number, compressedSize: number }>}
 */
export async function compressImage(fileOrDataUrl, maxWidth = 1024, maxHeight = 1024, quality = 0.75) {
  return new Promise((resolve, reject) => {
    let originalSize = 0;
    const img = new Image();

    if (fileOrDataUrl instanceof File || fileOrDataUrl instanceof Blob) {
      originalSize = fileOrDataUrl.size;
      const reader = new FileReader();
      reader.onload = (e) => {
        img.src = e.target.result;
      };
      reader.onerror = (err) => reject(err);
      reader.readAsDataURL(fileOrDataUrl);
    } else if (typeof fileOrDataUrl === 'string') {
      originalSize = Math.round((fileOrDataUrl.length * 3) / 4);
      img.src = fileOrDataUrl;
    } else {
      reject(new Error('Formato de imagem inválido para compressão.'));
      return;
    }

    img.onload = () => {
      let width = img.width;
      let height = img.height;

      // Calcular proporção de redimensionamento
      if (width > height) {
        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width = Math.round((width * maxHeight) / height);
          height = maxHeight;
        }
      }

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx.drawImage(img, 0, 0, width, height);

      const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
      const compressedSize = Math.round((compressedDataUrl.length * 3) / 4);

      resolve({
        dataUrl: compressedDataUrl,
        originalSize,
        compressedSize,
      });
    };

    img.onerror = (err) => reject(err);
  });
}

/**
 * Formata bytes em formato amigável (KB, MB)
 */
export function formatBytes(bytes, decimals = 1) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
