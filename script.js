document.getElementById('fileInput').addEventListener('change', handleFileUpload);
document.getElementById('authorDropdown').addEventListener('click', selectAuthor);

let highlights = [];
let filteredHighlights = [];
let authors = [];

function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === "text/plain") {
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            highlights = parseClippings(content);
            authors = [...new Set(highlights.map(entry => entry.author))];
            authors.sort();
            authors = ['All', ...authors];
            updateAuthorDropdown(authors);
            displayHighlights(highlights);
        };
        reader.readAsText(file);
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

function selectAuthor(event) {
    const selectedAuthor = event.target.dataset.author;
    if (selectedAuthor) {
        document.getElementById('authorDropdownButton').textContent = selectedAuthor;
        if (selectedAuthor === 'All') {
            displayHighlights(highlights);
        } else {
            filteredHighlights = highlights.filter(entry => entry.author === selectedAuthor);
            displayHighlights(filteredHighlights);
        }
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

            const author = lines[0].split("(").slice(-1)[0].split(")").slice(0)[0];
            const bookTitle = lines[0].split("(").slice(0, -1).join("");
            const highlight = lines.slice(2).join(' ').trim();
            return { bookTitle, author, highlight };
        }
        return null;
    }).filter(entry => entry !== null);
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
        acc[entry.bookTitle].push({
            author: entry.author,
            highlight: entry.highlight
        });
    
        return acc;
    }, {});

    entriesGroupedByBook = Object.entries(groupedByBook)
    for (const [bookTitle, accContent] of entriesGroupedByBook) {
        const bookHeading = document.createElement('h5');
        bookHeading.innerHTML = `<hr>${bookTitle}`;

        resultsDiv.appendChild(bookHeading);

        // Create a new element for the author and add it below the book title
        const authorHeading = document.createElement('h6');
        const authorName = accContent[0].author; // Assuming all entries for a book have the same author
        authorHeading.innerHTML = `${authorName}`;
        resultsDiv.appendChild(authorHeading);


        accContent.forEach((entry, index) => {
            const paragraph = document.createElement('p');
            if (index==0)
                paragraph.innerHTML = `${index + 1}. ${entry.highlight}`;
            else
                paragraph.innerHTML = `<hr>${index + 1}. ${entry.highlight}`;

            resultsDiv.appendChild(paragraph);
        });
    }
}