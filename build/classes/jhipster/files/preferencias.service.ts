import { Injectable } from '@angular/core';
import {ColaboradorService} from "./colaborador/colaborador.service";
import {Colaborador} from "./colaborador/colaborador.model";
import { JhiEventManager } from 'ng-jhipster';
import {Observable} from "rxjs/Observable";
import {isNullOrUndefined} from "util";

@Injectable()
export class PreferenciasService {


    colaborador :Colaborador;
    preferencias :any[] = [];


    constructor(private colaboradorService: ColaboradorService,
                private eventManager: JhiEventManager) {
        this.importarPreferencias(true);
        this.registerEvents();
    }

    registerEvents() {
        this.eventManager.subscribe('colaborador', (message) => {
            this.importarPreferencias(true);
        });
        this.eventManager.subscribe('logout', (message) => {
            this.preferencias = [];
        });
        this.eventManager.subscribe('authenticationSuccess', (message) => {
            this.importarPreferencias(true);
        });
    }

    public importarPreferencias(force :boolean) :Observable<any[]>{

        if (!force && (this.preferencias.length > 0)) {
            return Observable.from(this.preferencias);
        }

        return  this.colaboradorService.getCurrentColaborador()
            .map((colaborador :Colaborador) => {
                this.colaborador = colaborador;
                return this.preferencias = this.parsePreferencias(colaborador.preferencia);
            });
    }

    private parsePreferencias(preferencia: string): any[] {
        const ps :any[] = [];
        if (preferencia != null && preferencia.length > 0) {
            preferencia.split(',').forEach((pref: string) => {
                if (pref != null && pref.length > 0) {
                    const prefs = pref.split(':');

                    if (pref.startsWith('hp:')){
                        try {
                            ps['hp'] = pref.split(':')[1].split(';');
                        } catch (ex) {
                            console.log('falhou ao importar HP ' + ex);
                        }
                    } else  if (pref.startsWith('colunas:')) {
                        const colunas: boolean[][] = [];
                        try {
                            prefs[1].split(';')
                                .forEach((ent: string) => {
                                    if (ent != null && ent.length > 0) {
                                        const data: string[] = ent.split('-');
                                        const nome = data[0];
                                        const bools: boolean[] = [];

                                        colunas[nome] = bools;
                                        data[1].split(".")
                                            .forEach((col: string) => {
                                                const col2 = col.substring(0, col.length - 1);
                                                colunas[nome][col2] = col.endsWith('T');
                                            });
                                    }
                                });
                            ps['colunas'] = colunas;

                        } catch (e) {
                            console.log('Falha ao importar preferencias: ' + e);
                            console.log(e);
                        }

                    } else {
                        ps[prefs[0]] = prefs[1];
                    }
                }
            });
        }
        return ps;
    }

    public isColunaAtivada(entidade: string, coluna :string, index: number) :Observable<{entidade:string,index:number,coluna:string,visivel:boolean}> {
        return  this.importarPreferencias(false)
            .map(pref => {
                return {
                    entidade: entidade,
                    index: index,
                    coluna: coluna,
                    visivel: (
                        isNullOrUndefined(pref['colunas']) ||
                        isNullOrUndefined(pref['colunas'][entidade]) ||
                        isNullOrUndefined(pref['colunas'][entidade][index]) ||
                        pref['colunas'][entidade][index]) ? true : false
                };
            });
    }

    public isProdutoVisivel(id :number) :Observable<{visivel: boolean, id: number}> {
        return  this.importarPreferencias(false)
            .map((pref) => {

                console.log(pref);

                return {
                    visivel:
                        (   isNullOrUndefined(pref['hp']) ||
                            (pref['hp'].indexOf(id + 'F') < 0) ||
                            (pref['hp'].indexOf(id + 'T') >= 0)),
                    id: id
                }
            });
    }

    public storeColunaPref(entidade: string, index: number, ativo: boolean) {
        this.importarPreferencias(false).subscribe(
            (pref) => {
                if (isNullOrUndefined(pref['colunas'])) {
                    pref["colunas"] = [];
                }
                if(isNullOrUndefined(pref['colunas'][entidade])) {
                    pref['colunas'][entidade] = [];
                }
                pref['colunas'][entidade][index] = ativo;
                this.storePref(pref);
            }
        );
    }

    public storeProdPref(id :number, visivel :boolean) {
        this.importarPreferencias(false).subscribe(
            (pref) => {

                if (isNullOrUndefined(pref['hp'])) {
                    pref['hp'] = [];
                }
                else {
                    pref['hp'] = pref['hp'].join(';').split((id + (visivel ? 'F' : 'T'))).join('').split(';');
                }
                // if (pref['hp'].indexOf(id + (visivel ? 'F' : 'T') ) >=0 ){
                //     pref['hp'] = pref['hp'].join(';').replaceAll(id + (visivel ? 'F' : 'T'), '').split(';');
                // }

                pref['hp'].push((id + (visivel ? 'T' : 'F')));

                this.storePref(pref);
            }
        );
    }

    public getPref(cod :string) :Observable<string>{
        return  this.importarPreferencias(false)
            .map(pref => pref[cod] );
    }

    public setPreferencia(cod :string, value :string) {
        this.importarPreferencias(false).subscribe(
            (pref) => {
                pref[cod] = value;
                this.storePref(pref);
            });
    }

    private storePref(preferencias :any) {
        this.preferencias = preferencias;
        this.colaborador.preferencia = this.objToPersist(preferencias);
        this.colaboradorService.update(this.colaborador, true)
            .subscribe( (col) => {
                this.colaborador = col;
            });
    }


    private objToPersist(pref: any[]) :string{
        let str = [];
        Object.keys(pref).forEach( (k) => {
            switch (k) {
                case 'colunas':
                    const ents :boolean[][]=pref[k];
                    const t :string[] = [];
                    Object.keys(ents).forEach((e) => {

                        const en :boolean[] = ents[e];
                        const tmp :string[] = [];
                        en.forEach((v,i) =>{
                            tmp.push(i + '' + ( v ? 'T' : 'F'));
                        });
                        t.push(e + '-' + tmp.join('.'));
                    });
                    str.push(k + ':' + t.join(';'));
                    break;
                case 'hp':
                    str.push(k + ':' +pref[k].join(';'));
                    break;
                default:
                    str.push(k + ':' + pref[k]);
            }

        });

        return str.join(',');
    }


}
