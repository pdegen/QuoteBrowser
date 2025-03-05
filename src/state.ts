import { defineStore } from 'pinia'
import { ref, computed, reactive, type Ref } from 'vue'
import { store } from './main'

type UndoElement = {
  action: string
  id: number
}

export const useHighlightStore = defineStore('highlightStore', () => {
  const highlightsDF = reactive<HighlightDF[]>([])
  const filterActive = ref(false)
  const sortOption = ref(SortOptions.AUTHOR)
  const undoStack: Ref<UndoElement[]> = ref([])

  const selectedAuthor = ref('All Authors')
  //const selectedBook = ref('All Books')

  function $reset() {
    undoStack.value = []
    highlightsDF.length = 0
    filterActive.value = false
    sortOption.value = SortOptions.AUTHOR
    selectedAuthor.value = 'All Authors'
    //selectedBook.value = 'All Books'
  }

  const filteredHighlights = computed(() => {
    let results = [...highlightsDF]

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
      case SortOptions.HIGHLIGHT_COUNT_AUTHOR:
        results.sort(
          (a, b) => highlightsPerAuthor.value[b.author] - highlightsPerAuthor.value[a.author],
        )
        break
      case SortOptions.HIGHLIGHT_COUNT_TITLE:
        results.sort(
          (a, b) => highlightsPerBook.value[b.booktitle] - highlightsPerBook.value[a.booktitle],
        )
        break
    }

    return results
  })

  const highlightsPerAuthor = computed(() => {
    return highlightsDF.reduce(
      (acc, highlight) => {
        if (!highlight.deleted) {
          acc[highlight.author] = (acc[highlight.author] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )
  })

  const highlightsPerBook = computed(() => {
    return highlightsDF.reduce(
      (acc, highlight) => {
        if (!highlight.deleted) {
          acc[highlight.booktitle] = (acc[highlight.booktitle] || 0) + 1
        }
        return acc
      },
      {} as Record<string, number>,
    )
  })

  const totalHighlights = computed(() => {
    return Object.values(highlightsPerBook.value).reduce((sum, count) => sum + count, 0)
  })

  const totalSelected = computed(() => {
    return Object.values(filteredHighlights.value).filter((h) => h.selected && !h.deleted).length
  })

  return {
    highlightsDF,
    filterActive,
    sortOption,
    selectedAuthor,
    filteredHighlights,
    highlightsPerAuthor,
    highlightsPerBook,
    totalHighlights,
    undoStack,
    totalSelected,
    $reset,
  }
})

export type HighlightDF = {
  id: number
  booktitle: string
  author: string
  highlight: string
  metadata: string
  deleted: boolean
  selected: boolean
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
