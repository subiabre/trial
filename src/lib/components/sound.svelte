<script>
    /** @type {HTMLAudioElement}*/
    let sound;
    let soundSource = "sound/keyboard1.ogg";

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
        setSoundSource(key);

        await sound.load();
        sound.play();
    }

    export async function playSounds() {
        if (!soundPlay) {
            soundPlay = true;

            soundStart.load();
            await soundStart.play();
            soundBg.play();
        }
    }

    /**
     * @param {string} key
     */
    function setSoundSource(key) {
        if (key === "") {
            soundSource = "sound/spacebar.ogg";
            return;
        }

        let number = Math.floor(Math.random() * (4 - 1 + 1) + 1);
        soundSource = `sound/keyboard${number}.ogg`;
    }

</script>

<audio bind:this={sound}>
    <source src={soundSource} type="audio/ogg">
</audio>
<audio bind:this={soundBg} loop>
    <source src="sound/ambient.ogg" type="audio/ogg">
</audio>
<audio bind:this={soundStart}>
    <source src="sound/start.ogg" type="audio/ogg">
</audio>
