const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tileSize = 48; // Tamanho de cada bloco no mapa (48x48 pixels)
let offsetX = 0; // Deslocamento inicial para o "andar" no mapa
let offsetY = 0; // Deslocamento inicial para o "andar" no mapa
let scale = 1; // Fator de zoom
let isDragging = false;
let startDragOffset = { x: 0, y: 0 };
let highlightedBlocks = []; // Blocos destacados

// Carrega o mapa e desenha no canvas
const mapImage = new Image();
mapImage.src = 'assets/Pellet Town.png';
mapImage.onload = function() {
    drawMap();
};

// Definindo as coordenadas do mapa de colisão
const collisionsMap = [];
for (let i = 0; i < collisions.length; i += 70) {
    collisionsMap.push(collisions.slice(i, 70 + i));
}

// Função para desenhar o mapa com o deslocamento e o zoom aplicados
function drawMap() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(mapImage, offsetX, offsetY, mapImage.width * scale, mapImage.height * scale);

    // Desenhar os blocos destacados
    highlightedBlocks.forEach(collision => {
        ctx.save();
        ctx.globalAlpha = 0.5; // Aplicar sombra
        ctx.fillStyle = 'yellow'; // Cor de destaque
        ctx.fillRect(
            (collision.x * tileSize) * scale + offsetX,
            (collision.y * tileSize) * scale + offsetY,
            tileSize * scale,
            tileSize * scale
        );
        ctx.restore();
    });
}

// Função para verificar se o mouse está sobre um bloco de colisão
function mouseOverCollision(mouseTileX, mouseTileY) {
    const tileIndex = mouseTileY * (mapImage.width / tileSize) + mouseTileX;
    return collisions[tileIndex] === 1025;
}

// Detecção de toques/click para encontrar e destacar colisões
canvas.addEventListener('click', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseXAdjusted = (event.clientX - rect.left) / scale;
    const mouseYAdjusted = (event.clientY - rect.top) / scale;

    const tileX = Math.floor(mouseXAdjusted / tileSize);
    const tileY = Math.floor(mouseYAdjusted / tileSize);

    if (mouseOverCollision(tileX, tileY)) {
        const connectedBlocks = checkConnectedBlocks(tileX, tileY);
        if (connectedBlocks >= 4) {
            highlightCollisionBlocks(tileX, tileY);
            showTreasureModal(); // Exibe o modal
        }
    }
});

// Detecção de movimento do mouse
canvas.addEventListener('mousemove', (event) => {
    const rect = canvas.getBoundingClientRect();
    const mouseXAdjusted = (event.clientX - rect.left) / scale;
    const mouseYAdjusted = (event.clientY - rect.top) / scale;

    const mouseTileX = Math.floor(mouseXAdjusted / tileSize);
    const mouseTileY = Math.floor(mouseYAdjusted / tileSize);

    // Limpar os blocos destacados
    highlightedBlocks = [];

    // Verificar se o mouse está sobre um bloco de colisão
    if (mouseOverCollision(mouseTileX, mouseTileY)) {
        const connectedBlocks = checkConnectedBlocks(mouseTileX, mouseTileY);
        if (connectedBlocks >= 4) {
            highlightCollisionBlocks(mouseTileX, mouseTileY);
        }
    }

    drawMap(); // Redesenhar o mapa após verificar a colisão
});

// Função para verificar blocos conectados (recursiva)
function checkConnectedBlocks(tileX, tileY, visited = {}) {
    const index = tileY * (mapImage.width / tileSize) + tileX;
    if (collisions[index] !== 1025 || visited[index]) {
        return 0; // Se não for um bloco de colisão ou já foi visitado
    }
    visited[index] = true; // Marcar como visitado

    // Checar os blocos adjacentes
    let connectedBlocks = 1;
    if (tileX > 0) connectedBlocks += checkConnectedBlocks(tileX - 1, tileY, visited); // Esquerda
    if (tileX < (mapImage.width / tileSize) - 1) connectedBlocks += checkConnectedBlocks(tileX + 1, tileY, visited); // Direita
    if (tileY > 0) connectedBlocks += checkConnectedBlocks(tileX, tileY - 1, visited); // Cima
    if (tileY < (mapImage.height / tileSize) - 1) connectedBlocks += checkConnectedBlocks(tileX, tileY + 1, visited); // Baixo
    return connectedBlocks;
}

// Função para destacar os blocos de colisão
function highlightCollisionBlocks(tileX, tileY) {
    highlightedBlocks = [];
    const visited = {};
    addCollisionBlock(tileX, tileY, visited);
}

// Função para adicionar os blocos de colisão conectados
function addCollisionBlock(tileX, tileY, visited) {
    const index = tileY * (mapImage.width / tileSize) + tileX;
    if (collisions[index] !== 1025 || visited[index]) {
        return;
    }
    visited[index] = true;
    highlightedBlocks.push({ x: tileX, y: tileY });
    if (tileX > 0) addCollisionBlock(tileX - 1, tileY, visited); // Esquerda
    if (tileX < (mapImage.width / tileSize) - 1) addCollisionBlock(tileX + 1, tileY, visited); // Direita
    if (tileY > 0) addCollisionBlock(tileX, tileY - 1, visited); // Cima
    if (tileY < (mapImage.height / tileSize) - 1) addCollisionBlock(tileX, tileY + 1, visited); // Baixo
}

// Funções de movimentação por toque e arrasto
canvas.addEventListener('mousedown', (event) => {
    isDragging = true;
    startDragOffset.x = event.clientX - offsetX;
    startDragOffset.y = event.clientY - offsetY;
});

canvas.addEventListener('mousemove', (event) => {
    if (isDragging) {
        offsetX = event.clientX - startDragOffset.x;
        offsetY = event.clientY - startDragOffset.y;
        drawMap(); // Redesenhar mapa ao arrastar
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

// Função para zoom in/out
canvas.addEventListener('wheel', (event) => {
    const zoomIntensity = 0.1;
    scale += event.deltaY * -zoomIntensity;
    scale = Math.min(Math.max(0.5, scale), 3); // Limitar zoom
    drawMap(); // Redesenhar mapa ao aplicar zoom
});

// Modal de tesouro encontrado
function showTreasureModal() {
    const modal = document.getElementById('treasureModal');
    modal.style.display = 'block';
    const closeBtn = modal.querySelector('.close');
    closeBtn.onclick = () => {
        modal.style.display = 'none';
    };
}

// Fechar modal ao clicar fora dele
window.onclick = (event) => {
    const modal = document.getElementById('treasureModal');
    if (event.target === modal) {
        modal.style.display = 'none';
    }
};

// Redesenhar ao redimensionar
window.addEventListener('resize', drawMap);
