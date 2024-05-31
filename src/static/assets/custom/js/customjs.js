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

    // Process each file and create file preview elements
    ([...files]).forEach((file, index) => {
        if (validFileTypes.includes(file.type)) {
            let fileDiv = document.createElement('div');
            fileDiv.className = 'col file-item';
            fileDiv.id = `file-item-${index}-${Date.now()}`;
            fileDiv.draggable = true;

            let fileNameDiv = document.createElement('div');
            fileNameDiv.className = 'file-name';
            fileNameDiv.textContent = file.name;

            let objElem = document.createElement('object');
            objElem.data = URL.createObjectURL(file);
            objElem.className = 'file-preview';

            let buttonContainer = document.createElement('div');
            buttonContainer.className = 'button-container';

            let rotateButton = document.createElement('button');
            rotateButton.textContent = 'Rotate';
            rotateButton.className = 'file-button';
            rotateButton.onclick = () => rotateFile(objElem, fileDiv);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'file-button';
            deleteButton.onclick = () => deleteFile(fileDiv);

            buttonContainer.appendChild(rotateButton);
            buttonContainer.appendChild(deleteButton);

            fileDiv.appendChild(fileNameDiv);
            fileDiv.appendChild(objElem);
            fileDiv.appendChild(buttonContainer);

            uploadedFilesContainer.appendChild(fileDiv);
            enableDragAndDrop(fileDiv);
        } else {
            alert(`Please upload a valid file. Accepted formats are: ${validFileTypes.join(', ')}`);
        }
    });
}

function rotateFile(objElem, fileDiv) {
    let currentRotation = objElem.style.transform.match(/rotate\((\d+)deg\)/);
    let newRotation = (currentRotation ? parseInt(currentRotation[1]) : 0) + 90;
    objElem.style.transform = `rotate(${newRotation}deg)`;

    // Adjust size based on rotation
    objElem.style.width = newRotation % 180 !== 0 ? 'calc(100% * 1.414)' : '100%';
    objElem.style.height = newRotation % 180 !== 0 ? 'calc(100% * 1.414)' : '100%';
}

function deleteFile(fileDiv) {
    fileDiv.remove();
}

function enableDragAndDrop(fileDiv) {
    fileDiv.addEventListener('dragstart', dragStart);
    fileDiv.addEventListener('dragover', dragOver);
    fileDiv.addEventListener('drop', drop);
}

function dragStart(e) {
    e.dataTransfer.setData('text/plain', e.target.id);
    e.dropEffect = 'move';
}

function dragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
}

function drop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    const draggableElement = document.getElementById(id);
    const dropzone = e.target.closest('.file-item');
    dropzone.insertAdjacentElement('beforebegin', draggableElement);
}

/*document.addEventListener('DOMContentLoaded', function () {
    const buttonDiv = document.querySelector('.button-div');
    const footer = document.querySelector('footer');

    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                buttonDiv.style.position = 'absolute';
                buttonDiv.style.bottom = `${window.innerHeight - entry.boundingClientRect.top}px`;
            } else {
                buttonDiv.style.position = 'fixed';
                buttonDiv.style.bottom = '0';
            }
        });
    }, observerOptions);

    observer.observe(footer);

    // Initial check
    const footerRect = footer.getBoundingClientRect();
    if (footerRect.top < window.innerHeight) {
        buttonDiv.style.position = 'absolute';
        buttonDiv.style.bottom = `${window.innerHeight - footerRect.top}px`;
    } else {
        buttonDiv.style.position = 'fixed';
        buttonDiv.style.bottom = '0';
    }
});*/



