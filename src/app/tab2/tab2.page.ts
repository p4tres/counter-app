import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import {
  IonAlert,
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
  IonToast,
  IonToolbar,
  IonSegment,
  IonSegmentButton,
} from '@ionic/angular';
import { SavedCounter } from '../models/saved-counter';
import { CounterService } from '../services/counter.service';

export type SortOption =
  | 'newest'
  | 'oldest'
  | 'name'
  | 'value-desc'
  | 'value-asc';

export type ValueFilter = 'all' | 'positive' | 'negative';

@Component({
  selector: 'app-tab2',
  templateUrl: 'tab2.page.html',
  styleUrls: ['tab2.page.scss'],
  imports: [
    DatePipe,
    IonAlert,
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
    IonToast,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
  ],
})
export class Tab2Page implements OnInit {
  readonly counterService = inject(CounterService);

  readonly searchTerm = signal('');
  readonly sortBy = signal<SortOption>('newest');
  readonly valueFilter = signal<ValueFilter>('all');

  readonly isClearAlertOpen = signal(false);
  readonly toastMessage = signal<string | null>(null);

  readonly clearAlertButtons = [
    { text: 'Zrušit', role: 'cancel' },
    { text: 'Vymazat', role: 'destructive' },
  ];

  readonly total = computed(() =>
    this.counterService
      .counters()
      .reduce((sum, counter) => sum + counter.value, 0),
  );

  readonly visibleCounters = computed(() => {
    const term = this.searchTerm().trim().toLocaleLowerCase();
    const valueFilter = this.valueFilter();

    const filtered = this.counterService
      .counters()
      .filter((counter) => counter.name.toLocaleLowerCase().includes(term) &&
        this.matchesValueFilter(counter.value, valueFilter));

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

  onValueFilterChange(value: string | number | undefined): void {
    if (value === 'all' || value === 'positive' || value === 'negative') {
      this.valueFilter.set(value);
    }
  }

  async remove(id: string): Promise<void> {
    await this.counterService.remove(id);
    this.toastMessage.set('Záznam byl odstraněn.');
  }

  openClearAlert(): void {
    this.isClearAlertOpen.set(true);
  }

  async onClearAlertDismiss(role: string | undefined): Promise<void> {
    this.isClearAlertOpen.set(false);

    if (role !== 'destructive') {
      return;
    }

    await this.counterService.clear();
  }

  private matchesValueFilter(value: number, filter: ValueFilter): boolean {
    switch (filter) {
      case 'positive':
        return value > 0;
      case 'negative':
        return value < 0;
      case 'all':
        return true;
    }
  }

  private comparator(
    sortBy: SortOption,
  ): (a: SavedCounter, b: SavedCounter) => number {
    switch (sortBy) {
      case 'newest':
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
