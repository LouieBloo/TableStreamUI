import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import {GameComponent} from './components/pages/game/game.component';
import { IndexComponent } from './components/pages/index/index.component';
import { AiTestComponent } from './components/pages/ai-test/ai-test.component';
import { DevClassifyComponent } from './components/pages/dev-classify/dev-classify.component';
import { DevClassifyTrainSliceComponent } from './components/pages/dev-classify-train-slice/dev-classify-train-slice.component';
import { SpeechToTextComponent } from './components/speech-to-text/speech-to-text.component';

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
        path: 'stt', component: SpeechToTextComponent
    }
];
