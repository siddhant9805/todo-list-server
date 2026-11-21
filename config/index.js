const port = process.env.PORT || 5000;
const jwtSecret = process.env.JWT_SECRET || 'default_jwt_secret_change_in_env';
const configuredDelay = Number.parseInt(process.env.DELAY_MS || '0', 10);
const delayMs = Number.isFinite(configuredDelay) && configuredDelay > 0
  ? configuredDelay
  : 0;

module.exports = { port, jwtSecret, delayMs };
