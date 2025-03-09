import React, { useState } from 'react';
import { Nav } from '../components/Nav'; // Correct import for Nav
import Dropzone from '../components/Dropzone';
import '../components/AdminStyle/Upload.css';
import { post } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import { Link } from 'react-router-dom'; // Import Link for navigation

interface UploadReadingProps {
  hideLayout?: boolean; // Adding the hideLayout prop
}

const UploadReading = ({ hideLayout }: UploadReadingProps) => {
  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  const [readingFile, setReadingFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false); // Track if form is submitted

  // Callback to collect the reading file from Dropzone
  const handleReadingFile = (file: File | null) => setReadingFile(file);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);

    try {
      // Prepare the form data for reading file
      if (readingFile) {
        const readingFormData = new FormData();
        readingFormData.append('file', readingFile);

        await toJSON(
          post({
            apiName: 'myAPI',
            path: `/fileUpload?section=${encodeURIComponent('Reading')}`,
            options: { body: readingFormData },
          }),
        );
      }

      setUploadStatus('Upload successfully!');
      setIsSubmitted(true); // Mark the form as submitted
    } catch (error) {
      setUploadStatus(`Upload failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="upload-page">
      {/* Use Nav component here */}
      {!hideLayout && <Nav entries={navLinks} />}
      {/* Conditionally render Nav based on hideLayout */}
      <div className="container">
        <div className="upload-section">
          <h1 className="page-title">Upload Your Reading Files</h1>
          <p className="page-description">
            Please upload your question files here. Accepted files are of type
            .pdf.
          </p>

          {/* Dropzone for Reading Files */}
          <h2 className="subtitle">Reading Files</h2>
          <Dropzone
            className="dropzone-container"
            acceptedFileTypes={{
              'application/pdf': [], // .pdf files
            }}
            onFileSelected={handleReadingFile} // Pass callback
          />

          <div className="button-container">
            <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
            <Link to="/showExtractedReading">
              <button
                className="extract-btn"
                disabled={!isSubmitted} // Disable until submit is clicked
              >
                Extract
              </button>
            </Link>
          </div>

          {uploadStatus && (
            <p
              className={`upload-status ${
                uploadStatus.startsWith('Upload successfully')
                  ? 'success'
                  : 'error'
              }`}
            >
              {uploadStatus}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default UploadReading;
