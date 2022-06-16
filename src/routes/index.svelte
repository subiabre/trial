<script>
    import Console from "$lib/components/console.svelte";
    import Sound from "$lib/components/sound.svelte";

    /** @type {Sound} */
    let sound;
    
    /**
    * @param {any} event
    */
    function handleKeyDown(event) {
        sound.playSounds();
        sound.playKey(event.detail.key);
    }
</script>

<div id="app">
    <Sound bind:this={sound} />
    <Console on:keydown={handleKeyDown}/>
</div>

