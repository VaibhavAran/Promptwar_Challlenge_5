import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import type { Plugin } from 'vite';

function apiDevServerPlugin(): Plugin {
  return {
    name: 'api-dev-server',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (req.url?.startsWith('/api/generate-plan') && req.method === 'POST') {
          try {
            const chunks: Uint8Array[] = [];
            for await (const chunk of req) {
              chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
            }
            const rawBody = Buffer.concat(chunks).toString('utf-8');
            let body: unknown = {};
            try {
              body = JSON.parse(rawBody);
            } catch {
              body = {};
            }

            // Adapter conforming to VercelRequest and VercelResponse
            const vercelReq = Object.assign(req, {
              body,
              query: {},
              cookies: {},
            });

            const vercelRes = Object.assign(res, {
              status(code: number) {
                res.statusCode = code;
                return vercelRes;
              },
              json(payload: unknown) {
                if (!res.headersSent) {
                  res.setHeader('Content-Type', 'application/json');
                }
                res.end(JSON.stringify(payload));
                return vercelRes;
              },
              send(payload: unknown) {
                res.end(typeof payload === 'string' ? payload : JSON.stringify(payload));
                return vercelRes;
              },
            });

            const { default: handler } = await import('./api/generate-plan.ts');
            await handler(vercelReq as never, vercelRes as never);
          } catch (err: unknown) {
            if (!res.writableEnded) {
              res.statusCode = 500;
              res.setHeader('Content-Type', 'application/json');
              const msg = err instanceof Error ? err.message : 'Internal Server Error';
              res.end(JSON.stringify({ success: false, error: msg, code: 'UNKNOWN' }));
            }
          }
          return;
        }
        next();
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  // Load environment variables (.env, .env.local) so GEMINI_API_KEY is available in dev
  const env = loadEnv(mode, process.cwd(), '');
  if (env.GEMINI_API_KEY && !process.env.GEMINI_API_KEY) {
    process.env.GEMINI_API_KEY = env.GEMINI_API_KEY;
  }

  return {
    plugins: [react(), apiDevServerPlugin()],
    server: {
      port: 5173,
      host: true,
    },
  };
});
