import {NgModule} from '@angular/core';
import {Routes, RouterModule} from '@angular/router';
import {HomeComponent} from './home/home.component';
import {LoginComponent} from './login/login.component';
import {AboutComponent} from './about/about.component';

export const mainRoutes: Routes = [
  {
    path: 'home',
    component: HomeComponent
  },
  {
    path: 'about',
    component: AboutComponent
  },
  {
    path: 'login',
    component: LoginComponent
  }
];

const allRoutes: Routes = mainRoutes;
allRoutes.push({
    path: '',
    redirectTo: '/home',
    pathMatch: 'full'
});

@NgModule({
  imports: [RouterModule.forRoot(allRoutes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}
