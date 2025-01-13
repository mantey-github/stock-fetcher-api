import { Request, Response, NextFunction } from 'express';
import rateLimit from 'express-rate-limit';
import { getCache } from './cache';
const RATE_LIMIT_WINDOW_MS = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000', 10);
const RATE_LIMIT_MAX_REQUESTS = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100', 10);

const isValidDate = (date: string) => {
  return !isNaN(new Date(date).getTime());
};

const validateRequest = (req: Request, res: Response, next: NextFunction) => {
  const { market, symbol } = req.params;
  const { start, end } = req.query as { start: string; end?: string };

  if (!market || !symbol) {
    res.status(400).json({
      error: {
        code: 'Bad Request',
        description: 'Market and symbol are required.',
      },
    });
    return;
  }

  if (!start || !isValidDate(start)) {
    res.status(400).json({
      error: {
        code: 'Bad Request',
        description: 'Invalid input - start date. A valid date (YYYY-MM-DD) is required.',
      },
    });
    return;
  }

  if (end && !isValidDate(end)) {
    res.status(400).json({
      error: {
        code: 'Bad Request',
        description: 'Invalid input - end date. A valid date (YYYY-MM-DD)  is required.',
      },
    });
    return;
  }

  if (end && new Date(start) > new Date(end)) {
    res.status(400).json({
      error: {
        code: 'Bad Request',
        description: `Invalid input - start date cannot be after end date. startDate = ${start}, endDate = ${end}`,
      },
    });
    return;
  }

  next();
};

const checkCache = (req: Request, res: Response, next: NextFunction) => {
  const { market, symbol } = req.params;
  const { start, end } = req.query;
  const cacheKey = `${market}_${symbol}_${start}_${end}`;

  // Check cache
  const cachedResponse = getCache(cacheKey);
  if (cachedResponse) {
    res.send(cachedResponse);
    return;
  }

  next();
};

const rateLimiter = rateLimit({
  windowMs: RATE_LIMIT_WINDOW_MS, // default 15 minutes
  max: RATE_LIMIT_MAX_REQUESTS, // Limit each IP to 100 requests per `windowMs`
  standardHeaders: true,
  legacyHeaders: false,
  handler: (request, response) => {
    response.status(429).json({
      error: {
        code: 'Too Many Requests',
        description: 'You have exceeded the request limit. Please try again later.',
      },
    });
  },
});

export { validateRequest, checkCache, rateLimiter };
