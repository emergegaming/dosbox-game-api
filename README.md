# Implementing DOS Games
This is a hacked together API. This is how to do it.

1. Clone the repository
2. Create a folder (`/dist/games/dos/my-game-name-here`)
3. Copy `/games/dos/digger/index.html` into the new folder
4. Pop your DOS GAME zip file (they come in zips) into the same folder
5. Edit the JavaScript in `index.html` as required for your new game (see: ***Techniques*** below)
6. The UI makes use of tailwindCSS. Use the full tailwind set for development, then remove unused utility classes (see: ***Using tailwind*** below)
7. Run `npm run dev` (Hot Module Replacement not implemented - i.e. manual refresh)
8. Zip up the DIST folder and upload. Have the tournament team link the game URL in a IFRAME.
## Using Tailwind
   * The User Interface uses TailwindCSS (www.tailwindcss.com)
   * The full tailwind utility classes file is in `/css/tailwind.min.css`
   * The fill tailwind file is large and unused CSS classes need to be purged before deployment.

<blockquote>

1. Edit the style link in `index.html`, from `/css/tailwind-purged.min.css` to `/css/tailwind.min.css`
2. Make the changes to your `index.html` as required.
3. Recreate a new `/css/tailwind-purged.min.css` by using the `purgecss` commandline interface.
```
npx purgecss --css ./css/tailwind.min.css --content ./games/dos/digger/index.html games/dos/dangerous-dave/index.html --output css/tailwind-purged.css```
```
</blockquote>

## Techniques
Please use existing games as a guide (in `/dist/games/dos/**`). This documentation is supplementary. 
<blockquote>It's okay to work in the /dist directory. Only the /dist/index.js (minified / uglified / bundled) file is being auto-generated and placed in there. </blockquote>

### Automatically starting a game

There are three techniques for starting a game (i.e. getting through title and configuration screens):
1. You can watch a pixel and do something when the colour changes
2. You can wait for a certain number of milliseconds to pass then do something
3. You can automate the pressing of a key

```javascript
dosGame.autoKeyPress(13, 1000).then(() => { // Press enter, wait 1000ms.
    emergeGamingSDK.startLevel();           // do this (random example)
});

/** OR **/

setTimeout(
    () => loadingOverlay.remove()   // do this (random example)
    , 1000                          // after 1000 seconds
) 

/** OR **/

dosGame.setPixelListener(40, 190, (hexValue) => {   // When the pixel at x:40 y:190 changes...
    if (hexValue === '#ff0000')                     // If it's red 
        emergeGamingSDK.endLevel(_score);           // do this (random example)
});
```

### Going full screen
```javascript
emergeGamingSDK.startLevel();                 // Fullscreens the game (and starts it)
```
### Telling EMERGE a game has started
Note: StartLevel will make an attempt to reach several domains. You may see network errors in the console as the gaming SDK tries to reach several hosts. This is perfectly normal.
```javascript
emergeGamingSDK.startLevel();                 // Starts a game (and fulscreens it)
```
### Setting controls
```javascript
dosGame.mapTouchToArrowKeys({directions:4});  // Maps left-screen touches to up, down, left and right
dosGame.mapTouchToArrowKeys({directions:8});  // As above but allows for key combos eg. diagonal (up and right), etc
/** AND **/
dosGame.mapButtonToKey({element:buttonA, asciiCode:17});  // maps HTMLElement referenced as buttonA to keypress ASCII code 17

```
### Overriding key presses
*THIS IS AN EXPERIMENTAL FEATURE*<br/>
*(sometimes DOSBox picks up the keypress before JS)*
```javascript
/** @see https://keycode.info **/ 
dosGame.overrideKey(' ', 112);  // Replaces SPACE (event.key) with F1 (ASCII 112) 
```
### Scoring
Scoring is performed by a separate API (ocr2.js) also written internally but not yet integrated into the TypeScript API (dosGame). The OCR-like process works as follows:
1. Use the OCR tool (visit /ocrtool.html) to "extract" digits from various PNG screenshots
   
   * The OCR tool will print base64 png data url's to the console for each digit. Copy these strings into an array for digits [0 to 9] (see each games digits.js for an example)
   * Also record the position of the score, the character width and height, number of digits and spacing between each score (from the form you filled in, in ocrtool.html).<br/><br/>
    
2. At any point in the start-up process for your game, set up the OCR (from the data in the form)<br/>
    ```javascript
    import {dave_digits} from "/games/dos/dangerous-dave/digits.js";
    let startX = 64; let startY = 2; let charWidth = 7; let charHeight = 8; let charSpacing = 1; let numChars = 5;
    setupOcr(startX, startY, charWidth, charHeight, charSpacing, numChars, dave_digits);
    ```
3. When you're ready, use the `processScreenshot` function to extract the score It (the promise will return a NaN if it can't find a score)<br/>
   
    ```javascript
    processScreenshot(canvas.toDataURL('image/png')).then((_score) => {
        console.log ("SCORE: " + _score);
    })
    ```

### Ending the game
The simplest way to end a game is to end the level and refresh the iframe. In tournaments, EMERGE will bring up a pop-up overlay and the "load game" splash screen will wait be  
```javascript
emergeGamingSDK.endLevel(1000);         
setTimeout(() => location.reload(), 750);
```
The end of a game is usually detected in one of two ways:

1. Either we check for a certain pixel to change colour (eg: GAME OVER sign)
2. Or we see that the previously we were scoring and now the score is NaN or less than the last score.

Here are some examples of both:
   
```javascript
// Watch pixel x:40 y:190 for colour changes. If the colour is #ffffff, assume the game has ended.

dosGame.setPixelListener(40, 190, (hexValue) => {
    processScreenshot(canvas.toDataURL('image/png')).then((_score) => {
        if (hexValue === '#ffffff') {
            console.log ("SCORE: " + _score);
            emergeGamingSDK.endLevel(_score);
            setTimeout(() => location.reload(), 750);
        }
    })
})

/** OR **/

processScreenshot(canvas.toDataURL('image/png')).then((_score) => {
    if (!isNaN(_score)) {
        lastScore = _score
    } else if (lastScore > -1) { // Initially set score to -1
        console.log("Ending with: " + lastScore)
        emergeGamingSDK.endLevel(lastScore);
        window.clearInterval(scoreInterval);
        setTimeout(()=> location.reload(), 750);
    }
});
```
