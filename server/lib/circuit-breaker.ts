import { logger } from "./logger";

export enum CircuitState {
  CLOSED = 'CLOSED',     // Normal - toutes les requêtes passent
  OPEN = 'OPEN',         // Circuit ouvert - rejette les requêtes immédiatement
  HALF_OPEN = 'HALF_OPEN' // Test - autorise quelques requêtes pour tester
}

export interface CircuitBreakerConfig {
  name: string;
  failureThreshold: number;    // Nombre d'échecs avant ouverture
  successThreshold: number;    // Nombre de succès en HALF_OPEN pour fermer
  timeout: number;             // Temps avant passage en HALF_OPEN (ms)
  resetTimeout?: number;       // Temps avant reset des compteurs (ms)
}

export interface CircuitBreakerMetrics {
  state: CircuitState;
  failures: number;
  successes: number;
  lastFailureTime?: number;
  lastStateChange: number;
  totalRequests: number;
  totalFailures: number;
  totalSuccesses: number;
}

export class CircuitBreaker {
  private state: CircuitState = CircuitState.CLOSED;
  private failureCount: number = 0;
  private successCount: number = 0;
  private nextAttempt: number = Date.now();
  private lastStateChange: number = Date.now();
  private lastFailureTime?: number;
  
  // Métriques globales
  private totalRequests: number = 0;
  private totalFailures: number = 0;
  private totalSuccesses: number = 0;

  constructor(private config: CircuitBreakerConfig) {
    logger.info(`[CircuitBreaker] Initialized: ${config.name}`, {
      failureThreshold: config.failureThreshold,
      successThreshold: config.successThreshold,
      timeout: config.timeout
    });
  }

  async execute<T>(fn: () => Promise<T>): Promise<T> {
    this.totalRequests++;

    // Si circuit ouvert, vérifier si on peut passer en HALF_OPEN
    if (this.state === CircuitState.OPEN) {
      if (Date.now() < this.nextAttempt) {
        const error = new Error(`Circuit breaker is OPEN for ${this.config.name}`);
        logger.warn(`[CircuitBreaker] ${this.config.name} - Request rejected (OPEN)`, {
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
    } catch (error) {
      this.onFailure(error);
      throw error;
    }
  }

  private onSuccess(): void {
    this.totalSuccesses++;
    this.failureCount = 0;

    if (this.state === CircuitState.HALF_OPEN) {
      this.successCount++;
      logger.info(`[CircuitBreaker] ${this.config.name} - Success in HALF_OPEN (${this.successCount}/${this.config.successThreshold})`);
      
      if (this.successCount >= this.config.successThreshold) {
        this.toClosed();
      }
    }
  }

  private onFailure(error: unknown): void {
    this.totalFailures++;
    this.failureCount++;
    this.lastFailureTime = Date.now();
    
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    logger.warn(`[CircuitBreaker] ${this.config.name} - Failure (${this.failureCount}/${this.config.failureThreshold})`, {
      error: errorMessage,
      state: this.state
    });

    if (this.state === CircuitState.HALF_OPEN) {
      // En HALF_OPEN, un seul échec suffit pour rouvrir
      this.toOpen();
    } else if (this.failureCount >= this.config.failureThreshold) {
      this.toOpen();
    }
  }

  private toClosed(): void {
    this.state = CircuitState.CLOSED;
    this.successCount = 0;
    this.failureCount = 0;
    this.lastStateChange = Date.now();
    
    logger.info(`[CircuitBreaker] ${this.config.name} - State: CLOSED ✅`, {
      totalRequests: this.totalRequests,
      totalFailures: this.totalFailures,
      successRate: this.getSuccessRate()
    });
  }

  private toOpen(): void {
    this.state = CircuitState.OPEN;
    this.nextAttempt = Date.now() + this.config.timeout;
    this.lastStateChange = Date.now();
    
    logger.error(`[CircuitBreaker] ${this.config.name} - State: OPEN 🔴`, {
      failures: this.failureCount,
      nextAttemptAt: new Date(this.nextAttempt).toISOString(),
      totalFailures: this.totalFailures
    });
  }

  private toHalfOpen(): void {
    this.state = CircuitState.HALF_OPEN;
    this.successCount = 0;
    this.lastStateChange = Date.now();
    
    logger.info(`[CircuitBreaker] ${this.config.name} - State: HALF_OPEN ⚠️`, {
      testing: `Will try ${this.config.successThreshold} requests`
    });
  }

  getState(): CircuitState {
    return this.state;
  }

  getMetrics(): CircuitBreakerMetrics {
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

  getSuccessRate(): number {
    if (this.totalRequests === 0) return 100;
    return ((this.totalSuccesses / this.totalRequests) * 100);
  }

  isOpen(): boolean {
    return this.state === CircuitState.OPEN;
  }

  reset(): void {
    logger.info(`[CircuitBreaker] ${this.config.name} - Manual reset`);
    this.toClosed();
  }
}
