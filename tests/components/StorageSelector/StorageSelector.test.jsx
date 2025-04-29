import { render, screen, fireEvent } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { StorageSelector } from '../../../src/components/StorageSelector/index.jsx'

describe('StorageSelector Component', () => {
  const mockStorageOptions = [
    { code: 64, name: '64 GB' },
    { code: 128, name: '128 GB' },
    { code: 256, name: '256 GB' },
  ]

  const mockStoragePrimitives = [64, 128, 256]

  const mockOnStorageSelect = vi.fn()

  beforeEach(() => {
    mockOnStorageSelect.mockClear()
  })

  it('renders storage options correctly with object format', () => {
    render(
      <StorageSelector
        options={mockStorageOptions}
        onStorageSelect={mockOnStorageSelect}
        selectedStorage="64"
      />
    )
    expect(screen.getByText('64 GB')).toBeInTheDocument()
    expect(screen.getByText('128 GB')).toBeInTheDocument()
    expect(screen.getByText('256 GB')).toBeInTheDocument()

    const storageOptions = document.querySelectorAll('.storage-option')
    expect(storageOptions.length).toBe(3)

    const selectedOption = screen.getByText('64 GB').closest('.storage-option')
    expect(selectedOption).toHaveClass('selected')
  })

  it('renders storage options correctly with primitive values', () => {
    render(
      <StorageSelector
        options={mockStoragePrimitives}
        onStorageSelect={mockOnStorageSelect}
        selectedStorage="128"
      />
    )

    expect(screen.getByText('64 GB')).toBeInTheDocument()
    expect(screen.getByText('128 GB')).toBeInTheDocument()
    expect(screen.getByText('256 GB')).toBeInTheDocument()

    const selectedOption = screen.getByText('128 GB').closest('.storage-option')
    expect(selectedOption).toHaveClass('selected')
  })

  it('calls onStorageSelect when a storage option is clicked', () => {
    render(
      <StorageSelector
        options={mockStorageOptions}
        onStorageSelect={mockOnStorageSelect}
        selectedStorage="64"
      />
    )

    const option128GB = screen.getByText('128 GB').closest('.storage-option')
    fireEvent.click(option128GB)

    expect(mockOnStorageSelect).toHaveBeenCalledWith('128')
  })

  it('renders nothing when options array is empty', () => {
    const { container } = render(
      <StorageSelector options={[]} onStorageSelect={mockOnStorageSelect} selectedStorage="" />
    )

    expect(container.firstChild).toBeNull()
  })

  it('handles options without name property', () => {
    const optionsWithoutName = [{ code: 64 }, { code: 128 }]

    render(
      <StorageSelector
        options={optionsWithoutName}
        onStorageSelect={mockOnStorageSelect}
        selectedStorage="64"
      />
    )

    expect(screen.getByText('64 GB')).toBeInTheDocument()
    expect(screen.getByText('128 GB')).toBeInTheDocument()
  })
})
