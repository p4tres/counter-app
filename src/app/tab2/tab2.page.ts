import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonButton,
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonNote,
  IonSearchbar,
  IonSelect,
  IonSelectOption,
  IonSpinner,
  IonTitle,
  IonToolbar,
} from '@ionic/angular';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'name'
  | 'value-desc'
  | 'value-asc';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonButton,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonNote,
    IonSearchbar,
    IonSelect,
    IonSelectOption,
    IonSpinner,
    IonTitle,
    IonToolbar,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);

  readonly searchTerm = signal('');
  readonly sortBy = signal<SortOption>('newest');

  readonly total = computed(() =>
    this.counterService
      .counters()
      .reduce((sum, counter) => sum + counter.value, 0),
  );

  readonly visibleCounters = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();

    const filtered = this.counterService
      .counters()
      .filter((counter) => counter.name.toLocaleLowerCase().includes(term));

    return [...filtered].sort(this.comparator(this.sortBy()));
  });

  async ngOnInit(): Promise<void> {
    await this.counterService.initialize();
  }

  onSearch(value: string | null | undefined): void {
    this.searchTerm.set(value ?? '');
  }

  onSortChange(value: SortOption): void {
    this.sortBy.set(value);
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
  }

  async clear(): Promise<void> {
    await this.counterService.clear();
  }

  private comparator(
    sortBy: SortOption,
  ): (a: SavedCounter, b: SavedCounter) => number {
    switch (sortBy) {
      case 'newest':
        // ISO 8601 řetězce lze porovnávat přímo jako text.
        return (a, b) => b.createdAt.localeCompare(a.createdAt);
      case 'oldest':
        return (a, b) => a.createdAt.localeCompare(b.createdAt);
      case 'name':
        return (a, b) => a.name.localeCompare(b.name, 'cs');
      case 'value-desc':
        return (a, b) => b.value - a.value;
      case 'value-asc':
        return (a, b) => a.value - b.value;
    }
  }
}
