import {generateMnemonic} from "bip39"
import { Buffer } from 'buffer'

// use a nodejs Buffer polyfill in the browser
// see: https://github.com/vitejs/vite/discussions/2785
globalThis.Buffer = Buffer

const mnemonic = generateMnemonic()

const debugElement = `
  <h4>Debug</h4>
  <dt>mnemonic</dt>
  <dd><pre>${mnemonic}</pre></dd>
`

document.getElementById("debug").innerHTML = debugElement
