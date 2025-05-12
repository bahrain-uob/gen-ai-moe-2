import React, { useEffect, useState, useRef } from "react";
import { get } from "aws-amplify/api";
import { post } from 'aws-amplify/api';
import WaveSurfer from "wavesurfer.js";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import AdminUserCheck from '../components/userCheck';
//import { Nav } from '../components/Nav'; // Correct import for Nav

// interface UploadListeningProps {
//   hideLayout?: boolean; // Adding the hideLayout prop
// }

const SpeakingExtractedFilePage: React.FC = (/*{ hideLayout }: UploadListeningProps*/) => {
  AdminUserCheck();
  // const navLinks = [
  //   { text: 'Dashboard', to: '/admin-home' },
  //   { text: 'Upload Exam', to: '/AdminUploadExams' },
  // ];
  
  const [feedback, setFeedback] = useState<string>(""); 
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<string[] | null>(null);
  const audioS3Urls : string[] = [];

  const wavesurferRefs = useRef<(WaveSurfer | null)[]>([]);  // Ref to store WaveSurfer instances for each audio file
  //const [isPlaying, setIsPlaying] = useState(false);
  const sectionName = window.location.pathname?.split('/').pop()?.replace('showExtracted', '') || '';

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        const response: any = await get({
          apiName: "myAPI",
          path: "/getExtractSpeaking",
        });

        const resolvedResponse = await response.response;
        const parsedBody =
          typeof resolvedResponse.body === "string"
            ? JSON.parse(resolvedResponse.body)
            : resolvedResponse.body;

        if (parsedBody) {
          const fileContent = await parsedBody.text();
          const feedbackResults = JSON.parse(fileContent).objectContent;
          setFeedback(feedbackResults);
          setFileContent(feedback); // Update state with file content
        } else {
          setError("Failed to retrieve file content.");
        }
      } catch (err: any) {
        console.error("Error fetching file:", err);
        setError("An error occurred while fetching the file.");
      }

      try {
        const audioResponse: any = await get({
          apiName: "myAPI",
          path: `/getAudioFiles?section=${sectionName}`, 
        });

        const actualAudioFiles = await audioResponse.response;
        const AudioFiles =
          typeof actualAudioFiles.body === "string"
            ? JSON.parse(actualAudioFiles.body)
            : actualAudioFiles.body;

        const txtFiles = await AudioFiles.text();
        console.log("We got it now right? ", txtFiles);

        const parsedFiles = JSON.parse(txtFiles);

        const myAudioFiles = parsedFiles.mp3Files;
        setAudioUrls(myAudioFiles);

        console.log("Only the files here: ", myAudioFiles);

        if (myAudioFiles && myAudioFiles.length > 0) {
          console.log("Fetched audio files:", myAudioFiles);
        } else {
          console.log("No MP3 files found in the S3 bucket.");
        }
      } catch (error) {
        console.error("Error in fetching audio files:", error);
      }
    };

    fetchExtractedFile();
  }, []);

  useEffect(() => {
    // Initialize WaveSurfer instances for each audio URL
  if (audioUrls && audioUrls.length > 0) {
  for (let index = 0; index < audioUrls.length; index++) {
    
    if(index < 7){
    const url = audioUrls[index];
    const waveSurferInstance = WaveSurfer.create({
      container: `#wavesurfer-container-${index}`,
      waveColor: "#9ca3af",
      progressColor: "#4caf50",
      height: 60,
      barWidth: 3,
      barRadius: 2,
      barGap: 2,
    });

    wavesurferRefs.current[index] = waveSurferInstance; // Store instance for each URL
    waveSurferInstance.load(url);
  }else{
    audioS3Urls.push(audioUrls[index])
    console.log("S3 Returned Urls", audioS3Urls)
  }
  }
}

  }, [audioUrls]); // Add audioUrls as a dependency

  const togglePlay = (index: number) => {
    const waveSurferInstance = wavesurferRefs.current[index];
    if (waveSurferInstance) {
      if (waveSurferInstance.isPlaying()) {
        waveSurferInstance.pause();
      } else {
        waveSurferInstance.play();
      }
    }
  };
  

  const container = document.getElementById("container") ? document.getElementById("container") : null;

  useEffect(() => {
    // Create form and textarea only once
    if (container) {
      const form = document.createElement("form");
      form.action = "/ApproveQuestions";
      form.method = "POST";
      form.classList.add("question-section");
      const paragraphs = document.createElement("textarea");
      paragraphs.classList.add("textarea");
      paragraphs.rows = 10;
      paragraphs.style.width = "95%";
      paragraphs.value = feedback;
      form.appendChild(paragraphs);

      
      for(let i=0 ; i<7 ; i++){
      const div = document.createElement("div");
      div.classList.add("audio-section");
      const audioDesc = document.createElement("textarea");
      audioDesc.classList.add("textarea");
      audioDesc.rows = 10;
      audioDesc.style.width = "95%";
      audioDesc.value = `Enter Audio ${i} Description`;
      div.appendChild(audioDesc);
      div.appendChild(document.createElement("br"));
      form.appendChild(div);
      }
      
      container.appendChild(form);

      const statusElement = document.getElementById("status");
      const buttonTry = document.getElementById("btnTry");
      const buttonApprove = document.getElementById("btnApprove");

      if (statusElement && buttonTry && buttonApprove) { 
        statusElement.style.visibility = "hidden";
        buttonTry.style.visibility = "visible";
        buttonApprove.style.visibility = "visible";
      }
    }
  }, [feedback]);

  const approving = async (e: React.FormEvent) => {
    e.preventDefault();
  
    try {
      const buttonApprove = document.getElementById("btnApprove") as HTMLButtonElement | null;
      if(buttonApprove)
        buttonApprove.disabled = true;


      const sections = Array.from(document.getElementsByClassName("question-section")).map((section) => {
        const textarea = section.querySelector("textarea");
        return textarea ? textarea.value : null;
      });

      const audiosDesc = Array.from(document.getElementsByClassName("audio-section")).map((section) => {
        const textarea = section.querySelector("textarea");
        return textarea ? textarea.value : null;
      });
      
    
      const validSections = [ sections.filter((content) => content !== null && content.trim() !== ""), audiosDesc.filter((content) => content !== null && content.trim() !== ""), audioS3Urls ]
      console.log(validSections)
      // Send the gathered data to your Lambda function
      const response = await post({
        apiName: "myAPI",
        path: "/approveSpeaking",
        options: { body: JSON.stringify(validSections) },
      });
  
      console.log("Approve response:", response);

      const handleToastClose = () => {
        window.location.href = "/admin-home";
      };

      toast.success(`Questions Uploaded Successfully!`, {
        onClose: handleToastClose, // Redirect to admin landing page
      });

    } catch (error) {
      console.error(`Approve failed: ${(error as Error).message}`);
      const buttonApprove = document.getElementById("btnApprove") as HTMLButtonElement | null;
      if(buttonApprove)
        buttonApprove.disabled = false;
    }
  };

  return (
    // <div className="upload-page">
    //   {/* Use Nav component here */}
    //   {!hideLayout && <Nav entries={navLinks} />}
    //   {/* Conditionally render Nav based on hideLayout */}
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        height: "1750px",
        backgroundColor: "#f8f9fa",
      }}
    >
      <ToastContainer />
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#333" }}>
        Here is the extracted file:
      </h1>
      <div
        id="container"
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          width: "80%",
          height: "1500px",
          maxHeight: "auto",
          overflowY: "auto",
          wordWrap: "break-word",
          overflowWrap: "break-word",
          whiteSpace: "pre-wrap",
          textAlign: "left",
        }}
      >
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : fileContent ? (
          <pre>{fileContent}</pre>
        ) : (
          <div style={{ textAlign: "center" }}>
            <button
              id="btnTry"
              onClick={() => location.reload()}
              style={{
                backgroundColor: "#4c929f",
                color: "white",
                padding: "1rem 2rem",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                marginTop: "1.5rem",
                fontWeight: "bold",
                visibility: "hidden",
                display: "inline-block",
                marginRight: "25px",
              }}
            >
              Try again
            </button>
            <p style={{ display: "inline-block" }} id="status">
              Loading...
            </p>
            <button onClick = {approving}
              id="btnApprove"
              style={{
                backgroundColor: "#4c929f",
                color: "white",
                padding: "1rem 2rem",
                border: "none",
                borderRadius: "0.5rem",
                cursor: "pointer",
                marginTop: "1.5rem",
                fontWeight: "bold",
                visibility: "hidden",
                display: "inline-block",
                marginLeft: "25px",
              }}
            >
              Approve questions
            </button>
          </div>
        )}
      </div>

      {/* Render audio files as separate icons with start/pause buttons */}
      <div
        style={{
          marginTop: "20px",
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          width: "80%",
        }}
      >
        {audioUrls &&
          audioUrls.map((url, index) => index < 7 && (
            console.log(url),
            <div
              key={index}
              style={{
                margin: "10px",
                padding: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "#fff",
                textAlign: "center",
                width: "200px",
              }}
            > Audio {index}
              <div
                id={`wavesurfer-container-${index}`}
                style={{
                  width: "100%",
                  height: "60px",
                  border: "1px solid #ddd",
                  borderRadius: "4px",
                  marginBottom: "10px",
                }}
              ></div>
              <button
                onClick={() => togglePlay(index)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#4caf50",
                  color: "#fff",
                  border: "none",
                  borderRadius: "5px",
                  cursor: "pointer",
                  fontWeight: "bold",
                }}
              >
                Play / Pause
              </button>
            </div>
          ))}
      </div>
    </div>
    //</div>
  );
};

export default SpeakingExtractedFilePage;
