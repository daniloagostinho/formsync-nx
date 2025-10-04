import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatChipsModule } from '@angular/material/chips';
import { TourService, TourState, TourStep } from '../../services/tour.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-tour',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatChipsModule
  ],
  template: `
    <!-- Overlay do tour -->
    <div *ngIf="tourState.isActive" class="tour-overlay" (click)="onOverlayClick($event)">
      <!-- Card do tour -->
      <div class="tour-container" [class]="'tour-position-' + (currentStep?.position || 'bottom')">
        <mat-card class="tour-card">
          <!-- Header do tour -->
          <div class="tour-header">
            <div class="tour-header-content">
              <div class="tour-icon">
                <mat-icon>explore</mat-icon>
              </div>
              <div class="tour-title-section">
                <h2 class="tour-title">{{ currentStep?.title }}</h2>
                <div class="tour-progress">
                  <mat-chip color="primary" selected class="step-indicator">
                    <mat-icon>flag</mat-icon>
                    {{ tourState.currentStep + 1 }} de {{ tourState.totalSteps }}
                  </mat-chip>
                </div>
              </div>
              <button 
                mat-icon-button 
                class="tour-close-btn"
                (click)="skipTour()"
                matTooltip="Pular tour">
                <mat-icon>close</mat-icon>
              </button>
            </div>
          </div>

          <!-- Conteúdo do tour -->
          <div class="tour-content">
            <p class="tour-description">{{ currentStep?.content }}</p>
            
            <!-- Indicador de progresso -->
            <div class="tour-progress-container">
              <mat-progress-bar 
                mode="determinate" 
                [value]="progressPercentage"
                color="primary"
                class="tour-progress-bar">
              </mat-progress-bar>
              <span class="progress-text">{{ progressPercentage }}% completo</span>
            </div>
          </div>

          <!-- Ações do tour -->
          <div class="tour-actions">
            <div class="tour-actions-left">
              <button 
                *ngIf="tourState.currentStep > 0"
                mat-stroked-button 
                (click)="previousStep()"
                class="tour-btn tour-btn-secondary">
                <mat-icon>arrow_back</mat-icon>
                Anterior
              </button>
            </div>

            <div class="tour-actions-center">
              <button 
                mat-button 
                (click)="skipTour()"
                class="tour-btn tour-btn-skip">
                <mat-icon>skip_next</mat-icon>
                Pular Tour
              </button>
            </div>

            <div class="tour-actions-right">
              <button 
                *ngIf="tourState.currentStep < tourState.totalSteps - 1"
                mat-raised-button 
                color="primary"
                (click)="nextStep()"
                class="tour-btn tour-btn-primary">
                Próximo
                <mat-icon>arrow_forward</mat-icon>
              </button>
              
              <button 
                *ngIf="tourState.currentStep === tourState.totalSteps - 1"
                mat-raised-button 
                color="primary"
                (click)="completeTour()"
                class="tour-btn tour-btn-complete">
                <mat-icon>check_circle</mat-icon>
                Finalizar Tour
              </button>
            </div>
          </div>
        </mat-card>

        <!-- Seta indicadora -->
        <div *ngIf="currentStep?.showArrow" class="tour-arrow" [class]="'tour-arrow-' + (currentStep?.position || 'bottom')">
          <mat-icon>arrow_drop_down</mat-icon>
        </div>
      </div>
    </div>
  `,
  styleUrl: './tour.component.css'
})
export class TourComponent implements OnInit, OnDestroy {
  tourState: TourState = {
    isActive: false,
    currentStep: 0,
    totalSteps: 0,
    isFirstTime: false
  };

  currentStep: TourStep | null = null;
  progressPercentage = 0;

  private subscription: Subscription = new Subscription();

  constructor(private tourService: TourService) {}

  ngOnInit(): void {
    // Inscrever no estado do tour
    this.subscription.add(
      this.tourService.tourState$.subscribe(state => {
        this.tourState = state;
        this.currentStep = this.tourService.getCurrentStep();
        this.calculateProgress();
      })
    );
  }

  ngOnDestroy(): void {
    this.subscription.unsubscribe();
  }

  /**
   * Calcula a porcentagem de progresso
   */
  private calculateProgress(): void {
    if (this.tourState.totalSteps > 0) {
      this.progressPercentage = Math.round(((this.tourState.currentStep + 1) / this.tourState.totalSteps) * 100);
    }
  }

  /**
   * Avança para o próximo passo
   */
  nextStep(): void {
    this.tourService.nextStep();
  }

  /**
   * Volta para o passo anterior
   */
  previousStep(): void {
    this.tourService.previousStep();
  }

  /**
   * Completa o tour
   */
  completeTour(): void {
    this.tourService.completeTour();
  }

  /**
   * Pula o tour
   */
  skipTour(): void {
    this.tourService.skipTour();
  }

  /**
   * Manipula clique no overlay
   */
  onOverlayClick(event: Event): void {
    // Só fecha se clicar diretamente no overlay, não nos elementos filhos
    if (event.target === event.currentTarget) {
      this.skipTour();
    }
  }
} 