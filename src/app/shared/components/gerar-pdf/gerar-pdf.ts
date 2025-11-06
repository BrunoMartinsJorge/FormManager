import { Component, ElementRef, EventEmitter, Input, OnChanges, Output, SimpleChanges, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Button } from "primeng/button";
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Dialog } from "primeng/dialog";
import { Checkbox } from "primeng/checkbox";

@Component({
  selector: 'gerar-pdf',
  imports: [CommonModule, FormsModule, Button, Dialog, Checkbox],
  templateUrl: './gerar-pdf.html',
  styleUrl: './gerar-pdf.css',
})
export class GerarPdf implements OnChanges {
  @Input() public formularioSelecionado: any | null = null;
  @Input() public visibilidadeDeGerarPDF: boolean = false;
  @Output() public visibilidadeDeGerarPDFChange = new EventEmitter<boolean>();
  @ViewChild('pdfSection', { static: false }) conteudo!: ElementRef;

  constructor() {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['formularioSelecionado'] && this.formularioSelecionado) {
      this.organizarDados();
    }
  }

  public questoesFormatadas: any = [];

  /**
   * 
   * @description Organiza os dados das questoes
   */
  public organizarDados(): void {
    if (!this.formularioSelecionado.questoes) return;
    const questoes = this.formularioSelecionado.questoes;
    questoes.forEach((questao: any, indexQ: number) => {
      if (questao.opcoes) {
        let opcoes = questao.opcoes;
        questao.opcoes = [];
        opcoes.forEach((opcao: any, indexOp: number) => {
          const opcaoFormatada = {
            id: (indexQ + 1) + (indexOp + 1),
            valor: opcao
          }
          questao.opcoes.push(opcaoFormatada);
        })
      }
    });
    this.questoesFormatadas = questoes;
    console.log(questoes);
  }


  /**
   * 
   * @description Cria o PDF com base no elemento
   */
  public criarPDF(): void {
    html2canvas(this.conteudo.nativeElement).then(canvas => {
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF();
      pdf.addImage(imgData, 'PNG', 10, 10, 190, 0);
      pdf.save(this.formularioSelecionado?.titulo || 'formulario' + '.pdf');
    });
  }

  /**
   * 
   * @description Fecha o dialog
   */
  public fecharDialog(): void {
    this.visibilidadeDeGerarPDFChange.emit(false);
    this.visibilidadeDeGerarPDF = false;
    this.formularioSelecionado = null;
  }
}
