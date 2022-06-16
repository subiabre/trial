<script>
    // @ts-ignore
    import { messages } from "$lib/data/messages";
    // @ts-ignore
    import { createLogs, updateLogs } from "$lib/logs";
    // @ts-ignore
    import { emptyMemory, createMemory, sayToMemory } from "$lib/memory";
    // @ts-ignore
    import { createCommandList, getCommandFromList } from "$lib/commands";
    import { afterUpdate, beforeUpdate, createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();

    /** @type {HTMLDivElement} */
    let div;
    /** @type {boolean} */
    let autoscroll;

    let input = "";
    /** @type {HTMLInputElement} */
    let inputElement;
    /** @type {Selection|null} */
    let selection;

    let login = "user";
    let loggedin = false;

    let memory = emptyMemory();

    let dialog = createLogs();
    let output = createLogs();
    
    let log = { user: '', text: '' }
    let logs = createLogs([log]);
    
    let defaultCommand = "";
    let commands = createCommandList([
        {
            name: "",
            help: messages.commands.empty,
            /** @param {string[]} args */
            action: (args) => {
                if (defaultCommand === "") {
                    output = updateLogs(output, "", `${args[0]} is not a valid command.`);
                    return;
                }

                const {command} = getCommandFromList(commands, [defaultCommand]);

                command.action(args);
            },
        },
        {
            name: "help",
            help: messages.commands.help,
            /** @param {string[]} args */
            action: (args) => {
                if (args.length < 1) {
                    let list = loggedin 
                        ? commands.slice(1).map((/** @type {{ name: any; }} */ cmd) => cmd.name).join(", ")
                        : `login`
                        ;

                    output = updateLogs(output, "", `commands: ${list}`);
                    output = updateLogs(output, "", "Type help <command> to get help on a given command.");

                    return;
                }

                const {command} = getCommandFromList(commands.slice(1), args);
                command.help.map(msg => {
                    output = updateLogs(output, '', msg)
                });
            },
        },
        {
            name: "default",
            help: messages.commands.default,
            /** @param {string[]} args */
            action: (args) => {
                defaultCommand = args[0] ?? "";
            }
        },
        {
            name: "login",
            help: messages.commands.login,
            action: async () => {
                loggedin = true;

                await new Promise((res) => setTimeout(res, 600));

                login = "Engineer";
                output = updateLogs(output, '', `System Shell for the AMALGAMATE Digital Memory Repository.`);
                output = updateLogs(output, '', `Copyright AMALGAMATE INDUSTRIES. ALL RIGTHS RESERVED.`);
                output = updateLogs(output, '', `Type 'help' for a list of commands.`);
                output = updateLogs(output, '', ``);

                await new Promise((res) => setTimeout(res, 1250));

                messages.welcome.map((/** @type {string} */ msg) => {
                    output = updateLogs(output, '', msg);
                });
            }
        },
        {
            name: "name",
            help: messages.commands.name,
            /** @param {string[]} args */
            action: (args) => {
                if (!checkForLoggedIn()) return;
                if (args.length < 1) {
                    output = updateLogs(output, '', `You must provide a <name> argument.`);
                    return;
                }

                login = args[0];
                output = updateLogs(output, "", `Name set to ${login}`);
            },
        },
        {
            name: "invite",
            help: messages.commands.invite,
            /** @param {string[]} args*/
            action: async (args) => {
                if (!checkForLoggedIn()) return;

                memory = await createMemory(args[0]);

                dialog = createLogs();
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
            help: messages.commands.say,
            /** @param {string[]} args */
            action: async (args) => {
                if (!checkForLoggedIn()) return;
                if (!checkForLoadedMemory()) return;
                if (args.length < 1) {
                    output = updateLogs(output, '', `You must provide a <message> argument.`)
                    return;
                }

                dialog = updateLogs(dialog, login, args.join(" "));

                let res = await sayToMemory(dialog, { 
                    prompt: { memory: memory.data, login },
                    completion: { stop: [`${login}:`], temperature: memory.data.temperature } 
                });

                res.map((/** @type {string} */ msg) => {
                    output = updateLogs(output, memory.data.name, msg);
                    dialog = updateLogs(dialog, memory.data.name, msg);
                });
            },
        },
        {
            name: "force",
            help: messages.commands.force,
            /** @param {string[]} args */
            action: (args) => {
                if (!checkForLoggedIn()) return;
                if (!checkForLoadedMemory()) return;
                if (args.length < 1) {
                    output = updateLogs(output, '', `You must provide a <fact> argument.`);
                    return;
                }

                // @ts-ignore
                let text = args[0] === 'traits' ? `My traits are ${memory.data.traits}` : `My ${args[0]} is ${memory.data[args[0]]}`;
                
                output = updateLogs(output, memory.data.name, text);
                dialog = updateLogs(dialog, memory.data.name, text);
            }
        },
        {
            name: "brief",
            help: messages.commands.brief,
            /** @param {string[]} args */
            action: (args) => {
                if (!checkForLoggedIn()) return;
                if (!checkForLoadedMemory()) return;

                output = updateLogs(output, "", `Subject ${memory.code}`);
                output = updateLogs(output, "", `Name: ${memory.data.name}`);
                output = updateLogs(output, "", `Age: ${memory.data.age}`);
                output = updateLogs(output, "", `Personal remarks: ${memory.data.traits.split(', ')[0]}`);
            }
        },
        {
            name: "remove",
            help: messages.commands.remove,
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
                dialog = createLogs();
            },
        },
        {
            name: "clear",
            help: messages.commands.clear,
            action: () => (output = createLogs()),
        },
    ]);

    beforeUpdate(() => {
        autoscroll =
            div && div.offsetHeight + div.scrollTop > div.scrollHeight - 20;
    });

    afterUpdate(() => {
        if (autoscroll) div.scrollTo(0, div.scrollHeight);
    });

    onMount(() => {
        document.addEventListener('selectionchange', () => {
            selection = document.getSelection();
        });
    });

    /**
     * @param {Event} event
     */
    function handleMouseUp(event) {
        if (!selection?.toString()) {
            inputElement.focus();
        }

        dispatch('mouseup', { selection: selection })
    }

    /**
     * @param {Event} event
     */
    function handleSubmit(event) {
        event.preventDefault();

        output = updateLogs(output, login, input);
        logs = updateLogs(logs, new Date().toISOString(), input);

        const {command, args} = getCommandFromList(commands, input.split(" "));

        command.action(args);

        input = "";
    }

    /**
    * @param {any} event
    */
    function handleKeyDown(event) {
        const index = logs.findIndex(l => l.user === log.user);

        if (event.key === "ArrowUp") {
            log = index > 0 ? logs[index - 1] : logs[logs.length - 1];
            input = log.text;
        }

        if (event.key === "ArrowDown") {
            log = index < logs.length - 1 ? logs[index + 1] : logs[0];
            input = log.text;
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

<div id="console" bind:this={div} on:mouseup={handleMouseUp}>
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
            bind:this={inputElement}
            bind:value={input}
        />
    </form>
</div>

<style>
    @import "$lib/assets/keyframes.css";
    @import url('https://fonts.googleapis.com/css2?family=VT323&display=swap');

    :root {
        --background-color: #030303;
        --font-color-main: #fca026;
        --font-color-dark: #d16119;
        --font-color-glow: #fca02633;
    }

    :global(body) {
        margin: 0;
        background-color: var(--background-color);
    }

    #console {
        height: calc(100vh - 2em);
        padding: 1em;
        color: var(--font-color-main);
        overflow-y: auto;
        -webkit-animation: neon 2s infinite alternate both;
                animation: neon 2s infinite alternate both;
    }

    #console::before {
        content: "";
        position: absolute;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        pointer-events: none;
        background: repeating-linear-gradient(
            0deg,
            rgba(255, 255, 0, 0.15),
            rgba(0, 0, 0, 0.15) 1px,
            transparent 1px,
            transparent 2px
        );
    }

    #console * {
        margin: 0;
        font-family: 'VT323', monospace;
        font-size: 1.24rem;
    }

    #console p.cli {
        min-height: 1rem;
        word-wrap: break-word;
        -webkit-animation: flicker-5 0.6s linear both;
                animation: flicker-5 0.6s linear both;
    }

    #console .cli span {
        content: var(--code-data);
        color: var(--font-color-dark);
    }

    #console .cli input {
        width: calc(100% - 11rem);
        padding: 0;
        color: var(--font-color-main);
        border: none;
        outline: none;
        background-color: transparent;
        -webkit-animation: neon 4s infinite alternate both;
                animation: neon 4s infinite alternate both;
    }
</style>
