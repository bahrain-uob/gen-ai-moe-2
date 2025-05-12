import React, { useState } from 'react';
import { Nav } from '../components/Nav';
import DropzoneAudio from '../components/DropzoneAudio';
import DropzoneListeningQfiles from '../components/DropzoneListeningQfiles';
import '../components/AdminStyle/Upload.css';
import { post } from 'aws-amplify/api';
import { toJSON } from '../utilities';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { Link } from 'react-router-dom'; // Import Link for navigation
import AdminUserCheck from '../components/userCheck';

interface UploadSpeakingProps {
  hideLayout?: boolean; // Adding the hideLayout prop
}

const UploadSpeaking = ({ hideLayout }: UploadSpeakingProps) => {
  AdminUserCheck();
  const navLinks = [
    { text: 'Dashboard', to: '/admin-home' },
    { text: 'Upload Exam', to: '/AdminUploadExams' },
  ];

  const [audioFiles, setAudioFiles] = useState<File[]>([]); // Multiple audio files
  const [questionFile, setQuestionFile] = useState<File | null>(null);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false); // Track if form is submitted
  const handleToastClose = () => {
    window.location.href = "/showExtractedSpeaking";
  };

  // Callback to collect the multiple audio files from DropzoneAudio
  const handleAudioFiles = (files: File[]) => setAudioFiles(files);

  // Callback to collect the question file from Dropzone
  const handleQuestionFile = (file: File | null) => setQuestionFile(file);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setUploadStatus(null);

    try {
      const section = 'Speaking';
      const allUploadsSuccessful: boolean[] = []; // Track success for each file

      // Prepare the form data for multiple audio files
      if (audioFiles.length > 0) {
        const audioFormData = new FormData();
        audioFiles.forEach((file, index) => {
          // Append each audio file with a unique field name (e.g., 'audioFile1', 'audioFile2', etc.)
          audioFormData.append(`audioFile${index + 1}`, file);
        });

        // API call to upload multiple audio files
        const audioResponse = await toJSON(
          post({
            apiName: 'myAPI',
            path: `/UploadAudio?section=${encodeURIComponent(section)}`,
            options: { body: audioFormData },
          }),
        );
        allUploadsSuccessful.push(!!audioResponse);
      }

      // Handle the question file upload
      if (questionFile) {
        const questionFormData = new FormData();
        questionFormData.append('file', questionFile);

        // API call to upload the question file
        const questionResponse = await toJSON(
          post({
            apiName: 'myAPI',
            path: `/fileUpload?section=${encodeURIComponent(section)}`,
            options: { body: questionFormData },
          }),
        );
        allUploadsSuccessful.push(!!questionResponse);
      }

      // Check if all uploads were successful
      const allSuccessful = allUploadsSuccessful.every(success => success);
      setUploadStatus(
        allSuccessful
          ? 'Uploaded successfully!'
          : 'Some files failed to upload.',
      );
      setIsSubmitted(true); // Mark form as submitted
      toast.success(`Uploaded successfully!: Extracting...`, {
              autoClose: 10000,
              onClose: handleToastClose, // Redirect to Extracted Page
            })

    } catch (error) {
      setUploadStatus(`Upload failed: ${(error as Error).message}`);
      toast.error(`Upload failed: ${(error as Error).message}`, {});
    }
  };

  return (
    <div className="upload-page">
      {/* Conditionally render Nav component based on hideLayout */}
      {!hideLayout && <Nav entries={navLinks} />}
      <ToastContainer />
      <div className="container">
        <div className="upload-section">
          <h1 className="page-title">Upload Your Speaking Files</h1>
          <p className="page-description">
            Upload your audio files and question files.
          </p>

          {/* Dropzone for Audio Files */}
          <h2 className="subtitle">Please upload 7 Audio Files</h2>
          <DropzoneAudio
            className="dropzone-container"
            onFileSelected={handleAudioFiles} // Pass callback for multiple files
          />

          {/* Dropzone for Question Files */}
          <h2 className="subtitle">Question Files</h2>
          <DropzoneListeningQfiles
            className="dropzone-container"
            acceptedFileTypes={{
              'application/pdf': [], // .pdf files
            }}
            onFileSelected={handleQuestionFile} // Pass callback for single file
          />

          <div className="button-container">
            <button className="submit-btn" onClick={handleSubmit}>
              Submit
            </button>
            <Link to="/showExtractedSpeaking">
              <button
                className="extract-btn"
                disabled={!isSubmitted} // Disable until submit is clicked
              >
                Extract
              </button>
            </Link>
          </div>

          {uploadStatus && uploadStatus.startsWith('Uploaded successfully') && (
            <p
              className={`upload-status success}`}
            >
              {toast.success(`${uploadStatus}: Extracting...`, {
                autoClose: 10000,
                onClose: handleToastClose, // Redirect to Extracted Page
              })
              }
            </p>
          )}

          {uploadStatus && (
            <p
              className={`upload-status ${
                uploadStatus.startsWith('Uploaded successfully')
                  ? 'success'
                  : 'error'
              }`}
            >
            </p>
          )}

        </div>
      </div>
    </div>
  );
};

export default UploadSpeaking;
