const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tileSize = 32; // Tamanho de cada bloco no mapa (32x32 pixels)
let offsetX = 0; // Deslocamento para o "andar" no mapa
let offsetY = 0;
let scale = 1; // Fator de zoom
let isDragging = false;
let startDragOffset = { x: 0, y: 0 };
let collisionsHighlighted = []; // Armazena os blocos de colisão destacados
let mouseX = 0; // Coordenadas do mouse
let mouseY = 0;

// Carrega o mapa e desenha no canvas
const mapImage = new Image();
mapImage.src = 'assets/Pellet Town.png';

mapImage.onload = function() {
  highlightCollisions();
  drawMap();
};

// Função para desenhar o mapa com o deslocamento e o zoom aplicados
function drawMap() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.drawImage(mapImage, offsetX, offsetY, mapImage.width * scale, mapImage.height * scale);

  // Desenha os blocos de colisão destacados com sombra ao passar o mouse
  collisionsHighlighted.forEach(collision => {
    if (mouseOverCollision(collision.x, collision.y)) {
      ctx.save();
      ctx.globalAlpha = 0.5; // Sombra
      ctx.fillStyle = 'yellow'; // Cor de destaque
      ctx.fillRect(collision.x * scale + offsetX, collision.y * scale + offsetY, tileSize * scale, tileSize * scale);
      ctx.restore();
    }
  });
}

// Adiciona um efeito de sombra em blocos destacados
function highlightCollisions() {
  collisionsHighlighted = [];
  for (let i = 0; i < collisions.length; i++) {
    if (collisions[i] === 1025) {
      const x = (i % mapWidth) * tileSize;
      const y = Math.floor(i / mapWidth) * tileSize;
      collisionsHighlighted.push({ x, y });
    }
  }
}

// Função para verificar se o mouse está sobre um bloco de colisão
function mouseOverCollision(x, y) {
  return (
    mouseX >= x * scale + offsetX &&
    mouseX <= (x + tileSize) * scale + offsetX &&
    mouseY >= y * scale + offsetY &&
    mouseY <= (y + tileSize) * scale + offsetY
  );
}

// Detecção de toques/click para encontrar tesouro
canvas.addEventListener('click', (event) => {
  const mouseX = (event.clientX - offsetX) / scale;
  const mouseY = (event.clientY - offsetY) / scale;

  const tileX = Math.floor(mouseX / tileSize);
  const tileY = Math.floor(mouseY / tileSize);

  const tileIndex = tileY * (mapImage.width / tileSize) + tileX;

  // Verificar se o tile clicado é um ponto de colisão
  if (collisions[tileIndex] === 1025) {
    const connectedBlocks = checkConnectedBlocks(tileX, tileY);

    // Mostrar modal se houver 4 ou mais blocos conectados
    if (connectedBlocks >= 4) {
      showTreasureModal();
    }
  }
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
  if (tileX < mapImage.width / tileSize - 1) connectedBlocks += checkConnectedBlocks(tileX + 1, tileY, visited); // Direita
  if (tileY > 0) connectedBlocks += checkConnectedBlocks(tileX, tileY - 1, visited); // Cima
  if (tileY < mapImage.height / tileSize - 1) connectedBlocks += checkConnectedBlocks(tileX, tileY + 1, visited); // Baixo

  return connectedBlocks;
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

    limitMapMovement(); // Limitar a movimentação
    drawMap();
  }

  // Atualizar a posição do mouse
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;
  drawMap(); // Redesenhar o mapa para atualizar a sombra
});

canvas.addEventListener('mouseup', () => {
  isDragging = false;
});

// Função para limitar a movimentação do mapa
function limitMapMovement() {
  const maxX = 0;
  const maxY = 0;
  const minX = canvas.width - mapImage.width * scale;
  const minY = canvas.height - mapImage.height * scale;

  // Limitar o offsetX e offsetY aos limites do mapa
  if (offsetX > maxX) offsetX = maxX;
  if (offsetY > maxY) offsetY = maxY;
  if (offsetX < minX) offsetX = minX;
  if (offsetY < minY) offsetY = minY;
}

// Função para zoom in/out
canvas.addEventListener('wheel', (event) => {
  const zoomIntensity = 0.1;
  scale += event.deltaY * -zoomIntensity;

  scale = Math.min(Math.max(0.5, scale), 3); // Limitar zoom
  limitMapMovement(); // Limitar movimento com o novo zoom
  drawMap();
});

// Modal de tesouro encontrado
function showTreasureModal() {
  const modal = document.getElementById('treasureModal');
  modal.style.display = 'block';

  const closeBtn = document.querySelector('.close');
  closeBtn.onclick = function() {
    modal.style.display = 'none';
  };
}
