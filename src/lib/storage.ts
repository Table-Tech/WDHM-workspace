import { hasValidCredentials, supabase } from './supabase';

export interface MediaUploadResult {
  url: string;
  type: 'photo' | 'video';
}

export async function uploadIncidentMedia(file: File): Promise<MediaUploadResult | null> {
  if (!hasValidCredentials) {
    console.warn('Supabase is not configured. Media upload is disabled in local fallback mode.');
    return null;
  }

  const isVideo = file.type.startsWith('video/');

  if (isVideo) {
    return uploadVideo(file);
  } else {
    return uploadPhoto(file);
  }
}

async function uploadPhoto(file: File): Promise<MediaUploadResult | null> {
  try {
    // Resize image client-side
    const resizedBlob = await resizeImage(file, 1200, 0.8);

    // Generate unique filename
    const filename = `${crypto.randomUUID()}.jpg`;

    // Upload to Supabase Storage
    const { data, error } = await supabase.storage
      .from('incident-photos')
      .upload(filename, resizedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('incident-photos').getPublicUrl(data.path);

    return { url: publicUrl, type: 'photo' };
  } catch (error) {
    console.error('Photo upload failed:', error);
    return null;
  }
}

async function uploadVideo(file: File): Promise<MediaUploadResult | null> {
  try {
    // Get file extension
    const extension = file.name.split('.').pop() || 'mp4';
    const filename = `${crypto.randomUUID()}.${extension}`;

    // Upload to Supabase Storage (videos bucket)
    const { data, error } = await supabase.storage
      .from('incident-videos')
      .upload(filename, file, {
        contentType: file.type,
        cacheControl: '3600',
      });

    if (error) throw error;

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from('incident-videos').getPublicUrl(data.path);

    return { url: publicUrl, type: 'video' };
  } catch (error) {
    console.error('Video upload failed:', error);
    return null;
  }
}

// Legacy function for backwards compatibility
export async function uploadIncidentPhoto(file: File): Promise<string | null> {
  const result = await uploadPhoto(file);
  return result?.url || null;
}

async function resizeImage(file: File, maxWidth: number, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const ratio = Math.min(maxWidth / img.width, 1);
      canvas.width = img.width * ratio;
      canvas.height = img.height * ratio;

      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Canvas context not available'));
        return;
      }

      ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

      canvas.toBlob(
        (blob) => (blob ? resolve(blob) : reject(new Error('Canvas toBlob failed'))),
        'image/jpeg',
        quality
      );
    };
    img.onerror = () => reject(new Error('Image load failed'));
    img.src = URL.createObjectURL(file);
  });
}
