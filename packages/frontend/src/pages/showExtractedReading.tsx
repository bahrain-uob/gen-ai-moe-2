import React, { useEffect, useState } from "react";
import { get } from "aws-amplify/api";
import { post } from 'aws-amplify/api';
//import { Nav } from '../components/Nav'; // Correct import for Nav
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// interface UploadListeningProps {
//   hideLayout?: boolean; // Adding the hideLayout prop
// }

const ReadingExtractedFilePage: React.FC = (/*{ hideLayout }: UploadListeningProps*/) => {
  // const navLinks = [
  //   { text: 'Dashboard', to: '/admin-home' },
  //   { text: 'Upload Exam', to: '/AdminUploadExams' },
  // ];

  const [feedback, /*setFeedback*/] = useState<string>(""); 
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passages, setPassages] = useState<string[]>([]);
  const [firstSetQuestions, setFirstSetQuestions] = useState<string | null>(null);
  const [secondSetQuestions, setSecondSetQuestions] = useState<string | null>(null);
  const [thirdSetQuestions, setThirdSetQuestions] = useState<string | null>(null);

  useEffect(() => {
    const fetchExtractedFile = async () => {
      try {
        const response: any = await get({
          apiName: "myAPI",
          path: "/getExtractReading",
        });

        // Resolve the nested Promise if it exists
        const resolvedResponse = await response.response;
        if(resolvedResponse.statusCode >= 500){
          const statusElement = document.getElementById("status");
          if(statusElement)
          statusElement.textContent = `${resolvedResponse.body.message}, Please try again later`
        }
        // Check if body is already an object
        const parsedBody =
          typeof resolvedResponse.body === "string"
            ? JSON.parse(resolvedResponse.body) // Parse if it's a string
            : resolvedResponse.body; // Use directly if it's an object

        if (parsedBody) {
          const fileContent = await parsedBody.text();
          const passage1 = JSON.parse(fileContent).passage1;
          const passage2 = JSON.parse(fileContent).passage2;
          const passage3 = JSON.parse(fileContent).passage3;
          const firstSetQuestions = JSON.parse(fileContent).firstQuestions;
          const secondSetQuestions = JSON.parse(fileContent).secondQuestions;
          const thirdSetQuestions = JSON.parse(fileContent).thirdQuestions;
          setFirstSetQuestions(firstSetQuestions);
          setSecondSetQuestions(secondSetQuestions);
          setThirdSetQuestions(thirdSetQuestions);
          setPassages([passage1, passage2, passage3,firstSetQuestions,secondSetQuestions,thirdSetQuestions]);
          setFileContent(feedback); // Update state with file content
          //console.log("The entire returned from Api:" , fileContent)
          console.log(passage1)
          console.log(passage2)
          console.log(passage3)
          console.log(firstSetQuestions)
          console.log(secondSetQuestions)
          console.log(thirdSetQuestions)
        } else {
          setError("Failed to retrieve file content.");
        }
      } catch (err: any) {
        console.error("Error fetching file:", err);
        setError("An error occurred while fetching the file.");
      }
    };
    fetchExtractedFile();
  }, []);
  let title1 = ""
  let title2 = ""
  let title3 = ""
  let pass1 = ""
  let pass2 = ""
  let pass3 = ""
  const approving = async (e: React.FormEvent) => {
    e.preventDefault();
    var unAnswered: string[] = [];
    let validInput = true;
  
    try {
      const buttonApprove = document.getElementById("btnApprove") as HTMLButtonElement | null;
      if(buttonApprove)
        buttonApprove.disabled = true;
      // Gather the content of all "question-section" divs and their inputs
      const sections = Array.from(document.getElementsByClassName("question-section")).map((section) => {
      const question = (section.querySelector("input.question-input0") as HTMLInputElement)?.value || "";
        
        // Gather choices
        const choices = Array.from(section.querySelectorAll("input[type='text'].editable-choice0")).map(
          (input) => (input as HTMLInputElement).value
        );
  
        // Gather selected answers
        const selectedAnswer = (section.querySelector("input[type='radio']:checked") as HTMLInputElement)?.value || null;
        if(question && !selectedAnswer){
          //alert(`Please selected the correct answer for \"${question}\"`)
          unAnswered.push(question[0] + (question[1] == '.' ? '' : question[1]))
          validInput = false;
        }
  
        return {
          question,
          choices,
          selectedAnswer,
          
        };
      });
      const sections2 = Array.from(document.getElementsByClassName("question-section")).map((section) => {
        const question = (section.querySelector("input.question-input1") as HTMLInputElement)?.value || "";
          
          // Gather choices
          const choices = Array.from(section.querySelectorAll("input[type='text'].editable-choice1")).map(
            (input) => (input as HTMLInputElement).value
          );
    
          // Gather selected answers
          const selectedAnswer = (section.querySelector("input[type='radio']:checked") as HTMLInputElement)?.value || null;
          if(question && !selectedAnswer){
            //alert(`Please selected the correct answer for \"${question}\"`)
            unAnswered.push(question[0] + (question[1] == '.' ? '' : question[1]))
            validInput = false;
          }
    
          return {
            question,
            choices,
            selectedAnswer,
            
          };
        });
        const sections3 = Array.from(document.getElementsByClassName("question-section")).map((section) => {
          const question = (section.querySelector("input.question-input2") as HTMLInputElement)?.value || "";
            
            // Gather choices
            const choices = Array.from(section.querySelectorAll("input[type='text'].editable-choice2")).map(
              (input) => (input as HTMLInputElement).value
            );
      
            // Gather selected answers
            const selectedAnswer = (section.querySelector("input[type='radio']:checked") as HTMLInputElement)?.value || null;
            if(question && !selectedAnswer){
              //alert(`Please selected the correct answer for \"${question}\"`)
              unAnswered.push(question[0] + (question[1] == '.' ? '' : question[1]))
              validInput = false;
            }
      
            return {
              question,
              choices,
              selectedAnswer,
              
            };
          });
  
      // Filter out empty questions
      
      //const validSections = [pass1, pass2 , pass3 , title1 , title2 , title3 , sections.filter((section) => section.question.trim() !== "")];

      if (validInput){
      const validSections = [    [title1, pass1, sections.filter((section) => section.question.trim() !== "")],[title2, pass2, sections2.filter((section) => section.question.trim() !== "")],[title3, pass3, sections3.filter((section) => section.question.trim() !== "")]    ]
      console.log(validSections)
      // Send the gathered data to your Lambda function
      const response = await post({
        apiName: "myAPI",
        path: "/approveReading",
        options: { body: JSON.stringify(validSections) },
      });
  
      console.log("Approve response:", response);

      const handleToastClose = () => {
         window.location.href = "/admin-home";
      };

      toast.success(`Questions Uploaded Successfully!`, {
        onClose: handleToastClose, // Redirect to admin landing page
      });
      
    }else{
    if(buttonApprove)
      buttonApprove.disabled = false;
    toast.error(`Please Select Answers for all Questions: ${unAnswered}`, {});
    }
    } catch (error) {
      console.error(`Approve failed: ${(error as Error).message}`);
      const buttonApprove = document.getElementById("btnApprove") as HTMLButtonElement | null;
      if(buttonApprove)
        buttonApprove.disabled = false;
    }
  };
  
  
  console.log("our feedback:", feedback); // for testing

  const container = document.getElementById("container") ? document.getElementById("container") : null;
  


  if(firstSetQuestions && secondSetQuestions && thirdSetQuestions && container && passages.length > 2) {
  const form = document.createElement("form");
  form.action = "/ApproveQuestions";
  form.method = "POST";
  const allQuestions = [firstSetQuestions, secondSetQuestions, thirdSetQuestions];

  // Create a form element

  // Iterate over each set of questions
  let i = 0;
  allQuestions.forEach(questionSet => {
    
  // Split the questions into sections using "BREAK" as the delimiter
  const sections = questionSet.split(/BREAK/).map(section => section.trim()).filter(Boolean);
  let j = 0;
  sections.forEach(section => {
    const div = document.createElement("div");
      const passTitleRegex = /^PASSTITLE(.+)$/m; 
      const passageRegex = /^PASSAGE([\s\S]+)$/m; 
  
      const createTextArea = (passage: string) => {
        const textArea = document.createElement("textarea");
        textArea.classList.add("paragraph");
        textArea.rows = 10; // Number of lines (height)
        textArea.cols = 70; // Number of characters per line (width)
        console.log(" the full current passage is: " , passage)
        const passTitleMatch = passage.match(passTitleRegex);
        const passageMatch = passage.match(passageRegex);
        console.log("the title after regex: " , passTitleMatch)
        console.log("the passage after regex: " , passTitleMatch)
        
  
        const passageTitle = passTitleMatch ? passTitleMatch[1] : "";
        const passageContent = passageMatch ? passageMatch[1] : "";
        const completePassage = `${passageTitle}\n${passageContent}`; // Combine title and content
        if(i == 0){
          title1 = passageTitle
          pass1 = passageContent
        }
        else if(i == 1){
          title2 = passageTitle
          pass2 = passageContent
        }
        else if(i == 2){
          title3 = passageTitle
          pass3 = passageContent
        }
  
        textArea.value = completePassage;
        div.appendChild(textArea);
        let breakLine = document.createElement("br")
        div.appendChild(breakLine);
  
      };
  
      // Iterate through passages and create text areas
    
    if(i==0 && j==0){
      console.log("passgae 0");
      createTextArea(passages[0])
    }
    else if(i==1 && j==0 ){
      console.log("passgae 1");
      createTextArea(passages[1])
    }
    else if(i==2 && j==0){
      console.log("passgae 2");
      createTextArea(passages[2])}
    j++;
    // Extract question and choices
    const [question, ...choices] = section.split("CHOICE").map(line => line.trim()).filter(Boolean);

    // Create a new div for each "BREAK" section
    // const div = document.createElement("div");
    div.classList.add("question-section");

    // Add question as a heading (editable input)
    const questionHeading = document.createElement("input");
    questionHeading.classList.add(`question-input${i}`);
    questionHeading.value = question;
    questionHeading.style.width = "100%";
    questionHeading.style.height = "auto";
    questionHeading.style.border = "1px solid grey";

    div.appendChild(document.createElement("br"));
    div.appendChild(questionHeading);
    div.appendChild(document.createElement("br"));

    // Handle True/False questions separately
    if (question.includes("True") && question.includes("False")) {
      const trueRadio = document.createElement("input");
      trueRadio.type = "radio";
      trueRadio.name = question;
      trueRadio.value = "True";

      const trueInput = document.createElement("input");
      trueInput.type = "text";
      trueInput.value = "True";
      trueInput.style.width = "90%";
      trueInput.classList.add(`editable-choice${i}`);
      trueInput.style.border = "1px solid grey";

      const falseRadio = document.createElement("input");
      falseRadio.type = "radio";
      falseRadio.name = question;
      falseRadio.value = "False";

      const falseInput = document.createElement("input");
      falseInput.type = "text";
      falseInput.value = "False";
      falseInput.style.width = "90%";
      falseInput.classList.add(`editable-choice${i}`);
      falseInput.style.border = "1px solid grey";

      // Append True/False choices
      div.appendChild(trueRadio);
      div.appendChild(trueInput);
      div.appendChild(document.createElement("br"));
      div.appendChild(falseRadio);
      div.appendChild(falseInput);
    } else {
      // Add radio buttons and text inputs for choices
      choices.forEach(choice => {
        const radio = document.createElement("input");
        radio.type = "radio";
        radio.name = question;
        radio.value = choice;

        const input = document.createElement("input");
        input.type = "text";
        input.value = choice;
        input.style.width = "90%";
        input.classList.add(`editable-choice${i}`);
        input.style.border = "1px solid grey";

        div.appendChild(radio);
        div.appendChild(input);
        div.appendChild(document.createElement("br"));
      });
    }

    form.appendChild(div);
  });
  i++
  });

  // Append the form to the container
  container?.appendChild(form);
}

  /*
  // Generate divs dynamically
  sections.forEach(section => {
    // Extract question and choices
    //const [question, ...choices] = section.split("a)").map(line => line.trim()).filter(line => line);
    const [question, ...choices] = section.split("CHOICE").map(line => line.trim()).filter(line => line);
    // Create a new div for each "BREAK" section
    const div = document.createElement("div");
    div.classList.add("question-section");

    // Add question as a heading
    const questionHeading = document.createElement("input");
    questionHeading.classList.add("question-input");
    questionHeading.value = question;
    questionHeading.style.width = "100%";
    questionHeading.style.height = "auto";
    questionHeading.style.border = "1px solid grey";


    div.appendChild(document.createElement("br"));
    div.appendChild(questionHeading);
    div.appendChild(document.createElement("br"));

    // Add radio buttons and text inputs for choices
    if(question.includes("True") && question.includes("False")){
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = question; // Group radios by question
      radio.value = "True" // Cleaned-up value
      const choiceA = document.createElement("input");
      choiceA.type = "Text"
      choiceA.value = "True";
      const radio2 = document.createElement("input");
      radio2.type = "radio";
      radio.name = question; // Group radios by question
      radio2.value = "False" // Cleaned-up value
      const choiceB = document.createElement("input");
      choiceB.type = "Text"
      choiceB.value = "False";
      choiceA.style.width = "90%"; // Adjusted width to make the text box longer
      choiceA.classList.add("editable-choice");
      choiceB.style.width = "90%"; // Adjusted width to make the text box longer
      choiceB.classList.add("editable-choice");
      div.appendChild(radio);
      choiceA.style.border = "1px solid grey";
      div.appendChild(choiceA)
      div.appendChild(document.createElement("br"));
      div.appendChild(radio2);
      choiceB.style.border = "1px solid grey";
      div.appendChild(choiceB)

      

    }
    choices.forEach(choice => {
      // Create the radio button
      const radio = document.createElement("input");
      radio.type = "radio";
      radio.name = question; // Group radios by question
      radio.value = choice.replace(/^CHOICE/, ""); // Cleaned-up value

      // Create the text input
      const input = document.createElement("input");
      input.type = "text";
      input.value = choice.replace(/^CHOICE/, ""); // Removing "CHOICE" from the text
      input.style.width = `90%`; // Adjusted width to make the text box longer
      input.classList.add("editable-choice");
      input.name = question;
      input.style.border = "1px solid grey";

      // Append the radio button and text input to the div
      div.appendChild(radio);
      div.appendChild(input);

      // Add a line break after each set of inputs
      div.appendChild(document.createElement("br"));
    });

    form.appendChild(div);
  });
  container?.appendChild(form);
  */
  const statusElement = document.getElementById("status");
  const buttonTry = document.getElementById("btnTry");
  const buttonApprove = document.getElementById("btnApprove");
  


  if (statusElement && buttonTry && buttonApprove)
  { 
    statusElement.style.visibility = "hidden";
    buttonTry.style.visibility = "visible";
    buttonApprove.style.visibility = "visible";
  }
    
  

  
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
      <ToastContainer />
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

          </div>)}
      </div>
    </div>
    //</div>
  );
};

export default ReadingExtractedFilePage;


