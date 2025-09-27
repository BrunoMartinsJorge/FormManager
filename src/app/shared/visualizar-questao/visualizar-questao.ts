import { Component, Input } from '@angular/core';
import { NewQuest } from '../../pages/adicionar-formulario/forms/NewQuest';
import { CommonModule } from '@angular/common';
import { InputTextModule } from 'primeng/inputtext';
import { FormsModule } from '@angular/forms';
import { Button } from 'primeng/button';
import { InputNumber } from 'primeng/inputnumber';
import { RadioButton } from 'primeng/radiobutton';
import { TextareaModule } from 'primeng/textarea';
import { CheckboxModule } from 'primeng/checkbox';
import { DatePickerModule } from 'primeng/datepicker';

@Component({
  selector: 'app-visualizar-questao',
  imports: [
    CommonModule,
    InputTextModule,
    FormsModule,
    Button,
    InputNumber,
    RadioButton,
    TextareaModule,
    CheckboxModule,
    DatePickerModule,
  ],
  templateUrl: './visualizar-questao.html',
  styleUrl: './visualizar-questao.css',
})
export class VisualizarQuestao {
  @Input() questao: NewQuest | undefined;
  @Input() buttonSendIsVisible: boolean = true;
  disabled: boolean = false;
  resposta: any = '';
  mensagemResposta: string = '';

  public simularResposta(): void {
    this.disabled = false;
    this.mensagemResposta = 'Resposta enviada com sucesso!';
  }

  public get getMin(): number {
    return this.questao!.min || 0;
  }

  public get getMax(): number {
    return this.questao!.max || this.getMin + 1;
  }

  public getArray(n: number): number[] {
    return Array.from({ length: n }, (_, i) => i);
  }
}
