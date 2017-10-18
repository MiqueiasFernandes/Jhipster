import {Component, ElementRef, OnInit} from '@angular/core';
import {PreferenciasService} from "../../entities/preferencias.service";

@Component({
    selector: 'jhi-tableheader',
    templateUrl: './tableheader.component.html',
    styleUrls: ['./tableheader.component.scss']
})
export class TableheaderComponent implements OnInit {

    entidade :string;
    colunas1 :string[]  = [];
    colunas2 :string[]  = [];
    colunas3 :string[]  = [];
    colunas4 :string[]  = [];
    campos :ElementRef[][];
    colunas :string[];
    checks :boolean[] = [];


    constructor(private preferenciasService :PreferenciasService) { }

    ngOnInit() {

    }

    public createSwitches(entidade :string, colunas :string[], campos :ElementRef[][], quantidades? :number[]) {
        this.entidade = entidade;
        this.colunas = colunas;
        this.campos = campos;
        let max = Math.ceil(colunas.length / 4);
        let count = 0;
        let col = 0;

        colunas.forEach( (coluna, i) => {

           this.preferenciasService.isColunaAtivada(entidade, coluna, i)
                .subscribe( (data :{entidade:string,index:number,coluna:string,visivel:boolean}) => {
                    this.checks[data.coluna] = data.visivel;
                    this.updateColuna(data.coluna, data.visivel);
                });

            switch (col) {
                case 0:
                    this.colunas1.push(coluna);
                    break;
                case 1:
                    this.colunas2.push(coluna);
                    break;
                case 2:
                    this.colunas3.push(coluna);
                    break;
                case 3:
                    this.colunas4.push(coluna);
                    break;
            }

            count++;

            if (quantidades){
                if (count >= quantidades[col]) {
                    count = 0;
                    col++;
                }
            } else {
                if (count >= max) {
                    count = 0;
                    col++;
                }
            }

        });
    }

    alterar(chk : boolean, coluna :string) {
        this.updateColuna(coluna, chk);
        this.preferenciasService.storeColunaPref(this.entidade, this.colunas.indexOf(coluna), chk);
    }

    updateColuna(coluna :string, visivel :boolean) {
        this.campos[coluna]
            .forEach( el =>
                el.nativeElement.style.display = visivel ? 'table-cell' : 'none');
    }

}
