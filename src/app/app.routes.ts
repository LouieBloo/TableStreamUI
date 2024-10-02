import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import {GameComponent} from './components/pages/game/game.component';
import { IndexComponent } from './components/pages/index/index.component';

export const routes: Routes = [
    {
        path: '', component: IndexComponent
    },
    {
        path: 'join', component: HomeComponent
    },
    {
        path: 'game', component: GameComponent
    }
];
