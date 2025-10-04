import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ConfirmDeleteData {
  templateName: string;
  templateId: number;
}

@Component({
  selector: 'app-confirm-delete-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  template: `
    <div class="p-6">
      <div class="flex items-center mb-4">
 
        <div>
          <h2 class="text-xl font-semibold text-gray-800 m-0">Confirmar Exclusão</h2>
          <p class="text-gray-600 m-0">Esta ação não pode ser desfeita</p>
        </div>
      </div>
      
      <p class="text-gray-700 mb-6">
        Tem certeza que deseja deletar o template <strong>"{{ data.templateName }}"</strong>?
      </p>
      
      <div class="flex justify-end space-x-3">
        <button 
          class="px-6 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all duration-200 border border-gray-200 hover:border-gray-300"
          (click)="onCancel()">
          Cancelar
        </button>
        <button 
          class="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all duration-200 border border-red-600 hover:border-red-700"
          (click)="onConfirm()">
          Deletar
        </button>
      </div>
    </div>
  `,
  styles: [`
    :host {
      display: block;
      min-width: 400px;
    }
  `]
})
export class ConfirmDeleteDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ConfirmDeleteDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDeleteData
  ) { }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onConfirm(): void {
    this.dialogRef.close(true);
  }
}

