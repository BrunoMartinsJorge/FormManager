export enum TypeQuestEnum {
  TEXTO = 'TEXTO',
  PARAGRAFO = 'PARAGRAFO',
  NUMERO = 'NUMERO',
  UNICA = 'UNICA',
  MULTIPLA = 'MULTIPLA',
  DATA = 'DATA',
  ESCALA = 'ESCALA',
  VERDADEIRO_FALSO = 'VERDADEIRO_FALSO',
  IMAGEM = 'IMAGEM',
  TEMPO = 'TEMPO',
  PONTUACAO = 'PONTUACAO',
}

export function getTypeQuestLabel(type: TypeQuestEnum): string {
  switch (type) {
    case TypeQuestEnum.TEXTO:
      return 'Texto curto';
    case TypeQuestEnum.UNICA:
      return 'Única escolha';
    case TypeQuestEnum.MULTIPLA:
      return 'Múltipla escolha';
    case TypeQuestEnum.DATA:
      return 'Data';
    case TypeQuestEnum.ESCALA:
      return 'Escala';
    case TypeQuestEnum.VERDADEIRO_FALSO:
      return 'Verdadeiro / Falso';
    case TypeQuestEnum.PARAGRAFO:
      return 'Parágrafo';
    case TypeQuestEnum.NUMERO:
      return 'Número';
    case TypeQuestEnum.IMAGEM:
      return 'Imagem';
    case TypeQuestEnum.TEMPO:
      return 'Tempo';
    case TypeQuestEnum.PONTUACAO:
      return 'Pontuação';
    default:
      return 'Desconhecido';
  }
}
