import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import {GameComponent} from './components/pages/game/game.component';
import { IndexComponent } from './components/pages/index/index.component';
import { AiTestComponent } from './components/pages/ai-test/ai-test.component';
import { DevClassifyComponent } from './components/pages/dev-classify/dev-classify.component';
import { DevClassifyTrainSliceComponent } from './components/pages/dev-classify-train-slice/dev-classify-train-slice.component';
import { SpeechToTextComponent } from './components/speech-to-text/speech-to-text.component';
import { DashboardComponent } from './components/pages/dashboard/dashboard.component';
import { dashboardGuard } from './guard/dashboard.guard';
import { CheckPasswordComponent } from './components/pages/check-password/check-password.component';
import { CardTestComponent } from './components/pages/card-test/card-test.component';
import { VerifyEmailComponent } from './components/pages/verify-email/verify-email.component';
import { ResetPasswordComponent } from './components/pages/reset-password/reset-password.component';
import { UserEditComponent } from './components/pages/user-edit/user-edit.component';

export const routes: Routes = [
    {
        path: '', component: IndexComponent
    },
    {
        path: 'join', component: HomeComponent
    },
    {
        path: 'game', component: GameComponent
    },
    {
        path: 'classify', component: AiTestComponent
    },
    {
        path: 'dev-classify', component: DevClassifyComponent
    },
    {
        path: 'dev-classify-train', component: DevClassifyTrainSliceComponent
    },
    {
        path: 'stt', component: SpeechToTextComponent,
    },
    {
        path: 'dev-dashboard', component: DashboardComponent,
        canActivate: [dashboardGuard]
    },
    {
        path: 'check-password', component: CheckPasswordComponent
    },
    {
        path: 'card-test', component: CardTestComponent
    },
    {
        path: 'verify-email', component: VerifyEmailComponent
    },
    {
        path: 'reset-password', component: ResetPasswordComponent
    },
    {
        path: 'user', component: UserEditComponent
    }
];
