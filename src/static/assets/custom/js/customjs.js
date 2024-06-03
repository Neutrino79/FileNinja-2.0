let dropArea = document.getElementById('drop-area');
let fileElem = document.getElementById('fileElem');
let uploadedFilesContainer = document.getElementById('uploaded-files').children[0];

// Prevent default behavior for drag and drop events
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

// Highlight and unhighlight drop area on drag events
['dragenter', 'dragover'].forEach(eventName => {
    dropArea.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, unhighlight, false);
});

function highlight(e) {
    dropArea.classList.add('highlight');
}

function unhighlight(e) {
    dropArea.classList.remove('highlight');
}

// Handle file drop
dropArea.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
}

// Handle file selection
fileElem.addEventListener('change', handleFileInput);

function handleFileInput(e) {
    handleFiles(e.target.files);
}

function handleFiles(files) {
    let validFileTypes = ['application/pdf'];

    ([...files]).forEach((file, index) => {
        if (validFileTypes.includes(file.type)) {
            let fileDiv = document.createElement('div');
            fileDiv.className = 'col file-item';
            fileDiv.id = `file-item-${index}-${Date.now()}`;
            fileDiv.draggable = true;

            let fileNameDiv = document.createElement('div');
            fileNameDiv.className = 'file-name';
            fileNameDiv.textContent = file.name;

            let canvas = document.createElement('canvas');
            canvas.className = 'file-preview';

            let buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'file-button';
            deleteButton.onclick = () => deleteFile(fileDiv);

            if(window.location.href.endsWith('pdf_to_docx/'))
            {
                let rotateButton = document.createElement('button');
                rotateButton.textContent = 'Rotate';
                rotateButton.className = 'file-button';
                rotateButton.onclick = () => rotateFile(canvas);
                buttonContainer.appendChild(rotateButton);
            }

            buttonContainer.appendChild(deleteButton);

            fileDiv.appendChild(fileNameDiv);
            fileDiv.appendChild(canvas);
            fileDiv.appendChild(buttonContainer);

            uploadedFilesContainer.appendChild(fileDiv);
            enableDragAndDrop(fileDiv);

            const fileReader = new FileReader();

            fileReader.onload = function() {
                const typedarray = new Uint8Array(this.result);

                pdfjsLib.getDocument(typedarray).promise.then(
                    pdf => renderPDF(pdf, canvas),
                    error => {
                        if (error.name === 'PasswordException') {
                            askForPassword(file, fileDiv, canvas);
                        } else {
                            alert(`Error loading PDF: ${error.message}`);
                        }
                    }
                );
            };

            fileReader.readAsArrayBuffer(file);
        } else {
            alert(`Please upload a valid file. Accepted formats are: ${validFileTypes.join(', ')}`);
        }
    });
}

function askForPassword(file, fileDiv, canvas) {

    let passwordContainer = document.createElement('div');
    passwordContainer.className = 'password-container';

    let passwordInput = document.createElement('input');
    passwordInput.type = 'password';
    passwordInput.className = 'password-input';
    passwordInput.placeholder = 'Enter password';

    let passwordError = document.createElement('div');
    passwordError.className = 'password-error';

    let submitPasswordButton = document.createElement('button');
    submitPasswordButton.className = 'submit-password-button';
    submitPasswordButton.textContent = 'Submit Password';
    submitPasswordButton.onclick = () => openPDFWithPassword(file, passwordInput.value, passwordContainer, canvas, passwordError);

    passwordContainer.appendChild(passwordInput);
    passwordContainer.appendChild(passwordError);
    passwordContainer.appendChild(submitPasswordButton);

    // Insert the password container before the button container
    let buttonContainer = fileDiv.querySelector('.button-container');
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

function renderPDF(pdf, canvas) {
    pdf.getPage(1).then(function(page) {
        const viewport = page.getViewport({ scale: 1.0 });
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

function rotateFile(canvas) {
    let currentRotation = canvas.style.transform.match(/rotate\((\d+)deg\)/);
    let newRotation = (currentRotation ? parseInt(currentRotation[1]) : 0) + 90;
    canvas.dataset.rotation = newRotation;
    canvas.style.transform = `rotate(${newRotation}deg)`;

    // Determine if the canvas is rotated
    let isRotated = newRotation % 180 !== 0;

    // Adjust size based on rotation
    let scaleFactor = isRotated ? Math.sqrt(2) : 1; // Scale factor for diagonal length
    canvas.style.width = `calc(100% * ${scaleFactor})`;
    canvas.style.height = `calc(100% * ${scaleFactor})`;
    canvas.style.maxHeight = 'calc(100% - 90px)';
}

function deleteFile(fileDiv) {
    fileDiv.remove();
}

function enableDragAndDrop(fileDiv) {
    fileDiv.addEventListener('dragstart', dragStart);
    fileDiv.addEventListener('dragover', dragOver);
    fileDiv.addEventListener('drop', drop);
}

let draggedElement;

function dragStart(e) {
    draggedElement = e.target;
    e.dataTransfer.setData('text/plain', draggedElement.id);
    e.dropEffect = 'move';
}

function dragOver(e) {
    e.preventDefault();
    const dropzone = e.target.closest('.file-item');
    const fileItems = document.querySelectorAll('.file-item');
    const draggedIndex = Array.from(fileItems).indexOf(draggedElement);
    const dropIndex = Array.from(fileItems).indexOf(dropzone);
    const rect = dropzone.getBoundingClientRect();
    const nextSibling = getNextSibling(dropzone);

    if (dropzone && dropzone !== draggedElement) {
        if (e.clientY > rect.top + rect.height / 2) {
            if (draggedIndex < dropIndex) {
                dropzone.parentNode.insertBefore(draggedElement, nextSibling);
            } else {
                dropzone.parentNode.insertBefore(draggedElement, dropzone);
            }
        } else {
            dropzone.parentNode.insertBefore(draggedElement, dropzone);
        }
        applyFadeEffect(fileItems, dropzone);
    }
}

function applyFadeEffect(fileItems, dropzone) {
    fileItems.forEach(item => {
        if (item !== draggedElement) {
            item.style.opacity = '0.5';
        }
    });
    dropzone.style.opacity = '1';
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(id);
    const dropzone = e.target.closest('.file-item');
    const nextSibling = getNextSibling(dropzone);
    if (e.clientY > dropzone.getBoundingClientRect().top + dropzone.getBoundingClientRect().height / 2) {
        dropzone.parentNode.insertBefore(draggableElement, nextSibling);
    } else {
        dropzone.parentNode.insertBefore(draggableElement, dropzone);
    }
    resetOpacity();
    draggedElement = null;
}

function resetOpacity() {
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(item => {
        item.style.opacity = '1';
    });
}

function getNextSibling(el) {
    let nextSibling = el.nextElementSibling;
    while (nextSibling && nextSibling.nodeType !== 1) {
        nextSibling = nextSibling.nextElementSibling;
    }
    return nextSibling;
}
