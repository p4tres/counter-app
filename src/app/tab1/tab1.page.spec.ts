import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';
import { Tab1Page } from './tab1.page';

describe('Tab1Page', () => {
  let page: Tab1Page;

  const counterServiceMock = {
    add: vi.fn().mockResolvedValue(undefined),
  };

  const counter: SavedCounter = {
    id: 'first',
    name: 'První',
    value: 1,
    createdAt: '2026-09-17T08:00:00.000Z',
  };

  beforeEach(() => {
    vi.clearAllMocks();

    TestBed.configureTestingModule({
      providers: [{ provide: CounterService, useValue: counterServiceMock }],
    });

    page = TestBed.runInInjectionContext(() => new Tab1Page());
  });

  it('should create', () => {
    expect(page).toBeTruthy();
  });

  it('should pass saved counter to CounterService', async () => {
    await page.onSaved(counter);

    expect(counterServiceMock.add).toHaveBeenCalledTimes(1);
    expect(counterServiceMock.add).toHaveBeenCalledWith(counter);

    expect(page.toastMessage()).toContain('První');
  });
});