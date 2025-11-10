import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { Subject } from 'rxjs';
import { filter, takeUntil } from 'rxjs/operators';

import { MsalBroadcastService, MsalService } from '@azure/msal-angular';
import { EventMessage, EventType, AuthenticationResult, InteractionStatus } from '@azure/msal-browser';

// Utility function to create claims table
function createClaimsTable(claims: any): any[] {
    const claimsArray: any[] = [];
    for (const key in claims) {
        if (claims.hasOwnProperty(key)) {
            claimsArray.push({
                claim: key,
                value: claims[key],
                description: key
            });
        }
    }
    return claimsArray;
}

@Component({
    selector: 'app-home',
    standalone: true,
    imports: [CommonModule, MatTableModule],
    templateUrl: './home.component.html',
    styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

    loginDisplay = false;
    displayedColumns: string[] = ['claim', 'value', 'description'];
    dataSource: any = [];
    private readonly _destroying$ = new Subject<void>();

    constructor(private authService: MsalService, private msalBroadcastService: MsalBroadcastService) { }

    ngOnInit(): void {
        this.setLoginDisplay();

        this.msalBroadcastService.msalSubject$
            .pipe(
                filter((msg: EventMessage) => msg.eventType === EventType.LOGIN_SUCCESS),
                takeUntil(this._destroying$)
            )
            .subscribe((result: EventMessage) => {
                console.log('LOGIN_SUCCESS event received:', result);
                const payload = result.payload as AuthenticationResult;
                this.authService.instance.setActiveAccount(payload.account);
                this.setLoginDisplay();
                this.getClaims(payload.account?.idTokenClaims);
            });

        this.msalBroadcastService.inProgress$
            .pipe(
                filter((status: InteractionStatus) => status === InteractionStatus.None),
                takeUntil(this._destroying$)
            )
            .subscribe(() => {
                console.log('Interaction completed, updating display');
                this.setLoginDisplay();
                this.getClaims(this.authService.instance.getActiveAccount()?.idTokenClaims);
            });
    }

    ngOnDestroy(): void {
        this._destroying$.next(undefined);
        this._destroying$.complete();
    }

    setLoginDisplay() {
        this.loginDisplay = this.authService.instance.getAllAccounts().length > 0;
    }

    getClaims(claims: any) {
        if (claims) {
            const claimsTable = createClaimsTable(claims);
            this.dataSource = [...claimsTable];
        }
    }
}
