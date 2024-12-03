document.body.innerHTML = '';
var maxColor = 256*256*256 - 1;

function Particle(x, y, r, a, c, text) {
    this.x = +x || 0;
    this.y = +y || 0;
    this.r = +r || 0;
    this.a = a === null ? null : (+a || 0);
    this.c = c;
    this.text = text;
    this.isOn = false;
}

Particle.prototype.createView = function() {
    this.view = document.createElement('div');
    this.view.className = 'particle' + (this.a === null ? ' static' : '');
    this.view.style.left = this.x + 'px';
    this.view.style.top = this.y + 'px';
    this.view.style.width = this.r * 2 + 'px';
    this.view.style.height = this.r * 2 + 'px';
    this.view.style.transform = `translate3d(-${this.r}px, -${this.r}px, 0)`;
    this.view.style.backgroundColor = '#' + dec2hex(this.c);
    this.view.style.color = '#' + dec2hex(this.c);

    this.view.style.fontSize = this.r * 1.5 + 'px';
    this.view.style.lineHeight = this.r * 2 + 'px';
    this.view.style.textShadow = `2px 1px 3px rgba(${this.c >>> 16 & 255}, ${this.c >>> 8 & 255}, ${this.c & 255}, 0.8), 0px 0px 0px rgba(0, 0, 0, 0.8)`;

    var text = document.createElement('span');
    text.textContent = this.text;
    this.view.append(text);
    return this;
};
Particle.prototype.renderView = function() {
    document.body.appendChild(this.view);
    return this;
};
Particle.prototype.updateView = function() {
    this.view.style.left = this.x + 'px';
    this.view.style.top = this.y + 'px';
    return this;
};

Particle.prototype._dx = function() { return this.a === null ? 0 : 0.3 * Math.cos(this.a * Math.PI/180); };
Particle.prototype._dy = function() { return this.a === null ? 0 : 0.3 * Math.sin(this.a * Math.PI/180); };
Particle.prototype.reflect = function(a) {
    this.a = 2 * a - this.a;
    return this;
};
Particle.prototype.bump = function() {
    this.view.classList.add('bump');
    setTimeout(() => this.view.classList.remove('bump'), 66);
    return this;
};

Particle.prototype.on = function() {
    this.isOn = true;
    setTimeout(() => this.view.classList.add('bump'), 100);
    return this;
};


function move(p) {
    p.x += p._dx();
    p.y += p._dy();
}

function checkBorders(p) {
    if (p.x + p._dx() > sW - p.r) {
        p.x = sW - p.r;
        p.reflect(90);
    }
    if (p.x + p._dx() < p.r) {
        p.x = p.r;
        p.reflect(90);
    }
    if (p.y + p._dy() > sH - p.r) {
        p.y = sH - p.r;
        p.reflect(0);
    }
    if (p.y + p._dy() < p.r) {
        p.y = p.r;
        p.reflect(0);
    }
}

var obstacles = [];
var particles = [];
function checkBounce() {
    for (let p = 0; p < particles.length; p++) {
        for (let o = 0; o < obstacles.length; o++) {
            const distX = particles[p].x + particles[p]._dx() - obstacles[o].x,
                distY = particles[p].y + particles[p]._dy() - obstacles[o].y,
                rr = particles[p].r + obstacles[o].r;

            if (Math.pow(distX, 2) + Math.pow(distY, 2) < Math.pow(rr, 2)) {
                var surfaceAngle = Math.atan(distY / distX) / Math.PI * 180 + 90;
                particles[p].reflect(surfaceAngle);
                particles[p].bump();
                !obstacles[o].isOn && obstacles[o].bump();
                !obstacles[o].isOn && obstacles[o].on();
            }
        }
    }

    if (obstacles.every(o => o.isOn)) {
        setTimeout(() => window.location.reload(), 2000);
    }
}

function dist(x1, y1, x2, y2, getSquare) {
    var squareDist = Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2);
    return getSquare ? squareDist : Math.sqrt(squareDist);
}

function rnd(a, b = 0) {
    return Math.round(b + Math.random() * (a - b))
}

function dec2rgb(c) {
    return { r: c & 255, g: c >> 8 & 255, b: c >> 16 & 255 };
}
function dec2hex(c) {
    return `00000${c.toString(16)}`.slice(-6);
}
function rgb2dec(c) {
    return c.r + (c.g << 8) + (c.b << 16);
}
function hex2dec(c) {
    return parseInt(c, 10);
}

var sW = window.innerWidth;
var sH = window.innerHeight;

function createParticles(pArray) {
    let r = rnd(20, 30), c, x, y, rgb, maxTries = pArray.length < 3 ? 1000 : 0;
    do {
        x = rnd(r, sW - r);
        y = rnd(r, sH - r);
    } while (maxTries-- && pArray.some(p => dist(x, y, p.x, p.y) < r + p.r));
    if (maxTries < 0) { return pArray; }

    do {
        c = rnd(maxColor);
        rgb = dec2rgb(c);
    } while (rgb.r < 160 && rgb.g < 160 && rgb.b < 160);

    pArray.push(new Particle(x, y, r, rnd(359), c, ':)'));
    return createParticles(pArray);
}

createParticles(particles).forEach(p => p.createView().renderView());

function createObstacles(oArray) {
    let r = rnd(20, 40), x, y, c, rgb,
        maxTries = oArray.length < 99 ? 1000 : 0,
        maxParticleRadius = Math.max(0, ...particles.map(p => p.r));
    do {
        x = rnd(r, sW - r);
        y = rnd(r, sH - r);
    } while (maxTries-- && (oArray.some(o => dist(x, y, o.x, o.y) < r + 2.1 * maxParticleRadius + o.r) || particles.some(p => dist(x, y, p.x, p.y) < r + p.r)));

    do {
        c = rnd(maxColor);
        rgb = dec2rgb(c);
    } while (rgb.r < 160 && rgb.g < 160 && rgb.b < 160);

    if (maxTries < 0) { return oArray; }
    oArray.push(new Particle(x, y, r, null, c, oArray.length));
    return createObstacles(oArray);
}
createObstacles(obstacles).forEach(o => o.createView().renderView());

var c = window.c = 10;
var stope = false;

run.calls = 0;
function run() {
    run.calls++;
    particles.forEach(checkBorders);
    checkBounce();
    particles.forEach(move);

    if (run.calls < c){
        run();
    } else {
        run.calls = 0;
        stope || setTimeout(run, 0);
    }
}

var d = 0;

function updateView() {
    d++;
    particles.forEach(p => p.updateView());
    stope || window.requestAnimationFrame(updateView);
}

run();
updateView();

window.addEventListener('click', function(e) {
   if (!(stope = !stope)) { run(); updateView(); }
});
