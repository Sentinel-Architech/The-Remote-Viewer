/** Place official Sentinel-in-RV art on Hub */
import { SENTINEL_RV_ART_DATA_URL } from './sentinel-rv-art.js';

function placeHubArt() {
  const img = document.getElementById('sentinel-rv-art');
  if (img) {
    img.src = SENTINEL_RV_ART_DATA_URL;
    img.alt = 'The Sentinel depicted in The Remote Viewer';
    img.hidden = false;
  }
  const bg = document.getElementById('hub-sentinel-frame');
  if (bg) {
    bg.style.backgroundImage = `url(${SENTINEL_RV_ART_DATA_URL})`;
  }
}

placeHubArt();
