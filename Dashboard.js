import React, { useState } from 'react';
import './Dashboard.css';
import CustomRulesEditor from './CustomRulesEditor';
import {
  PieChart, Pie, Cell, Tooltip as ReTooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  LineChart, Line, AreaChart, Area,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ComposedChart
} from 'recharts';

const COLORS = ['#0088FE', '#FF8042'];

const awsRegions = [
  'us-east-1', 'us-east-2', 'us-west-1', 'us-west-2', 'af-south-1',
  'ap-east-1', 'ap-south-1', 'ap-northeast-3', 'ap-northeast-2',
  'ap-southeast-1', 'ap-southeast-2', 'ap-northeast-1', 'ca-central-1',
  'cn-north-1', 'cn-northwest-1', 'eu-central-1', 'eu-west-1',
  'eu-west-2', 'eu-south-1', 'eu-west-3', 'eu-north-1', 'me-south-1',
  'sa-east-1',
];

const Dashboard = ({ userEmail, logout }) => {
  const [activeMenu, setActiveMenu] = useState('fetch');
  const [awsAccessKey, setAwsAccessKey] = useState('');
  const [awsSecretKey, setAwsSecretKey] = useState('');
  const [region, setRegion] = useState('us-east-1');
  const [logPath, setLogPath] = useState('');
  const [logs, setLogs] = useState([]);
  const [errorMsg, setErrorMsg] = useState('');
  const [vizType, setVizType] = useState('pie');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setLogs([]);

    try {
      const response = await fetch("http://localhost:5000/api/connect-aws", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          accessKey: awsAccessKey,
          secretKey: awsSecretKey,
          region,
          logPath,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        alert("✅ Connected & Logs Fetched!");
        setLogs(data.logs || []);
      } else {
        setErrorMsg(data.message || 'Error connecting to AWS');
      }
    } catch (err) {
      setErrorMsg(`AWS Connection Failed: ${err.message}`);
    }
  };

  const logsWithRiskType = logs.map(log => {
    const isCustom = log.reason?.toLowerCase().includes('custom');
    return { ...log, riskType: isCustom ? 'custom' : 'rule' };
  });

  const categorizedData = logsWithRiskType.reduce((acc, log) => {
    if (log.riskType === 'custom') acc.custom.push(log);
    else acc.rule.push(log);
    return acc;
  }, { rule: [], custom: [] });

  const pieData = [
    { name: 'Rule-based', value: categorizedData.rule.length },
    { name: 'Custom-based', value: categorizedData.custom.length },
  ];

  const riskLevels = ['Low', 'Medium', 'High'];

  const countByRiskLevel = (arr) => {
    const counts = { Low: 0, Medium: 0, High: 0 };
    arr.forEach(log => {
      const risk = log.risk || 'Low';
      if (riskLevels.includes(risk)) counts[risk]++;
    });
    return counts;
  };

  const ruleCounts = countByRiskLevel(categorizedData.rule);
  const customCounts = countByRiskLevel(categorizedData.custom);

  const barData = riskLevels.map(level => ({
    riskLevel: level,
    RuleBased: ruleCounts[level],
    CustomBased: customCounts[level],
  }));

  const renderVisualization = () => {
    switch (vizType) {
      case 'pie':
        return (
          <PieChart width={400} height={300}>
            <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ReTooltip />
            <Legend />
          </PieChart>
        );
      case 'bar':
        return (
          <BarChart width={500} height={300} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="riskLevel" />
            <YAxis allowDecimals={false} />
            <ReTooltip />
            <Legend />
            <Bar dataKey="RuleBased" fill="#0088FE" />
            <Bar dataKey="CustomBased" fill="#FF8042" />
          </BarChart>
        );
      case 'line':
        return (
          <LineChart width={500} height={300} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="riskLevel" />
            <YAxis />
            <ReTooltip />
            <Legend />
            <Line type="monotone" dataKey="RuleBased" stroke="#0088FE" />
            <Line type="monotone" dataKey="CustomBased" stroke="#FF8042" />
          </LineChart>
        );
      case 'area':
        return (
          <AreaChart width={500} height={300} data={barData}>
            <defs>
              <linearGradient id="colorRule" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0088FE" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0088FE" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorCustom" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#FF8042" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#FF8042" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="riskLevel" />
            <YAxis />
            <ReTooltip />
            <Area type="monotone" dataKey="RuleBased" stroke="#0088FE" fillOpacity={1} fill="url(#colorRule)" />
            <Area type="monotone" dataKey="CustomBased" stroke="#FF8042" fillOpacity={1} fill="url(#colorCustom)" />
          </AreaChart>
        );
      case 'radar':
        return (
          <RadarChart outerRadius={90} width={500} height={300} data={barData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="riskLevel" />
            <PolarRadiusAxis angle={30} domain={[0, Math.max(...barData.map(d => d.RuleBased + d.CustomBased))]} />
            <Radar name="RuleBased" dataKey="RuleBased" stroke="#0088FE" fill="#0088FE" fillOpacity={0.6} />
            <Radar name="CustomBased" dataKey="CustomBased" stroke="#FF8042" fill="#FF8042" fillOpacity={0.6} />
            <Legend />
          </RadarChart>
        );
      case 'composed':
        return (
          <ComposedChart width={500} height={300} data={barData}>
            <CartesianGrid stroke="#f5f5f5" />
            <XAxis dataKey="riskLevel" />
            <YAxis />
            <ReTooltip />
            <Legend />
            <Bar dataKey="CustomBased" barSize={20} fill="#FF8042" />
            <Line type="monotone" dataKey="RuleBased" stroke="#0088FE" />
          </ComposedChart>
        );
      default:
        return <p>No visualization type selected</p>;
    }
  };

  return (
    <div className="dashboard-container">
      <aside className="sidebar open">
        <div className="logo">
          <img src="/logo192.png" alt="Cloud Risk Logo" />
          <h2>Cloud Risk</h2>
        </div>
        <nav>
          <ul>
            <li className={activeMenu === 'fetch' ? 'active' : ''} onClick={() => setActiveMenu('fetch')}>
              Fetch / Analysis
            </li>
            <li className={activeMenu === 'customRules' ? 'active' : ''} onClick={() => setActiveMenu('customRules')}>
              Custom Rules
            </li>
            <li className={activeMenu === 'visualization' ? 'active' : ''} onClick={() => setActiveMenu('visualization')}>
              Visualization
            </li>
            <li className={activeMenu === 'settings' ? 'active' : ''} onClick={() => setActiveMenu('settings')}>
              Settings
            </li>
            <li className="logout-section">
              <button className="logout-btn" onClick={logout}>Logout</button>
            </li>
          </ul>
        </nav>
      </aside>

      <main className="main-content">
        <h1>Welcome to Cloud Risk Dashboard</h1>
        <p>Logged in as: <strong>{userEmail}</strong></p>

        {activeMenu === 'fetch' && (
          <>
            <form className="aws-form" onSubmit={handleSubmit}>
              <label>
                AWS Access Key ID:
                <input type="password" value={awsAccessKey} onChange={(e) => setAwsAccessKey(e.target.value)} required />
              </label>
              <label>
                AWS Secret Access Key:
                <input type="password" value={awsSecretKey} onChange={(e) => setAwsSecretKey(e.target.value)} required />
              </label>
              <label>
                AWS Region:
                <select value={region} onChange={(e) => setRegion(e.target.value)}>
                  {awsRegions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
              </label>
              <label>
                AWS Log Path:
                <input type="text" value={logPath} onChange={(e) => setLogPath(e.target.value)} required />
              </label>
              <button type="submit">Connect to AWS</button>
            </form>

            {errorMsg && <p className="error-message">{errorMsg}</p>}

            {logs.length > 0 && (
              <section className="logs-section">
                <h2>Logs & Risk Analysis</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Event Name</th>
                      <th>Risk Level</th>
                      <th>Reason</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.map((log, index) => (
                      <tr key={index}>
                        <td>{log.eventName}</td>
                        <td>{log.risk}</td>
                        <td>{log.reason}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            )}
          </>
        )}

        {activeMenu === 'customRules' && <CustomRulesEditor />}

        {activeMenu === 'visualization' && (
          <section className="visualization-section">
            <h2>Risk Visualization</h2>
            <div style={{ marginBottom: '20px' }}>
              <label>
                Visualization Type:{' '}
                <select value={vizType} onChange={e => setVizType(e.target.value)}>
                  <option value="pie">Pie Chart</option>
                  <option value="bar">Bar Chart</option>
                  <option value="line">Line Chart</option>
                  <option value="area">Area Chart</option>
                  <option value="radar">Radar Chart</option>
                  <option value="composed">Composed Chart</option>
                </select>
              </label>
            </div>
            {renderVisualization()}
          </section>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
