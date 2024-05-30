/* file upload in pdf to docx */
let dropArea = document.getElementById('drop-area');

['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropArea.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

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

function handleDrop(e) {
    let dt = e.dataTransfer;
    let files = dt.files;

    handleFiles(files);
}

dropArea.addEventListener('drop', handleDrop, false);

let fileElem = document.getElementById('fileElem');

fileElem.addEventListener('change', function() {
    handleFiles(this.files);
});

function handleFiles(files) {
    let validFileTypes;
    let url = window.location.href;

    if (url.includes('pdf_to_docx')) {
        validFileTypes = ['application/pdf'];
    } else if (url.includes('img_to_pdf')) {
        validFileTypes = ['image/jpeg', 'image/png'];
    } else {
        // Default to PDF if the URL does not match any of the above
        validFileTypes = ['application/pdf'];
    }

    let uploadedFilesContainer = document.getElementById('uploaded-files').children[0];

    ([...files]).forEach(file => {
        if (validFileTypes.includes(file.type)) {
            let fileDiv = document.createElement('div');
            fileDiv.className = 'col';

            if (file.type.startsWith('image/')) {
                let img = document.createElement('img');
                img.src = URL.createObjectURL(file);
                img.onload = function() {
                    URL.revokeObjectURL(this.src);
                }
                fileDiv.appendChild(img);
            } else if (file.type === 'application/pdf') {
                let objElem = document.createElement('object');
                objElem.data = URL.createObjectURL(file);
                objElem.width = '50%';
                objElem.height = '50%'; // Adjust this value as needed
                fileDiv.appendChild(objElem);
            } else {
                fileDiv.textContent = file.name;
            }

            uploadedFilesContainer.appendChild(fileDiv);
        } else {
            alert(`Please upload a valid file. Accepted formats are: ${validFileTypes.join(', ')}`);
        }
    });
}





