import {generateMnemonic} from "bip39"
import { Buffer } from 'buffer'
import {getWindowAI, waitForWindowAI} from "window.ai"


async function main() {
  // DOM elements
  const errorSection = document.getElementById("missing-ai-error")
  const promptForm = document.getElementById("prompt-form")
  const resultSection = document.getElementById("result")
  const debugButton = document.getElementById("debug-button")
  const debugSection = document.getElementById("debug")

  //globals
  let currentModel = "unknown"
  let message = ""

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
  debugButton.addEventListener("click", () => {
    debugSection.classList.toggle("hidden")
  })
  const printDebug = () => {
    const debugElement = `
      <dt>mnemonic</dt>
      <dd><pre>${mnemonic}</pre></dd>
      <dt>hasWindowAi</dt>
      <dd>${window.ai !== undefined}</dd>
      <dt>currentModel</dt>
      <dd>${currentModel}</dd>
      <dt>Prompt</dt>
      <dd><pre>${message.content}</pre></dd>
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
Make me the first verse of a rap song following the rules below:

1. It must use the words from this ordered list: [${mnemonic.split(" ").map(i => `"${i}"`).join(", ")}]. 
2. All words must be used, they must appear in the provided order.
3. Mark each used word with an "*" before and an "*" after it. Mark each word only once.
4. Do not mark words that are not part of the list.
5. The song is about Bitcoin. The song is not about crypto.
${songStory.length < 3 ? "" : `
Feel free to write about "${songStory}" even though this is not part of the wordlist.`}`
    }
  }

  // AI response
  promptForm.addEventListener("submit", async e => {
    e.preventDefault()
    resultSection.innerHTML = `<span class="text-indigo-600">thinking...</span>`
    resultSection.classList.remove("hidden")
    const formData = new FormData(promptForm)
    const songTitle = formData.get("title")
    message = buildPrompt()

    const ai = await getWindowAI()
    const {generateText, getCurrentModel} = ai
    try {
      currentModel = await getCurrentModel()
      const [response] = await generateText({ messages: [message] })
      resultSection.innerHTML = `
        <pre class="whitespace-pre-line">
          # ${songTitle}

          ${response?.message?.content}

          ---
          Model: ${currentModel}
          Created at: ${window.location}
          ${new Date().toLocaleDateString("pt-BR")}
        </pre>`
      printDebug()
    } catch (e) {
      resultSection.innerHTML = `<p>Window AI error.</p><dt>Details:</dt><dd>${e}</dd><p>Maybe try changing the model.</p>`
    }
    mnemonic = generateMnemonic()
  })
}


window.addEventListener('load', main)