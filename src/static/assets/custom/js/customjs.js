/* File upload in pdf to docx */
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
    console.log('Drop event triggered');
    let dt = e.dataTransfer;
    let files = dt.files;
    handleFiles(files);
}

// Handle file selection
fileElem.addEventListener('change', handleFileInput);

function handleFileInput(e) {
    console.log('Change event triggered by', e.target);
    handleFiles(e.target.files);
}

function handleFiles(files) {
    console.log('Handling files');
    console.trace('Trace: handleFiles');
    let validFileTypes = ['application/pdf'];

    // Process each file and create file preview elements
    ([...files]).forEach((file, index) => {
        console.log(`Handling file ${index}`);
        if (validFileTypes.includes(file.type)) {
            let fileDiv = document.createElement('div');
            fileDiv.className = 'col file-item';
            fileDiv.id = `file-item-${index}-${Date.now()}`; // Ensure unique id by appending timestamp
            fileDiv.draggable = true;

            let objElem = document.createElement('object');
            objElem.data = URL.createObjectURL(file);
            objElem.width = '80%'; // Adjust this value as needed
            objElem.height = '80%'; // Adjust this value as needed
            objElem.style.objectFit = 'contain';

            let rotateButton = document.createElement('button');
            rotateButton.textContent = 'Rotate';
            rotateButton.onclick = () => rotateFile(objElem, fileDiv);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.onclick = () => deleteFile(fileDiv);

            fileDiv.appendChild(objElem);
            fileDiv.appendChild(rotateButton);
            fileDiv.appendChild(deleteButton);

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

    if (newRotation % 180 !== 0) {
        fileDiv.style.height = 'auto';
        fileDiv.style.width = '200px';
    } else {
        fileDiv.style.height = '200px';
        fileDiv.style.width = '100%';
    }
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
