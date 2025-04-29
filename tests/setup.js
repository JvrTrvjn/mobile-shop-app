// Este archivo configura el entorno de testing
import { expect, afterEach } from 'vitest';
import { cleanup } from '@testing-library/preact';
import * as matchers from '@testing-library/jest-dom/matchers';

// Extender los matchers de Vitest
expect.extend(matchers);

// Limpiar después de cada test
afterEach(() => {
  cleanup();
});