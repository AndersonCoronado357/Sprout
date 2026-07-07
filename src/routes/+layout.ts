// Toda la UI depende del ancho de pantalla (sidebar vs tabbar, grillas de 1 o 2
// columnas, etc.). Renderizar en el servidor obliga a asumir un viewport y
// provoca un parpadeo del layout equivocado al hidratar en el cliente.
// Renderizando solo en el cliente, cada vista se dibuja directamente en su
// layout correcto. Los load del servidor (auth, datos) siguen corriendo.
export const ssr = false;
