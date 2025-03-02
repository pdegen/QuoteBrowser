import { defineStore } from 'pinia'
import { ref, computed, reactive } from 'vue'
import { store } from './main'

export const useHighlightStore = defineStore('highlightStore', () => {
  const highlightsDF = reactive<HighlightDF[]>([])
  const filterActive = ref(false)
  const sortOption = ref(SortOptions.AUTHOR)

  const selectedAuthor = ref('All Authors')
  //const selectedBook = ref('All Books')

  const filteredHighlights = computed(() => {
    let results = [...highlightsDF]

    // Apply filter if active
    if (store.filterActive) {
      results = results.filter(
        (highlight) => !selectedAuthor.value || highlight.author === selectedAuthor.value,
      )
    }

    switch (store.sortOption) {
      case SortOptions.AUTHOR:
        results.sort((a, b) => a.author.localeCompare(b.author))
        break
      case SortOptions.TITLE:
        results.sort((a, b) => a.booktitle.localeCompare(b.booktitle))
        break
    }

    return results
  })

  return { highlightsDF, filterActive, sortOption, selectedAuthor, filteredHighlights }
})

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

export enum SortOptions {
  AUTHOR = 'author',
  TITLE = 'title',
  HIGHLIGHT_COUNT_AUTHOR = 'highlightCountAuthor',
  HIGHLIGHT_COUNT_TITLE = 'highlightCountTitle',
}
