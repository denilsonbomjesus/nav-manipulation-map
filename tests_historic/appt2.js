const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const tileSize = 48; // Tamanho de cada bloco no mapa (32x32 pixels)
let offsetX = -735; // Deslocamento inicial para o "andar" no mapa
let offsetY = -650; // Deslocamento inicial para o "andar" no mapa
let scale = 1; // Fator de zoom
let isDragging = false;
let startDragOffset = { x: 0, y: 0 };
let mouseX = 0; // Coordenadas do mouse
let mouseY = 0;
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
  
  // Desenhar o mapa de fundo
  ctx.drawImage(mapImage, offsetX, offsetY, mapImage.width * scale, mapImage.height * scale);

  // Desenhar os blocos de colisão
  drawCollisionBlocks();
}

// Função para desenhar os blocos de colisão
function drawCollisionBlocks() {
  const numRows = collisionsMap.length;
  const numCols = collisionsMap[0].length;

  for (let row = 0; row < numRows; row++) {
    for (let col = 0; col < numCols; col++) {
      if (collisionsMap[row][col] === 1025) { // Verifica se é uma colisão
        ctx.save();
        ctx.globalAlpha = 0.5; // Aplicar sombra
        ctx.fillStyle = 'yellow'; // Cor de destaque
        ctx.fillRect(
          (col * tileSize + offsetX) * scale, 
          (row * tileSize + offsetY) * scale, 
          tileSize * scale, 
          tileSize * scale
        );
        ctx.restore();
      }
    }
  }
}

// Função para verificar se o mouse está sobre um bloco de colisão
function mouseOverCollision(tileX, tileY) {
  const mouseTileX = Math.floor((mouseX - offsetX) / (tileSize * scale));
  const mouseTileY = Math.floor((mouseY - offsetY) / (tileSize * scale));

  // Checar se o mouse está sobre o bloco de colisão inteiro
  return tileX === mouseTileX && tileY === mouseTileY;
}

// Detecção de toques/click para encontrar e destacar colisões
canvas.addEventListener('click', (event) => {
  const mouseXAdjusted = (event.clientX - offsetX) / scale;
  const mouseYAdjusted = (event.clientY - offsetY) / scale;

  const tileX = Math.floor(mouseXAdjusted / tileSize);
  const tileY = Math.floor(mouseYAdjusted / tileSize);

  const tileIndex = tileY * (mapImage.width / tileSize) + tileX;

  // Verificar se o tile clicado é um ponto de colisão
  if (collisions[tileIndex] === 1025) {
    const connectedBlocks = checkConnectedBlocks(tileX, tileY);

    // Se houver 4 ou mais blocos conectados, destacar
    if (connectedBlocks >= 4) {
      highlightCollisionBlocks(tileX, tileY);
      showTreasureModal(); // Exibe o modal
    }
  }
});

// Detecção de movimento do mouse
canvas.addEventListener('mousemove', (event) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = event.clientX - rect.left;
  mouseY = event.clientY - rect.top;

  // Limpar os blocos destacados
  highlightedBlocks = [];

  // Verificar se o mouse está sobre um bloco de colisão
  const mouseTileX = Math.floor((mouseX - offsetX) / (tileSize * scale));
  const mouseTileY = Math.floor((mouseY - offsetY) / (tileSize * scale));
  const tileIndex = mouseTileY * (mapImage.width / tileSize) + mouseTileX;

  // Se o mouse está sobre um bloco de colisão, destacar
  if (collisions[tileIndex] === 1025) {
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
  if (tileX < mapImage.width / tileSize - 1) connectedBlocks += checkConnectedBlocks(tileX + 1, tileY, visited); // Direita
  if (tileY > 0) connectedBlocks += checkConnectedBlocks(tileX, tileY - 1, visited); // Cima
  if (tileY < mapImage.height / tileSize - 1) connectedBlocks += checkConnectedBlocks(tileX, tileY + 1, visited); // Baixo

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
  if (tileX < mapImage.width / tileSize - 1) addCollisionBlock(tileX + 1, tileY, visited); // Direita
  if (tileY > 0) addCollisionBlock(tileX, tileY - 1, visited); // Cima
  if (tileY < mapImage.height / tileSize - 1) addCollisionBlock(tileX, tileY + 1, visited); // Baixo
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
  modal.style.display = 'block'; // Exibir modal
}

// Fechar o modal ao clicar fora
window.onclick = function(event) {
  const modal = document.getElementById('treasureModal');
  if (event.target === modal) {
    modal.style.display = 'none';
  }
}
