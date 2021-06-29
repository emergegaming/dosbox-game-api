    //globals and browser detection

    let arrButtonsWas = [];
    let arrButtonsIs = [];
    let gamepads;
    let translateGamePad = new Map();
    let isChromium = window.chrome;
    let winNav = window.navigator;
    let vendorName = winNav.vendor;
    let isOpera = typeof window.opr !== "undefined";
    let isIEedge = winNav.userAgent.indexOf("Edge") > -1;
    let isIOSChrome = winNav.userAgent.match("CriOS");

    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------

    //set your controller keybinds on per game basis

    translateGamePad.set(14, 37)//left
    translateGamePad.set(15, 39)//right
    translateGamePad.set(12, 38)//up 
    translateGamePad.set(13, 40)//down 
    translateGamePad.set(0, 13)//enter
    translateGamePad.set(7, 32)//shoot 
    translateGamePad.set(4, 17)//kit1 
    translateGamePad.set(5, 18)//kit2
    translateGamePad.set(1, 27)//esc

    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------

    //Helper functions used later in the code

    window.addEventListener("gamepadconnected", function() {
        var gp = navigator.getGamepads()[0];
        gameLoop();
    });
    
    window.addEventListener("gamepaddisconnected", function() {
        gamepadInfo.innerHTML = "Waiting for gamepad.";
    });
    
    if(!('GamepadEvent' in window)) {
        var interval = setInterval(pollGamepads, 500);
    }
    
    function pollGamepads() {
        var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        for (var i = 0; i < gamepads.length; i++) {
        var gp = gamepads[i];
            if(gp) {
                clearInterval(interval);
            }
        }
    }
    
    function buttonPressed(b) {
        if (typeof(b) == "object") {
        return b.pressed;
        }
        return b == 1.0;
    }
    
    function gameLoop() {
        gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
        if (!gamepads)
        return;
    };

    function getGamepadState(gamePads) {
        let temp = gamePads[0].buttons;
            let state = [];
            let tLength = temp.length;
            for (let i = 0; i < tLength; i++) {
                state[i] = temp[i].pressed;
            }
            return state;
    }

    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------

    //This code needs to go in a ticker loop to poll the gamepad state

    var gamepads = navigator.getGamepads ? navigator.getGamepads() : (navigator.webkitGetGamepads ? navigator.webkitGetGamepads : []);
    if (!gamepads)
        return;
        
    if(isChromium && gamepads[0]){ //if browser is chrome and the gamepad has been initialised 
        if (arrButtonsIs.length > 0 && arrButtonsWas.length > 0) {
            arrButtonsIs = getGamepadState(gamepads);
            processControllerChange(arrButtonsWas, arrButtonsIs);
            arrButtonsWas = arrButtonsIs.slice(0);    
        }
        else {
            arrButtonsIs = getGamepadState(gamepads);
            arrButtonsWas = arrButtonsIs.slice(0);    
        }   
    }
    else if (gamepads[0]) { //if the browser is anyting else(firefox, safari atm) then wait for the gamepad to be connected 
        if (arrButtonsIs.length > 0 && arrButtonsWas.length > 0) {
            arrButtonsIs = getGamepadState(gamepads);
            processControllerChange(arrButtonsWas, arrButtonsIs);
            arrButtonsWas = arrButtonsIs.slice(0);    
        }
        else {
            arrButtonsIs = getGamepadState(gamepads);
            arrButtonsWas = arrButtonsIs.slice(0);    
        }
    }

    function processControllerChange (was, is) {
        let changes = [];
        if (is && was) {
            for (let i = 0; i < is.length; i++) {
                if (is[i] !== was[i]) {
                    changes.push({keyCode:(translateGamePad.get(i)), action:(is[i])});
                }       
            }
        }
        if (changes.length>0) {
                changes.forEach(requiredKeyPress => {
                    dosGame.ci.sendKeyEvent(DosGame.reverseKeyMap.get(requiredKeyPress.keyCode), requiredKeyPress.action);
                    console.log(DosGame.reverseKeyMap.get(requiredKeyPress.keyCode), requiredKeyPress.action);
                })   
            }
        }

    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------
    //-----------------------------------------------------------------------------------------------------------------------------
