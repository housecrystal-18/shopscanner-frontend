import { useRef, useCallback, useState, useEffect } from 'react';
import { Camera } from 'react-camera-pro';
import jsQR from 'jsqr';
import { X, FlipHorizontal, Zap, ZapOff } from 'lucide-react';
import { toast } from 'react-hot-toast';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  onClose: () => void;
  isScanning?: boolean;
}

export function BarcodeScanner({ onBarcodeDetected, onClose, isScanning = true }: BarcodeScannerProps) {
  const camera = useRef<any>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [torchEnabled, setTorchEnabled] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastScannedCode, setLastScannedCode] = useState<string>('');
  const scanIntervalRef = useRef<number | null>(null);

  const processFrame = useCallback(() => {
    if (!camera.current || !canvasRef.current || !isScanning || isProcessing) {
      return;
    }

    try {
      const video = camera.current.getCanvas();
      if (!video) return;

      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Set canvas dimensions to match video
      canvas.width = video.width;
      canvas.height = video.height;

      // Draw current frame to canvas
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Get image data for QR code detection
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      
      // Attempt to detect QR code
      const code = jsQR(imageData.data, imageData.width, imageData.height, {
        inversionAttempts: 'dontInvert',
      });

      if (code && code.data && code.data !== lastScannedCode) {
        setLastScannedCode(code.data);
        setIsProcessing(true);
        
        // Vibrate if supported
        if (navigator.vibrate) {
          navigator.vibrate(200);
        }
        
        // Call the callback with detected barcode
        onBarcodeDetected(code.data);
        
        // Reset processing state after a short delay
        setTimeout(() => {
          setIsProcessing(false);
          setLastScannedCode('');
        }, 2000);
      }
    } catch (error) {
      console.error('Error processing frame:', error);
    }
  }, [isScanning, isProcessing, lastScannedCode, onBarcodeDetected]);

  // Start scanning interval
  useEffect(() => {
    if (isScanning && !scanIntervalRef.current) {
      scanIntervalRef.current = setInterval(processFrame, 100); // Scan every 100ms
    } else if (!isScanning && scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }

    return () => {
      if (scanIntervalRef.current) {
        clearInterval(scanIntervalRef.current);
        scanIntervalRef.current = null;
      }
    };
  }, [isScanning, processFrame]);

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user');
  }, []);

  const toggleTorch = useCallback(async () => {
    try {
      if (camera.current && camera.current.stream) {
        const track = camera.current.stream.getVideoTracks()[0];
        if (track && 'torch' in track.getCapabilities()) {
          await track.applyConstraints({
            advanced: [{ torch: !torchEnabled }]
          });
          setTorchEnabled(!torchEnabled);
        } else {
          toast.error('Torch not supported on this device');
        }
      }
    } catch (error) {
      console.error('Error toggling torch:', error);
      toast.error('Failed to toggle torch');
    }
  }, [torchEnabled]);

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 bg-black/90 text-white">
        <h2 className="text-lg font-semibold">Scan Barcode</h2>
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleTorch}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title={torchEnabled ? 'Turn off torch' : 'Turn on torch'}
          >
            {torchEnabled ? (
              <ZapOff className="h-5 w-5" />
            ) : (
              <Zap className="h-5 w-5" />
            )}
          </button>
          <button
            onClick={switchCamera}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title="Switch camera"
          >
            <FlipHorizontal className="h-5 w-5" />
          </button>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
            title="Close scanner"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>

      {/* Camera View */}
      <div className="flex-1 relative overflow-hidden">
        <Camera
          ref={camera}
          aspectRatio={16 / 9}
          facingMode={facingMode}
          errorMessages={{
            noCameraAccessible: 'No camera device accessible. Please connect your camera or try a different browser.',
            permissionDenied: 'Permission denied. Please refresh and give camera permission.',
            switchCamera: 'It is not possible to switch camera to different one because there is only one video device accessible.',
            canvas: 'Canvas is not supported.',
          }}
        />
        
        {/* Scanning Overlay */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative">
            {/* Scanning Frame */}
            <div className="w-64 h-64 border-2 border-white/50 relative">
              {/* Corner markers */}
              <div className="absolute top-0 left-0 w-6 h-6 border-t-4 border-l-4 border-primary-500"></div>
              <div className="absolute top-0 right-0 w-6 h-6 border-t-4 border-r-4 border-primary-500"></div>
              <div className="absolute bottom-0 left-0 w-6 h-6 border-b-4 border-l-4 border-primary-500"></div>
              <div className="absolute bottom-0 right-0 w-6 h-6 border-b-4 border-r-4 border-primary-500"></div>
              
              {/* Scanning line animation */}
              {isScanning && !isProcessing && (
                <div className="absolute top-0 left-0 w-full h-1 bg-primary-500 animate-pulse"></div>
              )}
              
              {/* Processing indicator */}
              {isProcessing && (
                <div className="absolute inset-0 bg-primary-500/20 flex items-center justify-center">
                  <div className="bg-primary-500 text-white px-4 py-2 rounded-lg font-semibold">
                    Processing...
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
        
        {/* Status overlay */}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-6">
          <div className="text-center text-white">
            <p className="text-lg font-medium mb-2">
              {isProcessing ? 'Processing barcode...' : 'Position barcode within the frame'}
            </p>
            <p className="text-sm text-white/70">
              Make sure the barcode is well-lit and clearly visible
            </p>
          </div>
        </div>
      </div>

      {/* Hidden canvas for image processing */}
      <canvas
        ref={canvasRef}
        className="hidden"
        width="640"
        height="480"
      />
    </div>
  );
}