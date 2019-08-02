import Config from "../config";

/**
 * @param err
 * @throws AuthError GENERAL_ERROR
 */
export function errorLogging(err: any) {
    const config = Config.get();
    if (config.logging.error !== undefined) {
        config.logging.error(err);
    }
}

/**
 * @param info
 * @throws AuthError GENERAL_ERROR
 */
export function infoLogging(info: any) {
    const config = Config.get();
    if (config.logging.info !== undefined) {
        config.logging.info(info);
    }
}

export const loggingFormat = {
    default: "\x1b[0m",
    bold: "\x1b[1m",
    italic: "\x1b[3m",
    boldItalic: "\x1b[1;3m",
    black: "\x1b[30m",
    red: "\x1b[31m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    blue: "\x1b[34m",
    cyan: "\x1b[35m",
    blackBold: "\x1b[30;1m",
    redBold: "\x1b[31;1m",
    greenBold: "\x1b[32;1m",
    yellowBold: "\x1b[33;1m",
    blueBold: "\x1b[34;1m",
    cyanBold: "\x1b[35;1m"
};
