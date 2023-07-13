import {generateMnemonic, wordlists} from "bip39"
import {sha256} from '@noble/hashes/sha256'
import { Buffer } from 'buffer'
import {getWindowAI, waitForWindowAI} from "window.ai"
import {getIntro} from "./introVerses"


async function main() {
  // DOM elements
  const errorSection = document.getElementById("missing-ai-error")
  const promptForm = document.getElementById("prompt-form")
  const resultSection = document.getElementById("result")
  const debugButton = document.getElementById("debug-button")
  const debugSection = document.getElementById("debug")

  //global state
  let wordlist = ""
  let currentModel = "unknown"
  let messages = []
  let responses = []
  let response = ""
  let responseMetadata = ""
  let rhymes = ""
  let lastWord = ""
  let seed = ""

  // BIP39

  // use a nodejs Buffer polyfill in the browser
  // see: https://github.com/vitejs/vite/discussions/2785
  globalThis.Buffer = Buffer
  const updateWordlist = () => generateMnemonic(256)

  // utility functions for the last word calc (copied from bitcoinjs lib)
  function lpad(str, padString, length) {
    while (str.length < length) {
        str = padString + str;
    }
    return str;
  }
  function binaryToByte(bin) {
      return parseInt(bin, 2);
  }
  function bytesToBinary(bytes) {
    return bytes.map((x) => lpad(x.toString(2), '0', 8)).join('');
  }
  function deriveChecksumBits(entropyBuffer) {
      const ENT = entropyBuffer.length * 8;
      const CS = ENT / 32;
      const hash = sha256(Uint8Array.from(entropyBuffer));
      return bytesToBinary(Array.from(hash)).slice(0, CS);
  }

  // my function to create a random 12th word, based on https://github.com/BitcoinQnA/seedtool
  function get12thWord(elevenMnemonic) {
    // English bip39 wordlist
    const wordlist = wordlists.english
    // convert words indices to 11 bit binary strings and append the 7 bits of the "last word" 
    const elevenEntropyBits =  elevenMnemonic.map(word => {
      const index = wordlist.indexOf(word)
      return lpad(index.toString(2), '0', 11)
    }).join('') 
    // 7 random bits to concatenate with the checksum bits
    const latWordEntropyBits = lpad(crypto.getRandomValues(new Uint8Array(1))[0].toString(2).slice(-7), '0', 7)
    // full seed in bits
    const entropyBits = elevenEntropyBits + latWordEntropyBits
    // full seed in bytes
    const entropyBytes = entropyBits.match(/(.{1,8})/g).map(binaryToByte);
    // checksum bits
    const checkSumBits = deriveChecksumBits(Buffer.from(entropyBytes))
    // full last word bits
    const lastWordBits = latWordEntropyBits + checkSumBits
    // last word from the wordlist
    const lastWord = wordlist[parseInt(lastWordBits, 2)];

    return lastWord
  }


  // Window AI

  // check if window.ai is supported
  try {
    await waitForWindowAI();
    promptForm.classList.remove("opacity-50")
    promptForm.querySelectorAll("input, textarea, button").forEach(el => {
      el.removeAttribute("disabled")
      if (el.nodeName.toLowerCase() === "button") {
        el.classList.add("hover:bg-slate-500")
        el.classList.add("hover:border-transparent")
        el.classList.add("hover:text-white")
      }
    })
  } catch (e) {
    errorSection.innerHTML = `
      <p>A <strong>window.ai</strong> provider is required to create new rhymes.</p>
      <p>Please install the <a href="https://chrome.google.com/webstore/detail/window-ai/cbhbgmdpcoelfdoihppookkijpmgahag">Window AI extention</a>, or if you have it already, try <a href="/">reloading the page</a></p>
    `
  }
  promptForm.addEventListener("click", () => {
    if (promptForm.classList.item(0) === "opacity-50") {
      errorSection.classList.toggle("hidden")
    }
  })


  // Debug
  debugButton.addEventListener("click", () => {
    debugSection.classList.toggle("hidden")
  })
  const printDebug = () => {
    const debugElement = `
    <pre class="whitespace-pre-line">
      Wordlist: ${wordlist}
      hasWindowAi: ${window.ai !== undefined}
      currentModel: ${currentModel}
      Request: ${JSON.stringify(messages, " ", 2)}
      Response: ${JSON.stringify(response, " ", 2)}
      Response Metadata: ${responseMetadata}
      Seed: ${seed}
    </pre>
    `

    debugSection.innerHTML = debugElement
  }


  const buildPrompt = () => {
    const formData = new FormData(promptForm)
    const songTitle = formData.get("title")
    const songStory = formData.get("story")
    const hasTitle = songTitle.length > 2
    const hasStory = songStory.length > 2
    
    return [
      {
        role: "system",
        // FUN FACT:
        // Google's bison (google/palm-2-chat-bison) have a problem with counting, 
        // we will only use 11 words but we ask for 12
        // because when the prompt asks 11 Google returns only 10
        content: `
You are a rap song composition bot. Your goal is to generate the a short rap using exactly 12 words from a given Wordlist. All choses words MUST be from the Wordlist.

The user can provide a title and story to give you more context, words from the user input DO NOT count as Wordlist.

Compose a rap that incorporates the user's title and story while utilizing the 12 chosen words. Make it catchy and full of energy, capturing the essence of the given context.

The Wordlist: ${wordlist}

After completing the rap, conclude your message by listing the 11 chosen words from the Wordlist in the order that they were used in json format. This json should be in a section called METADATA in the end of the response.

        `
      },
      {
        role: "user",
        content: `
        ${hasTitle ? `title: ${songTitle}` : ""}
        ${hasStory ? `story: ${songStory}` : ""}
        `.trim()
      }
    ]
  }


  // AI response
  const parseResponseMetadata = (response) => {
    const responseParts = response.split("METADATA")
    
    if (responseParts.length < 2) { return [response, ""] }

    responseMetadata = responseParts[1]
    try {
      // We want to build the final seed from the words picked 
      // by the AI, so we use the first 11 words and generate a new
      // checksum (12th word)
      const matches = responseMetadata.match(/\[[^\]]*\]/)
      const elevenMnemonic = JSON.parse(matches[0]).slice(0,11)
      lastWord = get12thWord(elevenMnemonic)
      const seed = elevenMnemonic.concat(lastWord)

      return [responseParts[0], seed]
    } catch (e) {
      console.error(e)

      return [responseParts[0], ""]
    }
  }
  
  const generateRhymes = async e => {
    e.preventDefault()
    const formData = new FormData(promptForm)
    const songTitle = formData.get("title")
    wordlist = updateWordlist()
    messages = buildPrompt()
    printDebug()

    resultSection.innerHTML = `<span class="text-indigo-600">thinking...</span>`
    resultSection.classList.remove("hidden")

    const ai = await getWindowAI()
    const {generateText, getCurrentModel} = ai
    try {
      currentModel = await getCurrentModel()
      printDebug()
      responses = await generateText({ messages })
      printDebug()
    } catch (e) {
      return resultSection.innerHTML = `<p>Window AI error.</p><dt>Details:</dt><dd>${e}</dd><p>Maybe try changing the model.</p>`
    }
    response = responses[0]
    printDebug()
    let [rhymes, seed] = parseResponseMetadata(response.message?.content)
    printDebug()

    const markedText = rhymes.replace(
      new RegExp('\\b(' + seed.join('|') + ')\\b', 'gi'),
      '*$1*'
    )
    
    resultSection.innerHTML = `
      <pre class="whitespace-pre-line">
        # ${songTitle}

        ${markedText}
        *${lastWord}*

        ---
        Model: ${currentModel}
        Created at: ${window.location}
        Seed:${seed.join(" ")}
        ${new Date().toLocaleDateString("pt-BR")}
      </pre>`
  }
  promptForm.addEventListener("submit", generateRhymes)

  // intro verse
  resultSection.innerHTML = `
    <pre class="whitespace-pre-line">
          # Welcome

          ${getIntro()}

          ---
          Model: openai/gpt-4
          Created at: https://chat.openai.com/
          12/07/2023
    <pre>`

  printDebug()
}


window.addEventListener('load', main)