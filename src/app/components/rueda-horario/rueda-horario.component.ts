import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-rueda-horario',
  templateUrl: './rueda-horario.component.html',
  styleUrls: ['./rueda-horario.component.scss']
})
export class RuedaHorarioComponent implements OnInit {
  // Valores de entrada
  @Input() rueda:any;
  @Input() mostrarPasajeros:boolean;
  @Input() user:string=null;
  @Input() readonly=true;
  // Funciones de salida
  @Output() onclickCell= new EventEmitter<Object>();

  constructor() {
  }

  ngOnInit(): void {

    document.getElementById('horario').appendChild(this.rueda.getHtml({
      user:this.user,
      pasajeros:this.mostrarPasajeros,
      onclick:this.clickCell
    }))
  }
  clickCell = (event,item) => {
    console.log(this.readonly);

    if(this.readonly === false){
      this.selectCell(item);
    }
    this.onclickCell.emit(item);
  }
  selectCell = item => {
    var horario = document.getElementById('horario');
    const hora = item.dataset.hora;
    const dia = item.dataset.dia;
    const tipo = item.dataset.tipo;
    var items = horario.querySelectorAll(`[data-dia='${dia}'][data-tipo='${tipo}']`);
    items.forEach(e => {
      if(e instanceof HTMLElement){
        if(e.dataset.hora===hora){
          e.classList.add('bg-info');
        } else {
          e.classList.remove('bg-info');
        }
      }
    });

  }
}
