import { h } from 'preact'
import { render, screen, fireEvent } from '@testing-library/preact'
import { expect, describe, it, vi, beforeEach } from 'vitest'
import { LanguageSelector } from '../../../src/components/LanguageSelector/index'

const mockChangeLanguage = vi.fn()
vi.mock('../../../src/context/I18nContext', () => ({
  useTranslation: () => ({
    i18n: {
      language: 'es',
      options: {
        resources: {
          es: { translation: {} },
          en: { translation: {} },
        },
      },
    },
    changeLanguage: mockChangeLanguage,
    language: 'es',
    t: key => key,
  }),
}))

describe('LanguageSelector Component', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('renderiza correctamente los botones de idioma', () => {
    render(<LanguageSelector />)

    const esButton = screen.getByText('ES')
    const enButton = screen.getByText('EN')

    expect(esButton).toBeDefined()
    expect(enButton).toBeDefined()
  })

  it('marca como activo el idioma actual', () => {
    render(<LanguageSelector />)

    const esButton = screen.getByText('ES')
    const enButton = screen.getByText('EN')

    expect(esButton.className).toContain('active')
    expect(enButton.className).not.toContain('active')
  })

  it('llama a changeLanguage al hacer clic en un botón de idioma', () => {
    render(<LanguageSelector />)

    const enButton = screen.getByText('EN')
    fireEvent.click(enButton)

    expect(mockChangeLanguage).toHaveBeenCalledWith('en')
  })
})
