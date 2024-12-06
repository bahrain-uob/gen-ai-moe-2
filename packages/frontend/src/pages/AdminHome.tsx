import AdminHeader from '../components/AdminHeader';
import Navbar from '../components/Navbar';
import { FaSearch } from 'react-icons/fa';
import '../components/AdminStyle/AdminHome.css';

import Graph1 from '../assets/graph2.png';
import Graph2 from '../assets/graph2.png';

function AdminHome() {
  return (
    <div>
      <AdminHeader />
      <Navbar />
      <main className="admin-home">
        <div className="dashboard-cards">
          <div className="dashboard-card">
            <h3>Active Users</h3>
            <p>{344}</p>
          </div>

          <div className="dashboard-card">
            <h3>Average</h3>
            <p>{86.2}</p>
          </div>

          <div className="search-bar">
            <input type="text" placeholder="Search..." />
            <FaSearch className="search-icon" />
          </div>
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
