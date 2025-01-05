//import { HighlightContainer } from './classes/HighlightContainer.js';

document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('authorDropdown').addEventListener('click', selectAuthor);
document.getElementById('undoButton').addEventListener('click', undo);
// Listen for the toggle switch change
document.getElementById('toggleMetadata').addEventListener('change', (event) => {
    showMetadata = event.target.checked;
    if (filterActive) {
        displayHighlights(filteredHighlights);
    } else {
        displayHighlights(highlights);
    }
});
document.getElementById('toggleEdits').addEventListener('change', (event) => {
    showEditButtons = event.target.checked;
    if (filterActive) {
        displayHighlights(filteredHighlights);
    } else {
        displayHighlights(highlights);
    }
});

let filteredHighlights = [];
let authors = [];
let showMetadata = false;
let showEditButtons = false;
let filterActive = false; // are we currently displaying filtered highlights?

const highlights = new Map();
const undoStack = [];

// Add highlight
function addHighlight(id, highlight) {
    highlights.set(id, highlight);
}

// Delete highlight
function deleteHighlight(id) {
    if (highlights.has(id)) {
        const deletedItem = highlights.get(id);
        highlights.delete(id);
        undoStack.push({ action: 'delete', id, item: deletedItem });
    }
}

// Undo deletion
function undo() {
    const lastAction = undoStack.pop();
    if (lastAction && lastAction.action === 'delete') {
        highlights.set(lastAction.id, lastAction.item);
        rerenderHighlights();
    }
}

function rerenderHighlights() { 
    if (filterActive) {
        filteredHighlights = new Map(
            [...highlights].filter(([id, entry]) => entry.author === selectedAuthor)
        );
        displayHighlights(filteredHighlights);
    } else {
        displayHighlights(highlights)
    }
}

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            parseClippings(content);
            authors = [...new Set(
                Array.from(highlights.values()).map(entry => entry.author)
            )];
            authors.sort();
            authors = ['All Authors', ...authors];
            updateAuthorDropdown(authors);
            displayHighlights(highlights);
        };
        reader.readAsText(file);
        document.getElementById('authorDropdownButton').textContent = "All Authors";
    } else {
        alert("Please upload a valid .txt file.");
    }
}

function updateAuthorDropdown(authors) {
    const dropdown = document.getElementById('authorDropdown');
    dropdown.innerHTML = ''; // Clear existing items
    const searchInput = document.createElement('input');
    searchInput.type = 'text';
    searchInput.classList.add('search-input');
    searchInput.id = 'searchInput';
    searchInput.placeholder = 'Search authors...';
    dropdown.appendChild(searchInput);
    
    authors.forEach(author => {
        const option = document.createElement('li');
        option.classList.add('dropdown-item');
        option.textContent = author;
        option.dataset.author = author;
        dropdown.appendChild(option);
    });

    // Attach the event listener for search input after dropdown is populated
    document.getElementById('authorDropdown').addEventListener('input', function(event) {
        if (event.target && event.target.id === 'searchInput') {
            filterAuthors(event);
        }
    });
}

function filterAuthors(event) {
    const query = event.target.value.toLowerCase();
    const options = document.querySelectorAll('#authorDropdown .dropdown-item');
    options.forEach(option => {
        const authorName = option.textContent.toLowerCase();
        if (authorName.includes(query)) {
            option.style.display = 'block';
        } else {
            option.style.display = 'none';
        }
    });
}

let selectedAuthor = "All Authors"
function selectAuthor(event) {
    selectedAuthor = event.target.dataset.author;
    if (selectedAuthor) {
        document.getElementById('authorDropdownButton').textContent = selectedAuthor;
        if (selectedAuthor === 'All Authors') {
            displayHighlights(highlights);
            filterActive = false;
        } else {
            filteredHighlights = new Map(
                [...highlights].filter(([id, entry]) => entry.author === selectedAuthor)
            );
            displayHighlights(filteredHighlights);
            filterActive = true;
        }
    }
}

function parseClippings(content) {
    let entries = content.split('==========').map(entry => entry.trim()).filter(entry => entry);
    entries = entries.map(entry => {
        const lines = entry.split('\n').filter(line => line);
        if (lines.length >= 3) {
            
            //const titleAuthorMatch = lines[0].match(/^(.*) \((.*)\)$/);
            //const bookTitle = titleAuthorMatch ? titleAuthorMatch[1].trim() : 'Unknown Title';
            //const author = lines[0]; //titleAuthorMatch ? titleAuthorMatch[2].trim() : 'Unknown Author';

            const author = lines[0].split("(").slice(-1)[0].split(")").slice(0)[0];
            const bookTitle = lines[0].split("(").slice(0, -1).join("");
            const metadata = lines[1].slice(2); // location, page, datetime
            const highlight = lines.slice(2).join(' ').trim();
            return { bookTitle, author, highlight, metadata };
        }
        return null;
    }).filter(entry => entry !== null);
    

    entries.forEach((entry, id) => {
        addHighlight(id, entry);
    });
}   

function displayHighlights(entries) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    if (entries.size === 0) {
        resultsDiv.innerHTML = '<p class="text-muted">No highlights found.</p>';
        return;
    }

    let groupedByBook = [...entries].reduce((acc, [id, entry]) => {
        acc[entry.bookTitle] = acc[entry.bookTitle] || [];
        acc[entry.bookTitle].push({
            author: entry.author,
            highlight: entry.highlight,
            metadata: entry.metadata,
            id: id
        });
        return acc;
    }, {});

    groupedByBook = Object.entries(groupedByBook)
    .sort((a, b) => a[1][0].author.localeCompare(b[1][0].author)); // Sort by the author of the first highlight in each book


    for (const [bookTitle, accContent] of groupedByBook) {
        const bookHeading = document.createElement('h5');
        bookHeading.innerHTML = `<hr>${bookTitle}`;

        resultsDiv.appendChild(bookHeading);

        // Create a new element for the author and add it below the book title
        const authorHeading = document.createElement('h6');
        const authorName = accContent[0].author; // Assuming all entries for a book have the same author
        authorHeading.innerHTML = `${authorName}`;
        resultsDiv.appendChild(authorHeading);


        accContent.forEach((entry, index) => {
            const highlightContainer = document.createElement('div');
            
            const hr = document.createElement('hr');
            highlightContainer.appendChild(hr);
        
            if (showMetadata) {
                const metadataParagraph = document.createElement('p');
                metadataParagraph.classList.add('text-muted');
                metadataParagraph.textContent = `${entry.metadata}`;
                highlightContainer.appendChild(metadataParagraph);
            }
        
            const highlightParagraph = document.createElement('p');
            highlightParagraph.textContent = `${index + 1}. ${entry.highlight}`;
            highlightContainer.appendChild(highlightParagraph);

            // Add delete button
            const deleteButton = document.createElement('button');
            deleteButton.textContent = 'Delete';
            deleteButton.classList.add('btn', 'btn-danger', 'btn-sm');
            deleteButton.style.marginLeft = 'auto'; // Push the button to the right

            if (showEditButtons) {
                // Handle delete button click
                deleteButton.addEventListener('click', () => {
                    // Remove the highlight from the array
                    deleteHighlight(entry.id);
                    rerenderHighlights();
                });

                highlightContainer.appendChild(deleteButton)
            }


        
            resultsDiv.appendChild(highlightContainer);
        });
        
    }
}