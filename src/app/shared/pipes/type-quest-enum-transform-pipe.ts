import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'typeQuestEnumTransform'
})
export class TypeQuestEnumTransformPipe implements PipeTransform {

  transform(typeEnum: string): string {
    switch(typeEnum) {
      case 'TEXTO': return 'Texto';
      case 'PARAGRAFO': return 'Parágrafo';
      case 'NUMERO': return 'Número';
      case 'UNICA': return 'Única Escolha';
      case 'MULTIPLA': return 'Múltipla Escolha';
      case 'DATA': return 'Data';
      case 'ESCALA': return 'Escala';
      case 'VERDADEIRO_FALSO': return 'Verdadeiro / Falso';
      default: return '';
    }
  }

}
