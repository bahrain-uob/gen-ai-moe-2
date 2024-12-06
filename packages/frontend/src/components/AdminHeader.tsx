import { useState } from 'react';
import './AdminStyle/header.css';
import { FaUserCircle } from 'react-icons/fa';

function AdminHeader() {
  const [showMenu, setShowMenu] = useState(false); // Toggle the menu visibility

  const handleToggleMenu = () => {
    setShowMenu(!showMenu);
  };

  //no logic for now
  const handleLogout = () => {
    console.log('Logging out...');
  };

  const handleAccount = () => {
    console.log('Opening account page...');
  };

  return (
    <header className="header">
      <div className="logo">LINGUI</div>
      <nav>
        <ul>
          <li>
            <a href="/dashboard" className="nav-link">
              Dashboard
            </a>
          </li>
          <li>
            <a href="/generate-exams" className="nav-link">
              Generate Exams
            </a>
          </li>
          <li>
            <a href="/AdminUploadExams" className="nav-link">
              Upload Exams
            </a>
          </li>
        </ul>
      </nav>
      <div className="user-menu">
        <FaUserCircle className="user-icon" onClick={handleToggleMenu} />
        {showMenu && (
          <div className="user-dropdown">
            <button onClick={handleAccount} className="dropdown-item">
              Account
            </button>
            <button onClick={handleLogout} className="dropdown-item">
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

export default AdminHeader;
