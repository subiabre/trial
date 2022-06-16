export interface Log {
    user: string,
    text: string
}

/**
 * @param {Log[]} log
 * @returns {Log[]}
 */
export function createLogs(logs?: Log[]): Log[] {
    return [...logs ?? []];
}

/**
 * @param logs 
 * @param user 
 * @param text 
 * @returns {Log[]}
 */
export function updateLogs(logs: Log[], user: string, text: string): Log[] {
    return [...logs, { user, text }];
}
