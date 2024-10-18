import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import {GameComponent} from './components/pages/game/game.component';
import { IndexComponent } from './components/pages/index/index.component';
import { AiTestComponent } from './components/pages/ai-test/ai-test.component';

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
    }
];
