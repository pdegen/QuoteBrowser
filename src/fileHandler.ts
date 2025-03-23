import { store } from './main'
import { type HighlightDF } from './state'

const delim = '=========='

export function uploadSample() {
  store.$reset()
  fetch('SampleClippings.txt')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch sample file.')
      }
      return response.text() // Read the file as text
    })
    .then((fileContent) => {
      parseClippings(fileContent)
    })
    .catch((error) => console.error('Error uploading sample file:', error))
}

export function handleFileUpload(event: Event) {
  store.$reset()
  const target = event.target as HTMLInputElement
  if (!target.files) return
  const file = target.files[0]

  if (file && file.type === 'text/plain') {
    //clearAll()
    const reader = new FileReader()

    reader.onload = function (e) {
      if (e.target && typeof e.target.result === 'string') {
        const fileContent = e.target.result
        parseClippings(fileContent)
      } else throw new Error('No target.')
    }

    reader.readAsText(file)
  } else {
    alert('Please upload a valid .txt file.')
  }
}

function parseClippings(content: string) {
  const entries = content
    .split(delim)
    .map((entry) => entry.trim())
    .filter((entry) => entry)

  const entriesList = entries
    .map((entry) => {
      const lines = entry.split('\n').filter((line) => line)
      if (lines.length >= 3) {
        const author = lines[0].split('(').slice(-1)[0].split(')').slice(0)[0]
        const bookTitle = lines[0].split('(').slice(0, -1).join('')
        const metadata = lines[1].slice(2) // location, page, datetime
        const highlight = lines.slice(2).join(' ').trim()
        return { bookTitle, author, highlight, metadata }
      }
      return null
    })
    .filter((entry) => entry !== null)

  entriesList.forEach((entry, id) => {
    store.highlightsDF.push({
      id: id,
      booktitle: entry.bookTitle,
      author: entry.author,
      highlight: entry.highlight,
      metadata: entry.metadata,
      deleted: false,
      selected: false,
      favorited: entry.metadata.includes('$F'),
    })
  })
}

export function saveHighlightsDF(highlightDF: HighlightDF[]) {
  let content = ''

  for (let i = 0; i < highlightDF.length; i++) {
    const h = highlightDF[i]
    if (h.deleted) continue

    content += `${delim}\n${h.booktitle} (${h.author})}\n${h.metadata}`
    if (h.favorited) content += ' | $F'
    content += `\n\n${h.highlight}\n`
  }

  saveToFile(content)
}

function saveToFile(content: string) {
  const blob = new Blob([content], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)

  const link = document.createElement('a')
  link.href = url
  link.download = 'myFile.txt'
  link.click()

  URL.revokeObjectURL(url) // Clean up
}
