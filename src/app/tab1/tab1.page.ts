import { Component } from '@angular/core';
import {
  IonContent,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonListHeader,
  IonNote,
  IonTitle,
  IonToolbar,
  IonButton,
} from '@ionic/angular';
import { SavedCounter } from '../models/saved-counter';
import { CounterComponent } from '../components/counter/counter.component';

@Component({
  selector: 'app-tab1',
  templateUrl: 'tab1.page.html',
  styleUrls: ['tab1.page.scss'],
  imports: [
    CounterComponent,
    IonContent,
    IonHeader,
    IonItem,
    IonLabel,
    IonList,
    IonListHeader,
    IonNote,
    IonTitle,
    IonToolbar,
    IonButton,
  ],
})
export class Tab1Page {
  savedCounters: SavedCounter[] = [];

  onSaved(counter: SavedCounter): void {
    this.savedCounters.unshift(counter);
  }

  deleteCounter(id: string): void {
    this.savedCounters = this.savedCounters.filter((counter) => counter.id !== id);
  }
}