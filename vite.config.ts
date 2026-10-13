import { fileURLToPath, URL } from 'node:url';
import https from 'node:https';
import type { IncomingMessage, ServerResponse } from 'node:http';
import type { Plugin } from 'vite';
import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

const PROXY_PREFIX = '/green-api-proxy';

const HOP_BY_HOP_HEADERS = ['connection', 'content-length', 'host', 'origin', 'referer'];

const upstreamAgent = new https.Agent({ keepAlive: true });

function createGreenApiProxy(): Plugin {
  return {
    name: 'green-api-dev-proxy',
    apply: 'serve',
    configureServer(server) {
      server.middlewares.use(PROXY_PREFIX, (req: IncomingMessage, res: ServerResponse) => {
        const raw = req.url ?? '';
        const queryIndex = raw.indexOf('?');
        const pathPart = (queryIndex === -1 ? raw : raw.slice(0, queryIndex)).replace(/^\/+/, '');
        const query = queryIndex === -1 ? '' : raw.slice(queryIndex);
        const segments = pathPart.split('/');
        const baseSegment = segments.shift() ?? '';

        let target: URL;

        try {
          const base = decodeURIComponent(baseSegment);
          target = new URL(`${base.replace(/\/+$/, '')}/${segments.join('/')}${query}`);
        } catch {
          res.statusCode = 400;
          res.end('Invalid proxy target');

          return;
        }

        const headers: Record<string, string | string[]> = {};

        for (const [key, value] of Object.entries(req.headers)) {
          if (value !== undefined && !HOP_BY_HOP_HEADERS.includes(key.toLowerCase())) {
            headers[key] = value;
          }
        }

        headers.host = target.host;

        const upstream = https.request(
          target,
          { method: req.method, headers, agent: upstreamAgent },
          (upstreamRes) => {
            res.writeHead(upstreamRes.statusCode ?? 502, upstreamRes.headers);
            upstreamRes.pipe(res);
          },
        );

        upstream.on('error', (error: Error) => {
          res.statusCode = 502;
          res.end(`Proxy error: ${error.message}`);
        });

        req.pipe(upstream);
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), createGreenApiProxy()],
  css: {
    preprocessorOptions: {
      scss: {
        api: 'modern-compiler',
      },
    },
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/setupTests.ts'],
    css: true,
    include: ['src/**/*.test.{ts,tsx}'],
  },
});