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
function getOptions() {
    const selectOption = document.getElementById("theme");
    const apiUrl = "https://gazoblok-bukhara.uz/groups"; // URL вашего API

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
}

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


