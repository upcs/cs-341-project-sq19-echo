import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './components/home/home.component';
import {LoginComponent} from './components/login/login.component';
import {AboutComponent} from './components/about/about.component';
import {GameComponent} from "./components/game/game.component";

export const mainRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
    pathMatch: 'prefix'
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'game',
    component: GameComponent
  },
  {
    path: 'user',
    component: LoginComponent
  }
];

const allRoutes: Routes = mainRoutes;
allRoutes.push({
    path: '**',
    redirectTo: '/home',
    pathMatch: 'full'
});

@NgModule({
  imports: [RouterModule.forRoot(allRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
