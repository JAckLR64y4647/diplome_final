import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export enum ThemeMode {
  LIGHT = 'light',
  DARK = 'dark'
}

export interface Theme {
  name: string;
  backgroundColor: string;
  textColor: string;
  accentColor: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private lightTheme: Theme = {
    backgroundColor: '#ffffff',
    textColor: '#000000',
    accentColor: '#007bff',
    name: 'light'
  };

  private darkTheme: Theme = {
    backgroundColor: '#121212',
    textColor: '#ffffff',
    accentColor: '#bb86fc',
    name: 'dark'
  };

  private currentTheme: BehaviorSubject<Theme>;
  private currentMode: BehaviorSubject<ThemeMode>;

  constructor() {
    this.currentTheme = new BehaviorSubject<Theme>(this.lightTheme);
    this.currentMode = new BehaviorSubject<ThemeMode>(ThemeMode.LIGHT);
    this.loadTheme();
    this.applyTheme();
  }

  getCurrentTheme(): Observable<Theme> {
    return this.currentTheme.asObservable();
  }

  getCurrentMode(): Observable<ThemeMode> {
    return this.currentMode.asObservable();
  }

  setLightTheme(): void {
    this.currentTheme.next(this.lightTheme);
    this.currentMode.next(ThemeMode.LIGHT);
    localStorage.setItem('themeMode', ThemeMode.LIGHT);
    this.applyTheme();
  }

  setDarkTheme(): void {
    this.currentTheme.next(this.darkTheme);
    this.currentMode.next(ThemeMode.DARK);
    localStorage.setItem('themeMode', ThemeMode.DARK);
    this.applyTheme();
  }

  toggleTheme(): void {
    if (this.currentMode.value === ThemeMode.LIGHT) {
      this.setDarkTheme();
    } else {
      this.setLightTheme();
    }
  }

  private loadTheme(): void {
    const savedMode = localStorage.getItem('themeMode') as ThemeMode;
    if (savedMode === ThemeMode.DARK) {
      this.setDarkTheme();
    } else {
      this.setLightTheme();
    }
  }

  private applyTheme(): void {
    const theme = this.currentTheme.value;
    document.body.style.backgroundColor = theme.backgroundColor;
    document.body.style.color = theme.textColor;
  }
}
