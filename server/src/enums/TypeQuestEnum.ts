export enum TypeQuestEnum {
  TEXTO = 'TEXTO',
  PARAGRAFO = 'PARAGRAFO',
  UNICA = 'UNICA',
  MULTIPLA = 'MULTIPLA',
  DATA = 'DATA',
  ESCALA = 'ESCALA',
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
    case TypeQuestEnum.PARAGRAFO:
      return 'Parágrafo';
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

export const tiposParaGraficos = [
  TypeQuestEnum.UNICA,
  TypeQuestEnum.MULTIPLA,
  TypeQuestEnum.ESCALA,
  TypeQuestEnum.PONTUACAO,
]