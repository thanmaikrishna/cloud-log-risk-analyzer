import React, { useState } from 'react';
import './AwsConfigForm.css';

const awsRegions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
  "af-south-1", "ap-east-1", "ap-south-1", "ap-northeast-1",
  "ap-northeast-2", "ap-northeast-3", "ap-southeast-1",
  "ap-southeast-2", "ca-central-1", "cn-north-1", "cn-northwest-1",
  "eu-central-1", "eu-west-1", "eu-west-2", "eu-west-3",
  "eu-north-1", "eu-south-1", "me-south-1", "sa-east-1"
];

const AwsConfigForm = ({ onSubmit }) => {
  const [accessKey, setAccessKey] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [bucket, setBucket] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!accessKey || !secretKey || !bucket) {
      setError("Please fill all fields.");
      return;
    }
    setError('');
    onSubmit({ accessKey, secretKey, region, bucket });
  };

  return (
    <div className="aws-config-container">
      <h3>AWS Configuration</h3>
      <form onSubmit={handleSubmit}>
        <label>
          AWS Access Key
          <input
            type="password" // secure input
            value={accessKey}
            onChange={(e) => setAccessKey(e.target.value)}
            placeholder="Enter AWS Access Key"
            required
            autoComplete="new-password"
          />
        </label>
        <label>
          AWS Secret Key
          <input
            type="password" // secure input
            value={secretKey}
            onChange={(e) => setSecretKey(e.target.value)}
            placeholder="Enter AWS Secret Key"
            required
            autoComplete="new-password"
          />
        </label>
        <label>
          AWS Region
          <select value={region} onChange={(e) => setRegion(e.target.value)}>
            {awsRegions.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          CloudTrail S3 Bucket Name
          <input
            type="text"
            value={bucket}
            onChange={(e) => setBucket(e.target.value)}
            placeholder="Enter S3 Bucket Name"
            required
          />
        </label>
        {error && <p className="error-msg">{error}</p>}
        <button type="submit">Connect & Fetch Logs</button>
      </form>
    </div>
  );
};

export default AwsConfigForm;
