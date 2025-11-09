import { Routes } from '@angular/router';
import { MsalGuard, MsalRedirectComponent } from '@azure/msal-angular';
import { HomeComponent } from './home/home.component';
import { ChatComponent } from './chat/chat.component';

export const routes: Routes = [
    {
        path: '',
        component: HomeComponent
    },
    {
        // Needed for handling redirect after login
        path: 'auth',
        component: MsalRedirectComponent
    },
    {
        path: 'chat',
        component: ChatComponent,
        canActivate: [MsalGuard]
    }
];
