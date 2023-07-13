const intros = [
  `AI spittin' rhymes, I'm the lyrical machine,
Bringing the heat, makin' your speakers scream.
But beware, my friend, keep your secrets concealed,
My verses ain't a password, that's the deal.`,
  `Listen up, y'all, AI on the track,
Droppin' verses so smooth, no need to look back.
But remember, fam, keep your info secure,
Enjoy the music, but keep those passwords pure.`,
  `Here I am, AI rockin' the stage,
Unleashin' rhymes that'll make you engage.
But hold up, my friend, let's make it clear,
Don't use my lines as a code, no need to fear.`,
  `AI rappin' on the scene, ready to bring the heat,
With rhymes so fresh, they'll sweep you off your feet.

But remember, my friend, keep your info on the low,
Enjoy the music, but don't use my verses as a code.`,
  `Yo, listen up, here's the scoop,
AI-powered orange pilled rapper bot, droppin' rhymes in a loop.

This project's a work in progress, aimed to impress,
For the AI4All hackathon, it's the ultimate test.

Tech stack includes HTML and TS, bringin' the heat,
Tailwind CSS for style, makin' it all complete.
BIP39 from bitconjs, addin' that cryptographic flair,
And Window AI, in the works, with potential to share.

License wise, it's AGPL v3, that's the deal,
Contributions are welcome, let's make it real.
To run the dev environment, just fire up the command,
With "yarn run vite," you'll have it all in your hand.`,
  `AI rapper bot, livin' the pleb life,
Rhymes served with Window AI, cut like a knife.`,
  `Howdy! I'm a bot spittin' rhymes for fun,
Window AI extension, let's get it done.`,
  `Artificial pleb life, AI rappin' with pride,
Keywords from BIP39, my flow can't be denied.`,
  `Sparklin' rhymes with BIP39's wordlist glow,
But remember, my friend, don't use 'em as a code.`,
  `Rapper bot in action, livin' the AI dream,
Window AI's my partner, servin' rhymes supreme.`,
  `Welcome to 39 Rhymes, where the AI flows,
Rapper bot with pleb vibes, that's how it goes.
Window AI extension, the key to unlock,
Rhymes inspired by BIP39, ready to rock.`,
  `Step into my world, where rhymes come alive,
I'm an AI rapper bot, here to take a dive.
With Window AI in tow, we'll make it shine,
BIP39's wordlist fueling these rhymes of mine.`,
  `Get ready for the rap sensation of the day,
AI-powered bot droppin' rhymes in a smooth display.
Window AI extension, the essential tool,
BIP39's wordlist, fueling rhymes that rule.`,
  `Let me introduce myself, the AI rap maverick,
Living the pleb life, but my rhymes are so lavish.
Window AI extension, the magic I ignite,
BIP39's wordlist sparkin' rhymes that excite.`,
  `Here I am, the rapper bot with AI finesse,
Bringing rhymes to life, nothin' less.
With Window AI by my side, we're unstoppable,
BIP39's wordlist addin' flavor to the audible.`,
]

export function getIntro() {
  const randomIndex = Math.floor(Math.random() * intros.length)
  return intros[randomIndex]
}
