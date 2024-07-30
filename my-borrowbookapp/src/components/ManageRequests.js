import React, { useEffect, useState } from 'react';
import './ManageRequests.css';

function ManageRequests() {
  const [requests, setRequests] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPendingRequests();
  }, []);

  const fetchPendingRequests = async () => {
    try {
      const response = await fetch('http://localhost:8080/statusbook', {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (data.status === 'ok') {
        setRequests(data.msg);
      } else {
        setError(data.msg);
      }
    } catch (err) {
      setError('Failed to fetch requests.');
    }
  };

  const handleApprove = async (id) => {
    try {
      const response = await fetch(`http://localhost:8080/acceptreq/${id}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });
      const data = await response.json();
      if (response.ok) {
        fetchPendingRequests();
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('Failed to approve request.');
    }
  };

  return (
    <div className="manage-requests-container">
      <h1>Manage Borrow Requests</h1>
      {error && <p className="error-message">{error}</p>}
      <div className="requests-list" style={{marginTop:"20px"}}>
        {requests.map((request) => (
          <div key={request.id} className="request-item">
            <div className="request-info">
              <span className="request-id">Request ID: {request.id}</span>
              <span className={`request-status status-${request.status}`}>
                Status: {request.status}
              </span>
            </div>
            {request.status === 'pending' && (
              <button 
                className="approve-button" 
                onClick={() => handleApprove(request.id)}
              >
                Approve
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default ManageRequests;