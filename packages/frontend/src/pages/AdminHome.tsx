import { useState, useEffect } from 'react';
import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import { FaSearch } from 'react-icons/fa';
import '../components/AdminStyle/AdminHome.css';
import Graph1 from '../assets/graph2.png';
import Graph2 from '../assets/graph2.png';
import axios from 'axios';

function AdminHome() {
  // State to hold the dynamic data
  const [studentCount, setStudentCount] = useState<number | null>(null);
  const [avgOverallAvg, setAvgOverallAvg] = useState<number | null>(null);
  const [loading, setLoading] = useState<boolean>(true); // To track loading state
  const [error, setError] = useState<string | null>(null); // To track errors

  // Fetch data from the Lambda backend API immediately after component is mounted
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true); // Set loading to true when starting the request
        setError(null); // Clear any previous errors

        // Replace with your actual API endpoint
        const response = await axios.get(
          'https://kpc58nbxyc.execute-api.us-east-1.amazonaws.com/aggregates',
        );

        // Assuming the response has the structure { student_count, avg_overall_avg }
        setStudentCount(response.data.student_count);
        setAvgOverallAvg(response.data.avg_overall_avg);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to fetch data. Please try again later.');
      } finally {
        setLoading(false); // Stop loading after request completes
      }
    };

    fetchData();
  }, []); // Empty dependency array ensures the API is called once when the component mounts

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

        {/* Displaying graphs */}
        <div className="graph-section">
          <div className="graph">
            <h3>Performance Overview</h3>
            <img src={Graph1} alt="Graph 1" />
          </div>
          <div className="graph">
            <h3>Usage Statistics</h3>
            <img src={Graph2} alt="Graph 2" />
          </div>
        </div>
      </main>
    </div>
  );
}

export default AdminHome;
