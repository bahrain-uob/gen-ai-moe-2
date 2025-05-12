import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Nav } from '../components/Nav';
import '../components/AdminStyle/Upload.css';
import AdminUserCheck from '../components/userCheck';

const sections = [
  { name: 'Writing', route: '/uploadWriting' },
  { name: 'Speaking', route: '/uploadSpeaking' },
  { name: 'Reading', route: '/uploadReading' },
  { name: 'Listening', route: '/uploadListening' },
];

const AdminUploadExams: React.FC = () => {
  AdminUserCheck();
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleNavigate = (route: string): void => {
    navigate(route);
  };

  const toggleModal = (): void => {
    setShowModal(prevState => !prevState);
  };

  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  return (
    <div>
      <Nav entries={navLinks} />
      <h3
        style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#4c929f',
          marginTop: '30px',
          textAlign: 'center',
        }}
      >
        Select the Exam Upload Method
      </h3>
      <div style={containerStyle}>
        {/* Button to open modal */}
        <div
          style={boxStyle}
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = '#3b747e')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor = '#4c929f')
          }
          onClick={toggleModal}
        >
          Upload by Section
        </div>
        {/* Redirect to FullExamUpload */}
        <div
          style={boxStyle}
          onMouseEnter={e =>
            (e.currentTarget.style.backgroundColor = '#3b747e')
          }
          onMouseLeave={e =>
            (e.currentTarget.style.backgroundColor = '#4c929f')
          }
          onClick={() => handleNavigate('/FullExamUpload')}
        >
          Upload Full Exam
        </div>
      </div>

      {/* Modal for Upload by Section */}
      {showModal && (
        <div style={modalOverlayStyle}>
          <div style={modalContentStyle}>
            <h3
              style={{
                fontSize: '20px',
                fontWeight: 'bold',
                color: '#4c929f',
                marginBottom: '20px',
              }}
            >
              Select Section to Upload
            </h3>
            <div style={modalContainerStyle}>
              {sections.map(section => (
                <div
                  key={section.name}
                  style={modalBoxStyle}
                  onMouseEnter={e =>
                    (e.currentTarget.style.backgroundColor = '#3b747e')
                  }
                  onMouseLeave={e =>
                    (e.currentTarget.style.backgroundColor = '#4c929f')
                  }
                  onClick={() => handleNavigate(section.route)}
                >
                  {section.name}
                </div>
              ))}
            </div>
            <button style={closeButtonStyle} onClick={toggleModal}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

// Style for the main container
const containerStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'center',
  gap: '30px',
  margin: '50px auto',
  paddingTop: '30px',
};

// Style for the buttons/boxes
const boxStyle: React.CSSProperties = {
  backgroundColor: '#4c929f',
  color: 'white',
  padding: '20px',
  width: '200px',
  height: '150px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '10px',
  cursor: 'pointer',
  fontSize: '22px',
  fontWeight: 'bold',
  textAlign: 'center',
  transition: 'background-color 0.3s ease',
};

// Modal overlay style
const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  zIndex: 1000,
};

// Modal content style
const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  padding: '30px',
  borderRadius: '10px',
  width: '400px',
  textAlign: 'center',
  boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
};

// Container style for modal sections
const modalContainerStyle: React.CSSProperties = {
  display: 'grid',
  gridTemplateColumns: 'repeat(2, 1fr)',
  gap: '20px',
  marginBottom: '20px',
};

// Style for modal boxes
const modalBoxStyle: React.CSSProperties = {
  backgroundColor: '#4c929f',
  color: 'white',
  padding: '15px',
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  borderRadius: '8px',
  cursor: 'pointer',
  fontSize: '18px',
  fontWeight: 'bold',
  textAlign: 'center',
  transition: 'background-color 0.3s ease',
};

// Style for the close button
const closeButtonStyle: React.CSSProperties = {
  backgroundColor: '#4c929f',
  color: 'white',
  padding: '10px 20px',
  border: 'none',
  borderRadius: '5px',
  cursor: 'pointer',
  fontSize: '16px',
  fontWeight: 'bold',
};

export default AdminUploadExams;
