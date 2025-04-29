import { render, screen, fireEvent } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { ColorSelector } from '../../../src/components/ColorSelector/index.jsx'

describe('ColorSelector Component - Tests Simplificados', () => {
  const mockColors = [
    { code: 1000, name: 'Black' },
    { code: 1001, name: 'White' },
    { code: 1002, name: 'Red' },
  ]

  const mockOnColorSelect = vi.fn()

  beforeEach(() => {
    mockOnColorSelect.mockClear()
  })

  it('renderiza opciones de color y maneja selección', () => {
    const { container } = render(
      <ColorSelector colors={mockColors} onColorSelect={mockOnColorSelect} selectedColor="1000" />
    )

    expect(screen.getByText('Black')).toBeDefined()
    expect(screen.getByText('White')).toBeDefined()
    expect(screen.getByText('Red')).toBeDefined()

    const whiteColorOption = screen.getByText('White').closest('.color-option')
    fireEvent.click(whiteColorOption)

    expect(mockOnColorSelect).toHaveBeenCalledWith('1001')
  })
})
