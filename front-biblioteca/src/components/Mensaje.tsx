function Mensaje({ texto }: { texto: string }) {
  if (!texto) return null;
  const esError = /error|Error|no hay|No hay|no se pudo|No se pudo/.test(texto);
  return (
    <p
      className={`mb-4 rounded-xl border p-3 font-marmelad text-sm font-semibold ${
        esError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {texto}
    </p>
  );
}

export default Mensaje;