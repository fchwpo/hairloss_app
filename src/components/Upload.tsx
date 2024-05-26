import React, { useState, ChangeEvent, useEffect } from 'react';
import axios from 'axios';
import { Dialog } from '@headlessui/react';
import { CheckCircleIcon, ExclamationCircleIcon } from '@heroicons/react/solid';

const Upload: React.FC = () => {
  const [image, setImage] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState('');
  const [prediction, setPrediction] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!image) return;

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append('image', image);

    try {
      const imgurResponse = await axios.post('https://api.imgur.com/3/image', formData, {
        headers: {
          Authorization: `Client-ID ${process.env.NEXT_PUBLIC_IMGUR_CLIENT_ID}`,
        },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded * 100) / event.total));
          }
        },
      });

      const imgurLink = imgurResponse.data.data.link;

      await axios.post('/api/saveImage', { imgurLink }, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      setDialogMessage('Image uploaded and link saved successfully!');
      setIsOpen(true);

      // Start polling for prediction
      const intervalId = setInterval(async () => {
        const response = await axios.get(`/api/getPrediction?imgurLink=${imgurLink}`);
        const { prediction } = response.data;

        if (prediction) {
          setPrediction(prediction);
          clearInterval(intervalId);
        }
      }, 5000);
    } catch (error) {
      console.error('Error uploading image:', error);
      setDialogMessage('Error uploading image. Please try again.');
      setIsOpen(true);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md max-w-md mx-auto">
      <h2 className="text-lg font-medium text-gray-900">Hair Loss Classifier</h2>
      <p className="mt-1 text-sm text-gray-600">Please upload your image to check.</p>

      <div className="mt-4">
        <input
          type="file"
          onChange={handleImageChange}
          className="block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50"
        />
        <button
          onClick={handleUpload}
          className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
          disabled={uploading || !image}
        >
          {uploading ? 'Uploading...' : 'Upload Image'}
        </button>
      </div>

      {uploading && (
        <div className="mt-4 w-full bg-gray-200 rounded-full">
          <div
            className="bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full"
            style={{ width: `${progress}%` }}
          >
            {progress}%
          </div>
        </div>
      )}

      <Dialog open={isOpen} onClose={() => setIsOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="w-full max-w-sm bg-white rounded-lg p-6">
            <Dialog.Title className="text-lg font-medium text-gray-900">Notification</Dialog.Title>
            <Dialog.Description className="mt-2 text-sm text-gray-600">
              {dialogMessage}
            </Dialog.Description>
            <button
              onClick={() => setIsOpen(false)}
              className="mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
            >
              OK
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>

      {prediction && (
        <div className="mt-6 p-4 bg-green-100 border border-green-200 rounded-md">
          <div className="flex items-center">
            <CheckCircleIcon className="w-6 h-6 text-green-600" />
            <p className="ml-2 text-green-700">Prediction: {prediction}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Upload;
