import React, { useState } from 'react';
import { Nav } from '../components/Nav';
import DropzoneListeningQfiles from '../components/DropzoneListeningQfiles';
import '../components/AdminStyle/Upload.css';
import { post } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import DropzoneImageFiles from '../components/DropzoneImagefiles';
import { Link } from 'react-router-dom';

interface UploadWritingProps {
  hideLayout?: boolean;
}

const UploadWriting = ({ hideLayout }: UploadWritingProps) => {
  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  const [imageFile, setImageFile] = useState<File | null>(null);
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Callback to collect the image file from DropzoneImage
  const handleImageFile = (file: File | null) => setImageFile(file);

  // Callback to collect the question file from Dropzone
  const handleQuestionFile = (file: File | null) => setQuestionFile(file);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);

    try {
      const section = 'Writing';
      // Prepare the form data for the image file
      if (imageFile) {
        const imageFormData = new FormData();
        imageFormData.append('file', imageFile);

        await toJSON(
          post({
            apiName: 'myAPI',
            path: `/UploadImage?section=${encodeURIComponent(section)}`,
            options: { body: imageFormData },
          }),
        );
      }

      // Prepare the form data for the question file
      if (questionFile) {
        const questionFormData = new FormData();
        questionFormData.append('file', questionFile);

        await toJSON(
          post({
            apiName: 'myAPI',
            path: `/fileUpload?section=${encodeURIComponent(section)}`,
            options: { body: questionFormData },
          }),
        );
      }

      setUploadStatus('Upload successfully!');
      setIsSubmitted(true);
    } catch (error) {
      setUploadStatus(`Upload failed: ${(error as Error).message}`);
    }
  };

  return (
    <div className="upload-page">
      {/* Conditionally render Nav component based on hideLayout */}
      {!hideLayout && <Nav entries={navLinks} />}
      {/* Conditionally render Nav */}
      <div className="container">
        <div className="upload-section">
          <h1 className="page-title">Upload Your Writing Files</h1>
          <p className="page-description">
            Upload your image files and question files.
          </p>

          {/* Dropzone for Image Files */}
          <h2 className="subtitle">Image Files</h2>
          <DropzoneImageFiles
            className="dropzone-container"
            onFileSelected={handleImageFile} // Pass callback
          />

          {/* Dropzone for Question Files */}
          <h2 className="subtitle">Question Files</h2>
          <DropzoneListeningQfiles
            className="dropzone-container"
            acceptedFileTypes={{
              'application/pdf': [], // .pdf files
            }}
            onFileSelected={handleQuestionFile} // Pass callback
          />

          <div className="button-container">
            <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
            <Link to="/showExtractedWriting">
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

export default UploadWriting;
