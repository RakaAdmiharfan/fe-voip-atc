// jest.config.ts
import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest/presets/js-with-ts',
  testEnvironment: 'jsdom',
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
  },
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transformIgnorePatterns: ['/node_modules/'],
  globals: {
    'ts-jest': {
      useESM: false,
      tsconfig: 'tsconfig.json',
    },
  },
};

export default config;
