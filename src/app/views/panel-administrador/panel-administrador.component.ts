import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import * as iconos from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { AdministradorService } from 'src/app/services/administrador.service';
import { from, Observable } from 'rxjs';
import * as $ from 'jquery';
import { UsersService } from 'src/app/services/users.service';


@Component({
  selector: 'app-panel-administrador',
  templateUrl: './panel-administrador.component.html',
  styleUrls: ['./panel-administrador.component.scss']
})
export class PanelAdministradorComponent implements OnInit {

  //Font awesome
  faPencil = iconos.faPencilAlt;
  faTrash = iconos.faTrash;
  faAddSquare = iconos.faPlusSquare;

  //Datos del nuevo usuario
  idUserLogin: number;
  id: number;
  name: string;
  surname: string;
  email: string;
  password: string;
  rol: string;
  rolNuevo: any;

  code: string;
  indiceBorrar: number;
  indiceEditar: number;

  //Formulario
  registroForm: FormGroup;
  editForm: FormGroup;

  //Campos editar Usuario
  user: any[];
  editId: number;
  editName: string;
  editSurname: string;
  editEmail: string;
  editPassword1: string;
  editPassword2: string;
  editRol: string;
  //Errores
  error: string;

  //Lista de usuarios registrados en la BBDD
  usuarios: any[];

  rolAux: any;
  toast: any;
  constructor(private http: HttpClient, private formBuilder: FormBuilder, public administrador: AdministradorService, private userService: UsersService) {
    this.initForm();
  }

  ngOnInit(): void {
    this.cargarUsuariosBBDD();
    this.idUserLogin = this.userService.id;
    this.user = new Array();
    this.user["id"] = "";
    this.user["name"] = "";
    this.user["surname"] = "";
    this.user["email"] = "";
    this.user["rol"] = "";
    this.user["passwd"] = "";
  }

  // Inicia el formulario
  private initForm(): void {
    //console.log(this.registroForm);

    this.registroForm = this.formBuilder.group({
      name: ['', [Validators.required]],
      surname: ['', [Validators.required]],
      email: ['', [Validators.required]],
      password: ['', [Validators.required]],
      rol: ['', [Validators.required]],
    });

    this.editForm = this.formBuilder.group({
      idUsuario: ['', [Validators.required]],
      editName: ['', [Validators.required]],
      editSurname: ['', [Validators.required]],
      editEmail: ['', [Validators.required]],
      editPassword1: ['', [Validators.required]],
      editPassword2: ['', [Validators.required]],
      editRol: ['', [Validators.required]],
    })

  }

  onSubmit() {

    // Creo el usuario con los datos necesarios para la BBDD
    let usuario = this.registroForm.value;

    //Suscripción a la función de consulta a la API

    usuario.rol = this.comprobarRol(usuario.rol);

    this.administrador.registrar(usuario).subscribe(
      (data) => {
        this.code = '200';
        this.cargarUsuariosBBDD();
        document.getElementById('btn-cerrar-create').click();
        this.toast = {
          text: 'Usuario creado', type: 'success'
        }
      },
      (error) => {
        console.error(error.status);
        this.toast = {
          text: 'Error al crear el usuario', type: 'error'
        }
      }
    );

  }

  public comprobarRol = (usuarioRol) => {
    switch (usuarioRol) {
      case 'Administrador':
        usuarioRol = 1; break;
      case 'Usuario':
        usuarioRol = 2; break;
    }
    return usuarioRol;
  }

  //Carga de usuarios de la BBDD
  public cargarUsuariosBBDD = () => {
    this.administrador.getUsers().subscribe(
      (data) => {
        this.usuarios = data['listaUsuarios'];
        this.code = '200';
      },
      (error) => {
        console.error(error.status);
      }
    );
  }


  //Recogemos el usuario que queremos modificar de la tabla
  editUser = (i) => {
    this.indiceEditar = i;
    this.editForm.controls["idUsuario"].setValue(this.usuarios[i].id);
    this.editForm.controls["editName"].setValue(this.usuarios[i].name);
    this.editForm.controls["editSurname"].setValue(this.usuarios[i].surname);
    this.editForm.controls["editEmail"].setValue(this.usuarios[i].email);
    this.editForm.controls["editRol"].setValue(this.usuarios[i].rol);

    switch (this.user["rol"]) {
      case 1:
        document.getElementById('op_administrador').setAttribute("selected", "selected");
        break;
      case 2:
        document.getElementById('op_usuario').setAttribute("selected", "selected");
        break;
    }
  }

  //Editar el usuario
  editar() {

    //Recogemos los valores del formulario
    let usuarioEditar = this.editForm.value;

    //Comprobamos si ha habido cambios o no, Si no hay cambios, recogemos el nombre original
    if (usuarioEditar.editName == "") {
      usuarioEditar.editName = this.usuarios[this.indiceEditar].name;
    }

    if (usuarioEditar.editSurname == "") {
      usuarioEditar.editSurname = this.usuarios[this.indiceEditar].surname;
    }

    if (usuarioEditar.editEmail == "") {
      usuarioEditar.editEmail = this.usuarios[this.indiceEditar].email;
    }

    if (usuarioEditar.editPassword2 == "") {
      usuarioEditar.editPassword2 = null;
    }

    //Ponemos el rol correspondiente en el atributo del usuario
    usuarioEditar.editRol = this.comprobarRol(usuarioEditar.editRol); 

    this.administrador.editUser(usuarioEditar).subscribe(
      (data) => {
        this.code = '200';
        this.cargarUsuariosBBDD();
        document.getElementById('btn-cerrar-edit').click();
        this.toast = {
          text: 'Usuario actualizado', type: 'success'
        }
      },
      (error) => {
        console.error(error.status);
        this.toast = {
          text: 'Error al actualizar el usuario', type: 'error'
        }
      }
    )
  }


  //Recogemos el indice de la tabla que vamos a borrar
  borrar(indice) {
    this.indiceBorrar = indice;
    this.user['name'] = this.usuarios[indice].name;
    this.user['surname'] = this.usuarios[indice].surname;
  }

  //Recuperamos ese usuario y le decimos que lo borre de l BBDD
  deleteUser = () => {
    let usuarioAux = this.usuarios[this.indiceBorrar];
    this.administrador.deleteUser(usuarioAux).subscribe(
      (data) => {
        this.code = '200';
        this.cargarUsuariosBBDD();
        this.toast = {
          text: 'Usuario eliminado', type: 'success'
        }
      },
      (error) => {
        console.error(error.status);
        this.toast = {
          text: 'Error al eliminar el usuario', type: 'error'
        }
      }
    )
  }

}
