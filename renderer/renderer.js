
const urlInput = document.getElementById('url-input');
const deviceOptions = document.querySelectorAll('.device-option');
const customSizeInputs = document.getElementById('custom-size-inputs');
const customWidthInput = document.getElementById('custom-width');
const customHeightInput = document.getElementById('custom-height');
const openPreviewBtn = document.getElementById('open-preview-btn');

deviceOptions.forEach(option => {
  option.addEventListener('change', function() {
    if (this.id === 'custom') {
      customSizeInputs.classList.remove('hidden');
    } else {
      customSizeInputs.classList.add('hidden');
    }
  });
});


openPreviewBtn.addEventListener('click', async() => {
  let url = urlInput.value.trim();
    if (!url) {
      try {
        await window.electronAPI.showDialog({
          type: 'warning',
          message: 'Please enter a URL',
          buttons: ['OK']
        });
        urlInput.focus();
      } catch (err) {
        console.error('Dialog error:', err);
      }
      return;
    }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w- .\/?%&=]*)?$/;

  if (!urlPattern.test(url)) {
    await window.electronAPI.showDialog({
      type: 'error',
      message: 'Please enter a valid URL (e.g., example.com or https://example.com)',
      buttons: ['OK']
    });
    urlInput.focus();
    return;
  }

  let width, height;
  
  const selectedDevice = document.querySelector('input[name="device"]:checked');
  
  if (!selectedDevice) {
    await window.electronAPI.showDialog({
      type: 'warning',
      message: 'Please select a device or custom size',
      buttons: ['OK']
    });
    return;
  }
  
  if (selectedDevice.id === 'custom') {
    width = parseInt(customWidthInput.value) || 1024;
    height = parseInt(customHeightInput.value) || 768;
  } else {
    width = parseInt(selectedDevice.dataset.width);
    height = parseInt(selectedDevice.dataset.height);
  }

  console.log('Opening preview:', { url, width, height });
  window.electronAPI.openPreview({ url, width, height });
});

document.getElementById('iphone-14-pro').checked = true;

function saveRecentPreview(url, device, width, height) {
  const recentPreviews = JSON.parse(localStorage.getItem('recentPreviews') || '[]');

  recentPreviews.unshift({
    url,
    device,
    width,
    height,
    timestamp: new Date().toISOString()
  });
  

  const updatedPreviews = recentPreviews.slice(0, 5);
  
  localStorage.setItem('recentPreviews', JSON.stringify(updatedPreviews));
}

// function loadRecentPreviews() {
//   // Implementation left as an exercise
// }