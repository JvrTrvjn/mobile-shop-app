import { expect, describe, it, vi, beforeEach } from 'vitest';
import { ErrorService } from '../../../src/services/error/errorService';
import logger from '../../../src/utils/logger';

// Mock del logger
vi.mock('../../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    log: vi.fn(),
    info: vi.fn()
  }
}));

describe('ErrorService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('handleApiError', () => {
    it('registra el error y devuelve un objeto con mensaje y error original', () => {
      const testError = new Error('Error de prueba API');
      const result = ErrorService.handleApiError(testError, 'Mensaje personalizado');

      // Verificar que se registra el error
      expect(logger.error).toHaveBeenCalledWith('[API Error]', testError);

      // Verificar que devuelve el objeto correcto
      expect(result).toEqual({
        message: 'Mensaje personalizado',
        originalError: testError
      });
    });

    it('usa un mensaje por defecto si no se proporciona uno personalizado', () => {
      const testError = new Error('Error de prueba API');
      const result = ErrorService.handleApiError(testError);

      expect(result.message).toBe('Ha ocurrido un error. Inténtelo de nuevo más tarde.');
    });
  });

  describe('handleValidationError', () => {
    it('registra el error de validación y devuelve el objeto con campo y mensaje', () => {
      const result = ErrorService.handleValidationError('email', 'Formato inválido');

      // Verificar que se registra la advertencia
      expect(logger.warn).toHaveBeenCalledWith(
        '[Validation Error]', 
        'Error de validación: Formato inválido'
      );

      // Verificar que devuelve el objeto correcto
      expect(result).toEqual({
        field: 'email',
        message: 'Error de validación: Formato inválido'
      });
    });

    it('usa un mensaje genérico si no se proporciona uno específico', () => {
      const result = ErrorService.handleValidationError('password');

      expect(result.message).toBe('Error de validación: password inválido');
    });
  });

  describe('handleComponentError', () => {
    it('registra el error de componente y devuelve la UI de fallback si se proporciona', () => {
      const testError = new Error('Error de componente');
      const fallbackUI = <div>Error UI</div>;
      
      const result = ErrorService.handleComponentError('TestComponent', testError, fallbackUI);

      // Verificar que se registra el error
      expect(logger.error).toHaveBeenCalledWith(
        '[Component Error: TestComponent]', 
        testError
      );

      // Verificar que devuelve la UI de fallback
      expect(result).toBe(fallbackUI);
    });

    it('devuelve null si no se proporciona UI de fallback', () => {
      const testError = new Error('Error de componente');
      
      const result = ErrorService.handleComponentError('TestComponent', testError);

      expect(result).toBeNull();
    });
  });

  describe('handleCacheError', () => {
    it('registra el error de caché y devuelve un objeto con mensaje y error original', () => {
      const testError = new Error('Error de caché');
      const result = ErrorService.handleCacheError(testError, 'guardar');

      // Verificar que se registra el error
      expect(logger.error).toHaveBeenCalledWith(
        '[Cache Error: guardar]', 
        testError
      );

      // Verificar que devuelve el objeto correcto
      expect(result).toEqual({
        message: 'Error en la caché durante guardar',
        originalError: testError
      });
    });
  });
});