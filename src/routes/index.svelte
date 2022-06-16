<script>
    import Console from "$lib/components/console.svelte";
    import Sound from "$lib/components/sound.svelte";

    /** @type {Sound} */
    let sound;
    
    /**
    * @param {any} event
    */
    function handleMouseUp(event) {
        sound.playSounds();
    }

    /**
    * @param {any} event
    */
    function handleKeyDown(event) {
        sound.playKey(event.detail.key);
        sound.playSounds();
    }
</script>

<div id="app">
    <Sound bind:this={sound} />
    <Console on:mouseup={handleMouseUp} on:keydown={handleKeyDown}/>
</div>

