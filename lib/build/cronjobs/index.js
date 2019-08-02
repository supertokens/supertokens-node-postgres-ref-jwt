"use strict";
var __awaiter =
    (this && this.__awaiter) ||
    function(thisArg, _arguments, P, generator) {
        return new (P || (P = Promise))(function(resolve, reject) {
            function fulfilled(value) {
                try {
                    step(generator.next(value));
                } catch (e) {
                    reject(e);
                }
            }
            function rejected(value) {
                try {
                    step(generator["throw"](value));
                } catch (e) {
                    reject(e);
                }
            }
            function step(result) {
                result.done
                    ? resolve(result.value)
                    : new P(function(resolve) {
                          resolve(result.value);
                      }).then(fulfilled, rejected);
            }
            step((generator = generator.apply(thisArg, _arguments || [])).next());
        });
    };
Object.defineProperty(exports, "__esModule", { value: true });
const node_cron_1 = require("node-cron");
const config_1 = require("../config");
const logging_1 = require("../helpers/logging");
const oldRefreshTokenRemoval_1 = require("./oldRefreshTokenRemoval");
/**
 * @class
 */
class Cronjob {
    constructor(config) {
        const jobs = [
            {
                jobFunction: oldRefreshTokenRemoval_1.default,
                interval: config.tokens.refreshToken.removalCronjobInterval,
                description: "remove old expired refresh tokens"
            }
        ];
        jobs.forEach(job => {
            createNewJob(job.jobFunction, job.interval, job.description).start();
        });
    }
    static init() {
        const config = config_1.default.get();
        if (Cronjob.instance === undefined) {
            Cronjob.instance = new Cronjob(config);
        }
    }
}
exports.default = Cronjob;
/**
 *
 * @param job
 * @param interval
 * @param jobDescription
 */
function createNewJob(job, interval, jobDescription) {
    return node_cron_1.schedule(
        interval,
        () =>
            __awaiter(this, void 0, void 0, function*() {
                try {
                    const startTime = Date.now();
                    const startLog = `cron job started : ${jobDescription}`;
                    logging_1.infoLogging(startLog);
                    yield job();
                    const endLog = `cron job ended : ${jobDescription}. time taken : ${Date.now() - startTime}ms`;
                    logging_1.infoLogging(endLog);
                } catch (err) {
                    logging_1.errorLogging(err);
                }
            }),
        {
            scheduled: false
        }
    );
}
//# sourceMappingURL=index.js.map
