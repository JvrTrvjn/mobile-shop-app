import { h } from 'preact';
import { render, act } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { useErrorHandler } from '../../../src/services/error/useErrorHandler';
import { ErrorService } from '../../../src/services/error/errorService';
import logger from '../../../src/utils/logger';

// Mock de los módulos que necesitamos
const mockToast = {
  error: vi.fn(),
  warning: vi.fn(),
  success: vi.fn(),
  info: vi.fn()
};

vi.mock('../../../src/context/ToastContext', () => ({
  useToast: () => mockToast
}));

vi.mock('../../../src/services/error/errorService', () => ({
  ErrorService: {
    handleApiError: vi.fn().mockImplementation((error, fallbackMessage) => ({
      message: fallbackMessage || 'Error de API por defecto',
      originalError: error
    })),
    handleValidationError: vi.fn().mockImplementation((field, message) => ({
      field,
      message: `Error de validación: ${message || field + ' inválido'}`
    })),
    handleCacheError: vi.fn().mockImplementation((error, action) => ({
      message: `Error en la caché durante ${action}`,
      originalError: error
    }))
  }
}));

vi.mock('../../../src/utils/logger', () => ({
  default: {
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    log: vi.fn()
  }
}));

// Componente de prueba que usa el hook
function TestComponent({ onHookReady }) {
  const errorHandler = useErrorHandler();
  
  // Pasamos el hook al callback para hacer aserciones
  if (onHookReady) {
    onHookReady(errorHandler);
  }
  
  return <div>Test component</div>;
}

describe('useErrorHandler', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('registra errores generales y notifica al usuario', async () => {
    let handler;
    
    render(
      <TestComponent 
        onHookReady={(h) => { handler = h; }}
      />
    );
    
    // Verificar que el hook se inicializó correctamente
    expect(handler).toBeDefined();
    
    const testError = new Error('Error general de prueba');
    
    // Act para asegurar que los efectos se ejecuten
    await act(async () => {
      handler.notifyError(testError);
    });
    
    // Verificar que se registró el error
    expect(logger.error).toHaveBeenCalledWith('Error general de prueba', testError);
    
    // Verificar que se notificó al usuario
    expect(mockToast.error).toHaveBeenCalledWith('Error general de prueba', undefined);
  });
  
  it('no muestra toast si la opción silent es true', async () => {
    let handler;
    
    render(
      <TestComponent 
        onHookReady={(h) => { handler = h; }}
      />
    );
    
    const testError = new Error('Error silencioso');
    
    await act(async () => {
      handler.notifyError(testError, { silent: true });
    });
    
    // Verificar que se registró el error pero no se mostró toast
    expect(logger.error).toHaveBeenCalled();
    expect(mockToast.error).not.toHaveBeenCalled();
  });
  
  it('delega los errores de API al ErrorService', async () => {
    let handler;
    
    render(
      <TestComponent 
        onHookReady={(h) => { handler = h; }}
      />
    );
    
    const testError = new Error('Error API');
    
    await act(async () => {
      handler.notifyApiError(testError, 'Mensaje fallback API');
    });
    
    // Verificar que se llamó al ErrorService
    expect(ErrorService.handleApiError).toHaveBeenCalledWith(testError, 'Mensaje fallback API');
    
    // Verificar que se notificó al usuario
    expect(mockToast.error).toHaveBeenCalled();
  });
  
  it('maneja errores de validación', async () => {
    let handler;
    
    render(
      <TestComponent 
        onHookReady={(h) => { handler = h; }}
      />
    );
    
    await act(async () => {
      handler.notifyValidationError('email', 'Formato incorrecto');
    });
    
    // Verificar que se llamó al ErrorService
    expect(ErrorService.handleValidationError).toHaveBeenCalledWith('email', 'Formato incorrecto');
    
    // Verificar que se notificó al usuario con warning
    expect(mockToast.warning).toHaveBeenCalled();
  });
  
  it('maneja errores de caché', async () => {
    let handler;
    
    render(
      <TestComponent 
        onHookReady={(h) => { handler = h; }}
      />
    );
    
    const testError = new Error('Error caché');
    
    await act(async () => {
      handler.notifyCacheError(testError, 'guardar');
    });
    
    // Verificar que se llamó al ErrorService
    expect(ErrorService.handleCacheError).toHaveBeenCalledWith(testError, 'guardar');
    
    // Verificar que se notificó al usuario
    expect(mockToast.error).toHaveBeenCalled();
  });
});