import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Routes } from '@angular/router';
import { HomeScreenComponent } from './home-screen.component';
import { FormsModule } from '@angular/forms';
import { provideHttpClient } from '@angular/common/http';

const routes: Routes = [
  { path: '', component: HomeScreenComponent },
  { path: 'home', component: HomeScreenComponent },
];

@NgModule({
  declarations: [HomeScreenComponent],
  imports: [
    CommonModule, RouterModule.forChild(routes), FormsModule
  ],
  providers: [
    provideHttpClient(),
  ],
})
export class HomeScreenModule { }
