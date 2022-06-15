export interface Log {
    user: string,
    text: string
}

/**
 * @returns {Log[]}
 */
export function createLogs(): Log[] {
    return [];
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
