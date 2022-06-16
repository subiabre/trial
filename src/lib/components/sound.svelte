<script>
    /** @type {HTMLAudioElement[]} */
    let soundKeyboard = [];
    /** @type {HTMLAudioElement}*/
    let soundSpacebar;
    /** @type {HTMLAudioElement}*/
    let soundBg;
    /** @type {HTMLAudioElement}*/
    let soundStart;
    /** @type {boolean} */
    let soundPlay = false;

    /**
    * @param {string} key
    */
    export async function playKey(key) {
        if (key === " ") {
            soundSpacebar.play();
            return;
        }

        soundKeyboard.sort(() => 0.5 - Math.random())[0].play();
    }

    export async function playSounds() {
        if (!soundPlay) {
            soundPlay = true;

            soundStart.play();
            soundBg.play();
        }
    }
</script>

<audio bind:this={soundKeyboard[0]} >
    <source src="sound/keyboard1.ogg" type="audio/ogg">
</audio>
<audio bind:this={soundKeyboard[1]} >
    <source src="sound/keyboard2.ogg" type="audio/ogg">
</audio>
<audio bind:this={soundKeyboard[2]} >
    <source src="sound/keyboard3.ogg" type="audio/ogg">
</audio>
<audio bind:this={soundKeyboard[3]} >
    <source src="sound/keyboard4.ogg" type="audio/ogg">
</audio>
<audio bind:this={soundSpacebar} >
    <source src="sound/spacebar1.ogg" type="audio/ogg">
</audio>
<audio bind:this={soundBg}  loop>
    <source src="sound/ambient.ogg" type="audio/ogg">
</audio>
<audio bind:this={soundStart} >
    <source src="sound/start.ogg" type="audio/ogg">
</audio>
