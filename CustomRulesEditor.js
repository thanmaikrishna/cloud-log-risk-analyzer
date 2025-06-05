import React, { useEffect, useState } from 'react';
import '../styles/CustomRulesEditor.css';

const CustomRulesEditor = () => {
  const [rules, setRules] = useState([]);
  const [newRule, setNewRule] = useState({
    eventName: '',
    customRisk: 'Low',
    reason: '',
  });
  const [message, setMessage] = useState('');

  const fetchRules = async () => {
    try {
      const response = await fetch('http://localhost:5000/api/rules', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      setRules(data.customRules || []);
    } catch (err) {
      setMessage('Failed to fetch rules');
    }
  };

  useEffect(() => {
    fetchRules();
  }, []);

  const handleChange = (e) => {
    setNewRule({ ...newRule, [e.target.name]: e.target.value });
  };

  const handleAddRule = async (e) => {
    e.preventDefault();
    setMessage('');
    if (!newRule.eventName.trim() || !newRule.reason.trim()) {
      setMessage('All fields are required.');
      return;
    }

    // Check if eventName already exists (optional)
    if (rules.some(rule => rule.eventName === newRule.eventName)) {
      setMessage('Rule with this event name already exists.');
      return;
    }

    // Add new rule to local rules list
    const updatedRules = [...rules, newRule];

    try {
      const response = await fetch('http://localhost:5000/api/rules/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ customRules: updatedRules }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('✅ Rule added successfully.');
        setNewRule({ eventName: '', customRisk: 'Low', reason: '' });
        setRules(updatedRules); // Update UI immediately
      } else {
        setMessage(data.message || 'Failed to add rule.');
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  const handleDeleteRule = async (eventName) => {
    setMessage('');
    // Filter out the rule to delete
    const updatedRules = rules.filter(rule => rule.eventName !== eventName);

    try {
      const response = await fetch('http://localhost:5000/api/rules/custom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
        body: JSON.stringify({ customRules: updatedRules }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage('🗑️ Rule deleted successfully.');
        setRules(updatedRules);
      } else {
        setMessage(data.message || 'Failed to delete rule.');
      }
    } catch (err) {
      setMessage(`Error: ${err.message}`);
    }
  };

  return (
    <div className="custom-rules-editor">
      <h2>Custom Risk Rules Editor</h2>

      <form onSubmit={handleAddRule} className="custom-rule-form">
        <label>
          Event Name:
          <input
            type="text"
            name="eventName"
            value={newRule.eventName}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Custom Risk:
          <select
            name="customRisk"
            value={newRule.customRisk}
            onChange={handleChange}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
        </label>

        <label>
          Reason:
          <input
            type="text"
            name="reason"
            value={newRule.reason}
            onChange={handleChange}
            required
          />
        </label>

        <button type="submit">➕ Add Rule</button>
      </form>

      {message && <p className="message">{message}</p>}

      <div className="custom-rules-table">
        <h3>Existing Custom Rules</h3>
        <table>
          <thead>
            <tr>
              <th>Event Name</th>
              <th>Risk</th>
              <th>Reason</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {rules.length > 0 ? (
              rules.map((rule, index) => (
                <tr key={index}>
                  <td>{rule.eventName}</td>
                  <td>{rule.customRisk}</td>
                  <td>{rule.reason}</td>
                  <td>
                    <button onClick={() => handleDeleteRule(rule.eventName)}>🗑️ Delete</button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4">No custom rules added yet.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default CustomRulesEditor;
