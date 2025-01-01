document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('authorDropdown').addEventListener('change', filterHighlights);

let highlights = [];
let filteredHighlights = [];

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            highlights = parseClippings(content);
            updateAuthorDropdown(highlights);
            displayHighlights(highlights);
        };
        reader.readAsText(file);
    } else {
        alert("Please upload a valid .txt file.");
    }
}

function parseClippings(content) {
    const entries = content.split('==========').map(entry => entry.trim()).filter(entry => entry);
    return entries.map(entry => {
        const lines = entry.split('\n').filter(line => line);
        if (lines.length >= 3) {
            //const titleAuthorMatch = lines[0].match(/^(.*) \((.*)\)$/);
            //const bookTitle = titleAuthorMatch ? titleAuthorMatch[1].trim() : 'Unknown Title';
            //const author = lines[0]; //titleAuthorMatch ? titleAuthorMatch[2].trim() : 'Unknown Author';
            //console.log(lines[0])
            //console.log("Title and Author Match:", titleAuthorMatch);
            //console.log("Title:", bookTitle);
            //console.log("Author:", author);

            const author = lines[0].split("(").slice(-1)[0].slice(0, -2);
            const bookTitle = lines[0].split("(").slice(0, -1).join("");
            const highlight = lines.slice(2).join(' ').trim();

            return { bookTitle, author, highlight };
        }
        return null;
    }).filter(entry => entry !== null);
}

function updateAuthorDropdown(highlights) {
    const dropdown = document.getElementById('authorDropdown');
    dropdown.innerHTML = '<option value="all">All Authors</option>';
    const authors = [...new Set(highlights.map(entry => entry.author))];
    authors.forEach(author => {
        const option = document.createElement('option');
        option.value = author;
        option.textContent = author;
        dropdown.appendChild(option);
    });
}

function filterHighlights() {
    const selectedAuthor = document.getElementById('authorDropdown').value;
    if (selectedAuthor === 'all') {
        displayHighlights(highlights);
    } else {
        filteredHighlights = highlights.filter(entry => entry.author === selectedAuthor);
        displayHighlights(filteredHighlights);
    }
}

function displayHighlights(entries) {
    const resultsDiv = document.getElementById('results');
    resultsDiv.innerHTML = '';
    if (entries.length === 0) {
        resultsDiv.innerHTML = '<p class="text-muted">No highlights found.</p>';
        return;
    }

    const groupedByBook = entries.reduce((acc, entry) => {
        acc[entry.bookTitle] = acc[entry.bookTitle] || [];
        acc[entry.bookTitle].push(entry.highlight);
        return acc;
    }, {});

    for (const [bookTitle, highlights] of Object.entries(groupedByBook)) {
        const bookHeading = document.createElement('h5');
        bookHeading.textContent = bookTitle;
        resultsDiv.appendChild(bookHeading);

        highlights.forEach((highlight, index) => {
            const paragraph = document.createElement('p');
            paragraph.textContent = `${index + 1}. ${highlight}`;
            resultsDiv.appendChild(paragraph);
        });
    }
}

