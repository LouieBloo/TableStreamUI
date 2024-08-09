import { Routes } from '@angular/router';
import { HomeComponent } from './components/pages/home/home.component';
import {GameComponent} from './components/game/game.component';

export const routes: Routes = [
    {
        path: '', component: HomeComponent
    },
    {
        path: 'game', component: GameComponent
    }
];
