export interface Command {
    name: string,
    help: string,
    action: (args: string[]) => void;
}

/**
 * @param {Command[]} list
 * @param {string} name
 * @returns {Command}
 */
export function getCommandFromList(list: Command[], name: string) {
    for (let index = 0; index < list.length; index++) {
        const command = list[index];
        const match = new RegExp(command.name);
        
        if (match.test(name.toLowerCase())) {
            return command;
        }
    }

    return list[0];
}

export function createCommandList(list: Command[]) {
    return list;
}
