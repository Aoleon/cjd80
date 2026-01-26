"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CircuitBreaker = exports.CircuitState = void 0;
const logger_1 = require("./logger");
var CircuitState;
(function (CircuitState) {
    CircuitState["CLOSED"] = "CLOSED";
    CircuitState["OPEN"] = "OPEN";
    CircuitState["HALF_OPEN"] = "HALF_OPEN"; // Test - autorise quelques requêtes pour tester
})(CircuitState || (exports.CircuitState = CircuitState = {}));
class CircuitBreaker {
    constructor(config) {
        this.config = config;
        this.state = CircuitState.CLOSED;
        this.failureCount = 0;
        this.successCount = 0;
        this.nextAttempt = Date.now();
        this.lastStateChange = Date.now();
        // Métriques globales
        this.totalRequests = 0;
        this.totalFailures = 0;
        this.totalSuccesses = 0;
        logger_1.logger.info(`[CircuitBreaker] Initialized: ${config.name}`, {
            failureThreshold: config.failureThreshold,
            successThreshold: config.successThreshold,
            timeout: config.timeout
        });
    }
    async execute(fn) {
        this.totalRequests++;
        // Si circuit ouvert, vérifier si on peut passer en HALF_OPEN
        if (this.state === CircuitState.OPEN) {
            if (Date.now() < this.nextAttempt) {
                const error = new Error(`Circuit breaker is OPEN for ${this.config.name}`);
                logger_1.logger.warn(`[CircuitBreaker] ${this.config.name} - Request rejected (OPEN)`, {
                    nextAttempt: new Date(this.nextAttempt).toISOString(),
                    failures: this.failureCount
                });
                throw error;
            }
            // Passer en HALF_OPEN pour tester
            this.toHalfOpen();
        }
        try {
            const result = await fn();
            this.onSuccess();
            return result;
        }
        catch (error) {
            this.onFailure(error);
            throw error;
        }
    }
    onSuccess() {
        this.totalSuccesses++;
        this.failureCount = 0;
        if (this.state === CircuitState.HALF_OPEN) {
            this.successCount++;
            logger_1.logger.info(`[CircuitBreaker] ${this.config.name} - Success in HALF_OPEN (${this.successCount}/${this.config.successThreshold})`);
            if (this.successCount >= this.config.successThreshold) {
                this.toClosed();
            }
        }
    }
    onFailure(error) {
        this.totalFailures++;
        this.failureCount++;
        this.lastFailureTime = Date.now();
        const errorMessage = error instanceof Error ? error.message : String(error);
        logger_1.logger.warn(`[CircuitBreaker] ${this.config.name} - Failure (${this.failureCount}/${this.config.failureThreshold})`, {
            error: errorMessage,
            state: this.state
        });
        if (this.state === CircuitState.HALF_OPEN) {
            // En HALF_OPEN, un seul échec suffit pour rouvrir
            this.toOpen();
        }
        else if (this.failureCount >= this.config.failureThreshold) {
            this.toOpen();
        }
    }
    toClosed() {
        this.state = CircuitState.CLOSED;
        this.successCount = 0;
        this.failureCount = 0;
        this.lastStateChange = Date.now();
        logger_1.logger.info(`[CircuitBreaker] ${this.config.name} - State: CLOSED ✅`, {
            totalRequests: this.totalRequests,
            totalFailures: this.totalFailures,
            successRate: this.getSuccessRate()
        });
    }
    toOpen() {
        this.state = CircuitState.OPEN;
        this.nextAttempt = Date.now() + this.config.timeout;
        this.lastStateChange = Date.now();
        logger_1.logger.error(`[CircuitBreaker] ${this.config.name} - State: OPEN 🔴`, {
            failures: this.failureCount,
            nextAttemptAt: new Date(this.nextAttempt).toISOString(),
            totalFailures: this.totalFailures
        });
    }
    toHalfOpen() {
        this.state = CircuitState.HALF_OPEN;
        this.successCount = 0;
        this.lastStateChange = Date.now();
        logger_1.logger.info(`[CircuitBreaker] ${this.config.name} - State: HALF_OPEN ⚠️`, {
            testing: `Will try ${this.config.successThreshold} requests`
        });
    }
    getState() {
        return this.state;
    }
    getMetrics() {
        return {
            state: this.state,
            failures: this.failureCount,
            successes: this.successCount,
            lastFailureTime: this.lastFailureTime,
            lastStateChange: this.lastStateChange,
            totalRequests: this.totalRequests,
            totalFailures: this.totalFailures,
            totalSuccesses: this.totalSuccesses
        };
    }
    getSuccessRate() {
        if (this.totalRequests === 0)
            return 100;
        return ((this.totalSuccesses / this.totalRequests) * 100);
    }
    isOpen() {
        return this.state === CircuitState.OPEN;
    }
    reset() {
        logger_1.logger.info(`[CircuitBreaker] ${this.config.name} - Manual reset`);
        this.toClosed();
    }
}
exports.CircuitBreaker = CircuitBreaker;
