// src/components/RiskDashboard.js

import React from 'react';

function RiskDashboard({ logs }) {
  return (
    <div className="dashboard-container">
      <h2>Logs & Risk Analysis</h2>
      <table className="logs-table">
        <thead>
          <tr>
            <th>Event Name</th>
            <th>Risk Level</th>
            <th>Reason</th>
          </tr>
        </thead>
        <tbody>
          {logs.length === 0 ? (
            <tr>
              <td colSpan="3">No logs available</td>
            </tr>
          ) : (
            logs.map((log, index) => (
              <tr key={index}>
                <td>{log.eventName || 'N/A'}</td>
                <td>{log.risk}</td>
                <td>{log.reason}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

export default RiskDashboard;
