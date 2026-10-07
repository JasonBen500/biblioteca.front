export interface Prestamo {
  idPrestamo: number;
  idSocio: number;
  idUsuario: number;
  fechaPrestamo: string;
  fechaDevolucionEsperada: string;
  estado: boolean;
}
