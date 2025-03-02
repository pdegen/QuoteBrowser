<script setup lang="ts">
import { ref, computed } from 'vue'
import { selectAuthor, SortOptions } from './state.ts'
import { store } from './main.ts'
import { handleFileUpload, uploadSample } from './fileHandler'
import { useDark, useToggle } from '@vueuse/core'

const isDark = useDark({
  selector: 'body', //element to add attribute to
  attribute: 'theme', // attribute name
  valueDark: 'custom-dark', // attribute value for dark mode
  valueLight: 'custom-light', // attribute value for light mode
})
const toggleDark = useToggle(isDark)

const highlightsActive = ref(true)
const metadataActive = ref(false)
const editsActive = ref(false)
const highlightsCountActive = ref(false)

function toggleHighlightsCount() {
  highlightsCountActive.value = !highlightsCountActive.value
}

function toggleHighlights() {
  highlightsActive.value = !highlightsActive.value
}

function toggleMetadata() {
  metadataActive.value = !metadataActive.value
}

function toggleEdits() {
  editsActive.value = !editsActive.value
}

const selectSortOption = (option: string) => {
  if (Object.values(SortOptions).includes(option as SortOptions)) {
    store.sortOption = option as SortOptions
  }
}

function getAuthorList() {
  const authors = [...new Set(Array.from(store.highlightsDF.values()).map((entry) => entry.author))]
  authors.sort()
  return ['All Authors', ...authors]
}
const allAuthors = computed(() => getAuthorList())
const searchQuery = ref('') // User input for filtering authors

const filteredAuthors = computed(() => {
  return allAuthors.value.filter((author) =>
    author.toLowerCase().includes(searchQuery.value.toLowerCase()),
  )
})

type Entry = {
  id: number
  highlights: string
  metadata: string
  deleted: boolean
}

const groupedHighlights = computed(() => {
  const groups = new Map<
    string,
    { id: number; author: string; booktitle: string; entry: Entry[] }
  >()

  store.filteredHighlights.forEach((h) => console.log(h))

  for (const h of store.filteredHighlights) {
    const key = `${h.author}::${h.booktitle}`

    if (!groups.has(key)) {
      groups.set(key, {
        id: h.id,
        author: h.author,
        booktitle: h.booktitle,
        entry: [],
      })
    }

    groups
      .get(key)!
      .entry.push({ id: h.id, highlights: h.highlight, metadata: h.metadata, deleted: h.deleted })
  }

  return Array.from(groups.values())
})

type UndoElement = {
  action: string
  id: number
}
const undoStack: UndoElement[] = []

function deleteHighlight(id: number) {
  const item = store.filteredHighlights.find((h) => h.id === id)
  if (item) {
    item.deleted = true
  }
  undoStack.push({ action: 'delete', id })
}

function undo() {
  const lastAction = undoStack.pop()
  if (lastAction && lastAction.action === 'delete') {
    // must use highlightsDF; else, when deleting and changing to different author and undoing, won't work
    const item = store.highlightsDF.find((h) => h.id === lastAction.id)
    if (item) {
      item.deleted = false
    }
  }
}
</script>

<template>
  <div class="container my-5">
    <h1 class="text-center" id="header">Kindle Highlights Viewer</h1>

    <div class="mb-3 d-flex align-items-center gap-2">
      <label for="fileInput" class="form-label mb-0" style="white-space: nowrap"
        >Upload MyClippings.txt</label
      >
      <input
        type="file"
        id="fileInput"
        class="form-control"
        accept=".txt"
        @input="(event) => handleFileUpload(event)"
      />
      <button @click="uploadSample()" id="sampleButton" class="btn btn-secondary">
        Sample Clippings
      </button>
    </div>

    <!-- Control grid -->
    <div class="mb-3">
      <!-- Grid container -->
      <div
        class="d-grid"
        style="
          grid-template-rows: auto auto;
          grid-template-columns: 0fr 0.2fr 0.2fr 0.2fr 0.2fr 0.2fr 0.2fr 0.2fr;
          gap: 0.5rem;
          place-items: center;
        "
      >
        <!-- Top Row: Labels -->
        <label for="authorDropdown" class="form-label">Filter by Author</label>
        <label for="sortBy" class="form-label">Sort</label>
        <label for="toggleHighlight" class="form-label">Show Highlight</label>
        <label for="toggleHighlightsCount" class="form-label">Show Count</label>
        <label for="toggleMetadata" class="form-label">Show Metadata</label>
        <label for="toggleTheme" class="form-label">Dark Mode</label>
        <label for="toggleEdits" class="form-label">Edit Highlights</label>
        <label for="undoButton" class="form-label">
          <span v-if="editsActive"> Undo stack: {{ undoStack.length }}</span></label
        >

        <!-- Bottom Row: Dropdown and Toggle -->
        <div class="dropdown">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="authorDropdownButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            {{ store.selectedAuthor }}
          </button>
          <ul class="dropdown-menu" id="authorDropdown">
            <input
              v-model="searchQuery"
              type="text"
              class="search-input"
              id="searchInput"
              placeholder="Search authors..."
            />
            <!-- Dropdown options will be added dynamically here -->
            <li
              v-for="author in filteredAuthors"
              :key="author"
              class="dropdown-item"
              @click="selectAuthor(author)"
            >
              {{ author }}
            </li>

            <li v-if="filteredAuthors.length === 0" class="dropdown-item text-muted-custom">
              No authors found
            </li>
          </ul>
        </div>

        <div class="dropdown">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="sortBy"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            Sort by
          </button>
          <ul class="dropdown-menu" aria-labelledby="sortBy">
            <li>
              <a
                class="dropdown-item"
                href="#"
                data-value="author"
                @click="selectSortOption('author')"
                >Author (Alphabetical)</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                data-value="highlightCountAuthor"
                @click="selectSortOption('highlightCountAuthor')"
                >Author (Highlights)</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                data-value="title"
                @click="selectSortOption('title')"
                >Title (Alphabetical)</a
              >
            </li>
            <li>
              <a
                class="dropdown-item"
                href="#"
                data-value="highlightCountTitle"
                @click="selectSortOption('highlightCountTitle')"
                >Title (Highlights)</a
              >
            </li>
          </ul>
        </div>

        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="toggleHighlight"
            checked
            @change="toggleHighlights()"
          />
          <label class="form-check-label" for="toggleHighlight"></label>
        </div>

        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="toggleHighlight"
            @change="toggleHighlightsCount()"
          />
          <label class="form-check-label" for="toggleHighlightsCount"></label>
        </div>

        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="toggleMetadata"
            @change="toggleMetadata()"
          />
          <label class="form-check-label" for="toggleMetadata"></label>
        </div>

        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="toggleTheme"
            checked
            @change="toggleDark()"
          />
          <label class="form-check-label" for="toggleTheme"></label>
        </div>

        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="toggleEdits" @change="toggleEdits" />
          <label class="form-check-label" for="toggleEdits"></label>
        </div>

        <button v-if="editsActive" id="undoButton" class="btn btn-secondary" @click="undo">
          Undo Delete
        </button>
      </div>
    </div>

    <!-- Results -->
    <span v-if="highlightsCountActive">Total Highlights: {{ store.totalHighlights }}</span>
    <div style="overflow-y: auto; height: 900px">
      <div v-for="group in groupedHighlights" :key="group.author + group.booktitle">
        <div v-if="store.highlightsPerBook[group.booktitle] > 0">
          <hr />
          <h5>
            {{ group.author }}
            <span class="text-muted-custom" style="font-size: 1rem" v-if="highlightsCountActive"
              >({{ store.highlightsPerAuthor[group.author] }} highlights)</span
            >
          </h5>
          <h6>
            {{ group.booktitle }}
            <span class="text-muted-custom" v-if="highlightsCountActive"
              >({{ store.highlightsPerBook[group.booktitle] }} highlights)</span
            >
          </h6>
          <div v-for="(entry, index) in group.entry" :key="index">
            <div v-if="!entry.deleted">
              <div v-if="metadataActive || highlightsActive || editsActive">
                <hr />
              </div>

              <p v-if="metadataActive" class="text-muted-custom">
                {{ entry.metadata }}
                <br />
              </p>

              <p v-if="highlightsActive">{{ index + 1 }}. {{ entry.highlights }}</p>
              <div v-if="editsActive">
                <button class="btn btn-danger btn-sm" @click="deleteHighlight(entry.id)">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
[theme='custom-light'] {
  #header {
    background-color: royalblue;
    color: #fff;
  }
  .text-muted-custom {
    color: grey;
  }
}
[theme='custom-dark'] {
  background: #16171d;
  color: #fff;

  #header {
    background-color: crimson;
  }

  .text-muted-custom {
    color: silver;
  }
}
</style>
