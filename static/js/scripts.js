// Common UI helpers
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.innerHTML = `
        <div class="d-flex align-items-center">
            <i class="fas ${type === 'success' ? 'fa-check-circle' : 
                            type === 'error' ? 'fa-exclamation-circle' : 
                            'fa-exclamation-triangle'} me-2"></i>
            <div>${message}</div>
        </div>
    `;
    container.appendChild(toast);
    
    // Haptic feedback for mobile
    if (window.navigator.vibrate) {
        window.navigator.vibrate(50);
    }
    
    setTimeout(() => {
        toast.style.animation = 'slideIn 0.3s ease reverse';
        setTimeout(() => toast.remove(), 300);
    }, 4000);
}

function formatDuration(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
}

// Voice feedback
function speak(text) {
    if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'en-US';
        utterance.rate = 0.9;
        utterance.pitch = 1;
        window.speechSynthesis.speak(utterance);
    }
}

// Camera utilities
async function initCamera(videoElement, facingMode = 'user') {
    try {
        const stream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: facingMode,
                width: { ideal: 640 },
                height: { ideal: 480 }
            },
            audio: false
        });
        
        videoElement.srcObject = stream;
        
        return new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                resolve(stream);
            };
        });
    } catch (err) {
        console.error('Camera error:', err);
        showToast('Camera access denied or not available', 'error');
        throw err;
    }
}

// Detect active bottom nav item
function setActiveBottomNav() {
    const path = window.location.pathname;
    const navItems = document.querySelectorAll('.bottom-nav-item');
    
    navItems.forEach(item => {
        const href = item.getAttribute('href');
        if (path === href || (path === '/' && href === '/')) {
            item.classList.add('active');
        } else {
            item.classList.remove('active');
        }
    });
}

// Pull to refresh
function initPullToRefresh() {
    let touchstartY = 0;
    const ptrIndicator = document.querySelector('.ptr-indicator');
    
    document.addEventListener('touchstart', e => {
        touchstartY = e.touches[0].screenY;
    }, { passive: true });

    document.addEventListener('touchmove', e => {
        const touchY = e.touches[0].screenY;
        const touchDiff = touchY - touchstartY;
        
        if (touchDiff > 100 && window.scrollY === 0 && ptrIndicator) {
            ptrIndicator.classList.add('visible');
        }
    }, { passive: true });

    document.addEventListener('touchend', e => {
        if (ptrIndicator && ptrIndicator.classList.contains('visible')) {
            window.location.reload();
        }
    });
}

// Register service worker
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        navigator.serviceWorker.register('/static/service-worker.js')
            .then(registration => {
                console.log('ServiceWorker registered');
            })
            .catch(err => {
                console.log('ServiceWorker registration failed:', err);
            });
    });
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    setActiveBottomNav();
    initPullToRefresh();
});

// Handle back button on mobile
window.addEventListener('popstate', () => {
    setActiveBottomNav();
});