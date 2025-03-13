import React, { useEffect, useState } from "react";
import { get } from "aws-amplify/api";
import { post } from 'aws-amplify/api';
//import { toJSON } from '../utilities';
//import { Nav } from '../components/Nav'; // Correct import for Nav

// interface UploadListeningProps {
//   hideLayout?: boolean; // Adding the hideLayout prop
// }

const WritingExtractedFilePage: React.FC = (/*{ hideLayout }: UploadListeningProps*/) => {
  // const navLinks = [
  //   { text: 'Dashboard', to: '/admin-home' },
  //   { text: 'Upload Exam', to: '/AdminUploadExams' },
  // ];

  const [feedback, setFeedback] = useState<string>(""); 
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [audioUrls, setAudioUrls] = useState<string | null>(null);
  var audioS3Urls : string = 'undefined';
  
  const sectionName = window.location.pathname?.split('/').pop()?.replace('showExtracted', '') || '';

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        const response: any = await get({
          apiName: "myAPI",
          path: "/getExtractWriting",
        });

        // Resolve the nested Promise if it exists
        const resolvedResponse = await response.response;
        // Check if body is already an object
        const parsedBody =
          typeof resolvedResponse.body === "string"
            ? JSON.parse(resolvedResponse.body) // Parse if it's a string
            : resolvedResponse.body; // Use directly if it's an object

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

        const myAudioFiles = parsedFiles.image;
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
  console.log(audioUrls)
  const presignedindex = audioUrls.indexOf('?X-Amz')
  audioS3Urls = audioUrls.substring(0,presignedindex);
  console.log("To Be Approved Url:", audioS3Urls)
}

  }, [audioUrls]); // Add audioUrls as a dependency

  const approving = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const buttonApprove = document.getElementById("btnApprove") as HTMLButtonElement | null;
      if(buttonApprove)
        buttonApprove.disabled = true;
      // Gather the content of all "textarea" elements within the "question-section" divs
      const sections = Array.from(document.getElementsByClassName("question-section")).map((section) => {
        const textarea = section.querySelector("textarea");
        return textarea ? textarea.value : null;
      });
  
      // Filter out null or empty values
      const validSections = sections.filter((content) => content !== null && content.trim() !== "");
      const payload = {
        validSections,
        audioS3Urls, // Ensure `audioUrls` is defined in your component or state
      };
  
      // Send the gathered content to your Lambda function
      const response = await post({
        apiName: "myAPI",
        path: "/approveWriting",
        options: { body:  payload  },
      });
  
      console.log("Approve response:", response);
      alert("Questions Saved Successfully!")
      // Redirect to admin landing page
      window.location.href = "/admin-home";
    } catch (error) {
      console.error("Approve failed:", (error as Error).message);
      const buttonApprove = document.getElementById("btnApprove") as HTMLButtonElement | null;
      if(buttonApprove)
        buttonApprove.disabled = false;
    }
    
    
  };
  
  console.log("our feedback:", feedback); // for testing

  const container = document.getElementById("container") ? document.getElementById("container") : null;
   useEffect(() => {
    if (container) {
      const statusElement = document.getElementById("status");
      const buttonTry = document.getElementById("btnTry");
      const buttonApprove = document.getElementById("btnApprove");

      if (statusElement && buttonTry && buttonApprove) { 
        statusElement.style.visibility = "hidden";
        buttonTry.style.visibility = "visible";
        buttonApprove.style.visibility = "visible";
      }
    }

    // Split text by "Question"
    const sections = feedback.split("Question").filter(section => section.trim() !== "");
    const form = document.createElement("form");
    form.action = "/ApproveQuestions";
    form.method = "POST";


    // Generate divs dynamically
    sections.forEach(section => {
      // Create a new div for each "BREAK" section
      const div = document.createElement("div");
      div.classList.add("question-section");
      // Add question as a heading
      const questionHeading = document.createElement("textarea");
      questionHeading.value = section;
      questionHeading.style.width = "100%";
      questionHeading.style.border = "1px solid grey";
      questionHeading.rows = 10
      div.appendChild(document.createElement("br"));
      div.appendChild(questionHeading);
      div.appendChild(document.createElement("br"));
      form.appendChild(div);
    });
    container?.appendChild(form);
  }, [feedback]);
  
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
        height: "100vh",
        backgroundColor: "#f8f9fa",
      }}
    >
      <h1 style={{ fontSize: "2.5rem", fontWeight: "bold", color: "#333" }}>
        Here is the extracted file:
      </h1>
      <div
        id="container" // Add the id attribute here
        style={{
          marginTop: "20px",
          padding: "20px",
          border: "1px solid #ddd",
          borderRadius: "8px",
          backgroundColor: "rgba(255, 255, 255, 0.9)",
          width: "80%", // Adjust to take more horizontal space
          maxHeight: "auto", // Limit height
          overflowY: "auto", // Add vertical scrolling if needed
          wordWrap: "break-word", // Ensure long words break properly
          overflowWrap: "break-word", // Break long words within content
          whiteSpace: "pre-wrap", // Preserve whitespace and line breaks
          textAlign: "left", // Align text to the left
        }}
      >
        {error ? (
          <p style={{ color: "red" }}>{error}</p>
        ) : fileContent ? (
          <pre>{fileContent}</pre>
        ) : (<div style={{textAlign: "center"}}>
          <button id="btnTry" onClick={() => location.reload()} style={{
            backgroundColor: "#4c929f",
            color: "white",
            padding: "1rem 2rem",
            border: "none",
            borderRadius: "0.5rem",
            cursor: "pointer",
            marginTop: "1.5rem",
            fontWeight: "bold",
            visibility: "hidden",
            //float: "right",
            display: "inline-block",
            marginRight: "25px",
          }}>Try again</button>
          <p style={{display: "inline-block",}} id="status">Loading...</p>
          <button onClick = {approving} id="btnApprove"
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
            //float: "right",
            display: "inline-block",
            marginLeft: "25px",
          }}
          >
            Approve questions
          </button>          

          </div>
          
        )}
      </div>
      <div>
      <img
  src={audioUrls ? audioUrls: undefined}
  alt="Extracted file"
  style={{
    maxWidth: "100%",
    height: "200px",
    border: "1px solid #ddd",
    borderRadius: "8px",
    marginTop: "20px",
  }}
/>

      </div>
    </div>
    //</div>
  );
};

export default WritingExtractedFilePage;
