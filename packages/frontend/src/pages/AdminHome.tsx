import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import { FaSearch } from 'react-icons/fa';
import '../components/AdminStyle/AdminHome.css';


function AdminHome() {
  // State and data-fetching logic (as previously written)
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [avgOverallAvg, setAvgOverallAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(
          'https://kpc58nbxyc.execute-api.us-east-1.amazonaws.com/aggregates',
          {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
          },
        );

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        setStudentCount(data.student_count);
        setAvgOverallAvg(data.avg_overall_avg);
      } catch (error) {
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return (
    <div>
      <AdminHeader />
      <Navbar />
      <main className="admin-home">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Active Users</h3>
            {loading ? <p>Loading...</p> : error ? <p>{error}</p> : <p>{studentCount}</p>}
          </div>

          <div className="dashboard-card">
            <h3>Average</h3>
            {loading ? <p>Loading...</p> : error ? <p>{error}</p> : <p>{avgOverallAvg}</p>}
          </div>
        </div>

        <div className="search-bar">
          <input type="text" placeholder="Search..." />
          <FaSearch className="search-icon" />
        </div>

        <div className="graph-section">
          <div className="graph">
            <h3>Performance Overview</h3>
          
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminHome;
