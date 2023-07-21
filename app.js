let tg = window.Telegram.WebApp;


ClassicEditor.create(document.querySelector("#myeditor"), {
    removePlugins: ["Heading"],
    toolbar: ["italic", "link", "bold"], // Include 'bold', 'italic', and 'link' in the toolbar configuration
})
    .then((newEditor) => {
        editor = newEditor;

        // Set the CKEditor text color explicitly
        const editorDocument = newEditor.ui.getEditableElement().parentElement;
        editorDocument.style.color = "white";
    })
    .catch((error) => {
        console.log(error);
    });


function setQuestionIdInURL(questionId) {
    // Update the URL with the question_id as a query parameter
    window.history.pushState({}, "", `index.html?question_id=${questionId}`);
}


const urlParams = new URLSearchParams(window.location.search);
const questionId = urlParams.get("question_id");



function fetchAllGroups() {
    const groupsApiUrl = "https://gazoblok-bukhara.uz/groups";
    fetch(groupsApiUrl)
        .then((response) => response.json())
        .then((groupsData) => {
            const selectOption = document.getElementById("selectOption");
            groupsData.forEach((group) => {
                const option = document.createElement("option");
                option.value = group.id;
                option.textContent = group.name;
                selectOption.appendChild(option);
            });

            // After populating the dropdown, fetch the question data and set the selected group
            fetchQuestionData();
        })
        .catch((error) => console.error("Error fetching groups data:", error));
}

// Function to fetch data from an API and populate the form fields
let editor; // Declare the editor variable outside the fetchQuestionData function

function fetchQuestionData() {
    const questionApiUrl = `https://gazoblok-bukhara.uz/question/${questionId}`;
    fetch(questionApiUrl)
        .then((response) => response.json())
        .then((questionData) => {
            document.getElementById("emailInput").value = questionData.question;

            // Replace \n with <br> tags for new lines
            const formattedAnswer = questionData.answer.replace(/\n/g, "<br>");

            if (!editor) {
                // Initialize CKEditor with custom configuration on the "myeditor" textarea only if editor is not already initialized
                ClassicEditor.create(document.querySelector("#myeditor"), {
                    removePlugins: ["Heading"],
                    toolbar: ["italic", "link", "bold"], // Include 'bold', 'italic', and 'link' in the toolbar configuration
                })
                    .then((newEditor) => {
                        editor = newEditor;
                        editor.setData(formattedAnswer); // Set the content of CKEditor with formatted answer
                    })
                    .catch((error) => {
                        console.error(error);
                    });
            } else {
                // If editor is already initialized, set the content of CKEditor with formatted answer
                editor.setData(formattedAnswer);
            }

            // Set the selected group based on the group_id of the question
            document.getElementById("selectOption").value = questionData.group_id;
        })
        .catch((error) => console.error("Error fetching question data:", error));
}




function formatContentForEditor(content) {
    // Remove <p> tags from the content
    const withoutPTags = content.replace(/<p[^>]*>/g, "").replace(/<\/p>/g, "");
    // Replace <br> tags with \n
    const formattedContent = withoutPTags.replace(/<br>/g, "\n");
    return formattedContent;
}
function updateQuestion() {
    const questionApiUrl = `https://gazoblok-bukhara.uz/question/${questionId}`;
    const formData = {
        question: document.getElementById("emailInput").value,
        answer: formatContentForEditor(editor.getData()).replace(/&nbsp;/g, " "), // Format CKEditor's content without <p> tags
        group_id: document.getElementById("selectOption").value,
    };

    fetch(questionApiUrl, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
    })
        .then((response) => response.json())
        .then((data) => {
            // Handle the response as needed
            console.log("Question data updated:", data);
            tg.close();
        })
        .catch((error) => console.error("Error updating question data:", error));
}







// Populate the form fields with data on page load
if (questionId) {
    fetchAllGroups();
    fetchQuestionData();
}
// Add event listener to the "Отправить" (Submit) button
document.getElementById("submitBtn").addEventListener("click", updateQuestion);



document.getElementById("deleteBtn").addEventListener("click", deleteQuestion);

function deleteQuestion() {
  // Check if the question has an ID before making the API call
  if (questionId) {
    const questionApiUrl = `https://gazoblok-bukhara.uz/question/${questionId}`;
    fetch(questionApiUrl, {
      method: "DELETE",
    })
      .then((response) => response.json())
      .then((data) => {
        // Handle the response as needed
        console.log("Question deleted:", data);
        tg.close();
        // After successfully deleting the question, you can redirect the user or perform other actions if required.
        // For example, you can redirect the user to a new page or update the UI accordingly.
      })
      .catch((error) => console.error("Error deleting question:", error));
  } else {
    console.error("Question ID not found. Cannot delete the question.");
  }
}