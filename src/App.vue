<script setup lang="ts">
import { ref, watch } from 'vue'
import { init, type State } from './state.ts'
import { uploadSample } from './fileHandler'

let highlightsActive = ref(true)
let metadataActive = ref(true)
let editsActive = ref(false)

const state = ref(init())

function toggleHighlights() {
  highlightsActive.value = !highlightsActive.value
}

function toggleMetadata() {
  metadataActive.value = !metadataActive.value
}

function toggleEdits() {
  editsActive.value = !editsActive.value
}

const resultsDiv = ref<HTMLElement | null>(null)
watch(
  state,
  (newValue) => {
    if (resultsDiv.value) {
      resultsDiv.value.innerText = JSON.stringify(newValue, null, 2)
    }
  },
  { deep: true },
)
</script>

<template>
  <div class="container my-5">
    <h1 class="text-center" style="background-color: royalblue; color: white">
      Kindle Highlights Viewer
    </h1>

    <div class="mb-3 d-flex align-items-center gap-2">
      <label for="fileInput" class="form-label mb-0" style="white-space: nowrap"
        >Upload MyClippings.txt</label
      >
      <input type="file" id="fileInput" class="form-control" accept=".txt" />
      <button @click="uploadSample(state)" id="sampleButton" class="btn btn-secondary">
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
          grid-template-columns: 0fr 0.2fr 0.2fr 0.2fr 0.2fr 0.2fr;
          gap: 0.5rem;
          place-items: center;
        "
      >
        <!-- Top Row: Labels -->
        <label for="authorDropdown" class="form-label">Filter by Author</label>
        <label for="sortBy" class="form-label">Sort</label>
        <label for="toggleHighlight" class="form-label">Show Highlight</label>
        <label for="toggleMetadata" class="form-label">Show Metadata</label>
        <label for="toggleEdits" class="form-label">Edit Highlights</label>
        <label for="undoButton" class="form-label"></label>

        <!-- Bottom Row: Dropdown and Toggle -->
        <div class="dropdown">
          <button
            class="btn btn-secondary dropdown-toggle"
            type="button"
            id="authorDropdownButton"
            data-bs-toggle="dropdown"
            aria-expanded="false"
          >
            All Authors
          </button>
          <ul class="dropdown-menu" id="authorDropdown">
            <input
              type="text"
              class="search-input"
              id="searchInput"
              placeholder="Search authors..."
            />
            <!-- Dropdown options will be added dynamically here -->
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
            <li><a class="dropdown-item" href="#" data-value="author">Author (Alphabetical)</a></li>
            <li>
              <a class="dropdown-item" href="#" data-value="highlightCountAuthor"
                >Author (Highlights)</a
              >
            </li>
            <li><a class="dropdown-item" href="#" data-value="title">Title (Alphabetical)</a></li>
            <li>
              <a class="dropdown-item" href="#" data-value="highlightCountTitle"
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
            @change="toggleHighlights"
          />
          <label class="form-check-label" for="toggleHighlight"></label>
        </div>

        <div class="form-check form-switch">
          <input
            class="form-check-input"
            type="checkbox"
            id="toggleMetadata"
            @change="toggleMetadata"
          />
          <label class="form-check-label" for="toggleMetadata"></label>
        </div>

        <div class="form-check form-switch">
          <input class="form-check-input" type="checkbox" id="toggleEdits" @change="toggleEdits" />
          <label class="form-check-label" for="toggleEdits"></label>
        </div>

        <button v-if="editsActive" id="undoButton" class="btn btn-secondary">Undo Delete</button>
      </div>
    </div>

    <!-- Results -->
    <div ref="resultsDiv" class="border p-3">
      <p class="text-muted">Highlights will appear here.</p>
    </div>
  </div>
</template>

<style scoped></style>
