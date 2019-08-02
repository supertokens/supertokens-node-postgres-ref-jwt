import { TypeConfig, TypeInputConfig } from "./helpers/types";
/**
 * @class Config
 * @description this is a singleton class since we need just one Config for this node process.
 */
export default class Config {
    private static instance;
    private config;
    private constructor();
    /**
     * @description called when library is being initialised
     * @throws AuthError GENERAL_ERROR
     */
    static init(config: TypeInputConfig): void;
    static get(): TypeConfig;
    static reset: () => void;
    static isInitialised: () => boolean;
}
