import React from 'react';
import Upload from '../components/Upload';

const Home: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <Upload />
      </div>
    </div>
  );
};

export default Home;
