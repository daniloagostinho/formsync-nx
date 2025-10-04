import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class MobileMenuService {
  private mobileMenuOpenSubject = new BehaviorSubject<boolean>(false);
  public mobileMenuOpen$ = this.mobileMenuOpenSubject.asObservable();

  constructor() { }

  toggleMobileMenu(): void {
    const currentValue = this.mobileMenuOpenSubject.value;
    const newValue = !currentValue;
    console.log('🔍 MobileMenuService: toggleMobileMenu - current:', currentValue, 'new:', newValue);
    this.mobileMenuOpenSubject.next(newValue);
  }

  openMobileMenu(): void {
    this.mobileMenuOpenSubject.next(true);
  }

  closeMobileMenu(): void {
    this.mobileMenuOpenSubject.next(false);
  }

  get isMobileMenuOpen(): boolean {
    return this.mobileMenuOpenSubject.value;
  }
}
