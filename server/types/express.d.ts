declare global {
  namespace Express {
    interface Request {
      user?: string;
      company?: string;
      roles?: string[];
      departments?: Array<{
        _id: string;
        name: string;
      }>;
    }
  }
}

export {};
