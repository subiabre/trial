<script>
import { afterUpdate, beforeUpdate } from "svelte";



    let div;
    let autoscroll;
    let input = "";

    /** @type {{name: String, age: Number, traits: String}} */
    let memory = { name: '', age: 0, traits: '' };

    /** @type {{user: String, text: String}[]} */
    let log = [];

    beforeUpdate(() => {
		autoscroll = div && (div.offsetHeight + div.scrollTop) > (div.scrollHeight - 20);
	});

	afterUpdate(() => {
		if (autoscroll) div.scrollTo(0, div.scrollHeight);
	});

    /**
     * @param {Event} event
     */
    async function handleSubmit(event)
    {
        event.preventDefault();
        
        updateLog('user', input);
        
        let command = input.split(' ')[0];
        input = "";
        
        switch (command) {
            case 'help':
                updateLog('', 'commands: help, invite, say, clear.');
                break;
            case 'invite':
                memory = await getMemoryData();
                updateLog('', `Invited ${memory.name}. Age: ${memory.age}. Use 'say' to talk to this memory.`);
                break;
            case 'say':
                let text = memory.name !== '' ? await memoryAnswer() : `Type 'invite' to load a memory into the shell.`;
                updateLog(memory.name, text);
                break;
            case 'kill':
                memory = { name: '', age: 0, traits: '' }
                updateLog('', `The memory was removed from the repository.`)
                break;
            case 'clear':
                clearLog();
                break;
            default:
                updateLog('', `${command} is not a valid command.`)
                break;
        }
    }

    /** 
     * @param {String} user
     * @param {String} text
     */
    function updateLog(user, text) {
        log = [...log, { user, text}];
    }

    function clearLog()
    {
        log = [];
    }

    async function memoryAnswer() {
        let data = bundleLog()
            .map((msg) => msg.text.split(' ')[0] === 'say' || msg.user === memory.name ? `${msg.user}: ${msg.text.split(' ').slice(1).join(' ')}` : '')
            .join("\n");

        let answer = await getMemoryAnswer(data);

        return answer;
    }

    function bundleLog()
    {
        return [
            {
                user: '',
                text: `say The following is a conversation between a human user and ${memory.name}, a person of ${memory.age} years of age whose memory was preserved digitally and is ${memory.traits}.`
            },
            ...log.slice(-100),
            { user: `${memory.name}`, text: '' }
        ];
    }

    /** @param {String} data */
    async function getMemoryAnswer(data) {
        const res = await fetch('/openai', {
            method: 'POST',
            headers: { "Content-Type": "application.json" },
            body: JSON.stringify({ log: data })
        });
        const json = await res.json();

        return json.data;
    }

    async function getMemoryData() {
        const res = await fetch('/generate', {
            method: 'GET',
            headers: { "Content-Type": "application-json" },
        });
        const json = await res.json();
    
        return json.data;
    }

</script>

<div id="app" bind:this={div}>
    <p>Copyright AMALGAMATE INDUSTRIES. ALL RIGTHS RESERVED.</p>
    <br/>
    <p>Welcome to AMALGAMATE System Shell v1.1 for the AMALGAMATE Digital Memory Repository.</p>
    <p>Type 'help' for a list of commands.</p>
    <br/>

    {#each log as msg}
        <p class="cli">{#if msg.user !== ''}
            <span>{msg.user}@local: </span>
        {/if}{msg.text}</p>
    {/each}

    <!-- svelte-ignore a11y-autofocus -->
    <form class="cli" on:submit="{handleSubmit}"><span>user@local: </span><input autofocus name="input" bind:value="{input}"/></form>
</div>

<style>
    :root {
        --background-color: #030303;
        --font-color-main: #fca026;
        --font-color-dark: #d16119;
    }

    :global(body) {
        margin: 0;
        background-color: var(--background-color);
    }

    #app {
        max-width: 800px;
        height: 100vh;
        margin: 0 auto;
        padding: 0 1em;
        font-family: 'Courier New', Courier, monospace;
        color: var(--font-color-main);
        overflow-y: auto;
    }

    #app * {
        text-shadow: 0px 0px 1em var(--font-color-main);
    }

    #app p {
        margin: 0;
    }

    #app .cli span {
        content: var(--code-data);
        color: var(--font-color-dark);
    }

    #app .cli input {
        width: calc(100% - 11rem);
        padding: 0;
        font-size: 1rem;
        font-family: 'Courier New', Courier, monospace;
        color: var(--font-color-main);
        border: none;
        outline: none;
        background-color: transparent;
    }
</style>
