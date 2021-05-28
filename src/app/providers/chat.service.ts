import { Injectable } from '@angular/core';
import { AngularFirestore, AngularFirestoreCollection } from '@angular/fire/firestore';
import { Mensaje } from '../interface/mensaje.interface';
import { map } from 'rxjs/operators';
import { AngularFireAuth } from '@angular/fire/auth';
import { auth } from 'firebase/app';


@Injectable({
  providedIn: 'root'
})
export class ChatService {

  private itemsCollection: AngularFirestoreCollection<Mensaje>;

  chats: Mensaje[] = [];

  usuario: any = {};

  constructor( private afs: AngularFirestore,
               public auth: AngularFireAuth ) { 

      this.auth.authState.subscribe( user => {
        console.log('estado del usuario', user);

        if( !user ){ return }

        this.usuario.nombre = user.displayName;
        this.usuario.uid = user.uid;
      });
  }
  // Para acceder a google o facebook
  login( proveedor: string ) {
    if(proveedor == 'google'){
      this.auth.signInWithPopup(new auth.GoogleAuthProvider());
    }else{
      this.auth.signInWithPopup(new auth.FacebookAuthProvider()).then(function(result) {
        console.log('La conexión fue un exito');
      }).catch(function(error) {
        console.log('Ocurrio un error en la conexión');
      });
    }
  }

  logout() {

    this.usuario = {};
    this.auth.signOut();
  }

  cargarMensajes(){
                                                        // en el segundo parametro podemos enviar mysql
    this.itemsCollection = this.afs.collection<Mensaje>('chats', ref=>ref.orderBy('fecha','desc').limit(5));

    // para estar pendiente a los cambios
    return this.itemsCollection.valueChanges().pipe(
      map((mensajes:Mensaje[]) => {
        console.log(mensajes);

        this.chats = [];

        for(let mensaje of mensajes){
            this.chats.unshift( mensaje );
        }

        return this.chats;
      }) 
    );
  }
  
  agregarMensaje(texto: string){
    let mensaje: Mensaje = {
      nombre:this.usuario.nombre,
      mensaje: texto,
      fecha: new Date().getTime(),
      uid: this.usuario.uid
    }
    // esto regresa una promesa
    return this.itemsCollection.add( mensaje );
  }
}
