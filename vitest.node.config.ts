import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    name: 'node',
    environment: 'node',
    include: ['src/graphql/**/*.test.ts', 'src/loaders/**/*.test.ts', 'src/utils/**/*.test.ts'],
    globals: true,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
});
