import { TestBed } from '@angular/core/testing';
import { Preferences } from '@capacitor/preferences';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from './counter.service';

vi.mock('@capacitor/preferences', () => ({
  Preferences: {
    get: vi.fn(),
    set: vi.fn(),
    remove: vi.fn(),
  },
}));

describe('CounterService', () => {
  let service: CounterService;

  const getMock = vi.mocked(Preferences.get);
  const setMock = vi.mocked(Preferences.set);
  const removeMock = vi.mocked(Preferences.remove);

  const first: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  const second: SavedCounter = {
    id: 'second',
    name: 'Druhé',
    value: 2,
    createdAt: '2026-09-17T09:00:00.000Z',
  };

  beforeEach(() => {
    // Vynulujeme počty volání mocků z předchozího testu.
    vi.clearAllMocks();

    // Výchozí stav: v Preferences zatím není uložená historie.
    getMock.mockResolvedValue({ value: null });

    // Zápis i odstranění ve výchozím stavu úspěšně skončí.
    setMock.mockResolvedValue(undefined);
    removeMock.mockResolvedValue(undefined);

    // Pro každý test vytvoříme nové prostředí Angular dependency injection.
    TestBed.configureTestingModule({
      providers: [CounterService],
    });

    // Z testovacího injectoru získáme čerstvou instanci služby.
    service = TestBed.inject(CounterService);
  });

  it('should initialize only once', async () => {
    // Dvě volání bez čekání simulují souběžné požadavky na inicializaci.
    await Promise.all([service.initialize(), service.initialize()]);

    // Další volání proběhne až po dokončení první inicializace.
    await service.initialize();

    // Všechna volání musí sdílet jedinou operaci načtení Preferences.
    expect(getMock).toHaveBeenCalledTimes(1);

    // Služba dokončila inicializaci a při value: null má prázdnou historii.
    expect(service.initialized()).toBe(true);
    expect(service.counters()).toEqual([]);
  });

  // 1. Načtení uložených dat
  it('should load saved counters from Preferences', async () => {
    // V úložišti je uložené pole dvou záznamů jako JSON řetězec.
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.initialize();

    // Signal obsahuje stejné objekty ve stejném pořadí.
    expect(service.counters()).toEqual([first, second]);
    expect(service.initialized()).toBe(true);

    // Služba četla správný klíč.
    expect(getMock).toHaveBeenCalledWith({ key: 'saved-counters' });
  });

  // 2. Přidání záznamu
  it('should add a counter to the beginning and persist it', async () => {
    // V úložišti už je jeden záznam.
    getMock.mockResolvedValue({
      value: JSON.stringify([first]),
    });

    await service.add(second);

    // Nový záznam je na začátku seznamu.
    expect(service.counters()).toEqual([second, first]);

    // Stav byl uložen pod správným klíčem jako JSON.
    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second, first]),
    });
  });

  // 3. Odstranění jednoho záznamu
  it('should remove only the matching counter and persist the new state', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.remove('first');

    // Zůstal pouze záznam s jiným id.
    expect(service.counters()).toEqual([second]);

    // Nový stav byl uložen.
    expect(setMock).toHaveBeenCalledTimes(1);
    expect(setMock).toHaveBeenCalledWith({
      key: 'saved-counters',
      value: JSON.stringify([second]),
    });
  });

  // 4. Vymazání historie
  it('should clear history and remove only the saved-counters key', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify([first, second]),
    });

    await service.clear();

    // Signal je prázdný.
    expect(service.counters()).toEqual([]);

    // Odstraněn byl pouze klíč této historie.
    expect(removeMock).toHaveBeenCalledTimes(1);
    expect(removeMock).toHaveBeenCalledWith({ key: 'saved-counters' });

    // clear() neukládá prázdné pole přes set().
    expect(setMock).not.toHaveBeenCalled();
  });

  // 5a. Poškozená data – neplatný JSON
  it('should recover from invalid JSON', async () => {
    getMock.mockResolvedValue({
      value: 'this is not a valid JSON',
    });

    // Spy musí vzniknout PŘED initialize().
    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    await service.initialize();

    expect(service.counters()).toEqual([]);
    expect(service.initialized()).toBe(true);
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to load saved counters:',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });

  // 5b. Poškozená data – platný JSON, ale ne pole
  it('should recover from valid JSON that is not an array', async () => {
    getMock.mockResolvedValue({
      value: JSON.stringify({ name: 'test' }),
    });

    const errorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => undefined);

    await service.initialize();

    expect(service.counters()).toEqual([]);
    expect(service.initialized()).toBe(true);
    expect(errorSpy).toHaveBeenCalledWith(
      'Failed to load saved counters:',
      expect.any(Error),
    );

    errorSpy.mockRestore();
  });
});