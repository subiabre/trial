export interface Log {
    user: String,
    text: String
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
export function updateLogs(logs: Log[], user: String, text: String): Log[] {
    return [...logs, { user, text }];
}
