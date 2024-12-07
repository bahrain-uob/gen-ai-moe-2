import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import { FaSearch } from 'react-icons/fa';
import '../components/AdminStyle/AdminHome.css';
import { get } from 'aws-amplify/api';
import { toJSON } from '../utilities';

function AdminHome() {
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [avgOverallAvg, setAvgOverallAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        await new Promise((resolve) => setTimeout(resolve, 2000));

        const response = await toJSON(
          get({
            apiName: 'myAPI',
            path: '/getAggregates',
          }),
        );
        setStudentCount(response.student_count);
        setAvgOverallAvg(response.avg_overall_avg);
      } catch (error) {
        console.error('Error fetching data:', error);
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