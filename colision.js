const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let ancho = window.innerWidth;
let alto = window.innerHeight;
canvas.width = ancho;
canvas.height = alto;

const TOTAL_OBJETOS = 25;
const REBOTE = 0.6;          // pérdida de energía en cada rebote
const VELOCIDAD_MINIMA = 2;  // si el rebote es menor, desaparece y reaparece

// Cambia por los nombres de tus imágenes (puedes agregar más)
const RUTAS_IMAGENES = ["pico.png", "diamante.png"];

// Reglas de velocidad según el contador
const NIVELES = {
    inicial: 0.25,
    media: 0.45,
    alta: 0.7
};

let eliminadas = 0;

function gravedadActual() {
    if (eliminadas > 20) return NIVELES.alta;
    if (eliminadas > 10) return NIVELES.media;
    return NIVELES.inicial;
}

// Cargar todas las imágenes
const imagenes = RUTAS_IMAGENES.map(ruta => {
    const img = new Image();
    img.src = ruta;
    return img;
});

class Objeto {
    constructor(tipo) {
        this.tipo = tipo; // índice de la imagen que le corresponde
        this.reiniciar();
    }

    reiniciar() {
        const img = imagenes[this.tipo];

        // Tamaño aleatorio conservando la proporción de la imagen
        this.w = 40 + Math.random() * 40;
        this.h = this.w * (img.height / img.width);

        // Zona aleatoria, siempre justo después del margen superior
        this.posX = this.w / 2 + Math.random() * Math.max(1, ancho - this.w);
        this.posY = this.h / 2;

        // Cada objeto cae a una velocidad distinta
        this.vy = 1 + Math.random() * 3;
        this.dx = (Math.random() - 0.5) * 2;
        this.factor = 0.8 + Math.random() * 0.5;
    }

    update(paso) {
        this.vy += gravedadActual() * this.factor * paso;
        this.posY += this.vy * paso;
        this.posX += this.dx * paso;

        // Paredes laterales
        if (this.posX - this.w / 2 <= 0) {
            this.posX = this.w / 2;
            this.dx = Math.abs(this.dx);
        }
        if (this.posX + this.w / 2 >= ancho) {
            this.posX = ancho - this.w / 2;
            this.dx = -Math.abs(this.dx);
        }

        // Rebote en el suelo (parábola cada vez más baja)
        if (this.posY + this.h / 2 >= alto) {
            this.posY = alto - this.h / 2;
            this.vy = -this.vy * REBOTE;

            if (Math.abs(this.vy) < VELOCIDAD_MINIMA) {
                this.reiniciar(); // deja de rebotar: desaparece y vuelve a caer
            }
        }
    }

    contienePunto(x, y) {
        return (
            x >= this.posX - this.w / 2 &&
            x <= this.posX + this.w / 2 &&
            y >= this.posY - this.h / 2 &&
            y <= this.posY + this.h / 2
        );
    }

    draw(context) {
        context.drawImage(
            imagenes[this.tipo],
            this.posX - this.w / 2,
            this.posY - this.h / 2,
            this.w,
            this.h
        );
    }
}

const objetos = [];

function generarObjetos() {
    for (let i = 0; i < TOTAL_OBJETOS; i++) {
        // Se alternan los tipos: 0, 1, 0, 1, ...
        const obj = new Objeto(i % imagenes.length);
        // Escalonar la altura inicial para que no caigan todos juntos
        obj.posY = obj.h / 2 + Math.random() * (alto * 0.3);
        objetos.push(obj);
    }
}

// Detectar mouseX y mouseY y eliminar el objeto con clic izquierdo
canvas.addEventListener("click", (evento) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = evento.clientX - rect.left;
    const mouseY = evento.clientY - rect.top;

    // Se recorre al revés para eliminar el que está dibujado encima
    for (let i = objetos.length - 1; i >= 0; i--) {
        if (objetos[i].contienePunto(mouseX, mouseY)) {
            eliminadas++;
            objetos[i].reiniciar(); // se reemplaza por otro del mismo tipo: siempre hay 25
            break;
        }
    }
});

function dibujarContador() {
    ctx.fillStyle = "#000000";
    ctx.font = "20px Arial";
    ctx.textAlign = "right";
    ctx.textBaseline = "top";
    ctx.fillText(`Eliminadas: ${eliminadas}`, ancho - 20, 15);
}

let ultimoTiempo = 0;

function animate(tiempoActual) {
    ctx.clearRect(0, 0, ancho, alto);

    // Paso normalizado a 60 fps para que sea igual en cualquier pantalla
    const delta = ultimoTiempo === 0 ? 16.67 : Math.min(tiempoActual - ultimoTiempo, 50);
    ultimoTiempo = tiempoActual;
    const paso = delta / 16.67;

    objetos.forEach(obj => {
        obj.update(paso);
        obj.draw(ctx);
    });

    dibujarContador();

    requestAnimationFrame(animate);
}

// La animación inicia hasta que TODAS las imágenes hayan cargado
let cargadas = 0;
imagenes.forEach((img, i) => {
    img.onload = () => {
        cargadas++;
        if (cargadas === imagenes.length) {
            generarObjetos();
            requestAnimationFrame(animate);
        }
    };
    img.onerror = () => {
        console.error("No se pudo cargar la imagen: " + RUTAS_IMAGENES[i]);
    };
});

window.addEventListener("resize", () => {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    canvas.width = ancho;
    canvas.height = alto;
});