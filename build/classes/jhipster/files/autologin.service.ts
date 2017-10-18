import { Injectable } from '@angular/core';

import { JhiEventManager } from 'ng-jhipster';
import {LoginService} from "./login.service";
import {Principal} from "../auth/principal.service";
import {Observable} from "rxjs/Observable";
import {isNullOrUndefined} from "util";
import {Subject} from 'rxjs';


@Injectable()
export class AutologinService {

    constructor(
        private eventManager: JhiEventManager,
        private loginService :LoginService,
        private princiapl :Principal) {
        this.eventManager.subscribe('logout', (message) => {
            this.broadcast(false);
        });
    }


    public autoLogin() {
        this.loginService.login({
            username: 'user',
            password: 'user',
            rememberMe: true
        }).then(() => {
            this.broadcast(true);
            console.log('auto login efetuado...');
        });
    }

    public verifyAccount(account :any) {
        if (this.accountIsAutologin(account)) {
            this.broadcast(true);
        }
    }

    public isAutoLogin() :Promise<boolean> {
        if (!isNullOrUndefined(this.princiapl.isAutoLogin())) {
            return Promise.resolve(this.princiapl.isAutoLogin());
        }
        return Observable.from(this.princiapl.identity(true)).map(() => {
            return this.princiapl.isAutoLogin();
        }).toPromise();
    }

    public accountIsAutologin(account: any): boolean{
        return !isNullOrUndefined(account) &&
            account.login &&
            (account.login.length === 4) &&
            account.login.startsWith('user');
    }

    private broadcast(modo) {
        this.eventManager.broadcast({
            name: 'autologin',
            content: modo ? 'true' : 'false'
        });
    }

}
