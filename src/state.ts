export type State = {
  highlightsDF: HighlightDF[]
  filterActive: boolean
  selectedAuthor: string
  selectedBook: string
}

export type HighlightDF = {
  id: number
  booktitle: string
  author: string
  highlight: string
  metadata: string
}

export function init(): State {
  return {
    highlightsDF: [],
    filterActive: false,
    selectedAuthor: 'All Authors',
    selectedBook: 'All Books',
  }
}

export function selectAuthor(selectedAuthor: string, state: State) {
  state.filterActive = selectedAuthor !== 'All Authors'
  state.selectedAuthor = selectedAuthor
}
