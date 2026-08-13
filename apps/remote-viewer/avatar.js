/**
 * Custom Viewer avatar — device-local, compressed JPEG.
 */

const AVATAR_KEY = 'rv-avatar';
const AVATAR_MAX_SIDE = 256;
const AVATAR_QUALITY = 0.82;

export function loadAvatar() {
  return localStorage.getItem(AVATAR_KEY) || '';
}

export function saveAvatar(dataUrl) {
  if (!dataUrl) localStorage.removeItem(AVATAR_KEY);
  else localStorage.setItem(AVATAR_KEY, dataUrl);
}

export function renderAvatar() {
  const img = document.getElementById('avatar-preview');
  const ph = document.getElementById('avatar-placeholder');
  const rm = document.getElementById('avatar-remove');
  const url = loadAvatar();
  if (!img || !ph) return;
  if (url) {
    img.src = url;
    img.hidden = false;
    img.style.display = 'block';
    ph.hidden = true;
    ph.style.display = 'none';
    if (rm) rm.hidden = false;
  } else {
    img.removeAttribute('src');
    img.hidden = true;
    img.style.display = 'none';
    ph.hidden = false;
    ph.style.display = 'flex';
    if (rm) rm.hidden = true;
  }
}

export function compressImageFile(file) {
  return new Promise((resolve, reject) => {
    const objectUrl = URL.createObjectURL(file);
    const image = new Image();
    image.onload = () => {
      try {
        let { width, height } = image;
        const max = AVATAR_MAX_SIDE;
        if (width > max || height > max) {
          if (width >= height) {
            height = Math.round((height * max) / width);
            width = max;
          } else {
            width = Math.round((width * max) / height);
            height = max;
          }
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(image, 0, 0, width, height);
        const dataUrl = canvas.toDataURL('image/jpeg', AVATAR_QUALITY);
        URL.revokeObjectURL(objectUrl);
        resolve(dataUrl);
      } catch (e) {
        URL.revokeObjectURL(objectUrl);
        reject(e);
      }
    };
    image.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error('image'));
    };
    image.src = objectUrl;
  });
}

export function wireAvatarControls(toast) {
  const file = document.getElementById('avatar-file');
  const remove = document.getElementById('avatar-remove');
  if (file) {
    file.addEventListener('change', async (e) => {
      const f = e.target.files && e.target.files[0];
      if (!f) return;
      if (!f.type.startsWith('image/')) {
        if (toast) toast('Choose an image file');
        return;
      }
      try {
        const dataUrl = await compressImageFile(f);
        if (dataUrl.length > 1200000) {
          if (toast) toast('Photo still too large — try another');
          return;
        }
        saveAvatar(dataUrl);
        renderAvatar();
        if (toast) toast('Avatar saved on this device');
      } catch (err) {
        console.error(err);
        if (toast) toast('Could not process photo');
      } finally {
        e.target.value = '';
      }
    });
  }
  if (remove) {
    remove.addEventListener('click', () => {
      saveAvatar('');
      renderAvatar();
      if (toast) toast('Avatar removed');
    });
  }
  renderAvatar();
}
