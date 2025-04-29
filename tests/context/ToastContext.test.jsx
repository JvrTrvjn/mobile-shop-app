import { render, act } from '@testing-library/preact';
import { expect, describe, it, vi, beforeEach } from 'vitest';
import { ToastProvider, useToast } from '../../src/context/ToastContext';
import { toast as toastify } from 'react-toastify';

// Mock de react-toastify
vi.mock('react-toastify', () => {
  return {
    toast: {
      success: vi.fn(),
      error: vi.fn(),
      info: vi.fn(),
      warning: vi.fn(),
    },
    ToastContainer: vi.fn(() => null),
  };
});

// Componente para testear el hook useToast
function TestComponent({ testFn }) {
  const toast = useToast();
  testFn(toast);
  return null;
}

describe('ToastContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('proporciona funciones para mostrar diferentes tipos de toast', () => {
    let capturedToast;

    const testFn = vi.fn((toast) => {
      capturedToast = toast;
    });

    render(
      <ToastProvider>
        <TestComponent testFn={testFn} />
      </ToastProvider>
    );

    // Verificar que todas las funciones necesarias están disponibles
    expect(capturedToast).toBeDefined();
    expect(typeof capturedToast.success).toBe('function');
    expect(typeof capturedToast.error).toBe('function');
    expect(typeof capturedToast.info).toBe('function');
    expect(typeof capturedToast.warning).toBe('function');
  });

  it('muestra toast de éxito correctamente', () => {
    let capturedToast;

    const testFn = vi.fn((toast) => {
      capturedToast = toast;
    });

    render(
      <ToastProvider>
        <TestComponent testFn={testFn} />
      </ToastProvider>
    );

    // Llamar a success
    act(() => {
      capturedToast.success('Mensaje de éxito');
    });

    // Verificar que se llamó a toastify.success con los parámetros correctos
    expect(toastify.success).toHaveBeenCalledTimes(1);
    expect(toastify.success).toHaveBeenCalledWith('Mensaje de éxito', expect.objectContaining({
      toastId: 'success-Mensaje de éxito'
    }));
  });

  it('muestra toast de error correctamente', () => {
    let capturedToast;

    const testFn = vi.fn((toast) => {
      capturedToast = toast;
    });

    render(
      <ToastProvider>
        <TestComponent testFn={testFn} />
      </ToastProvider>
    );

    // Llamar a error
    act(() => {
      capturedToast.error('Mensaje de error');
    });

    // Verificar que se llamó a toastify.error con los parámetros correctos
    expect(toastify.error).toHaveBeenCalledTimes(1);
    expect(toastify.error).toHaveBeenCalledWith('Mensaje de error', expect.objectContaining({
      toastId: 'error-Mensaje de error'
    }));
  });

  it('muestra toast de advertencia correctamente', () => {
    let capturedToast;

    const testFn = vi.fn((toast) => {
      capturedToast = toast;
    });

    render(
      <ToastProvider>
        <TestComponent testFn={testFn} />
      </ToastProvider>
    );

    // Llamar a warning
    act(() => {
      capturedToast.warning('Mensaje de advertencia');
    });

    // Verificar que se llamó a toastify.warning con los parámetros correctos
    expect(toastify.warning).toHaveBeenCalledTimes(1);
    expect(toastify.warning).toHaveBeenCalledWith('Mensaje de advertencia', expect.objectContaining({
      toastId: 'warning-Mensaje de advertencia'
    }));
  });

  it('muestra toast de información correctamente', () => {
    let capturedToast;

    const testFn = vi.fn((toast) => {
      capturedToast = toast;
    });

    render(
      <ToastProvider>
        <TestComponent testFn={testFn} />
      </ToastProvider>
    );

    // Llamar a info
    act(() => {
      capturedToast.info('Mensaje informativo');
    });

    // Verificar que se llamó a toastify.info con los parámetros correctos
    expect(toastify.info).toHaveBeenCalledTimes(1);
    expect(toastify.info).toHaveBeenCalledWith('Mensaje informativo', expect.objectContaining({
      toastId: 'info-Mensaje informativo'
    }));
  });

  it('usa el id personalizado cuando se proporciona', () => {
    let capturedToast;

    const testFn = vi.fn((toast) => {
      capturedToast = toast;
    });

    render(
      <ToastProvider>
        <TestComponent testFn={testFn} />
      </ToastProvider>
    );

    // Llamar a success con un toastId personalizado
    act(() => {
      capturedToast.success('Mensaje con ID personalizado', { toastId: 'custom-id' });
    });

    // Verificar que se usó el id personalizado
    expect(toastify.success).toHaveBeenCalledWith('Mensaje con ID personalizado', expect.objectContaining({
      toastId: 'custom-id'
    }));
  });
});