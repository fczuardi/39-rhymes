import {generateMnemonic} from "bip39"
import { Buffer } from 'buffer'
import {getWindowAI, waitForWindowAI} from "window.ai"


async function main() {
  // DOM elements
  const errorSection = document.getElementById("missing-ai-error")
  const promptForm = document.getElementById("prompt-form")
  const resultSection = document.getElementById("result")
  const debugSection = document.getElementById("debug")


  // BIP39

  // use a nodejs Buffer polyfill in the browser
  // see: https://github.com/vitejs/vite/discussions/2785
  globalThis.Buffer = Buffer
  let mnemonic = generateMnemonic()


  // Window AI

  // check if window.ai is supported
  try {
    await waitForWindowAI();
    promptForm.classList.remove("hidden")
  } catch (e) {
    errorSection.className = 'p-4 m-4 rounded-lg bg-yellow-100'
    errorSection.innerHTML = `
      <p>A <strong>window.ai</strong> provider is required to create new rhymes.</p>
      <p>Please install the <a href="https://chrome.google.com/webstore/detail/window-ai/cbhbgmdpcoelfdoihppookkijpmgahag">Window AI extention</a>, or if you have it already, try <a href="/">reloading the page</a></p>
    `
  }

  // Debug
  let currentModel = "unknown"
  const printDebug = () => {
    const debugElement = `
      <h4>Debug</h4>
      <dt>mnemonic</dt>
      <dd><pre>${mnemonic}</pre></dd>
      <dt>hasWindowAi</dt>
      <dd>${window.ai !== undefined}</dd>
      <dt>currentModel</dt>
      <dd>${currentModel}</dd>
    `

    debugSection.innerHTML = debugElement
  }
  printDebug()

  const buildPrompt = () => {
    const formData = new FormData(promptForm);
    const songTitle = formData.get("title")
    const songStory = formData.get("story")

    return {
      role: "user",
      content: `
Please make me the first verse of a rap song following this rules:
1. It must use the words from THE LIST: [${mnemonic}] the order is important.
2. You cannot use a word from the list more than one time.
4. Mark each used word with an "*" before and an "*" after. Stop marking words after the last one from THE LIST is used.
5. The song is about Bitcoin. Please dont use the word "crypto".

${songStory.length < 3 ? "" : `Feel free to write a second verse without asterisks and about ${songStory}`}.
`
    }
  }

  // AI response
  promptForm.addEventListener("submit", async e => {
    e.preventDefault()
    resultSection.innerHTML = `<span class="text-indigo-600">thinking...</span>`
    resultSection.classList.remove("hidden")
    const formData = new FormData(promptForm);
    const songTitle = formData.get("title")

    const ai = await getWindowAI()
    const {generateText, getCurrentModel} = ai
    currentModel = await getCurrentModel()
    const [response] = await generateText({ messages: [buildPrompt()] })
    resultSection.innerHTML = `
      <pre class="whitespace-pre-line">
        # ${songTitle}

        ${response?.message?.content}
      </pre>`
    printDebug()
    mnemonic = generateMnemonic()
  })
}


window.addEventListener('load', main)