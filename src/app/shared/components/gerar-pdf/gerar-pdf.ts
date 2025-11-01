import { Component, ElementRef, EventEmitter, Input, Output, ViewChild } from '@angular/core';
import { FormularioPdfModel } from './models/FormularioPdf.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Dialog } from "primeng/dialog";

@Component({
  selector: 'app-gerar-pdf',
  imports: [CommonModule, FormsModule, Button, Dialog],
  templateUrl: './gerar-pdf.html',
  styleUrl: './gerar-pdf.css',
})
export class GerarPdf {
  @Input() public formSelected: FormularioPdfModel | null = null;
  @Input() public visibilidadeDeGerarPDF: boolean = false;
  @Output() public visibilidadeDeGerarPDFChange = new EventEmitter<boolean>();
  @ViewChild('pdfSection', { static: false }) conteudo!: ElementRef;

  constructor() {}

  public createPdf(): void {
    html2canvas(this.conteudo.nativeElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save(this.formSelected?.titulo || 'formulario' + '.pdf');
    });
  }

  public closeDialog(): void {
    this.visibilidadeDeGerarPDFChange.emit(false);
    this.visibilidadeDeGerarPDF = false;
    this.formSelected = null;
  }
}
