import { hasValidCredentials, supabase } from './supabase';

export interface MediaUploadResult {
  url: string;
  type: 'photo' | 'video';
}

export interface MultipleMediaUploadResult {
  photoUrls: string[];
  videoUrls: string[];
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

export async function uploadMultipleMedia(files: Array<{ file: File; type: 'photo' | 'video' }>): Promise<MultipleMediaUploadResult> {
  if (!hasValidCredentials) {
    console.warn('Supabase is not configured. Media upload is disabled in local fallback mode.');
    return { photoUrls: [], videoUrls: [] };
  }

  const photoUrls: string[] = [];
  const videoUrls: string[] = [];

  // Upload all files in parallel
  const uploadPromises = files.map(async ({ file, type }) => {
    const result = type === 'video' ? await uploadVideo(file) : await uploadPhoto(file);
    if (result) {
      if (result.type === 'photo') {
        photoUrls.push(result.url);
      } else {
        videoUrls.push(result.url);
      }
    }
  });

  await Promise.all(uploadPromises);

  return { photoUrls, videoUrls };
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

// Upload badge image
export async function uploadBadgeImage(file: File): Promise<string | null> {
  if (!hasValidCredentials) {
    console.warn('Supabase is not configured. Badge image upload is disabled.');
    return null;
  }

  try {
    // Resize image for badge (smaller, square-ish)
    const resizedBlob = await resizeImage(file, 400, 0.9);
    const filename = `badge-${crypto.randomUUID()}.jpg`;

    const { data, error } = await supabase.storage
      .from('badge-images')
      .upload(filename, resizedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('badge-images').getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Badge image upload failed:', error);
    return null;
  }
}

// Upload team trip photo
export async function uploadTripPhoto(file: File): Promise<string | null> {
  if (!hasValidCredentials) {
    console.warn('Supabase is not configured. Trip photo upload is disabled.');
    return null;
  }

  try {
    const resizedBlob = await resizeImage(file, 1200, 0.8);
    const filename = `trip-${crypto.randomUUID()}.jpg`;

    const { data, error } = await supabase.storage
      .from('trip-photos')
      .upload(filename, resizedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('trip-photos').getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Trip photo upload failed:', error);
    return null;
  }
}

// Upload memory photo
export async function uploadMemoryPhoto(file: File): Promise<string | null> {
  if (!hasValidCredentials) {
    console.warn('Supabase is not configured. Memory photo upload is disabled.');
    return null;
  }

  try {
    const resizedBlob = await resizeImage(file, 1600, 0.85);
    const filename = `memory-${crypto.randomUUID()}.jpg`;

    const { data, error } = await supabase.storage
      .from('memory-photos')
      .upload(filename, resizedBlob, {
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });

    if (error) throw error;

    const {
      data: { publicUrl },
    } = supabase.storage.from('memory-photos').getPublicUrl(data.path);

    return publicUrl;
  } catch (error) {
    console.error('Memory photo upload failed:', error);
    return null;
  }
}

// Upload multiple memory photos
export async function uploadMemoryPhotos(files: File[]): Promise<string[]> {
  if (!hasValidCredentials) {
    console.warn('Supabase is not configured. Memory photo upload is disabled.');
    return [];
  }

  const urls: string[] = [];

  for (const file of files) {
    const url = await uploadMemoryPhoto(file);
    if (url) {
      urls.push(url);
    }
  }

  return urls;
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
