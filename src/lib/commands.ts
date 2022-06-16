export interface Command {
    name: string,
    help: string[],
    action: (args: string[]) => void;
}

/**
 * @param {Command[]} list
 * @param {string[]} args
 * @returns {{ Command, string[] }}
 */
export function getCommandFromList(list: Command[], args: string[]) {
    for (let index = 0; index < list.length; index++) {
        const command = list[index];
        
        if (command.name === args[0].toLowerCase()) {
            return { command, args: args.slice(1) };
        }
    }

    return { command: list[0], args };
}

export function createCommandList(list: Command[]) {
    return list;
}
