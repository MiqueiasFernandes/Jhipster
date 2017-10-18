import {
    Directive,
    ElementRef,
    ComponentFactoryResolver,
    ViewContainerRef,
    AfterViewInit,
    Input, ViewChild
} from '@angular/core';

import {TableheaderComponent} from "../../layouts/tableheader/tableheader.component";
import {isNullOrUndefined} from "util";

@Directive({
    selector: '[jhiTableheader]'
})
export class TableheaderDirective implements AfterViewInit{

    factory = this.componentFactoryResolver.resolveComponentFactory(TableheaderComponent);

    colunas :string[] = [];
    checksHeader :boolean[] = [];
    switches :string[] = [];
    colunasRef :ElementRef[][] = [];
    tableHeaderInstance :TableheaderComponent;

    @Input() entidade: string = 'undefined';

    @Input()
    set jhiTableheader(opt :{view :ViewContainerRef, entidade: string}) {
        if (isNullOrUndefined(opt.view))
            return;
        opt.view.clear();
        const ref = opt.view.createComponent(this.factory);
        this.tableHeaderInstance = ref.instance;
        ref.changeDetectorRef.detectChanges();
        this.entidade = opt.entidade;
    }


    ngAfterViewInit(): void {
        const thread :Element[]  = this._elementRef.nativeElement
            .getElementsByTagName("THEAD");
        if (thread && thread.length > 0) {
            const tr :NodeListOf<Element>  = thread[0].getElementsByTagName("TR");
            if (tr && tr.length > 0) {
                const th :NodeListOf<Element>  = tr[0].getElementsByTagName('TH');

                if (th && th.length > 0) {

                    for (let i=0; i < th.length; i++) {
                        const el = th[i].getElementsByTagName("SPAN");

                        if (el[1]) {
                            const elref = new ElementRef(el[1]);
                            const coluna :string =  elref.nativeElement.innerText

                            this.colunas.push(coluna);
                            this.checksHeader[coluna] = true;
                            this.colunasRef[coluna] = [new ElementRef(th[i])];
                            this.switches.push(
                                coluna +
                                ': <label class="switch">\n' +
                                '      <input type="checkbox" id="jhiTableheader-' + this.switches.length + '">\n' +
                                '           <span class="slider round"></span>\n' +
                                '  </label>');
                        }
                    }

                    this.importCampos();

                    if (! isNullOrUndefined(this.tableHeaderInstance)) {
                        this.tableHeaderInstance.createSwitches(this.entidade, this.colunas, this.colunasRef);
                    }

                }
            }
        }
    }


    private importCampos() {
        const trs :NodeListOf<Element>  =
            this._elementRef
            .nativeElement.getElementsByTagName("TR");

        for(let i =0; i<trs.length; i++) {

            if(trs[i]) {
                const tds :NodeListOf<Element>  = trs[i].getElementsByTagName('TD');
                if (tds && tds.length > 0) {
                    this.colunas.forEach((v, i) => {
                        this.colunasRef[v].push(new ElementRef(tds[i]));
                    });
                }
            }
        }
    }

    constructor(
        private _elementRef: ElementRef,
        private componentFactoryResolver: ComponentFactoryResolver
    ) {}


}
