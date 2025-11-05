import { Pipe, PipeTransform } from '@angular/core';
import { getTypeQuestLabel, TypeQuestEnum } from '../../pages/adicionar-formulario/enums/TypeQuestEnum';

@Pipe({
  name: 'typeQuestEnumTransform',
})
export class TypeQuestEnumTransformPipe implements PipeTransform {
  transform(typeEnum: string): string {
    const nome = getTypeQuestLabel(typeEnum as TypeQuestEnum);
    return nome;
  }
}
