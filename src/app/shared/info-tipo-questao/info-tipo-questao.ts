import { Component, Input, OnInit } from '@angular/core';
import { TypeQuestEnum } from '../../pages/adicionar-formulario/enums/TypeQuestEnum';
import { DialogModule } from 'primeng/dialog';
import { ButtonModule } from 'primeng/button';
import { Tooltip } from 'primeng/tooltip';
import { Fieldset } from "primeng/fieldset";
import { InputText } from "primeng/inputtext";
import { Textarea } from "primeng/textarea";
import { RadioButton } from "primeng/radiobutton";
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Checkbox } from "primeng/checkbox";
import { InputMaskModule } from 'primeng/inputmask';

@Component({
  selector: 'info-tipo-questao',
  imports: [DialogModule, ButtonModule, Tooltip, Fieldset, InputText, Textarea, RadioButton, CommonModule, FormsModule, Checkbox, InputMaskModule],
  templateUrl: './info-tipo-questao.html',
  styleUrl: './info-tipo-questao.css',
})
export class InfoTipoQuestao {
  @Input() public tipoQuestao: TypeQuestEnum | undefined = TypeQuestEnum.TEXTO;
  public visibilidadeDeInfo: boolean = false;
  resposta: any;
  public questoesSelecao: any[] = [
    {
      escala: 1,
      label: 'Opção 1',
      value: 1
    },
    {
      escala: 2,
      label: 'Opção 2',
      value: 2
    },
    {
      escala: 3,
      label: 'Opção 3',
      value: 3
    }
  ]
}
