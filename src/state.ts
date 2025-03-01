import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { store } from './main'

export const useHighlightStore = defineStore('highlightStore', () => {
  const highlightsDF = reactive<HighlightDF[]>([])
  const filterActive = ref(false)

  const selectedAuthor = ref('All Authors')
  //const selectedBook = ref('All Books')

  const filteredHighlights = computed(() => {
    if (!filterActive.value) return highlightsDF
    return highlightsDF.filter((highlight) => {
      return (
        !selectedAuthor.value || highlight.author === selectedAuthor.value // &&
        //(!state.selectedBook || highlight.bookTitle === state.selectedBook)
      )
    })
  })
  return { highlightsDF, filterActive, selectedAuthor, filteredHighlights }
})

// export type State = {
//   highlightsDF: HighlightDF[]
//   filteredHighlights: HighlightDF[]
//   filterActive: boolean
//   selectedAuthor: string
//   selectedBook: string
// }

export type HighlightDF = {
  id: number
  booktitle: string
  author: string
  highlight: string
  metadata: string
  deleted: boolean
}

export function selectAuthor(selectedAuthor: string) {
  store.filterActive = selectedAuthor !== 'All Authors'
  store.selectedAuthor = selectedAuthor
}
