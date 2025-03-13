import React, { useEffect, useState,useRef } from "react";
import { get } from "aws-amplify/api";
//import { Nav } from '../components/Nav'; // Correct import for Nav
//import { /*ToastContainer*/ toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { post } from 'aws-amplify/api';
import WaveSurfer from "wavesurfer.js";

// interface UploadListeningProps {
//   hideLayout?: boolean; // Adding the hideLayout prop
// }

const ListeningExtractedFilePage: React.FC = (/*{ hideLayout }: UploadListeningProps*/) => {
  // const navLinks = [
  //   { text: 'Dashboard', to: '/admin-home' },
  //   { text: 'Upload Exam', to: '/AdminUploadExams' },
  // ];


const [feedback, setFeedback] = useState<string>(""); 
const [fileContent, setFileContent] = useState<string | null>(null);
const [error, setError] = useState<string | null>(null);
const [audioUrls, setAudioUrls] = useState<string[] | null>(null);
var audioS3Urls: string[] = [];
const wavesurferRefs = useRef<(WaveSurfer | null)[]>([]);  // Ref to store WaveSurfer instances for each audio file

  
const sectionName = window.location.pathname?.split('/').pop()?.replace('showExtracted', '') || '';

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        
        const response: any = await get({
          apiName: "myAPI",
          path: `/getExtract`,
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
          const feedbackResults = JSON.parse(fileContent).feedbackResults;
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
  for (let index = 0; index < audioUrls.length; index++) { //audioUrls is expected to always be of length 8

    if (index < 4){
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
  }else{ // Do this only once tto save all 
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



  // const handleToastClose = () => {
  //   window.location.href = '/adminLandingPage';
  //};
  
  const approving = async (e: React.FormEvent) => {
    let validInput = true;
    try{
      e.preventDefault();
      const buttonApprove = document.getElementById("btnApprove") as HTMLButtonElement | null;
      if(buttonApprove)
        buttonApprove.disabled = true;

      const sections = Array.from(document.getElementsByClassName("question-section")).map((section) => {
        const question = (section.querySelector("input.question-input") as HTMLInputElement)?.value || "";
          
          // Gather choices
          const choices = Array.from(section.querySelectorAll("input[type='text'].editable-choice")).map(
            (input) => (input as HTMLInputElement).value
          );
    
          // Gather selected answers
          const selectedAnswer = (section.querySelector("input[type='radio']:checked") as HTMLInputElement)?.value || null;
          if(question && !selectedAnswer){
            alert(`Please selected the correct answer for \"${question}\"`)
            validInput = false;
          }
    
          return {
            question,
            choices,
            selectedAnswer,
            
          };
        });
        if (validInput){
          const validSections = sections.filter((section) => section.question.trim() !== "")
          console.log(validSections)
          // Send the gathered data to your Lambda function
          const requestData = {
            validSections,
            audioS3Urls,
          };
          const response = await post({
            apiName: "myAPI",
            path: "/approveListening",
            options: { body: JSON.stringify(requestData) },
          });
      
          console.log("Approve response:", response);
    
          alert("Questions Saved Successfully!")
          // Redirect to admin landing page
          window.location.href = "/admin-home";
        }else{
        if(buttonApprove)
          buttonApprove.disabled = false;
        }
        
      //setUploadStatus(null);
  
      //try {
        // Prepare the form data for audio file
        // if (audioFile) {
        //   const audioFormData = new FormData();
        //   audioFormData.append('file', audioFile);
  
        //   await toJSON(
        //     post({
        //       apiName: 'myAPI',
        //       path: '/adminUploadAudio',
        //       options: { body: audioFormData },
        //     }),
        //   );
        // }
  
        // Prepare the form data for question file
        // if (questionFile) {
        //   const questionFormData = new FormData();
        //   questionFormData.append('file', questionFile);
  
        //   await toJSON(
        //     post({
        //       apiName: 'myAPI',
        //       path: '/adminUpload',
        //       options: { body: questionFormData },
        //     }),
        //   );
        // }
  
        // setUploadStatus('Upload successfully!');
    
      } catch (error) {
        // setUploadStatus(`Upload failed: ${(error as Error).message}`);
        console.log(`Approve failed: ${(error as Error).message}`)
      }
    };
  
  console.log("our feedback:", feedback); // for testing

  const container = document.getElementById("container") ? document.getElementById("container") : null;
   useEffect(() => {
      // Create form and textarea only once
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
      // Split text by "BREAK"
  const sections = feedback.split(/BREAK /).filter(section => section.trim() !== "");
  const form = document.createElement("form");
  form.action = "/ApproveQuestions";
  form.method = "POST";


  // Generate divs dynamically
  sections.forEach(section => {
    // Extract question and choices
    const [question, ...choices] = section.split("\n").map(line => line.trim()).filter(line => line);

    // Create a new div for each "BREAK" section
    const div = document.createElement("div");
    div.classList.add("question-section");

    // Add question as a heading
    const questionHeading = document.createElement("input");
    questionHeading.classList.add(`question-input`);
    questionHeading.value = question;
    questionHeading.style.width = "100%";
    questionHeading.style.border = "1px solid grey";
    div.appendChild(document.createElement("br"));
    div.appendChild(questionHeading);
    div.appendChild(document.createElement("br"));


    // Add radio buttons and text inputs for choices
    choices.forEach(choice => {
      // Create the radio button
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = question; // Group radios by question
      radio.value = choice.replace(/^CHOICE\s/, ""); // Cleaned-up value

      // Create the text input
      const input = document.createElement("input");
      input.type = "text";
      input.value = choice.replace(/^CHOICE\s/, ""); // Removing "CHOICE" from the text
      input.style.width = "90%"; // Adjusted width to make the text box longer
      input.classList.add("editable-choice");
      input.name = question;
      input.style.border = "1px solid grey";

      // Append the radio button and text input to the div
      div.appendChild(radio);
      div.appendChild(input);

      // Add a line break after each set of inputs
      div.appendChild(document.createElement("br"));
    });

    // Append the div to the container
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
          audioUrls.map((url, index) => index < 4 && (
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
            >
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

export default ListeningExtractedFilePage;
