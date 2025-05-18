
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


openPreviewBtn.addEventListener('click', () => {
  let url = urlInput.value.trim();
  if (!url) {
    alert('Please enter a URL');
    return;
  }
  
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://' + url;
  }

  let width, height;
  
  const selectedDevice = document.querySelector('input[name="device"]:checked');
  
  if (!selectedDevice) {
    alert('Please select a device or custom size');
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
  if (window.electron) {
    window.electron.openPreview({ url, width, height });
  } else {
    console.log('Electron API not available. In a real app, this would open a new window with:', { url, width, height });
  }
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