export interface Usuario {
  idUsuario: number;
  idPerfil: number;
  nombre: string;
  usuario: string;
  contrasena: string;
  correo: string;
  estado: boolean;
  nombrePerfil?: string;
}
