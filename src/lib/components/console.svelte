<script>
    // @ts-ignore
    import { createLogs, updateLogs } from "$lib/logs";
    // @ts-ignore
    import { emptyMemory, createMemory, sayToMemory } from "$lib/memory";
    // @ts-ignore
    import { createCommandList, getCommandFromList } from "$lib/commands";
    import { afterUpdate, beforeUpdate, createEventDispatcher } from "svelte";

    const dispatch = createEventDispatcher();

    /** @type {HTMLDivElement} */
    let div;
    /** @type {boolean} */
    let autoscroll;

    let input = "";
    let login = "user";
    let loggedin = false;

    let memory = emptyMemory();

    let messages = createLogs();
    let output = createLogs();
    let logs = createLogs();

    let commands = createCommandList([
        {
            name: "help",
            help: "Shows help about commands.",
            /** @param {string[]} args */
            action: (args) => {
                if (args.length < 1) {
                    let list = loggedin 
                        ? commands.map((/** @type {{ name: any; }} */ cmd) => cmd.name).join(", ")
                        : `login`
                        ;

                    output = updateLogs(output, "", `commands: ${list}`);
                    output = updateLogs(output, "", "Type help <command> to get help on a given command.");

                    return;
                }

                const command = getCommandFromList(commands, args[0]);
                output = updateLogs(output, "", command.help);
            },
        },
        {
            name: "login",
            help: "Open a remote connection with the AMALGAMATE Digital Memory Repository",
            action: async () => {
                loggedin = true;

                await new Promise((res, rej) => setTimeout(res, 600));

                output = updateLogs(output, '', `System Shell for the AMALGAMATE Digital Memory Repository.`);
                output = updateLogs(output, '', `Copyright AMALGAMATE INDUSTRIES. ALL RIGTHS RESERVED.`);
                output = updateLogs(output, '', `Type 'help' for a list of commands.`);
                output = updateLogs(output, '', ``);

                await new Promise((res, rej) => setTimeout(res, 2250));

                login = "Engineer";

                output = updateLogs(output, '', `Welcome, Engineer. We've detected signs of possible corruption in some memories.`);
                output = updateLogs(output, '', `You've been tasked with investigating them. The possibly corrupted memories have been loaded into this machine.`);
                output = updateLogs(output, '', `Interview the memories to assess if they have corruption and use every tool you've been given carefully to repair or remove the damaged instances.`);
            }
        },
        {
            name: "name",
            help: "Changes your conversational name. This is the name memories will read about you.",
            /** @param {string[]} args */
            action: (args) => {
                if (!checkForLoggedIn()) return;

                login = args[0];
                output = updateLogs(output, "", `Name set to ${login}`);
            },
        },
        {
            name: "invite",
            help: "Loads a new digital memory into the shell.",
            /** @param {string[]} args*/
            action: async (args) => {
                if (!checkForLoggedIn()) return;

                memory = await createMemory(args[0]);

                output = createLogs();
                output = updateLogs(output, "", `Invited a new memory.`);

                output = updateLogs(
                    output,
                    "",
                    `Name: ${memory.data.name}. Age: ${memory.data.age}.`
                );

                output = updateLogs(
                    output,
                    "",
                    `Type 'say <message>' to talk to this memory.`
                );
            },
        },
        {
            name: "say",
            help: "Sends a message to the digital memory.",
            /** @param {string[]} args */
            action: async (args) => {
                if (!checkForLoggedIn()) return;
                if (!checkForLoadedMemory()) return;

                messages = updateLogs(messages, login, args.join(" "));

                let res = await sayToMemory(messages, { 
                    prompt: { memory: memory.data, login },
                    completion: { stop: [`${login}:`], temperature: memory.data.temperature } 
                });

                res.map((/** @type {string} */ msg) => {
                    output = updateLogs(output, memory.data.name, msg);
                    messages = updateLogs(messages, memory.data.name, msg);
                });
            },
        },
        {
            name: "force",
            help: "Use it to get a digital memory to state on of their facts. 'force <fact>'",
            /** @param {string[]} args */
            action: (args) => {
                if (!checkForLoggedIn()) return;
                if (!checkForLoadedMemory()) return;

                // @ts-ignore
                let text = args[0] === 'traits' ? `My traits are ${memory.data.traits}` : `My ${args[0]} is ${memory.data[args[0]]}`;
                
                output = updateLogs(output, memory.data.name, text);
                messages = updateLogs(messages, memory.data.name, text);
            }
        },
        {
            name: "brief",
            help: "Get a brief on the personality of the digital memory",
            /** @param {string[]} args */
            action: (args) => {
                if (!checkForLoggedIn()) return;
                if (!checkForLoadedMemory()) return;

                output = updateLogs(output, "", `Name: ${memory.data.name}`);
                output = updateLogs(output, "", `Age: ${memory.data.age}`);
                output = updateLogs(output, "", `Personality: ${memory.data.traits.split(', ')[0]}`);
                output = updateLogs(output, "", `Code: ${memory.code}`);
            }
        },
        {
            name: "remove",
            help: "Removes the currently loaded digital memory from the repository. This action is not reversible.",
            action: () => {
                if (!checkForLoggedIn()) return;
                if (!checkForLoadedMemory()) return;

                output = createLogs();
                output = updateLogs(
                    output,
                    "",
                    `${memory.data.name} was removed from the repository.`
                );

                memory = emptyMemory();
                messages = createLogs();
            },
        },
        {
            name: "clear",
            help: "Clears the shell of messages.",
            action: () => (output = createLogs()),
        },
        {
            name: "",
            help: "",
            /** @param {string[]} args */
            action: (args) => (output = updateLogs(output, "", `${args[0]} is not a valid command.`)),
        },
    ]);

    beforeUpdate(() => {
        autoscroll =
            div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
    });

    afterUpdate(() => {
        if (autoscroll) div.scrollTo(0, div.scrollHeight);
    });

    /**
     * @param {Event} event
     */
    function handleSubmit(event) {
        event.preventDefault();

        output = updateLogs(output, login, input);
        logs = updateLogs(logs, '', input);

        let args = input.split(" ");
        let command = getCommandFromList(commands, args[0]);

        command.action(args.slice(1));

        input = "";
    }

    /**
    * @param {any} event
    */
    function handleKeyDown(event) {
        if (event.key === "ArrowUp") {
            input = logs[logs.length - 1].text;
        }

        dispatch('keydown', { key: event.key });
    }
    
    function checkForLoadedMemory() {
        if (memory.code === "") {
            output = updateLogs(
                output,
                "",
                `There is currently no digital memory loaded. Type 'invite' to bring one.`
            );

            return false;
        }

        return true;
    }

    function checkForLoggedIn() {
        if (!loggedin) {
            output = updateLogs(output, "", `You are not logged in.`)
            return false;
        }

        return true;
    }
</script>

<div id="console" bind:this={div}>
    {#each output as msg}
        <p class="cli">
            {#if msg.user !== ""}
                <span>{msg.user}@local: </span>
            {/if}{msg.text}
        </p>
    {/each}

    <!-- svelte-ignore a11y-autofocus -->
    <form class="cli" autocomplete="off" on:submit={handleSubmit}>
        <span>{login}@local: </span><input
            autofocus
            name="input"
            on:keydown={handleKeyDown}
            bind:value={input}
        />
    </form>
</div>

<style>
    @import "$lib/assets/keyframes.css";

    :root {
        --background-color: #030303;
        --font-color-main: #fca026;
        --font-color-dark: #d16119;
    }

    :global(body) {
        margin: 0;
        background-color: var(--background-color);
    }

    #console {
        max-width: 800px;
        height: calc(100vh - 2em);
        margin: 0 auto;
        padding: 1em;
        font-family: "Courier New", Courier, monospace;
        color: var(--font-color-main);
        overflow-y: auto;
    }

    #console * {
        margin: 0;
        -webkit-animation: text-shadow-drop-center 1s infinite both;
        animation: text-shadow-drop-center 1s infinite both;
        -webkit-animation: flicker-5 0.6s linear both;
        animation: flicker-5 0.6s linear both;
    }

    #console p.cli {
        min-height: 1rem;
        word-wrap: break-word;
    }

    #console .cli span {
        content: var(--code-data);
        color: var(--font-color-dark);
    }

    #console .cli input {
        width: calc(100% - 11rem);
        padding: 0;
        font-size: 1rem;
        font-family: "Courier New", Courier, monospace;
        color: var(--font-color-main);
        border: none;
        outline: none;
        background-color: transparent;
    }
</style>
