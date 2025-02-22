import { ref, computed } from 'vue'

export type State = {
  highlightsDF: HighlightDF[]
}

export type HighlightDF = {
  id: number
  bookTitle: string
  author: string
  highlight: string
  metadata: string
}

export function init(): State {
  return { highlightsDF: [] }
}

// Computed property to filter highlights by author (like filtering a DataFrame)
// const filteredHighlights = computed((highlights: HighlightDF) =>
//   highlights.value.filter(entry => entry.author === "Author X")
// );
