import React, { useState } from 'react';
import { Upload, AlertCircle, Loader2 } from 'lucide-react';

interface Prediction {
  cell_density: number;
  cv: number;
  corneal_thickness: number;
  suggested_action: string;
  surgery_type: string;
  surgery_required: string;
}

function App() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setPreview(URL.createObjectURL(file));
      setPrediction(null);
      setError(null);
    }
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!selectedFile) return;

    setLoading(true);
    setError(null);

    const formData = new FormData();
    formData.append('file', selectedFile);

    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Prediction failed');
      }

      const result = await response.json();
      setPrediction(result);
    } catch (err) {
      setError('Failed to get prediction. Please try again.');
      console.error('Fetch error:', err); // Debug
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">HCEC Analysis</h1>
          <p className="text-gray-600">Upload a corneal endothelial image for analysis</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
              <div className="flex flex-col items-center">
                <Upload className="h-12 w-12 text-gray-400 mb-4" />
                <label className="block">
                  <span className="sr-only">Choose file</span>
                  <input
                    type="file"
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    accept=".png,.jpg,.jpeg,.bmp"
                    onChange={handleFileChange}
                  />
                </label>
                <p className="text-xs text-gray-500 mt-2">PNG, JPG, JPEG, or BMP up to 10MB</p>
              </div>
            </div>

            {preview && (
              <div className="mt-4">
                <img src={preview} alt="Preview" className="max-h-64 mx-auto rounded-lg" />
              </div>
            )}

            <button
              type="submit"
              disabled={!selectedFile || loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-blue-300 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin mr-2 h-5 w-5" />
                  Processing...
                </>
              ) : (
                'Analyze Image'
              )}
            </button>
          </form>
        </div>

        {error && (
          <div className="bg-red-50 border-l-4 border-red-400 p-4 mb-8">
            <div className="flex">
              <AlertCircle className="h-5 w-5 text-red-400" />
              <p className="ml-3 text-red-700">{error}</p>
            </div>
          </div>
        )}

        {prediction && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Analysis Results</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-blue-800">Cell Density</h3>
                <p className="text-2xl font-bold text-blue-900">{prediction.cell_density} cells/mm²</p>
              </div>
              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-green-800">Coefficient of Variation</h3>
                <p className="text-2xl font-bold text-green-900">{prediction.cv}%</p>
              </div>
              <div className="bg-purple-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-purple-800">Corneal Thickness</h3>
                <p className="text-2xl font-bold text-purple-900">{prediction.corneal_thickness} µm</p>
              </div>
            </div>
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-lg font-semibold text-gray-900">Clinical Recommendation</h3>
              <p className="text-gray-700"><strong>Suggested Action:</strong> {prediction.suggested_action}</p>
              <p className="text-gray-700"><strong>Surgery Type:</strong> {prediction.surgery_type}</p>
              <p className="text-gray-700"><strong>Surgery Required:</strong> {prediction.surgery_required}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;