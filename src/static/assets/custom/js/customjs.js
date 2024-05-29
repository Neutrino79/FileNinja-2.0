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

    ([...files]).forEach(file => uploadFile(file, validFileTypes));
}

function uploadFile(file, validFileTypes) {

    let mimeToExtension = {
        'application/pdf': '.pdf',
        'image/jpeg': '.jpg',
        'image/png': '.png'
        // Add more mappings if needed
    };

    if (!validFileTypes.includes(file.type)) {
        let validExtensions = validFileTypes.map(type => mimeToExtension[type]).join(', ');
        alert(`Please upload a valid file. Accepted formats are: ${validExtensions}`);
        return;
    }

    let url = '/your-upload-url/';
    let formData = new FormData();

    formData.append('file', file);

    fetch(url, {
        method: 'POST',
        body: formData
    })
    .then(() => { /* Done. Inform the user */ })
    .catch(() => { /* Error. Inform the user */ });
}
