import React, { useState } from 'react';
import axios from 'axios';

export function RiskClassification() {
  const [awsKey, setAwsKey] = useState('');
  const [awsSecret, setAwsSecret] = useState('');
  const [s3Path, setS3Path] = useState('');
  const [results, setResults] = useState([]);

  const analyzeLogs = async () => {
    const token = localStorage.getItem('token');
    const response = await axios.post('/api/analyze', {
      key: awsKey,
      secret: awsSecret,
      s3_path: s3Path
    }, {
      headers: { Authorization: `Bearer ${token}` }
    });

    setResults(response.data.results || []);
  };

  return (
    <div className="section">
      <h2>Risk Classification</h2>
      <input placeholder="AWS Key" value={awsKey} onChange={e => setAwsKey(e.target.value)} />
      <input placeholder="AWS Secret" type="password" value={awsSecret} onChange={e => setAwsSecret(e.target.value)} />
      <input placeholder="S3 Log Path" value={s3Path} onChange={e => setS3Path(e.target.value)} />
      <button onClick={analyzeLogs}>Analyze</button>
      <ul>
        {results.map((log, idx) => (
          <li key={idx}>{log.eventName} - {log.risk} ({log.reason})</li>
        ))}
      </ul>
    </div>
  );
}
