<script>
    import Console from "$lib/components/console.svelte";
    import Sound from "$lib/components/sound.svelte";

    /** @type {Console} */
    let console;

    /** @type {Sound} */
    let sound;
    
    /**
    * @param {any} event
    */
    function handleKeyDown(event) {
        sound.playSounds();
        sound.playKey(event.key);
    }
</script>

<div id="app">
    <Console bind:this={console} on:keydown={handleKeyDown}/>
    <Sound bind:this={sound} />    
</div>

