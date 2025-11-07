import { NewForm } from '../pages/adicionar-formulario/forms/NewForm';
import { NewQuest } from '../pages/adicionar-formulario/forms/NewQuest';

export function ValidarFormulario(formulario: NewForm): boolean {
  if (!formulario) return false;

  let valido = true;

  if (!formulario.titulo || formulario.titulo.trim() === '') valido = false;
  if (!formulario.descricao || formulario.descricao.trim() === '') valido = false;
  if (!formulario.questoes || formulario.questoes.length === 0) valido = false;

  for (let pergunta of formulario.questoes) {
    let perguntaValida = false;

    switch (pergunta.tipo) {
      case 'TEXTO':
      case 'PARAGRAFO':
      case 'DATA':
      case 'TEMPO':
        perguntaValida = validarBasicoPergunta(pergunta);
        break;

      case 'UNICA':
      case 'MULTIPLA':
        perguntaValida =
          !!pergunta.opcoes &&
          pergunta.opcoes.length > 0 &&
          pergunta.opcoes.every(checarAlternativa) &&
          validarBasicoPergunta(pergunta);
        break;

      case 'ESCALA':
        const escalasValidas =
          pergunta.low != null &&
          pergunta.high != null &&
          pergunta.low < pergunta.high &&
          pergunta.low >= 0 &&
          pergunta.high <= 10 &&
          pergunta.low <= 10;

        perguntaValida = escalasValidas && validarBasicoPergunta(pergunta);
        break;

      case 'IMAGEM':
        perguntaValida =
          !!pergunta.imagemUrl &&
          pergunta.imagemUrl.trim() !== '' &&
          !!pergunta.descricaoImagem &&
          pergunta.descricaoImagem.trim() !== '';
        break;

      case 'PONTUACAO':
        perguntaValida =
          !!pergunta.nivelPontuacao &&
          pergunta.nivelPontuacao > 0 &&
          pergunta.nivelPontuacao <= 10 &&
          validarBasicoPergunta(pergunta);
        break;

      default:
        perguntaValida = false;
    }

    valido = valido && perguntaValida;
  }

  return valido;
}

function validarBasicoPergunta(pergunta: NewQuest): boolean {
  return !!(pergunta.titulo && pergunta.titulo.trim() !== '');
}

function checarAlternativa(alternativa: string) {
  return !!(alternativa && alternativa.trim() !== '');
}
