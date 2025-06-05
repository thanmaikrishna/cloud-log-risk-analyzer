import React, { useState } from 'react';
import axios from 'axios';

const FetchAnalyze = ({ token }) => {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [region, setRegion] = useState('');
  const [s3Path, setS3Path] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleFetchLogs = async () => {
    setLoading(true);
    setMessage('');

    try {
      const response = await axios.post(
        'http://localhost:5000/fetch-logs',
        {
          access_key: accessKey,
          secret_key: secretKey,
          region: region,
          s3_path: s3Path,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message || 'Logs fetched and analyzed successfully!');
    } catch (error) {
      console.error(error);
      setMessage('Error fetching or analyzing logs.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-2xl mx-auto bg-white rounded-lg shadow-lg mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center text-gray-800">Fetch & Analyze CloudTrail Logs</h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="AWS Access Key"
          value={accessKey}
          onChange={(e) => setAccessKey(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="password"
          placeholder="AWS Secret Key"
          value={secretKey}
          onChange={(e) => setSecretKey(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="AWS Region (e.g., us-east-1)"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />
        <input
          type="text"
          placeholder="S3 Path (e.g., s3://my-bucket/logs/)"
          value={s3Path}
          onChange={(e) => setS3Path(e.target.value)}
          className="w-full p-3 border rounded-lg"
        />

        <button
          onClick={handleFetchLogs}
          disabled={loading}
          className="w-full py-3 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200"
        >
          {loading ? 'Fetching & Analyzing...' : 'Fetch & Analyze Logs'}
        </button>
      </div>

      {message && (
        <div className="mt-6 text-center text-lg font-medium text-green-600">{message}</div>
      )}
    </div>
  );
};

export default FetchAnalyze;
