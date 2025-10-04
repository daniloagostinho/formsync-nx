import { Routes } from '@angular/router';
import { TemplateManagerComponent } from '../../components/template-manager/template-manager.component';
import { DadosPreenchimentoComponent } from '../../components/dados-preenchimento/dados-preenchimento.component';
import { UploadCsvComponent } from '../../components/upload-csv/upload-csv.component';
import { FormularioCompletoComponent } from '../../components/formulario-completo/formulario-completo.component';

export const FORMS_ROUTES: Routes = [
  { path: '', component: TemplateManagerComponent },
  { path: 'dados-preenchimento', component: DadosPreenchimentoComponent },
  { path: 'upload-csv', component: UploadCsvComponent },
  { path: 'formulario-completo', component: FormularioCompletoComponent }
];
