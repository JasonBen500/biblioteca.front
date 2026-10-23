// Quita tildes y pasa a minúsculas para comparar sin importar cómo se escriba
export const normalizar = (texto: string) =>
  texto
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .trim();

// Solo se busca en textos cortos y números
const esBuscable = (valor: unknown): valor is string | number =>
  typeof valor === "number" ||
  (typeof valor === "string" && valor.length < 200);

// Filtra cualquier lista buscando en todos sus campos de texto,
// incluidos los nombres relacionados (nombreSocio, nombreLibro, etc.).
// Se ignoran los campos id (idLibro, idSocio, ...) para evitar coincidencias raras.
export function filtrarPorTexto<T extends object>(
  datos: T[],
  busqueda: string,
): T[] {
  const texto = normalizar(busqueda);
  if (texto === "") return datos;

  return datos.filter((fila) =>
    Object.entries(fila).some(
      ([clave, valor]) =>
        !/^id[A-Z]/.test(clave) &&
        esBuscable(valor) &&
        normalizar(String(valor)).includes(texto),
    ),
  );
}