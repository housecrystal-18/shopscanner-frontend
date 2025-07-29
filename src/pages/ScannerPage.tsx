import { useState } from 'react';
import { ScanLine, Camera, History, X } from 'lucide-react';
import { BarcodeScanner } from '../components/scanner/BarcodeScanner';
import { ProductResult } from '../components/scanner/ProductResult';
import { useScanner } from '../hooks/useScanner';

export function ScannerPage() {
  const {
    isScanning,
    currentBarcode,
    scanHistory,
    isLoadingProduct,
    startScanning,
    stopScanning,
    handleBarcodeDetected,
    clearCurrentScan,
    rescanBarcode,
    addProductManually,
    updateProduct,
    getScanResult,
  } = useScanner();

  const [showHistory, setShowHistory] = useState(false);
  const scanResult = getScanResult();

  const handleNewScan = () => {
    clearCurrentScan();
    startScanning();
  };

  const handleRescan = () => {
    if (currentBarcode) {
      rescanBarcode(currentBarcode);
    }
  };

  return (
    <div className="min-h-screen">
      {/* Scanner Modal */}
      {isScanning && (
        <BarcodeScanner
          onBarcodeDetected={handleBarcodeDetected}
          onClose={stopScanning}
          isScanning={isScanning}
        />
      )}

      {/* History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/50 z-40 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Scan History</h3>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-4 overflow-y-auto">
              {scanHistory.length > 0 ? (
                <div className="space-y-2">
                  {scanHistory.map((barcode, index) => (
                    <button
                      key={index}
                      onClick={() => {
                        rescanBarcode(barcode);
                        setShowHistory(false);
                      }}
                      className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                    >
                      <div className="font-mono text-sm text-gray-900">{barcode}</div>
                      <div className="text-xs text-gray-500">
                        Scan #{scanHistory.length - index}
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <History className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No scan history yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="container py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="w-20 h-20 bg-gradient-to-br from-primary-500 to-primary-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg">
            <ScanLine className="h-10 w-10 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Product Scanner
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
            Scan any product barcode to verify authenticity, compare prices, and get detailed product information.
          </p>
        </div>

        {/* Main Content */}
        <div className="max-w-4xl mx-auto">
          {scanResult ? (
            /* Show scan result */
            <ProductResult
              barcode={scanResult.barcode}
              product={scanResult.product}
              isNewProduct={scanResult.isNewProduct}
              isLoading={isLoadingProduct}
              onAddProduct={addProductManually}
              onUpdateProduct={updateProduct}
              onRescan={handleRescan}
              onNewScan={handleNewScan}
            />
          ) : (
            /* Show scan interface */
            <div className="space-y-12">
              {/* Primary Action */}
              <div className="text-center">
                <button
                  onClick={startScanning}
                  className="bg-primary-600 hover:bg-primary-700 text-white px-8 py-4 rounded-2xl text-lg font-semibold inline-flex items-center shadow-lg hover:shadow-xl transition-all duration-200 transform hover:-translate-y-0.5"
                >
                  <Camera className="h-6 w-6 mr-3" />
                  Start Scanning
                </button>
                <p className="text-gray-500 mt-4">
                  Position your camera over any product barcode
                </p>
              </div>

              {/* Secondary Action */}
              {scanHistory.length > 0 && (
                <div className="text-center">
                  <button
                    onClick={() => setShowHistory(true)}
                    className="text-primary-600 hover:text-primary-700 font-medium inline-flex items-center transition-colors duration-200"
                  >
                    <History className="h-4 w-4 mr-2" />
                    View Recent Scans ({scanHistory.length})
                  </button>
                </div>
              )}

              {/* Features Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-6">
                  <div className="w-14 h-14 bg-primary-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ScanLine className="h-7 w-7 text-primary-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Instant Recognition</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Advanced AI instantly recognizes and processes any standard barcode format
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-14 h-14 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ScanLine className="h-7 w-7 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Price Comparison</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Compare prices across multiple stores and find the best deals
                  </p>
                </div>

                <div className="text-center p-6">
                  <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <ScanLine className="h-7 w-7 text-purple-600" />
                  </div>
                  <h3 className="font-semibold text-gray-900 mb-2">Authenticity Check</h3>
                  <p className="text-gray-600 text-sm leading-relaxed">
                    Verify product authenticity and detect fake or counterfeit items
                  </p>
                </div>
              </div>

              {/* Instructions */}
              <div className="bg-blue-50 rounded-lg p-6">
                <h3 className="font-semibold text-blue-900 mb-3">How to scan:</h3>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                  <li>Tap "Start Scanning" to open the camera</li>
                  <li>Point your camera at the barcode</li>
                  <li>Keep the barcode within the scanning frame</li>
                  <li>Wait for automatic detection</li>
                  <li>View product information and price comparisons</li>
                </ol>
              </div>

              {/* Scan History */}
              {scanHistory.length > 0 && (
                <div className="bg-white rounded-lg p-6 shadow-sm">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Recent Scans</h3>
                    <button
                      onClick={() => setShowHistory(true)}
                      className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                    >
                      View All
                    </button>
                  </div>
                  <div className="space-y-2">
                    {scanHistory.slice(0, 3).map((barcode, index) => (
                      <button
                        key={index}
                        onClick={() => rescanBarcode(barcode)}
                        className="w-full text-left p-3 rounded-lg hover:bg-gray-50 transition-colors border"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-sm text-gray-900">{barcode}</span>
                          <span className="text-xs text-gray-500">
                            Scan #{scanHistory.length - index}
                          </span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}