document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('authorDropdown').addEventListener('click', selectAuthor);
document.getElementById('undoButton').addEventListener('click', undo);
document.getElementById('sampleButton').addEventListener('click', uploadSample);

document.getElementById('toggleHighlight').addEventListener('change', (event) => {
    showHighlight = event.target.checked;
    if (filterActive) {
        displayHighlights(filteredHighlights);
    } else {
        displayHighlights(highlights);
    }
});

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

const SortOptions = Object.freeze({
    AUTHOR: "author",
    TITLE: "title",
    HIGHLIGHT_COUNT_AUTHOR: "highlightCountAuthor",
    HIGHLIGHT_COUNT_TITLE: "highlightCountTitle"
});

document.querySelectorAll(".dropdown-item").forEach(item => {
    item.addEventListener("click", function () {
        const selectedOption = this.getAttribute("data-value");
        document.getElementById("sortBy").textContent = this.textContent; // Update button text
        console.log("Sorting by:", selectedOption);

        switch (selectedOption) {
            case SortOptions.AUTHOR:
                sortOption = SortOptions.AUTHOR;
                break;
            case SortOptions.TITLE:
                sortOption = SortOptions.TITLE;
                break;
            case SortOptions.HIGHLIGHT_COUNT_AUTHOR:
                sortOption = SortOptions.HIGHLIGHT_COUNT_AUTHOR;
                break;
            case SortOptions.HIGHLIGHT_COUNT_TITLE:
                sortOption = SortOptions.HIGHLIGHT_COUNT_TITLE;
                break;
            default:
                console.warn("Unknown sorting option");
        }
        rerenderHighlights();
    });
});

const highlights = new Map();

let sortOption = SortOptions.AUTHOR;
let showHighlight = true;
let showMetadata = false;
let showEditButtons = false;
let filterActive = false; // are we currently displaying filtered highlights?

let undoStack = [];
let filteredHighlights = [];
let authors = [];

function clearAll() {
    highlights.clear();
    filteredHighlights = [];
    undoStack = [];
    authors = [];
    filterActive = false;
    updateAuthorDropdown(authors);
    displayHighlights(highlights);
    document.getElementById('authorDropdownButton').textContent = "All Authors";
}

function addHighlight(id, highlight) {
    highlights.set(id, highlight);
}

function deleteHighlight(id) {
    if (highlights.has(id)) {
        const deletedItem = highlights.get(id);
        highlights.delete(id);
        undoStack.push({ action: 'delete', id, item: deletedItem });
    }
}

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

function uploadSample() {
    clearAll();
    fetch("data/SampleClippings.txt")
        .then(response => {
            if (!response.ok) {
                throw new Error("Failed to fetch sample file.");
            }
            return response.text(); // Read the file as text
        })
        .then(fileContent => {
            handleFileContent(fileContent);
        })
        .catch(error => console.error("Error uploading sample file:", error));
}

function handleFileUpload(event) {
    const file = event.target.files[0];

    if (file && file.type === "text/plain") {
        clearAll();
        const reader = new FileReader();

        reader.onload = function (e) {
            const fileContent = e.target.result;
            handleFileContent(fileContent);
        };

        reader.readAsText(file);

    }  else {
        alert("Please upload a valid .txt file.");
    }
}

function handleFileContent(fileContent) {
        parseClippings(fileContent);
        authors = [...new Set(
            Array.from(highlights.values()).map(entry => entry.author)
        )];
        authors.sort();
        authors = ['All Authors', ...authors];
        updateAuthorDropdown(authors);
        displayHighlights(highlights);
        document.getElementById('authorDropdownButton').textContent = "All Authors";
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
            filterActive = false;
            displayHighlights(highlights);
        } else {
            filterActive = true;
            filteredHighlights = new Map(
                [...highlights].filter(([id, entry]) => entry.author === selectedAuthor)
            );
            displayHighlights(filteredHighlights);
        }
    }
}

function parseClippings(content) {
    let entries = content.split('==========').map(entry => entry.trim()).filter(entry => entry);
    entries = entries.map(entry => {
        const lines = entry.split('\n').filter(line => line);
        if (lines.length >= 3) {
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

let authorHighlightCount = {};

function sortByAuthorHighlights(highlightArray, authorHighlightCount) {

    // Sort highlights by author's total highlight count
    highlightArray.sort((a, b) => {
        return (authorHighlightCount[b.author] || 0) - (authorHighlightCount[a.author] || 0);
    });
    
    // Now group by book AFTER sorting
    const groupedByBook = highlightArray.reduce((acc, entry) => {
        acc[entry.bookTitle] = acc[entry.bookTitle] || [];
        acc[entry.bookTitle].push(entry);
        return acc;
    }, {});
    return Object.entries(groupedByBook)
}

function sortHighlights(groupedByBook) {

    const highlightArray = [...highlights.values()];
    authorHighlightCount = highlightArray.reduce((acc, entry) => {
        acc[entry.author] = (acc[entry.author] || 0) + 1;
        return acc;
    }, {});

    switch (sortOption) {
        case SortOptions.AUTHOR:
            return groupedByBook.sort((a, b) => a[1][0].author.localeCompare(b[1][0].author));
        case SortOptions.HIGHLIGHT_COUNT_AUTHOR:
            return sortByAuthorHighlights(highlightArray, authorHighlightCount);
        case SortOptions.TITLE:
            return groupedByBook.sort((a, b) => a[0].localeCompare(b[0]));
        case SortOptions.HIGHLIGHT_COUNT_TITLE:
            return groupedByBook.sort((a, b) => b[1].length - a[1].length);
    }
}

// TO DO: refactor later to use highlight array instead of highlights map
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
    groupedByBook = sortHighlights(groupedByBook);

    // Count total highlights
    const counter = document.createElement('h6');
    const totalHighlights = Object.values(groupedByBook).reduce((sum, highlights) => sum + highlights[1].length, 0);
    counter.textContent = `Total Highlights: ${totalHighlights}`;
    resultsDiv.appendChild(counter);
    
    for (const [bookTitle, accContent] of groupedByBook) {
        const bookHeading = document.createElement('h5');
        bookHeading.innerHTML = `<hr>${bookTitle}`;
        resultsDiv.appendChild(bookHeading);

        if (showMetadata) {
            const metadataParagraph = document.createElement('p');
            metadataParagraph.classList.add('text-muted');
            metadataParagraph.textContent = `Book Highlights: ${accContent.length}`;
            resultsDiv.appendChild(metadataParagraph);
        }

        // Create a new element for the author and add it below the book title
        const authorHeading = document.createElement('h6');
        const authorName = accContent[0].author; // Assuming all entries for a book have the same author
        authorHeading.innerHTML = `${authorName}`;
        resultsDiv.appendChild(authorHeading);

        if (showMetadata) {
            const metadataParagraph = document.createElement('p');
            metadataParagraph.classList.add('text-muted');
            metadataParagraph.textContent = `Author Highlights: ${authorHighlightCount[authorName]}`;
            resultsDiv.appendChild(metadataParagraph);
        }

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
        
            if (showHighlight) {
                const highlightParagraph = document.createElement('p');
                highlightParagraph.textContent = `${index + 1}. ${entry.highlight}`;
                highlightContainer.appendChild(highlightParagraph);
            }

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