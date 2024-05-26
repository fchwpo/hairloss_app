import React, { useState, ChangeEvent, useEffect } from 'react'
import axios from 'axios'
import { Dialog } from '@headlessui/react'

const CheckCircleIcon: React.FC = () => {
  return (
    <svg
      xmlns='http://www.w3.org/2000/svg'
      fill='none'
      viewBox='0 0 24 24'
      stroke='currentColor'
      className='w-6 h-6 text-green-600'
    >
      <path
        strokeLinecap='round'
        strokeLinejoin='round'
        strokeWidth='2'
        d='M5 13l4 4L19 7'
      />
    </svg>
  )
}

const Upload: React.FC = () => {
  const [image, setImage] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [dialogMessage, setDialogMessage] = useState('')
  const [prediction, setPrediction] = useState<string | null>(null)
  const [fetchingPrediction, setFetchingPrediction] = useState(false)

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setImage(e.target.files[0])
    }
  }

  const handleUpload = async () => {
    if (!image) return

    setUploading(true)
    setProgress(0)

    const formData = new FormData()
    formData.append('image', image)

    try {
      const imgurResponse = axios.post('https://api.imgbb.com/1/upload', null, {
        params: {
          expiration: 600,
          key: process.env.NEXT_PUBLIC_IMG_BB_API_KEY,
        },
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        data: {
          image: image,
        },
        onUploadProgress: (event) => {
          if (event.total) {
            setProgress(Math.round((event.loaded * 100) / event.total))
          }
        },
      })
      // const imgurResponse = await axios.post(
      //   `https://api.imgbb.com/1/upload?key=${process.env.NEXT_PUBLIC_IMG_BB_API_KEY}`,
      //   formData,
      //   {
      //     // headers: {
      //     //   Authorization: `Client-ID ${process.env.NEXT_PUBLIC_IMG_BB_API_KEY}`,
      //     // },
      //     onUploadProgress: (event) => {
      //       if (event.total) {
      //         setProgress(Math.round((event.loaded * 100) / event.total))
      //       }
      //     },
      //   }
      // )

      console.log(imgurResponse)
      const imgurLink = imgurResponse?.data?.data?.url || ""

      await axios.post(
        '/api/saveImage',
        { imgurLink },
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      )

      setDialogMessage('Image uploaded and link saved successfully!')
      setIsOpen(true)

      setFetchingPrediction(true)
    } catch (error) {
      console.error('Error uploading image:', error)
      setDialogMessage('Error uploading image. Please try again.')
      setIsOpen(true)
    } finally {
      setUploading(false)
    }
  }

  useEffect(() => {
    if (prediction === null && image !== null && !fetchingPrediction) {
      handlePrediction()
    }
  }, [prediction, image, fetchingPrediction])

  const handlePrediction = async () => {
    if (!image) return

    const formData = new FormData()
    formData.append('image', image)

    try {
      const response = await axios.post('/api/predict', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      const { data } = response

      setPrediction(data.prediction)
    } catch (error) {
      console.error('Error fetching prediction:', error)
    } finally {
      setFetchingPrediction(false)
    }
  }

  return (
    <div className='p-6 bg-white rounded-lg shadow-md'>
      <h2 className='text-lg font-medium text-gray-900'>
        Hair Loss Classifier
      </h2>
      <p className='mt-1 text-sm text-gray-600'>
        Please upload your image to check.
      </p>

      <div className='mt-4'>
        <input
          type='file'
          onChange={handleImageChange}
          className='block w-full text-sm text-gray-900 border border-gray-300 rounded-lg cursor-pointer bg-gray-50'
        />
        {image && (
          <img
            src={URL.createObjectURL(image)}
            alt='Selected Image'
            className='mt-2 w-full h-auto rounded-lg'
          />
        )}
        {!prediction && !uploading && (
          <button
            onClick={handleUpload}
            className='mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50'
            disabled={uploading || !image}
          >
            Upload Image
          </button>
        )}

        {uploading && (
          <div className='mt-4 w-full bg-gray-200 rounded-full'>
            <div
              className='bg-blue-600 text-xs font-medium text-blue-100 text-center p-0.5 leading-none rounded-full'
              style={{ width: `${progress}%` }}
            >
              {progress}%
            </div>
          </div>
        )}

        {fetchingPrediction && !prediction && (
          <div className='mt-4 flex items-center justify-center text-blue-600'>
            <svg
              className='animate-spin h-5 w-5 mr-3'
              xmlns='http://www.w3.org/2000/svg'
              fill='none'
              viewBox='0 0 24 24'
            >
              <circle
                className='opacity-25'
                cx='12'
                cy='12'
                r='10'
                stroke='currentColor'
                strokeWidth='4'
              ></circle>
              <path
                className='opacity-75'
                fill='currentColor'
                d='M4 12a8 8 0 018-8V2.5A1.5 1.5 0 0113.5 1h-3A1.5 1.5 0 019 2.5V4a8 8 0 014 7.33V12h2.5a1.5 1.5 0 010 3h-6a1.5 1.5 0 010-3H12v-2.67A8 8 0 014 12z'
              ></path>
            </svg>
            Fetching prediction...
          </div>
        )}

        {prediction && (
          <div className='mt-6 p-4 bg-green-100 border border-green-200 rounded-md'>
            <div className='flex items-center'>
              <CheckCircleIcon />
              <p className='ml-2 text-green-700'>Prediction: {prediction}</p>
            </div>
          </div>
        )}
      </div>

      <Dialog
        open={isOpen}
        onClose={() => setIsOpen(false)}
        className='relative z-50'
      >
        <div className='fixed inset-0 bg-black/30' aria-hidden='true' />
        <div className='fixed inset-0 flex items-center justify-center p-4'>
          <Dialog.Panel className='w-full max-w-sm bg-white rounded-lg p-6'>
            <Dialog.Title className='text-lg font-medium text-gray-900'>
              Notification
            </Dialog.Title>
            <Dialog.Description className='mt-2 text-sm text-gray-600'>
              {dialogMessage}
            </Dialog.Description>
            <button
              onClick={() => setIsOpen(false)}
              className='mt-4 w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700'
            >
              OK
            </button>
          </Dialog.Panel>
        </div>
      </Dialog>
    </div>
  )
}

export default Upload
