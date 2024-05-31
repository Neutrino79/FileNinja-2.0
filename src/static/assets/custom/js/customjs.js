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

            let rotateButton = document.createElement('button');
            rotateButton.textContent = 'Rotate';
            rotateButton.className = 'file-button';
            rotateButton.onclick = () => rotateFile(canvas);

            let deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.className = 'file-button';
            deleteButton.onclick = () => deleteFile(fileDiv);

            buttonContainer.appendChild(rotateButton);
            buttonContainer.appendChild(deleteButton);

            fileDiv.appendChild(fileNameDiv);
            fileDiv.appendChild(canvas);
            fileDiv.appendChild(buttonContainer);

            uploadedFilesContainer.appendChild(fileDiv);
            enableDragAndDrop(fileDiv);

            renderPDF(file, canvas);
        } else {
            alert(`Please upload a valid file. Accepted formats are: ${validFileTypes.join(', ')}`);
        }
    });
}

function renderPDF(file, canvas) {
    const fileReader = new FileReader();

    fileReader.onload = function() {
        const typedarray = new Uint8Array(this.result);

        pdfjsLib.getDocument(typedarray).promise.then(function(pdf) {
            pdf.getPage(1).then(function(page) {
                const viewport = page.getViewport({scale: 1.0});
                const context = canvas.getContext('2d');
                canvas.height = viewport.height;
                canvas.width = viewport.width;

                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };
                page.render(renderContext);
            });
        });
    };

    fileReader.readAsArrayBuffer(file);
}

function rotateFile(canvas) {
    let currentRotation = canvas.style.transform.match(/rotate\((\d+)deg\)/);
    let newRotation = (currentRotation ? parseInt(currentRotation[1]) : 0) + 90;
    canvas.style.transform = `rotate(${newRotation}deg)`;

    // Adjust size based on rotation
    let isRotated = newRotation % 180 !== 0;
    canvas.style.width = isRotated ? 'calc(100% * 1.414)' : '100%';
    canvas.style.height = isRotated ? 'calc(100% * 1.414)' : '100%';
    canvas.style.maxHeight = 'calc(100% - 90px)';
}

function deleteFile(fileDiv) {
    fileDiv.remove();
}

function enableDragAndDrop(fileDiv) {
    fileDiv.addEventListener('dragstart', dragStart);
    fileDiv.addEventListener('dragover', dragOver);
    fileDiv.addEventListener('drop', drop);

    // For touch devices
    fileDiv.addEventListener('touchstart', touchStart, false);
    fileDiv.addEventListener('touchmove', touchMove, false);
    fileDiv.addEventListener('touchend', touchEnd, false);
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
        applyFadeEffect(fileItems, dropzone, nextSibling);
    }
}

function applyFadeEffect(fileItems, dropzone, nextSibling) {
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



// Touch events for mobile drag-and-drop with touch-and-hold
let touchDragElement = null;
let touchHoldTimeout = null;

function touchStart(e) {
    touchDragElement = e.target.closest('.file-item');
    if (touchDragElement) {
        touchHoldTimeout = setTimeout(() => {
            touchDragElement.classList.add('dragging');
            const touch = e.touches[0];
            touchDragElement.style.position = 'absolute';
            touchDragElement.style.zIndex = '1000';
            moveAt(touch.pageX, touch.pageY);
        }, 500); // 500ms hold time to initiate drag

        const placeholder = document.createElement('div');
        placeholder.className = 'placeholder';
        touchDragElement.insertAdjacentElement('beforebegin', placeholder);
    }
}

function touchMove(e) {
    if (touchDragElement && touchHoldTimeout) {
        const touch = e.touches[0];
        moveAt(touch.pageX, touch.pageY);
        const dropzone = document.elementFromPoint(touch.clientX, touch.clientY).closest('.file-item');

        if (dropzone && dropzone !== touchDragElement) {
            const placeholder = document.querySelector('.placeholder');
            dropzone.insertAdjacentElement('beforebegin', placeholder);
        }
    }
}

function touchEnd() {
    if (touchDragElement && touchHoldTimeout) {
        clearTimeout(touchHoldTimeout);
        touchDragElement.classList.remove('dragging');
        touchDragElement.style.position = '';
        touchDragElement.style.zIndex = '';
        const placeholder = document.querySelector('.placeholder');
        placeholder.insertAdjacentElement('beforebegin', touchDragElement);
        placeholder.remove();
        touchDragElement = null;
        touchHoldTimeout = null;
    }
}

function moveAt(pageX, pageY) {
    touchDragElement.style.left = pageX - touchDragElement.offsetWidth / 2 + 'px';
    touchDragElement.style.top = pageY - touchDragElement.offsetHeight / 2 + 'px';
}
