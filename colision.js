
const canvas = document.getElementById("canvas");
const ctx = canvas.getContext("2d");

let ancho = window.innerWidth;
let alto = window.innerHeight;

canvas.width = ancho;
canvas.height = alto;
canvas.style.background = "#ffff88";

class Circle {
    constructor(x, y, radius, color, text, dx, dy) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.dx = dx;
        this.dy = dy;

        this.tiempoDestello = 0;
        this.parejasColision = new Set();
    }

    update() {
        this.posX += this.dx;
        this.posY += this.dy;

        if (this.posX + this.radius >= ancho) {
            this.posX = ancho - this.radius;
            this.dx = -Math.abs(this.dx);
        }

        if (this.posX - this.radius <= 0) {
            this.posX = this.radius;
            this.dx = Math.abs(this.dx);
        }

        if (this.posY + this.radius >= alto) {
            this.posY = alto - this.radius;
            this.dy = -Math.abs(this.dy);
        }

        if (this.posY - this.radius <= 0) {
            this.posY = this.radius;
            this.dy = Math.abs(this.dy);
        }
    }

    draw(context) {
        context.beginPath();

        context.strokeStyle =
            this.tiempoDestello > 0 ? "#0000FF" : this.color;

        context.lineWidth = 2;

        context.arc(
            this.posX,
            this.posY,
            this.radius,
            0,
            Math.PI * 2
        );

        context.stroke();

        context.fillStyle = "#000000";
        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);

        context.closePath();
    }
}

const circles = [];

function generateCircles(n) {
    const colores = [
        "#FF0000", "#00AA00", "#FF8800", "#AA00AA",
        "#008888", "#FF1493", "#8B4513", "#5555FF",
        "#00AAAA", "#808000", "#9932CC", "#DC143C",
        "#2E8B57", "#FF6347", "#4169E1", "#DAA520",
        "#C71585", "#20B2AA", "#6B8E23", "#FF4500"
    ];

    for (let i = 0; i < n; i++) {
        const radius = 15 + Math.random() * 25;

        const x = radius +
            Math.random() * Math.max(1, ancho - radius * 2);

        const y = radius +
            Math.random() * Math.max(1, alto - radius * 2);

        const velocidadX = 1 + Math.random() * 4;
        const velocidadY = 1 + Math.random() * 4;

        const dx = Math.random() < 0.5
            ? -velocidadX : velocidadX;

        const dy = Math.random() < 0.5
            ? -velocidadY : velocidadY;

        circles.push(
            new Circle(
                x, y, radius, colores[i], `C${i + 1}`, dx, dy
            )
        );
    }
}

function detectarColisiones() {
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            const a = circles[i];
            const b = circles[j];

            const dx = b.posX - a.posX;
            const dy = b.posY - a.posY;

            const distancia = Math.sqrt(dx * dx + dy * dy);
            const distanciaMinima = a.radius + b.radius;

            if (distancia <= distanciaMinima) {
                if (!a.parejasColision.has(b.text)) {
                    const d = Math.max(distancia, 0.01);
                    const nx = dx / d;
                    const ny = dy / d;

                    // Destello azul
                    a.tiempoDestello = 180;
                    b.tiempoDestello = 180;

                    // Calcular el movimiento relativo
                    const velocidadRelativa =
                        (b.dx - a.dx) * nx +
                        (b.dy - a.dy) * ny;

                    // Cambiar las velocidades para generar el rebote
                    if (velocidadRelativa < 0) {
                        a.dx += velocidadRelativa * nx;
                        a.dy += velocidadRelativa * ny;

                        b.dx -= velocidadRelativa * nx;
                        b.dy -= velocidadRelativa * ny;
                    }

                    // Separar los círculos para evitar que se traben
                    const solapamiento = distanciaMinima - distancia;
                    const separacion =
                        Math.max(solapamiento, 0) / 2 + 0.5;

                    a.posX -= nx * separacion;
                    a.posY -= ny * separacion;

                    b.posX += nx * separacion;
                    b.posY += ny * separacion;

                    a.parejasColision.add(b.text);
                    b.parejasColision.add(a.text);
                }
            } else {
                a.parejasColision.delete(b.text);
                b.parejasColision.delete(a.text);
            }
        }
    }
}

let ultimoTiempo = 0;

function animate(tiempoActual) {
    ctx.clearRect(0, 0, ancho, alto);

    const delta = ultimoTiempo === 0
        ? 16
        : Math.min(tiempoActual - ultimoTiempo, 50);

    ultimoTiempo = tiempoActual;

    circles.forEach(circle => {
        circle.update();

        circle.tiempoDestello = Math.max(
            0,
            circle.tiempoDestello - delta
        );
    });

    detectarColisiones();

    circles.forEach(circle => circle.draw(ctx));

    requestAnimationFrame(animate);
}

generateCircles(20);
animate();

window.addEventListener("resize", () => {
    ancho = window.innerWidth;
    alto = window.innerHeight;
    canvas.width = ancho;
    canvas.height = alto;
    canvas.style.background = "#ffff88";
});