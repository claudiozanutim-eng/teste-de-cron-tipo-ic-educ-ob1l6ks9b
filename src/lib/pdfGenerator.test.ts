import { describe, it, expect } from 'vitest'
import { sanitizeFilename } from './pdfGenerator'
import { PERFIS_INFO } from '@/types/cronotipo'

describe('pdfGenerator', () => {
  it('sanitizeFilename remove acentos e caracteres especiais', () => {
    expect(sanitizeFilename('João da Silva & Cia.')).toBe('joao-da-silva-cia')
    expect(sanitizeFilename('Golfinho / Urso')).toBe('golfinho-urso')
    expect(sanitizeFilename('  ---Teste---  ')).toBe('teste')
  })

  it('todos os 4 perfis de cronotipo existem nas informações do PDF', () => {
    const perfis = ['Urso', 'Leão', 'Lobo', 'Golfinho'] as const
    for (const perfil of perfis) {
      expect(PERFIS_INFO[perfil]).toBeDefined()
      expect(PERFIS_INFO[perfil].perfil).toBe(perfil)
      expect(PERFIS_INFO[perfil].pontosChave.length).toBeGreaterThan(0)
      expect(PERFIS_INFO[perfil].dicaRotina).toBeTruthy()
    }
  })
})
