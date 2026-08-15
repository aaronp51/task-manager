import type { NextFunction, Request, Response } from 'express';

function handleError(err: unknown, _req: Request, res: Response, _next: NextFunction) {
  console.error(err);
  res.status(500).json({ message: 'Internal server error.' });
}

export default handleError;