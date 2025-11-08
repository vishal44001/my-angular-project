import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-delete-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <div class="dialog-root">
      <div class="dialog-body">
        <div class="icon-wrap">
          <mat-icon class="warn-icon">warning</mat-icon>
        </div>
        <div class="content">
          <h2 class="title">Delete Employee?</h2>
          <p class="message">Are you sure you want to delete <strong>{{ data.name }}</strong>?<br>
            This action cannot be undone and will permanently remove their data from the system.</p>
        </div>
      </div>
      <div class="dialog-actions">
        <button mat-stroked-button (click)="onCancel()">Cancel</button>
        <button mat-raised-button color="warn" (click)="onDelete()">Delete</button>
      </div>
    </div>
  `,
  styles: [
    `
    .dialog-root{padding:18px 20px;min-width:320px}
    .dialog-body{display:flex;gap:16px;align-items:flex-start}
    .icon-wrap{background:#fff5f5;border-radius:50%;width:56px;height:56px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.06)}
    .warn-icon{color:#d32f2f;font-size:28px}
    .title{margin:0 0 6px 0;font-size:20px}
    .message{margin:0;color:rgba(0,0,0,0.7);line-height:1.4}
    .dialog-actions{display:flex;justify-content:flex-end;gap:12px;margin-top:18px}
    `
  ]
})
export class DeleteConfirmDialogComponent {
  constructor(
    private dialogRef: MatDialogRef<DeleteConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { name?: string }
  ) {}

  onCancel(): void {
    this.dialogRef.close(false);
  }

  onDelete(): void {
    this.dialogRef.close(true);
  }
}
