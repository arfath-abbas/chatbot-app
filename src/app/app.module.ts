import { NgModule } from '@angular/core';
import { BrowserModule, provideClientHydration } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { FormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeScreenModule } from './home-screen/home-screen.module';
import { provideHttpClient } from '@angular/common/http';
import { RouterModule } from '@angular/router';

const modules = [
  BrowserModule,
  BrowserAnimationsModule,
  AppRoutingModule,
  RouterModule,
  FormsModule,
  HomeScreenModule,
];

@NgModule({
  declarations: [
    AppComponent,
  ],
  imports: modules,
  providers: [
    provideHttpClient(),
    provideClientHydration()
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
