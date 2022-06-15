<script>
    // @ts-ignore
    import { createLogs, updateLogs } from "$lib/logs";
    // @ts-ignore
    import { emptyMemory, createMemory, sayToMemory, parseMemoryAnswer } from "$lib/memory";
    // @ts-ignore
    import { createCommandList, getCommandFromList } from "$lib/commands";
    import { afterUpdate, beforeUpdate } from "svelte";

    /** @type {HTMLDivElement} */
    let div;
    /** @type {boolean} */
    let autoscroll;
    let input = "";
    let login = "Engineer";

    let memory = emptyMemory();

    let messages = createLogs();
    let log = createLogs();

    let commands = createCommandList([
        {
            name: "help",
            help: "Shows help about commands.",
            /** @param {string[]} args */
            action: (args) => {
                if (args.length < 1) {
                    // @ts-ignore
                    log = updateLogs(
                        log,
                        "",
                        `commands: ${commands
                            .map(
                                (/** @type {{ name: any; }} */ cmd) => cmd.name
                            )
                            .join(", ")}`
                    );
                    log = updateLogs(
                        log,
                        "",
                        "Type help <command> to get help on a given command."
                    );

                    return;
                }

                const command = getCommandFromList(commands, args[0]);
                log = updateLogs(log, "", command.help);
            },
        },
        {
            name: "name",
            help: "Changes your conversational name. This is the name memories will read about you.",
            /** @param {string[]} args */
            action: (args) => {
                login = args[0];

                log = updateLogs(log, "", `Name set to ${login}`);
            },
        },
        {
            name: "invite",
            help: "Loads a new digital memory into the shell.",
            action: async () => {
                memory = await createMemory();
                log = createLogs();
                log = updateLogs(log, "", `Invited a new memory.`);

                log = updateLogs(
                    log,
                    "",
                    `Name: ${memory.name}. Age: ${memory.age}.`
                );

                log = updateLogs(
                    log,
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
                if (memory.name === "") {
                    log = updateLogs(
                        log,
                        "",
                        `There is currently no digital memory loaded. Type 'invite' to bring one.`
                    );
                    return;
                }

                messages = updateLogs(messages, login, args.join(" "));

                let res = await sayToMemory({
                    messages: [
                        `The following is a conversation with ${memory.name}. ${memory.name} is ${memory.age} years old and is ${memory.traits}.\n\n`,
                        ...messages
                            .map(
                                (
                                    /** @type {{ user: any; text: any; }} */ msg
                                ) => `${msg.user}: ${msg.text}\n`
                            )
                            .slice(-64),
                        `${memory.name}: `,
                    ],
                    end: [login],
                });

                let answer = parseMemoryAnswer(res);

                answer.split(`\n`).map((/** @type {string} */ msg) => {
                    let text = msg.replace(/\w{1,}:/, "");

                    if (text.length > 0 && !(new RegExp(`^${login}`).test(text))) {
                        log = updateLogs(log, memory.name, text);
                        messages = updateLogs(messages, memory.name, text.trim());
                    }
                });
            },
        },
        {
            name: "force",
            help: "Use it to get a digital memory to state on of their facts. 'force <fact>'",
            /** @param {string[]} args */
            action: (args) => {
                if (memory.name === "") {
                    log = updateLogs(
                        log,
                        "",
                        `There is currently no digital memory loaded. Type 'invite' to bring one.`
                    );
                    return;
                }

                let text = args[0] === 'traits' ? `My traits are ${memory.traits}` : `My ${args[0]} is ${memory[args[0]]}`;
                
                log = updateLogs(log, memory.name, text);
                messages = updateLogs(messages, memory.name, text);
            }
        },
        {
            name: "remove",
            help: "Removes the currently loaded digital memory from the repository. This action is not reversible.",
            action: () => {
                log = createLogs();
                log = updateLogs(
                    log,
                    "",
                    `${memory.name} was removed from the repository.`
                );

                memory = emptyMemory();
                messages = createLogs();
            },
        },
        {
            name: "clear",
            help: "Clears the shell",
            action: () => (log = createLogs()),
        },
        {
            name: "",
            help: "",
            action: () =>
                (log = updateLogs(log, "", `Could not parse command.`)),
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
    async function handleSubmit(event) {
        event.preventDefault();

        log = updateLogs(log, login, input);

        let args = input.split(" ");
        let command = getCommandFromList(commands, args[0]);

        command.action(args.slice(1));

        input = "";
    }
</script>

<div id="app" bind:this={div}>
    <p>Copyright AMALGAMATE INDUSTRIES. ALL RIGTHS RESERVED.</p>
    <br />
    <p>
        Welcome to AMALGAMATE System Shell v1.1 for the AMALGAMATE Digital
        Memory Repository.
    </p>
    <p>Type 'help' for a list of commands.</p>
    <br />

    {#each log as msg}
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

    #app {
        max-width: 800px;
        height: calc(100vh - 2em);
        margin: 0 auto;
        padding: 1em;
        font-family: "Courier New", Courier, monospace;
        color: var(--font-color-main);
        overflow-y: auto;
    }

    #app * {
        margin: 0;
        -webkit-animation: text-shadow-drop-center 1s infinite both;
        animation: text-shadow-drop-center 1s infinite both;
        -webkit-animation: flicker-5 0.6s linear both;
        animation: flicker-5 0.6s linear both;
    }

    #app .cli span {
        content: var(--code-data);
        color: var(--font-color-dark);
    }

    #app .cli input {
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
