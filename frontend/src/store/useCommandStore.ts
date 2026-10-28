import { create } from 'zustand';

interface CommandState {
  isOpen: boolean;
  searchQuery: string;
  openCommandPalette: () => void;
  closeCommandPalette: () => void;
  toggleCommandPalette: () => void;
  setSearchQuery: (query: string) => void;
}

export const useCommandStore = create<CommandState>((set) => ({
  isOpen: false,
  searchQuery: '',
  openCommandPalette: () => set({ isOpen: true, searchQuery: '' }),
  closeCommandPalette: () => set({ isOpen: false, searchQuery: '' }),
  toggleCommandPalette: () => set((state) => ({ isOpen: !state.isOpen, searchQuery: '' })),
  setSearchQuery: (query: string) => set({ searchQuery: query }),
}));
