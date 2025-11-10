import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterOutlet } from '@angular/router';
import { MsalModule } from '@azure/msal-angular';
import { HeaderComponent } from './shared/header/header';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [CommonModule, RouterOutlet, HeaderComponent, MsalModule],
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
    isIframe = false;

    ngOnInit(): void {
        this.isIframe = window !== window.parent && !window.opener;
    }
}
