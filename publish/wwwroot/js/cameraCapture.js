// Camera capture functionality using WebRTC

let cameraStream = null;
let videoElement = null;

export async function startCamera(videoContainerId) {
    try {
        // Check if browser supports getUserMedia
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            throw new Error('Camera not supported on this browser');
        }

        // Request camera access
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: { facingMode: 'environment' }, // Back camera on mobile, default on desktop
            audio: false
        });

        // Wait for container element to be available (with retries)
        let container = null;
        for (let i = 0; i < 50; i++) {
            container = document.getElementById(videoContainerId);
            if (container) break;
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        if (!container) {
            throw new Error(`Video container "${videoContainerId}" not found in DOM`);
        }

        // Clear previous content
        container.innerHTML = '';

        videoElement = document.createElement('video');
        videoElement.srcObject = cameraStream;
        videoElement.autoplay = true;
        videoElement.playsInline = true; // Important for iOS
        videoElement.style.width = '100%';
        videoElement.style.height = 'auto';
        videoElement.style.borderRadius = '0.5rem';

        container.appendChild(videoElement);

        // Wait for video to load
        return new Promise((resolve) => {
            videoElement.onloadedmetadata = () => {
                videoElement.play();
                resolve(true);
            };
        });
    } catch (error) {
        console.error('Camera error:', error);
        throw error;
    }
}

export function stopCamera() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }
    if (videoElement) {
        videoElement.srcObject = null;
        videoElement = null;
    }
}

export async function capturePhoto() {
    if (!videoElement) {
        throw new Error('Camera not active');
    }

    // Create canvas and draw video frame
    const canvas = document.createElement('canvas');
    canvas.width = videoElement.videoWidth;
    canvas.height = videoElement.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoElement, 0, 0);

    // Convert to data URL
    return canvas.toDataURL('image/jpeg', 0.9);
}
