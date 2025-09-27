import { Routes } from '@angular/router';
import { ListarFormularios } from './pages/listar-formularios/listar-formularios';
import { authGuardGuard } from './core/guards/auth-guard-guard';
import { Autenticacao } from './pages/autenticacao/autenticacao';
import { AdicionarFormulario } from './pages/adicionar-formulario/adicionar-formulario';
import { VisualisarFormulario } from './pages/visualisar-formulario/visualisar-formulario';
import { AdicionarQuiz } from './pages/adicionar-quiz/adicionar-quiz';
import { ListarQuiz } from './pages/listar-quiz/listar-quiz';
import { GerarPdf } from './pages/gerar-pdf/gerar-pdf';
import { QuestoesSalvasFormulario } from './pages/questoes-salvas-formulario/questoes-salvas-formulario';
import { QuestoesSalvasQuiz } from './pages/questoes-salvas-quiz/questoes-salvas-quiz';

export const routes: Routes = [
    {
        path: '',
        component: Autenticacao,
        title: 'Autenticação',
    },
    {
        path: 'listar-formularios',
        component: ListarFormularios,
        title: 'Listar Formulários',
        canActivate: [authGuardGuard],
    },
    {
        path: 'adicionar-formulario',
        component: AdicionarFormulario,
        title: 'Adicionar Formulário',
        canActivate: [authGuardGuard],
    },
    {
        path: 'listar-quiz',
        component: ListarQuiz,
        title: 'Listar Formulários',
        canActivate: [authGuardGuard],
    },
    {
        path: 'adicionar-quiz',
        component: AdicionarQuiz,
        title: 'Adicionar Formulário',
        canActivate: [authGuardGuard],
    },
    {
        path: 'ver-formulario/:id',
        component: VisualisarFormulario,
        title: 'Visualizar Formulário',
        canActivate: [authGuardGuard],
    },
    {
        path: 'gerar-formulario',
        component: GerarPdf,
        title: 'Visualizar Formulário',
        canActivate: [authGuardGuard],
    },
    {
        path: 'questoes-salvas-formularios',
        component: QuestoesSalvasFormulario,
        title: 'Questões Salvas - Formulários',
        canActivate: [authGuardGuard],
    },
    {
        path: 'questoes-salvas-quiz',
        component: QuestoesSalvasQuiz,
        title: 'Questões Salvas - Quiz',
        canActivate: [authGuardGuard],
    }
];
