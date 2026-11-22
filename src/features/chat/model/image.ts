const MAX_SIDE = 1920;
const JPEG_QUALITY = 0.85;
export const MAX_IMAGES_PER_SEND = 10;
const MAX_ORIGINAL_BYTES = 30 * 1024 * 1024;

export type PreparedImage = {
  blob: Blob;
  fileName: string;
  width: number;
  height: number;
};

const loadImage = (file: File) =>
  new Promise<HTMLImageElement>((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve(img);
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('이미지를 읽을 수 없습니다.'));
    };
    img.src = url;
  });

/**
 * 전송 전 이미지 최적화
 * - 긴 변 1920px 로 축소 + JPEG 재인코딩 → 용량 절감 및 위치정보(EXIF) 제거
 * - GIF 는 애니메이션 보존을 위해 원본 그대로 전송
 */
export async function prepareImage(file: File): Promise<PreparedImage> {
  if (!file.type.startsWith('image/')) throw new Error('이미지 파일만 보낼 수 있습니다.');
  if (file.size > MAX_ORIGINAL_BYTES) throw new Error('30MB 이하 이미지만 보낼 수 있습니다.');

  const img = await loadImage(file);
  const { naturalWidth: w, naturalHeight: h } = img;

  if (file.type === 'image/gif') {
    return { blob: file, fileName: file.name || 'image.gif', width: w, height: h };
  }

  const scale = Math.min(1, MAX_SIDE / Math.max(w, h));
  const width = Math.max(1, Math.round(w * scale));
  const height = Math.max(1, Math.round(h * scale));

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('이미지를 처리할 수 없습니다.');
  // 투명 배경(PNG)은 JPEG 변환 시 검게 나오므로 흰색으로 채운다
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', JPEG_QUALITY),
  );
  if (!blob) throw new Error('이미지를 처리할 수 없습니다.');
  return { blob, fileName: 'image.jpg', width, height };
}
