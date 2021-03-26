# Implementing DOS Games
This is a hacked together API. This is how to do it.

1. Clone the repository
2. Create a folder (`/dist/games/dos/my-game-name-here`)
3. Copy `/games/dos/digger/index.html` into the new folder
4. Pop your DOS GAME zip file (they come in zips) into the same folder
5. Edit the JavaScript in `index.html` as required for your new game
6. Run `npm run dev` (Hot Module Replacement not implemented - i.e. manual refresh)

## UI Notes
 * The User Interface uses TailwindCSS (www.tailwindcss.com)
 * If you need to change UI elements, you need to follow the steps below.

### Using Tailwind

1. Edit the style link in `index.html`, from `/css/tailwindpurged.min.css` to `/css/tailwind.min.css` (this uses the original tailwind with *all* the classes)
2. Make the changes to your `index.html` as required.
3. Recreate a new `/css/tailwindpurged.min.css` by using the `purgecss` commandline interface.

```bash
npx purgecss --css tailwind.min.css --content games/dos/**/index.html --output output6.css
```
**IMPORTANT:** You need to use the source of all the index.html's as inputs to purgecss so that you don't accidentally remove the classes they use. In the above example you can see the `/**/index.html` that caters for this.



