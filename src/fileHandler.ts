import { type State } from './state'

export function uploadSample(state: State) {
  //clearAll()
  fetch('data/SampleClippings.txt')
    .then((response) => {
      if (!response.ok) {
        throw new Error('Failed to fetch sample file.')
      }
      return response.text() // Read the file as text
    })
    .then((fileContent) => {
      parseClippings(fileContent, state)
    })
    .catch((error) => console.error('Error uploading sample file:', error))
}

export function handleFileUpload(event: Event, state: State) {
  const target = event.target as HTMLInputElement
  if (!target.files) return
  const file = target.files[0]

  if (file && file.type === 'text/plain') {
    //clearAll()
    const reader = new FileReader()

    reader.onload = function (e) {
      if (e.target && typeof e.target.result === 'string') {
        const fileContent = e.target.result
        parseClippings(fileContent, state)
      } else throw new Error('No target.')
    }

    reader.readAsText(file)
  } else {
    alert('Please upload a valid .txt file.')
  }
}

function parseClippings(content: string, state: State) {
  const entries = content
    .split('==========')
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
    state.highlightsDF.push({
      id: id,
      bookTitle: entry.bookTitle,
      author: entry.author,
      highlight: entry.highlight,
      metadata: entry.metadata,
    })
  })
}
