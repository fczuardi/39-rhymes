import {generateMnemonic} from "bip39"
import { Buffer } from 'buffer'
import {getWindowAI, waitForWindowAI} from "window.ai"


async function main() {
  // DOM elements
  const errorSection = document.getElementById("missing-ai-error")
  const promptSection = document.getElementById("prompt")
  const promptForm = document.getElementById("prompt-form")
  const resultSection = document.getElementById("result")
  const debugSection = document.getElementById("debug")


  // BIP39

  // use a nodejs Buffer polyfill in the browser
  // see: https://github.com/vitejs/vite/discussions/2785
  globalThis.Buffer = Buffer
  const mnemonic = generateMnemonic()


  // Window AI

  // display user prompt if window.ai provider is found
  try {
    await waitForWindowAI();
    promptSection.classList.remove("hidden")
  } catch (e) {
    errorSection.className = 'p-4 m-4 rounded-lg bg-yellow-100'
    errorSection.innerHTML = `
      <p>A <strong>window.ai</strong> provider is required to create new rhymes.</p>
      <p>Please install the <a href="https://chrome.google.com/webstore/detail/window-ai/cbhbgmdpcoelfdoihppookkijpmgahag">Window AI extention</a>, or if you have it already, try <a href="/">reloading the page</a></p>
    `
  }

  promptForm.addEventListener("submit", async e => {
    e.preventDefault()
    const ai = await getWindowAI()
    const {generateText, getCurrentModel} = ai
    resultSection.classList.remove("hidden")
    const [response] = await generateText({ messages: [{role: "user", content: "Who are you?"}] })
    console.log({response})
    resultSection.innerHTML = `<pre class="whitespace-pre-line">${response?.message?.content}</pre>`
  })

  const debugElement = `
    <h4>Debug</h4>
    <dt>hasWindowAi</dt>
    <dd>${window.ai !== undefined}</dd>
    <dt>mnemonic</dt>
    <dd><pre>${mnemonic}</pre></dd>
  `

  debugSection.innerHTML = debugElement
}


window.addEventListener('load', main)