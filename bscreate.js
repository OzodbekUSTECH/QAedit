CKEDITOR.replace('answer', {
    // Define the toolbar groups as it is a more accessible solution.
    toolbarGroups: [
        { name: 'links', groups: ['links'] },
        { name: 'basicstyles', groups: ['basicstyles'] }, // Include basicstyles group
    ],
    enterMode: CKEDITOR.ENTER_BR,
    // Remove the redundant buttons from toolbar groups defined above.
    removeButtons: 'Strike,Subscript,Superscript,Anchor,Styles,Specialchar,PasteFromWord, Body',
    extraPlugins: 'editorplaceholder',
    editorplaceholder: 'Введите ответ...',
    extraPlugins: 'autogrow',
    autoGrow_minHeight: 200,
    autoGrow_maxHeight: 600,
    autoGrow_bottomSpace: 50,
    removePlugins: 'resize',

});
let tg = window.Telegram.WebApp;

// Функция для выполнения GET-запроса и заполнения данных в select


// Function to populate the select element with options
const getOptions = () => {
    const selectOption = document.getElementById("theme");
    const apiUrl = "https://gazoblok-bukhara.uz/groups";
    fetch(apiUrl, {
        method: "GET",
        headers: {
            accept: "application/json",
        },
    })
        .then((response) => response.json())
        .then((data) => {
            // Очищаем список перед добавлением новых данных
            selectOption.innerHTML = "";

            // Добавляем элементы option на основе полученных данных
            data.forEach((group) => {
                const option = document.createElement("option");
                option.value = group.id; // Предполагается, что в ответе API есть поле 'id'
                option.textContent = group.name; // Предполагается, что в ответе API есть поле 'name'
                selectOption.appendChild(option);
            });
        })
        .catch((error) => console.error("Error:", error));
};

// Вызываем функцию getOptions() для получения данных перед отображением списка
getOptions();

// Обработчик события при нажатии на кнопку "Отправить"
// ... (предыдущий код)

function submitData() {
    const form = document.querySelector("#dataForm");
    const questionValue = document.getElementById("question").value;
    const answerValue = CKEDITOR.instances.answer.getData();
    const selectOptionValue = document.getElementById("theme").value;
    const messageElement = document.getElementById("message");

    // Check if any of the fields are empty
    if (!questionValue || !answerValue || !selectOptionValue) {
        messageElement.textContent = "Please fill in all the fields.";
        return;
    }

    const newLineFormattedAnswer = answerValue.replace(/<br\s*\/?>\n/g, "\n");
    const spaceFormattedAnswer = newLineFormattedAnswer.replace(/&nbsp;/g, " ");

    // Формируем объект с данными для отправки на сервер
    const formData = {
        question: questionValue,
        answer: spaceFormattedAnswer, // Use the sanitized value here
        group_id: parseInt(selectOptionValue), // Преобразуем значение в число
    };

    // Выполняем POST-запрос к API
    const apiUrl = "https://gazoblok-bukhara.uz/question";
    fetch(apiUrl, {
        method: "POST",
        headers: {
            "accept": "application/json",
            "Content-Type": "application/json",
        },
        body: JSON.stringify(formData), // Преобразуем объект в JSON-строку для отправки
    })
        .then((response) => response.json())
        .then((data) => {
            console.log("Ответ сервера:", data); // Выводим ответ сервера в консоль

            // Выводим сообщение об успешной отправке ниже формы
            messageElement.textContent = "Данные успешно отправлены!";

            // Очищаем значения элементов формы после успешной отправки данных
            form.reset();
            CKEDITOR.instances.answer.setData(""); // Очищаем содержимое редактора
            tg.close();
            // Очищаем список данных в selectOption
            const selectOption = document.getElementById("theme");
            selectOption.innerHTML = "";

            // Вызываем функцию getOptions() для обновления данных в selectOption
            getOptions();

            // Очищаем сообщение об успешной отправке через некоторое время (например, 5 секунд)
            setTimeout(() => {
                messageElement.textContent = "";
            }, 5000);
        })
        .catch((error) => console.error("Error:", error));
}


document.getElementById("sendData").addEventListener("click", submitData);



let isCreating = false; // Flag to track if a group is currently being created

const closeButton = document.getElementById('closeButton');
closeButton.addEventListener('click', (event) => {
    event.preventDefault();
    const popup = document.querySelector('.popup');
    popup.style.display = 'none';
});

const createGroup = (groupNameInput) => {
    if (isCreating) {
        return; // If a group is already being created, do not send another request
    }

    isCreating = true; // Set the flag to indicate that a group is being created

    const apiUrl = 'https://gazoblok-bukhara.uz/group';

    // Encode the group name to ensure it is properly formatted for URL
    const encodedGroupName = encodeURIComponent(groupNameInput);

    // Construct the URL with the "name" query parameter
    const urlWithParams = `${apiUrl}?name=${encodedGroupName}`;

    fetch(urlWithParams, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json', // Use Content-Type for sending JSON data
        },
    })
        .then(response => response.json())
        .then(data => {
            console.log('Ответ сервера:', data);

            // Add the new group name as an option to the select element
            const selectOption = document.getElementById("theme");
            const option = document.createElement("option");
            option.value = data.id; // Use the ID of the newly created group
            option.textContent = data.name; // Use the name of the newly created group
            selectOption.appendChild(option);

            // Reset the flag after creating the group
            isCreating = false;

            const popup = document.querySelector('.popup');
            popup.style.display = 'none';
        })
        .catch(error => {
            console.error('Error:', error);
            isCreating = false; // Reset the flag in case of an error
        });
};

const createButton = document.getElementById('createButton');
createButton.addEventListener('click', () => {
    const groupNameInput = document.getElementById('groupNameInput').value;
    createGroup(groupNameInput);
});

const openpopup = (event) => {
    event.preventDefault();
    const popup = document.querySelector('.popup');
    popup.style.display = 'block';
};

const button = document.querySelector('.button');
button.addEventListener('click', openpopup);

const displayGroupsPopup = () => {
    const groupListPopupContainer = document.getElementById("groupListPopup");

    fetch("https://gazoblok-bukhara.uz/groups")
        .then((response) => response.json())
        .then((data) => {
            // Clear the existing content in the groupListPopupContainer
            groupListPopupContainer.innerHTML = "";

            // Loop through the groups and create checkboxes for each
            data.forEach((group) => {
                const groupDiv = document.createElement("div");
                groupDiv.classList.add("form-check");
                groupDiv.innerHTML = `
                    <input class="form-check-input" type="checkbox" value="${group.id}" id="groupPopup${group.id}">
                    <label class="form-check-label" for="groupPopup${group.id}">
                        ${group.name}
                    </label>
                `;
                groupListPopupContainer.appendChild(groupDiv);
            });
        })
        .catch((error) => console.error("Error:", error));
};

// Event listener for the "Редактировать группы" button click
document.getElementById("editGroupsButton").addEventListener("click", (event) => {
    event.preventDefault();
    const editGroupsPopup = document.getElementById("editGroupsPopup");
    editGroupsPopup.style.display = "block";

    // Display existing groups with checkboxes in the popup
    displayGroupsPopup();
});

// Event listener for the "Удалить выбранные группы" button click in the popup
document.getElementById("deleteSelectedGroupsButton").addEventListener("click", (event) => {
    event.preventDefault();
    deleteSelectedGroupsPopup();
});

// Function to delete selected groups from the popup
const deleteSelectedGroupsPopup = () => {
    const selectedGroupsPopup = Array.from(document.querySelectorAll(".form-check-input:checked"))
        .map((checkbox) => parseInt(checkbox.value));

    if (selectedGroupsPopup.length === 0) {
        alert("Please select at least one group to delete.");
        return;
    }

    const apiUrl = "https://gazoblok-bukhara.uz/group/";

    Promise.all(
        selectedGroupsPopup.map((groupId) =>
            fetch(apiUrl + groupId, {
                method: "DELETE",
            })
        )
    )
        .then(() => {
            // Refresh the group list after deletion
            displayGroupsPopup();
            displayGroups(); // Refresh the main group list
        })
        .catch((error) => console.error("Error:", error));
};

// Event listener for the "Закрыть" button click in the popup
document.getElementById("closeButtonPopup").addEventListener("click", (event) => {
    event.preventDefault();
    const editGroupsPopup = document.getElementById("editGroupsPopup");
    editGroupsPopup.style.display = "none";
});


document.getElementById("updateGroupNameButton").addEventListener("click", (event) => {
    event.preventDefault();
    updateGroupName();
});

// Function to update the group name through the API
const updateGroupName = () => {
    const selectedGroupsPopup = Array.from(document.querySelectorAll(".form-check-input:checked"))
        .map((checkbox) => parseInt(checkbox.value));

    if (selectedGroupsPopup.length === 0) {
        alert("Please select at least one group to update the name.");
        return;
    }

    const newGroupName = document.getElementById("newGroupName").value;

    if (!newGroupName) {
        alert("Please enter the new group name.");
        return;
    }

    const apiUrl = "https://gazoblok-bukhara.uz/group/";

    Promise.all(
        selectedGroupsPopup.map((groupId) =>
            fetch(apiUrl + groupId + "?name=" + encodeURIComponent(newGroupName), {
                method: "PUT",
            })
        )
    )
        .then(() => {
            // Refresh the group list after updating the name
            displayGroupsPopup();
            displayGroups(); // Refresh the main group list
            document.getElementById("newGroupName").value = ""; // Clear the input field after updating
        })
        .catch((error) => console.error("Error:", error));
};

