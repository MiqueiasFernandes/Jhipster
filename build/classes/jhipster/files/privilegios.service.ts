import { Injectable } from '@angular/core';
import {ColaboradorService} from "./colaborador/colaborador.service";
import {Colaborador} from "./colaborador/colaborador.model";
import {Cargo} from "./cargo/cargo.model";
import { JhiEventManager } from 'ng-jhipster';
import {isNullOrUndefined} from "util";
import {Observable} from "rxjs/Observable";
import {Principal} from "../shared/auth/principal.service";

@Injectable()
export class PrivilegiosService {

    privilegios :string[][] = [];


    constructor(private colaboradorService :ColaboradorService,
                private eventManager: JhiEventManager,
                private principal :Principal) {
        this.reset();
        this.importPrivilegios(true).subscribe();
        this.registerEvents();
    }

    registerEvents() {
        this.eventManager.subscribe('cargo', (message) => {
            this.importPrivilegios(true).subscribe();
        });
        this.eventManager.subscribe('colaborador', (message) => {
            this.importPrivilegios(true).subscribe();
        });
        this.eventManager.subscribe('logout', (message) => {
            this.reset();
        });
        this.eventManager.subscribe('authenticationSuccess', (message) => {
            this.importPrivilegios(true).subscribe();
        });
        this.eventManager.subscribe('autologin', (message) => {
            if (message.content.startsWith('true')) {
                this.importPrivilegios(true).subscribe();
            }
        });
    }

    private importPrivilegios(force :boolean) :Observable<string[][]> {

        if (!this.principal.isAuthenticated() || !force) {
            return Observable.of(this.privilegios);
        }

        return this.colaboradorService.getCurrentColaborador().map(
            (colaborador :Colaborador) => {
                colaborador.cargos.forEach((cargo: Cargo) => {
                    this.parsePermissao(cargo.permissao);
                });
                return this.privilegios;
            });
    }

    private parsePermissao(permissao :string){
        if (!isNullOrUndefined(permissao) && permissao.length > 3) {
            permissao.split(',').forEach((p) => {
                const opts = p.split('_');
                this.storePermissao(opts[0], opts[1], false);
            })
        }
    }

    private storePermissao(entidade :string, privilegio :string, revogar :boolean) {
        if (this.principal.isAuthenticated() && !isNullOrUndefined(this.privilegios[entidade])){
            if (revogar) {
                this.privilegios[entidade] =
                    this.privilegios[entidade].filter(v => v.indexOf(privilegio) >= 0);
            } else if (this.privilegios[entidade].indexOf(privilegio) < 0){
                this.privilegios[entidade].push(privilegio);
            }
        }
    }

    public hasPermissao(entidade :string, privilegio :string, force :boolean) :Observable<{has :boolean, privs :string[][]}> {
        if (!this.principal.isAuthenticated()) {
            return Observable.of({has : false, privs :[]});
        }
        return this.importPrivilegios(force).map(
            (priv :string[][]) => {
                return {
                    has: (!isNullOrUndefined(priv[entidade]) && (priv[entidade].indexOf(privilegio) >= 0)),
                    privs: priv
                }
            });
    }

    private reset() {
        this.privilegios['produto'] = [];
        this.privilegios['endereco'] = [];
        this.privilegios['cliente'] = [];
        this.privilegios['mesa'] = [];
        this.privilegios['venda'] = [];
        this.privilegios['comanda'] = [];
        this.privilegios['colaborador'] = [];
        this.privilegios['cargo'] = [];
        this.privilegios['cardapio'] = [];
        this.privilegios['imposto'] = [];
        this.privilegios['lancamento'] = [];
        this.privilegios['nota'] = [];
        this.privilegios['restaurante'] = [];
    }

}
