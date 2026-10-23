export interface DetallePrestamo {
  idDetallePrestamo: number;
  idPrestamo: number;
  idLibro: number;
  fechaDevolucionReal: string;
  estado: boolean;
  descripcionPrestamo?: string;
  nombreSocio?: string;
  nombreLibro?: string;
}