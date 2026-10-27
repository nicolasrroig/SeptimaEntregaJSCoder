// ENTREGA 7: INTERFAZ DINÁMICA CON DOM Y EVENTOS
// Proyecto: Tienda de ropa y accesorios masculinos


// 1. DEFINIMOS LA CLASE PRODUCTO

class Producto {

    constructor(id, nombre, precio, categoria, stock) {
        this.id = id;
        this.nombre = nombre;
        this.precio = precio;
        this.categoria = categoria;
        this.stock = stock;
    }

}


// 2. CREAMOS LOS PRODUCTOS INICIALES

const reloj = new Producto(
    1, "Reloj Tressa", 85000, "Relojes", 10
);

const gafas = new Producto(
    2, "Gafas de sol", 35000, "Gafas", 15
);

const remera = new Producto(
    3, "Remera básica", 22000, "Remeras", 20
);

const short = new Producto(
    4, "Short deportivo", 28000, "Shorts", 0
);


// 3. GUARDAMOS LOS OBJETOS EN UN ARRAY

const productos = [reloj, gafas, remera, short];

let siguienteId = 5;


// 4. SELECCIONAMOS LOS ELEMENTOS DEL DOM

const formulario = document.querySelector("#formulario-producto");

const inputNombre = document.querySelector("#nombre");

const inputCategoria = document.querySelector("#categoria");

const inputPrecio = document.querySelector("#precio");

const inputStock = document.querySelector("#stock");

const inputBusqueda = document.querySelector("#busqueda");

const listaProductos = document.querySelector("#lista-productos");

const mensaje = document.querySelector("#mensaje");

const contador = document.querySelector("#contador");


// 5. PREPARAMOS EL FORMATO DE LOS PRECIOS

const formatoPrecio = new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 2
});


// 6. FUNCIÓN PARA MOSTRAR MENSAJES EN PANTALLA

function mostrarMensaje(texto, tipo) {

    mensaje.textContent = texto;

    mensaje.className = `mensaje ${tipo}`;

}


// 7. FUNCIÓN PARA PROTEGER LOS TEXTOS QUE INSERTAMOS EN HTML

function escaparHTML(texto) {

    return String(texto).replace(/[&<>"']/g, caracter => {

        const caracteresHTML = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return caracteresHTML[caracter];

    });

}


// 8. FUNCIÓN PARA RENDERIZAR LOS PRODUCTOS

function renderizarProductos(lista = productos) {

    // Limpiamos el contenido anterior
    listaProductos.innerHTML = "";

    // Actualizamos el contador
    contador.textContent =
        `${lista.length} ${lista.length === 1 ? "producto" : "productos"}`;

    // Si no hay productos para mostrar, informamos al usuario
    if (lista.length === 0) {

        listaProductos.innerHTML = `
            <p class="estado-vacio">
                No encontramos productos para mostrar.
            </p>
        `;

        return;

    }

    // Recorremos el array y generamos una tarjeta por producto
    for (const producto of lista) {

        const nombreSeguro = escaparHTML(producto.nombre);

        const categoriaSegura = escaparHTML(producto.categoria);

        const precioFormateado = formatoPrecio.format(producto.precio);

        const textoStock = producto.stock > 0
            ? `Stock disponible: ${producto.stock}`
            : "Producto agotado";

        const claseStock = producto.stock > 0
            ? "stock"
            : "stock stock-agotado";

        // Generamos el HTML de cada tarjeta mediante template literals
        listaProductos.innerHTML += `
            <article class="tarjeta">

                <p class="categoria-producto">
                    ${categoriaSegura}
                </p>

                <h3>${nombreSeguro}</h3>

                <p class="precio">${precioFormateado}</p>

                <p class="${claseStock}">
                    ${textoStock}
                </p>

                <button
                    type="button"
                    class="boton boton-eliminar"
                    data-id="${producto.id}"
                    aria-label="Eliminar ${nombreSeguro}"
                >
                    Eliminar producto
                </button>

            </article>
        `;

    }

}


// 9. EVENTO PARA AGREGAR PRODUCTOS

formulario.addEventListener("submit", function(evento) {

    // Evitamos que el formulario recargue la página
    evento.preventDefault();

    // Obtenemos los valores ingresados
    const nombre = inputNombre.value.trim();

    const categoria = inputCategoria.value;

    const precio = Number(inputPrecio.value);

    const stock = Number(inputStock.value);


    // Validamos los datos ingresados
    if (
        nombre === "" ||
        categoria === "" ||
        !Number.isFinite(precio) ||
        precio <= 0 ||
        !Number.isInteger(stock) ||
        stock < 0
    ) {

        mostrarMensaje(
            "Revisá los datos. El precio debe ser positivo y el stock un entero no negativo.",
            "error"
        );

        return;

    }


    // Creamos el nuevo objeto
    const nuevoProducto = new Producto(
        siguienteId,
        nombre,
        precio,
        categoria,
        stock
    );

    // Lo agregamos al array
    productos.push(nuevoProducto);

    siguienteId++;

    // Limpiamos el formulario
    formulario.reset();

    // Actualizamos la lista que se muestra en pantalla
    actualizarCatalogo();

    // Mostramos una confirmación
    mostrarMensaje(
        `¡${nuevoProducto.nombre} se agregó correctamente!`,
        "exito"
    );

});


// 10. EVENTO PARA ELIMINAR PRODUCTOS

listaProductos.addEventListener("click", function(evento) {

    // Comprobamos si se hizo clic en un botón de eliminar
    const botonEliminar = evento.target.closest(".boton-eliminar");

    if (!botonEliminar || !listaProductos.contains(botonEliminar)) {
        return;
    }

    // Obtenemos el ID del producto seleccionado
    const idProducto = Number(botonEliminar.dataset.id);

    // Buscamos su posición dentro del array
    const indice = productos.findIndex(
        producto => producto.id === idProducto
    );

    // Si no existe, no hacemos nada
    if (indice === -1) {
        mostrarMensaje("No se encontró el producto.", "error");
        return;
    }

    // Guardamos el nombre para mostrar la confirmación
    const nombreEliminado = productos[indice].nombre;

    // Eliminamos el producto del array
    productos.splice(indice, 1);

    // Volvemos a dibujar el catálogo
    actualizarCatalogo();

    // Informamos al usuario
    mostrarMensaje(
        `${nombreEliminado} se eliminó correctamente.`,
        "exito"
    );

});


// 11. EVENTO DE TECLADO PARA BUSCAR PRODUCTOS

inputBusqueda.addEventListener("input", function() {

    // Actualizamos el catálogo mientras el usuario escribe
    actualizarCatalogo();

});


// 12. FUNCIÓN PARA ACTUALIZAR EL CATÁLOGO

function actualizarCatalogo() {

    // Obtenemos el texto que escribió el usuario
    const busqueda = inputBusqueda.value.trim().toLowerCase();

    // Filtramos por nombre o categoría
    const productosFiltrados = productos.filter(producto => {

        return (
            producto.nombre.toLowerCase().includes(busqueda) ||
            producto.categoria.toLowerCase().includes(busqueda)
        );

    });

    // Mostramos los resultados
    renderizarProductos(productosFiltrados);

}


// 13. MOSTRAMOS EL CATÁLOGO AL CARGAR LA PÁGINA

renderizarProductos();