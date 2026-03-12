import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { loginGuard } from './auth/login.guard';
import { roleRedirectGuard } from './guards/role-redirect.guard';
import { creatorGuard } from './auth/creator.guard';
import { TestCreateComponent } from './interview/test-create/test-create.component';
import { HomeComponent } from './home/home.component';
import { ResumeDashboardComponent } from './resume-dashboard/resume-analyzer/resume-dashboard.component';
import { ResumeResultComponent } from './resume-dashboard/resume-result/resume-result.component';

export const routes: Routes = [


  { path: '', pathMatch: 'full', redirectTo: 'home' },

  /* AUTH */
  {
    path: 'login',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./login/login.component')
        .then(m => m.LoginComponent)
  },
  {
    path: 'register',
    canActivate: [loginGuard],
    loadComponent: () =>
      import('./register/register.component')
        .then(m => m.RegisterComponent)
  },

  /* HOME (PUBLIC) */
  {
    path: 'home',
    loadComponent: () =>
      import('./home/home.component')
        .then(m => m.HomeComponent)
  },
  {
    path: 'about',
    loadComponent: () =>
      import('./about/about.component')
        .then(m => m.AboutComponent)
  },
  {
    path: 'contact',
    loadComponent: () =>
      import('./contact/contact.component')
        .then(m => m.ContactComponent)
  },

  /* DASHBOARDS */
  {
    path: 'dashboard/user',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/user-dashboard/user-dashboard')
        .then(m => m.UserDashboardComponent)
  },
  {
    path: 'dashboard/creator',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./dashboard/creator-dashboard/creator-dashboard')
        .then(m => m.CreatorDashboardComponent)
  },

  /* ================= TEST LIST (BY TYPE) ================= */
  {
    path: 'home/:type/tests',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./interview/mcq/components/test-list/test-list.component')
        .then(m => m.TestListComponent)
  },

/* ================= TEST START ================= */
// MCQ tests (aptitude + technical)
// Coding tests
{
  path: 'home/coding/tests/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./interview/coding/components/coding-workspace/coding-workspace')
      .then(m => m.CodingWorkspaceComponent)
},
// Communication
{
  path: 'home/communication/tests/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./interview/communication/components/communication-test/CommunicationTestComponent')
      .then(m => m.CommunicationTestComponent)
}
,
{
  path: 'home/:type/tests/:id',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./interview/mcq/components/test-start/test-start.component')
      .then(m => m.TestStartComponent)
},



  /* ================= TEST RESULT ================= */
  {
    path: 'result',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./interview/mcq/components/test-result/test-result.component')
        .then(m => m.TestResultComponent)
  },


/* ================= TEST CREATION (common)================= */
  {
    path: 'creator/tests/create',
    component: TestCreateComponent
  },

  /* ================= MCQ ROUTES ================= */

  //add question to test
  {
    path: 'creator/tests/:testId',
    canActivate: [authGuard], // CREATOR
    loadComponent: () =>
      import('./interview/mcq/components/question-add/question-add.component')
        .then(m => m.QuestionAddComponent)
  },

  //view test questions
  {
    path: 'creator/view/tests/:testId',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./interview/mcq/components/test-question-review/test-question-review')
        .then(m => m.TestQuestionReviewComponent)
  },

  //edit test if private
  {
    path: 'creator/tests/:id/edit',
    loadComponent: () =>
      import('./interview/mcq/components/edit-test/edit-test')
        .then(m => m.EditTestComponent)
  },

  /* ================= Coding test creation ================= */
{
  path: 'creator/coding/test/:testId',
  loadComponent: () =>
    import('./interview/coding/components/add-test/add-test.components')
      .then(m => m.AddTestComponent)
},

{
  path: 'creator/coding/question/:questionId/test-cases',
  loadComponent: () =>
    import('./interview/coding/components/add-test/add-test.components')
      .then(m => m.AddTestComponent)
},

{
  path: 'creator/coding/:id/view',
  loadComponent: () =>
    import('./interview/coding/components/view-test/view-coding-test.component')
      .then(m => m.ViewCodingTestComponent)
},

/* ================= Communication test creation ================= */
{
  path: 'creator/communication/test/:testId',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./interview/communication/components/question-add/communication-question-add')
      .then(m => m.CommunicationQuestionAddComponent)
},
{
  path: 'creator/communication/:testId/view',
  canActivate: [authGuard],
  loadComponent: () =>
    import('./interview/communication/components/edit-test/communication-edit-test')
      .then(m => m.CommunicationEditTestComponent)
},

{
  path: 'coding/test/:testId',
  loadComponent: () =>
    import('./interview/coding/components/coding-workspace/coding-workspace')
      .then(m => m.CodingWorkspaceComponent)
},

  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./pages/unauthorized/unauthorized')
        .then(m => m.Unauthorized)
  },

  {
    path: 'tests',
    loadComponent: () =>
      import('./test-dashboard/test-dashboard')
        .then(m => m.TestComponent)
  },
  { path: 'resume', component: ResumeDashboardComponent },
  { path: 'resume/result/:id', component: ResumeResultComponent },

  /* ================= FALLBACK (MUST BE LAST) ================= */
  {
    path: '**',
    redirectTo: 'home'
  }
];
