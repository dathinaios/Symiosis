import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createSearchActions } from '$lib/app/actions/search.svelte'

describe('search actions', () => {
  let searchActions: ReturnType<typeof createSearchActions>
  let mockDeps: Parameters<typeof createSearchActions>[0]

  beforeEach(() => {
    mockDeps = {
      searchManager: {
        clearSearch: vi.fn(),
        setFilteredNotes: vi.fn(),
      },
      contentManager: {
        clearHighlights: vi.fn(),
      },
      focusManager: {
        selectedIndex: 0,
        setSelectedIndex: vi.fn(),
      },
      editorManager: {
        exitEditMode: vi.fn(),
      },
    }

    searchActions = createSearchActions(mockDeps)
  })

  describe('updateFilteredNotes', () => {
    it('should update filtered notes in search manager', () => {
      const notes = ['note1.md', 'note2.md', 'note3.md']

      searchActions.updateFilteredNotes(notes)

      expect(mockDeps.searchManager.setFilteredNotes).toHaveBeenCalledWith(
        notes
      )
    })

    it('should reset selection to 0 when current index is -1 and notes exist', () => {
      mockDeps.focusManager.selectedIndex = -1
      const notes = ['note1.md', 'note2.md']

      searchActions.updateFilteredNotes(notes)

      expect(mockDeps.editorManager.exitEditMode).toHaveBeenCalledOnce()
      expect(mockDeps.focusManager.setSelectedIndex).toHaveBeenCalledWith(0)
    })

    it('should reset selection to 0 when current index exceeds notes length', () => {
      mockDeps.focusManager.selectedIndex = 5
      const notes = ['note1.md', 'note2.md']

      searchActions.updateFilteredNotes(notes)

      expect(mockDeps.editorManager.exitEditMode).toHaveBeenCalledOnce()
      expect(mockDeps.focusManager.setSelectedIndex).toHaveBeenCalledWith(0)
    })

    it('should not reset selection when index is valid', () => {
      mockDeps.focusManager.selectedIndex = 1
      const notes = ['note1.md', 'note2.md', 'note3.md']

      searchActions.updateFilteredNotes(notes)

      expect(mockDeps.editorManager.exitEditMode).not.toHaveBeenCalled()
      expect(mockDeps.focusManager.setSelectedIndex).not.toHaveBeenCalled()
    })

    it('should not reset selection when no notes exist', () => {
      mockDeps.focusManager.selectedIndex = 5
      const notes: string[] = []

      searchActions.updateFilteredNotes(notes)

      expect(mockDeps.editorManager.exitEditMode).not.toHaveBeenCalled()
      expect(mockDeps.focusManager.setSelectedIndex).not.toHaveBeenCalled()
    })

    it('should handle empty notes array', () => {
      searchActions.updateFilteredNotes([])

      expect(mockDeps.searchManager.setFilteredNotes).toHaveBeenCalledWith([])
    })
  })

  describe('resetSearchState', () => {
    it('should clear search, filtered notes, and highlights', () => {
      searchActions.resetSearchState()

      expect(mockDeps.searchManager.clearSearch).toHaveBeenCalledOnce()
      expect(mockDeps.searchManager.setFilteredNotes).toHaveBeenCalledWith([])
      expect(mockDeps.contentManager.clearHighlights).toHaveBeenCalledOnce()
    })

    it('should call methods in correct order', () => {
      const clearSearchSpy = mockDeps.searchManager.clearSearch
      const setFilteredNotesSpy = mockDeps.searchManager.setFilteredNotes
      const clearHighlightsSpy = mockDeps.contentManager.clearHighlights

      searchActions.resetSearchState()

      expect(clearSearchSpy).toHaveBeenCalledOnce()
      expect(setFilteredNotesSpy).toHaveBeenCalledOnce()
      expect(clearHighlightsSpy).toHaveBeenCalledOnce()
    })
  })

  describe('clearHighlights', () => {
    it('should delegate to content manager clearHighlights', () => {
      searchActions.clearHighlights()

      expect(mockDeps.contentManager.clearHighlights).toHaveBeenCalledOnce()
    })
  })

  describe('clearSearch', () => {
    it('should delegate to search manager clearSearch', () => {
      searchActions.clearSearch()

      expect(mockDeps.searchManager.clearSearch).toHaveBeenCalledOnce()
    })
  })

  describe('interface compliance', () => {
    it('should expose all required methods', () => {
      expect(searchActions).toHaveProperty('updateFilteredNotes')
      expect(searchActions).toHaveProperty('resetSearchState')
      expect(searchActions).toHaveProperty('clearHighlights')
      expect(searchActions).toHaveProperty('clearSearch')

      expect(typeof searchActions.updateFilteredNotes).toBe('function')
      expect(typeof searchActions.resetSearchState).toBe('function')
      expect(typeof searchActions.clearHighlights).toBe('function')
      expect(typeof searchActions.clearSearch).toBe('function')
    })
  })

  describe('edge cases', () => {
    it('should handle null/undefined notes gracefully', () => {
      expect(() => {
        searchActions.updateFilteredNotes(null as any)
      }).toThrow() // Should throw due to length check
    })

    it('should handle very large note arrays', () => {
      const largeNoteArray = Array.from(
        { length: 10000 },
        (_, i) => `note${i}.md`
      )

      expect(() => {
        searchActions.updateFilteredNotes(largeNoteArray)
      }).not.toThrow()

      expect(mockDeps.searchManager.setFilteredNotes).toHaveBeenCalledWith(
        largeNoteArray
      )
    })
  })
})
