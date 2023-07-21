CKEDITOR.replace('myeditor', {
    // Define the toolbar groups as it is a more accessible solution.
    toolbarGroups: [
        { name: 'links', groups: ['links'] },
        { name: 'basicstyles', groups: ['basicstyles'] }, // Include basicstyles group
    ],
    enterMode: CKEDITOR.ENTER_BR,
    // Remove the redundant buttons from toolbar groups defined above.
    removeButtons: 'Underline,Strike,Subscript,Superscript,Anchor,Styles,Specialchar,PasteFromWord, Body'
});
let tg = window.Telegram.WebApp;




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

// // Function to fetch data from an API and populate the form fields
function fetchQuestionData() {
    const questionApiUrl = `https://gazoblok-bukhara.uz/question/${questionId}`;
    fetch(questionApiUrl)
        .then((response) => response.json())
        .then((questionData) => {
            document.getElementById("emailInput").value = questionData.question;

            // Replace \n with <br> tags for new lines
            const formattedAnswer = questionData.answer.replace(/\n/g, "<br>");

            // Replace regular spaces with &nbsp;
            const spaceFormattedAnswer = formattedAnswer.replace(/ /g, "&nbsp;");

            // Destroy the existing editor instance, if any, before initializing CKEditor
            if (CKEDITOR.instances.myeditor) {
                CKEDITOR.instances.myeditor.destroy();
            }

            // Initialize CKEditor with custom configuration on the "myeditor" textarea
            CKEDITOR.replace("myeditor", {
                toolbarGroups: [
                    { name: "links", groups: ["links"] },
                    { name: "basicstyles", groups: ["basicstyles"] }, // Include basicstyles group
                ],
                enterMode: CKEDITOR.ENTER_BR,
                removeButtons:
                    "Underline,Strike,Subscript,Superscript,Anchor,Styles,Specialchar,PasteFromWord, Body",
            });

            // Set the content of CKEditor with formatted answer
            CKEDITOR.instances.myeditor.setData(spaceFormattedAnswer);

            // Set the selected group based on the group_id of the question
            document.getElementById("selectOption").value = questionData.group_id;
        })
        .catch((error) => console.error("Error fetching question data:", error));
}

function updateQuestion() {
    const questionApiUrl = `https://gazoblok-bukhara.uz/question/${questionId}`;

    // Retrieve the formatted content from CKEditor
    const formattedAnswer = CKEDITOR.instances.myeditor.getData();

    // Replace <br />\n with \n
    const newLineFormattedAnswer = formattedAnswer.replace(/<br\s*\/?>\n/g, "\n");

    // Replace &nbsp; with regular spaces
    const spaceFormattedAnswer = newLineFormattedAnswer.replace(/&nbsp;/g, " ");

    const formData = {
        question: document.getElementById("emailInput").value,
        answer: spaceFormattedAnswer,
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



fetchAllGroups();