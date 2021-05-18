let charData = [], numChars = 0, startX = 0, startY = 0, charWidth = 0, charHeight = 0, charSpacing = 0, thousandsSeparatorWidth = 0, digitArrayLength = 10;

export const setupOcr = (_startX, _startY, _charWidth, _charHeight, _charSpacing, _numChars, _referenceChars, _thousandsSeparatorWidth = 0) => {

    numChars = _numChars;
    startX = _startX;
    startY = _startY;
    charWidth = _charWidth;
    charHeight = _charHeight;
    charSpacing = _charSpacing
    thousandsSeparatorWidth = _thousandsSeparatorWidth
    digitArrayLength = _referenceChars.length


    for (let charNo = 0; charNo < digitArrayLength; charNo++) {
        getImageSignature(_referenceChars[charNo], 0, 0, _charWidth, _charHeight).then((data) => {
            charData[charNo] = data;
        });
    }
}

export const processScreenshot = (_imageData) => {

    return new Promise((resolve, reject) => {
        let stack = [];
        let scoreChars = [];
        let scoreString = '';

        for (let charNo = 0; charNo < numChars; charNo++) {
            let ifThousandSeparator = 0;
            if (thousandsSeparatorWidth > 0 && charNo <= numChars - 4) {
                ifThousandSeparator = thousandsSeparatorWidth - charSpacing;
            }
            stack.push(getImageSignature(_imageData, startX + (charNo * (charWidth + charSpacing)) - ifThousandSeparator, startY, charWidth, charHeight).then((data) => {
                // startX + ((digitWidth + digitSpacing) * i) - ifThousandSeparator
                scoreChars[charNo] = data;
            }));
        }

        Promise.all(stack).then(() => {
            scoreChars.forEach(scoreChar => {

                for (let i = 0; i < digitArrayLength; i++) {
                    if (scoreChar === charData[i]) {
                        if (i < digitArrayLength - 1) {
                            scoreString += i;
                            break
                        } else {
                            scoreString += '-';
                            break
                        }
                    }
                }
            })
            let numericScore = parseInt(scoreString, 10);
            resolve(numericScore);
        });
    })
}

export const getImageSignature = (_imageData, sourceX, sourceY, width, height) => {

    return new Promise((resolve, reject) => {

        let i = new Image();

        i.onload = function() {
            let elem = document.createElement('canvas');
            let canvas = elem.getContext('2d');
            elem.width = width;
            elem.height = height;
            canvas.drawImage(i, sourceX, sourceY, width, height, 0, 0, width, height);
            resolve (elem.toDataURL().substr(70));
        };

        i.src = _imageData;

    })
}
