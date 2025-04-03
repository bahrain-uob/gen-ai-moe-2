import { Link } from 'react-router-dom'; // Import the Link component for navigation
import '../components/AdminStyle/adminLandingPage.css'; // Link to your custom styles
import { Nav } from '../components/Nav'; 
import AdminUserCheck from '../components/userCheck';

const AdminLandingPage = () => {
  AdminUserCheck();
  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  return (
    <div className="admin-landing-page">
      {/* Navigation Bar */}
      <Nav showLogo={true} entries={navLinks} />

      <div className="container">
        <h1 className="admin-page-title">
          Hello Admin, please choose an option to continue your work!
        </h1>

        <div className="dashboard-cards">
          {/* Button-like Link for Uploading Exams */}
          <Link to="/AdminUploadExams" className="dashboard-card button-link">
            <h3>Manage and upload new exams for students📄</h3>
          </Link>

          {/* Button-like Link for Viewing Student Performance Dashboard Across Bahrain */}
          <Link to="/admin-home" className="dashboard-card button-link">
            <h3>View the performance dashboard of students across Bahrain📊</h3>
          </Link>

          {/* Button-like Link for Viewing Specific School Performance Dashboard */}
          <Link
            to="/chooseschoolperformance"
            className="dashboard-card button-link"
          >
            <h3>View the performance dashboard of a specific school📊</h3>
          </Link>

          {/* Button-like Link for Viewing Top Achievers */}
          <Link to="/studentperformance" className="dashboard-card button-link">
            <h3>View the top-performing students across Bahrain🏆</h3>
          </Link>

          <Link
            to="/chooseschoolachievers"
            className="dashboard-card button-link"
          >
            <h3>View the top-performing students across specific school🏆</h3>
          </Link>

          {/* Button-like Link for Viewing Students' Home */}
          <Link to="/" className="dashboard-card button-link">
            <h3>Access the students' website view</h3>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AdminLandingPage;
