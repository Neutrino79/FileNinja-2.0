// Constants and DOM element references
const DROP_AREA = document.getElementById('drop-area');
const FILE_INPUT = document.getElementById('fileElem');
const UPLOADED_FILES_CONTAINER = document.getElementById('uploaded-files').children[0];
const CONVERT_BUTTON = document.getElementById('convert-button');
const DOWNLOAD_BUTTON_CONTAINER = document.getElementById('download-button-container');
const DOWNLOAD_BUTTON = document.getElementById('download-button');
const LOADER = DOWNLOAD_BUTTON_CONTAINER.querySelector('.loader');
const VALID_FILE_TYPES = ['application/pdf'];
const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

// Event listeners
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    DROP_AREA.addEventListener(eventName, preventDefaults, false);
});

['dragenter', 'dragover'].forEach(eventName => {
    DROP_AREA.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    DROP_AREA.addEventListener(eventName, unhighlight, false);
});

DROP_AREA.addEventListener('drop', handleDrop, false);
FILE_INPUT.addEventListener('change', handleFileInput);
CONVERT_BUTTON.addEventListener('click', sendFilesToBackend);

// Utility functions
function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

function highlight() {
    DROP_AREA.classList.add('highlight');
}

function unhighlight() {
    DROP_AREA.classList.remove('highlight');
}

function handleDrop(e) {
    const files = e.dataTransfer.files;
    handleFiles(files);
}

function handleFileInput(e) {
    handleFiles(e.target.files);
}

function handleFiles(files) {
    [...files].forEach((file, index) => {
        if (validateFile(file)) {
            processFile(file, index);
        }
    });
}

function validateFile(file) {
    if (!VALID_FILE_TYPES.includes(file.type)) {
        showError(`Invalid file type: ${file.name}. Please upload PDF files only.`);
        return false;
    }
    if (file.size > MAX_FILE_SIZE) {
        showError(`File too large: ${file.name}. Maximum size is ${MAX_FILE_SIZE / 1024 / 1024}MB.`);
        return false;
    }
    return true;
}

function processFile(file, index) {
    const fileDiv = createFileElement(file, index);
    UPLOADED_FILES_CONTAINER.appendChild(fileDiv);
    enableDragAndDrop(fileDiv);
    renderPDFPreview(file, fileDiv);
}

function createFileElement(file, index) {
    const fileDiv = document.createElement('div');
    fileDiv.className = 'col file-item';
    fileDiv.id = `file-item-${index}-${Date.now()}`;
    fileDiv.draggable = true;

    const fileNameDiv = document.createElement('div');
    fileNameDiv.className = 'file-name';
    fileNameDiv.textContent = file.name;

    const canvas = document.createElement('canvas');
    canvas.className = 'file-preview';

    const buttonContainer = document.createElement('div');
    buttonContainer.className = 'button-container';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.className = 'file-button';
    deleteButton.onclick = () => deleteFile(fileDiv);

    if (window.location.href.endsWith('pdf_to_docx/')) {
        const rotateButton = document.createElement('button');
        rotateButton.textContent = 'Rotate';
        rotateButton.className = 'file-button';
        rotateButton.onclick = () => rotateFile(canvas);
        buttonContainer.appendChild(rotateButton);
    }

    buttonContainer.appendChild(deleteButton);

    fileDiv.appendChild(fileNameDiv);
    fileDiv.appendChild(canvas);
    fileDiv.appendChild(buttonContainer);

    return fileDiv;
}

function renderPDFPreview(file, fileDiv) {
    const canvas = fileDiv.querySelector('canvas');
    const fileReader = new FileReader();

    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(
            pdf => renderPDF(pdf, canvas),
            error => {
                if (error.name === 'PasswordException') {
                    askForPassword(file, fileDiv, canvas);
                } else {
                    showError(`Error loading PDF: ${error.message}`);
                }
            }
        );
    };

    fileReader.readAsArrayBuffer(file);
}

function renderPDF(pdf, canvas) {
    pdf.getPage(1).then(function(page) {
        const scale = 1.5;
        const viewport = page.getViewport({ scale });
        const context = canvas.getContext('2d');
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        const renderContext = {
            canvasContext: context,
            viewport: viewport
        };
        page.render(renderContext);
    });
}

function askForPassword(file, fileDiv, canvas) {
    const passwordContainer = document.createElement('div');
    passwordContainer.className = 'password-container';

    const passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.className = 'password-input';
    passwordInput.placeholder = 'Enter password';

    const passwordError = document.createElement('div');
    passwordError.className = 'password-error';

    const submitPasswordButton = document.createElement('button');
    submitPasswordButton.className = 'submit-password-button';
    submitPasswordButton.textContent = 'Submit Password';
    submitPasswordButton.onclick = () => openPDFWithPassword(file, passwordInput.value, passwordContainer, canvas, passwordError);

    passwordContainer.appendChild(passwordInput);
    passwordContainer.appendChild(passwordError);
    passwordContainer.appendChild(submitPasswordButton);

    const buttonContainer = fileDiv.querySelector('.button-container');
    fileDiv.insertBefore(passwordContainer, buttonContainer);
}

function openPDFWithPassword(file, password, passwordContainer, canvas, passwordError) {
    const fileReader = new FileReader();

    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument({ data: typedarray, password }).promise.then(
            pdf => {
                renderPDF(pdf, canvas);
                passwordContainer.remove();
            },
            error => {
                if (error.name === 'PasswordException') {
                    passwordError.textContent = 'Incorrect password. Please try again.';
                } else {
                    passwordError.textContent = `Error opening PDF: ${error.message}`;
                }
            }
        );
    };

    fileReader.readAsArrayBuffer(file);
}

function rotateFile(canvas) {
    let currentRotation = parseInt(canvas.dataset.rotation || '0');
    let newRotation = (currentRotation + 90) % 360;
    canvas.dataset.rotation = newRotation;
    canvas.style.transform = `rotate(${newRotation}deg)`;

    const isRotated = newRotation % 180 !== 0;
    const scaleFactor = isRotated ? Math.sqrt(2) : 1;
    canvas.style.width = `calc(100% * ${scaleFactor})`;
    canvas.style.height = `calc(100% * ${scaleFactor})`;
    canvas.style.maxHeight = 'calc(100% - 90px)';
}

function deleteFile(fileDiv) {
    fileDiv.remove();
}

// Drag and drop functionality for reordering files
function enableDragAndDrop(fileDiv) {
    fileDiv.addEventListener('dragstart', dragStart);
    fileDiv.addEventListener('dragover', dragOver);
    fileDiv.addEventListener('drop', drop);
}

let draggedElement;

function dragStart(e) {
    draggedElement = e.target.closest('.file-item');
    e.dataTransfer.setData('text/plain', draggedElement.id);
    e.dropEffect = 'move';
}

function dragOver(e) {
    e.preventDefault();
    const dropzone = e.target.closest('.file-item');
    if (dropzone && dropzone !== draggedElement) {
        const rect = dropzone.getBoundingClientRect();
        const nextSibling = dropzone.nextElementSibling;
        const dropIndex = Array.from(UPLOADED_FILES_CONTAINER.children).indexOf(dropzone);
        const draggedIndex = Array.from(UPLOADED_FILES_CONTAINER.children).indexOf(draggedElement);

        if (e.clientY > rect.top + rect.height / 2) {
            if (draggedIndex < dropIndex) {
                UPLOADED_FILES_CONTAINER.insertBefore(draggedElement, nextSibling);
            } else {
                UPLOADED_FILES_CONTAINER.insertBefore(draggedElement, dropzone);
            }
        } else {
            UPLOADED_FILES_CONTAINER.insertBefore(draggedElement, dropzone);
        }
        applyFadeEffect(dropzone);
    }
}

function applyFadeEffect(dropzone) {
    const fileItems = UPLOADED_FILES_CONTAINER.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.style.opacity = item === draggedElement ? '1' : '0.5';
    });
    dropzone.style.opacity = '1';
}

function drop(e) {
    e.preventDefault();
    resetOpacity();
    draggedElement = null;
}

function resetOpacity() {
    const fileItems = UPLOADED_FILES_CONTAINER.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.style.opacity = '1';
    });
}

// Backend communication
function sendFilesToBackend() {
    const files = document.querySelectorAll('.file-item');
    if (files.length === 0) {
        showError("Please add files to convert.");
        return;
    }

    let allPasswordsEntered = true;
    let fileData = [];

    files.forEach(fileItem => {
        const fileId = fileItem.id;
        const canvas = fileItem.querySelector('canvas');
        const rotation = canvas.dataset.rotation || 0;
        const passwordInput = fileItem.querySelector('.password-input');
        const password = passwordInput ? passwordInput.value : null;

        if (passwordInput && !password) {
            allPasswordsEntered = false;
        }

        fileData.push({ fileId, rotation, password });
    });

    if (!allPasswordsEntered) {
        showError("Enter password for password encrypted files");
        return;
    }

    startLoading();

    const formData = new FormData();
    fileData.forEach(fileInfo => {
        const fileItem = document.getElementById(fileInfo.fileId);
        const file = FILE_INPUT.files[Array.from(FILE_INPUT.files).findIndex(f => f.name === fileItem.querySelector('.file-name').textContent)];
        formData.append('files', file);
        formData.append('rotations', fileInfo.rotation);
        formData.append('passwords', fileInfo.password);
    });

    fetch('/pdf_to_docx/', {
        method: 'POST',
        body: formData,
        headers: {
            'X-CSRFToken': getCookie('csrftoken')
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        return response.blob();
    })
    .then(blob => {
        setTimeout(() => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            a.download = 'converted_files.zip';
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            stopLoading();
        }, 2000);
    })
    .catch(error => {
        console.error('Error:', error);
        showError('An error occurred during conversion. Please try again.');
        stopLoading();
    });
}

function startLoading() {
    CONVERT_BUTTON.style.display = 'none';
    DOWNLOAD_BUTTON_CONTAINER.style.display = 'inline-block';
    DOWNLOAD_BUTTON.disabled = true;
    LOADER.style.display = 'inline-block';
}

function stopLoading() {
    LOADER.style.display = 'none';
    DOWNLOAD_BUTTON.disabled = false;
}

function showError(message) {
    alert(message);
}

function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Initialize the page
document.addEventListener('DOMContentLoaded', () => {
    // Additional initialization if needed
});