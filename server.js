const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, 'public')));

const BOARD_DATA = new Array(
  { id: 0, name: "SALIDA", type: "go" },
  { id: 1, name: "Ronda de Valencia", type: "street", color: "#8B4513", price: 60, houseCost: 50, rents: new Array(2, 10, 30, 90, 160, 250) },
  { id: 2, name: "Caja de Comunidad", type: "chest" },
  { id: 3, name: "Plaza Lavapiés", type: "street", color: "#8B4513", price: 60, houseCost: 50, rents: new Array(4, 20, 60, 180, 320, 450) },
  { id: 4, name: "Impuesto Capital", type: "tax", amount: 200 },
  { id: 5, name: "Estación de Goya", type: "station", price: 200, rent: 25 },
  { id: 6, name: "Glorieta Cuatro Caminos", type: "street", color: "#87CEEB", price: 100, houseCost: 50, rents: new Array(6, 30, 90, 270, 400, 550) },
  { id: 7, name: "Suerte", type: "chance" },
  { id: 8, name: "Av. Reina Victoria", type: "street", color: "#87CEEB", price: 100, houseCost: 50, rents: new Array(6, 30, 90, 270, 400, 550) },
  { id: 9, name: "Calle Bravo Murillo", type: "street", color: "#87CEEB", price: 120, houseCost: 50, rents: new Array(8, 40, 100, 300, 450, 600) },
  { id: 10, name: "Cárcel / Visitas", type: "jail" },
  { id: 11, name: "Glorieta de Bilbao", type: "street", color: "#FF69B4", price: 140, houseCost: 100, rents: new Array(10, 50, 150, 450, 625, 750) },
  { id: 12, name: "Electricidad", type: "utility", price: 150, rent: 4 },
  { id: 13, name: "Calle Alberto Aguilera", type: "street", color: "#FF69B4", price: 140, houseCost: 100, rents: new Array(10, 50, 150, 450, 625, 750) },
  { id: 14, name: "Calle Fuencarral", type: "street", color: "#FF69B4", price: 160, houseCost: 100, rents: new Array(12, 60, 180, 500, 700, 900) },
  { id: 15, name: "Estación Delicias", type: "station", price: 200, rent: 25 },
  { id: 16, name: "Av. Felipe II", type: "street", color: "#FFA500", price: 180, houseCost: 100, rents: new Array(14, 70, 200, 550, 750, 950) },
  { id: 17, name: "Caja de Comunidad", type: "chest" },
  { id: 18, name: "Calle Velázquez", type: "street", color: "#FFA500", price: 180, houseCost: 100, rents: new Array(14, 70, 200, 550, 750, 950) },
  { id: 19, name: "Calle Serrano", type: "street", color: "#FFA500", price: 200, houseCost: 100, rents: new Array(16, 80, 220, 600, 800, 1000) },
  { id: 20, name: "Parking Gratuito", type: "parking" },
  { id: 21, name: "Av. de América", type: "street", color: "#FF0000", price: 220, houseCost: 150, rents: new Array(18, 90, 250, 700, 875, 1050) },
  { id: 22, name: "Suerte", type: "chance" },
  { id: 23, name: "Calle María de Molina", type: "street", color: "#FF0000", price: 220, houseCost: 150, rents: new Array(18, 90, 250, 700, 875, 1050) },
  { id: 24, name: "Calle Cea Bermúdez", type: "street", color: "#FF0000", price: 240, houseCost: 150, rents: new Array(20, 100, 300, 750, 925, 1100) },
  { id: 25, name: "Estación Mediodía", type: "station", price: 200, rent: 25 },
  { id: 26, name: "Av. Reyes Católicos", type: "street", color: "#FFFF00", price: 260, houseCost: 150, rents: new Array(22, 110, 330, 800, 975, 1150) },
  { id: 27, name: "Calle Bailén", type: "street", color: "#FFFF00", price: 260, houseCost: 150, rents: new Array(22, 110, 330, 800, 975, 1150) },
  { id: 28, name: "Compañía Aguas", type: "utility", price: 150, rent: 4 },
  { id: 29, name: "Plaza de España", type: "street", color: "#FFFF00", price: 280, houseCost: 150, rents: new Array(24, 120, 360, 850, 1025, 1200) },
  { id: 30, name: "Ve a la Cárcel", type: "gotojail" },
  { id: 31, name: "Puerta del Sol", type: "street", color: "#008000", price: 300, houseCost: 200, rents: new Array(26, 130, 390, 900, 1100, 1275) },
  { id: 32, name: "Calle Alcalá", type: "street", color: "#008000", price: 300, houseCost: 200, rents: new Array(26, 130, 390, 900, 1100, 1275) },
  { id: 33, name: "Caja de Comunidad", type: "chest" },
  { id: 34, name: "Gran Vía", type: "street", color: "#008000", price: 320, houseCost: 200, rents: new Array(28, 150, 450, 1000, 1200, 1400) },
  { id: 35, name: "Estación del Norte", type: "station", price: 200, rent: 25 },
  { id: 36, name: "Suerte", type: "chance" },
  { id: 37, name: "Paseo Castellana", type: "street", color: "#0000FF", price: 350, houseCost: 200, rents: new Array(35, 175, 500, 1100, 1300, 1500) },
  { id: 38, name: "Impuesto de Lujo", type: "tax", amount: 100 },
  { id: 39, name: "Paseo del Prado", type: "street", color: "#0000FF", price: 400, houseCost: 200, rents: new Array(50, 200, 600, 1400, 1700, 2000) }
);

const SUERTE_CARDS = new Array(
  { text: "Avanza hasta la SALIDA y cobra M200.", action: "move", target: 0, collectGo: true },
  { text: "Ve directo a Paseo del Prado.", action: "move", target: 39, collectGo: false },
  { text: "El banco te paga un dividendo de M150.", action: "money", amount: 150 },
  { text: "Multa por exceso de velocidad. Paga M50.", action: "money", amount: -50 },
  { text: "¡Ve a la Cárcel directamente! No cobras M200.", action: "jail" },
  { text: "Avanza hasta Gran Vía. Si pasas por Salida cobra M200.", action: "move", target: 34, collectGo: true }
);

const CAJA_CARDS = new Array(
  { text: "Error bancario a tu favor. Cobra M200.", action: "money", amount: 200 },
  { text: "Factura del médico. Paga M50.", action: "money", amount: -50 },
  { text: "Has ganado el segundo premio de belleza. Cobra M20.", action: "money", amount: 20 },
  { text: "Heredas M100 de un pariente lejano.", action: "money", amount: 100 },
  { text: "Gastos de hospital. Paga M100.", action: "money", amount: -100 },
  { text: "Avanza hasta la SALIDA y cobra M200.", action: "move", target: 0, collectGo: true }
);

const PLAYER_TOKENS = new Array(
  { icon: '🚗', color: '#e74c3c' },
  { icon: '🐒', color: '#2ecc71' },
  { icon: '🐕', color: '#f1c40f' },
  { icon: '🐈', color: '#e67e22' },
  { icon: '🎩', color: '#3498db' },
  { icon: '🚀', color: '#9b59b6' }
);

const TURN_DURATION = 30;
const rooms = {};
const roomTimers = {};function generateRoomCode() {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function sanitizeRoom(room) {
  return {
    code: room.code,
    hostId: room.hostId,
    started: room.started,
    bankMoney: room.bankMoney,
    players: room.players,
    propertiesOwner: room.propertiesOwner,
    houses: room.houses,
    mortgaged: room.mortgaged,
    turnIndex: room.turnIndex,
    hasRolled: room.hasRolled,
    timeLeft: room.timeLeft,
    pendingDebt: room.pendingDebt,
    auction: room.auction ? {
      phase: room.auction.phase,
      timeLeft: room.auction.timeLeft,
      currentTileId: room.auction.queue[0],
      highestBid: room.auction.highestBid,
      highestBidderName: room.auction.highestBidderName,
      leftPlayerName: room.auction.leftPlayerName,
      queueNames: room.auction.queue.map(id => room.board[id].name)
    } : null,
    board: room.board
  };
}

function hasFullColorSet(room, playerId, color) {
  const sameColorTiles = room.board.filter(t => t.type === 'street' && t.color === color);
  return sameColorTiles.every(t => room.propertiesOwner[t.id] === playerId);
}

function calculateRent(room, tile, diceTotal) {
  if (room.mortgaged[tile.id]) return 0;
  const ownerId = room.propertiesOwner[tile.id];
  const owner = room.players.find(p => p.id === ownerId);
  if (!owner) return 0;

  if (tile.type === 'station') {
    const count = owner.properties.filter(id => room.board[id].type === 'station' && !room.mortgaged[id]).length;
    return 25 * Math.pow(2, Math.max(0, count - 1));
  }
  if (tile.type === 'utility') {
    const count = owner.properties.filter(id => room.board[id].type === 'utility' && !room.mortgaged[id]).length;
    return diceTotal * (count === 2 ? 10 : 4);
  }
  if (tile.type === 'street') {
    const houseCount = room.houses[tile.id] || 0;
    if (houseCount > 0) return tile.rents[houseCount];
    const baseRent = tile.rents[0];
    return hasFullColorSet(room, ownerId, tile.color) ? baseRent * 2 : baseRent;
  }
  return 0;
}

function handleSpecialTileCard(room, code, player, tile) {
  if (tile.type !== 'chance' && tile.type !== 'chest') return null;
  const deck = tile.type === 'chance' ? SUERTE_CARDS : CAJA_CARDS;
  const card = deck[Math.floor(Math.random() * deck.length)];
  const cardTitle = tile.type === 'chance' ? 'SUERTE' : 'CAJA DE COMUNIDAD';

  if (card.action === 'money') {
    if (card.amount >= 0) {
      player.money += card.amount;
      room.bankMoney -= card.amount;
    } else {
      const debtAmt = Math.abs(card.amount);
      if (player.money >= debtAmt) {
        player.money -= debtAmt;
        room.bankMoney += debtAmt;
      } else {
        room.pendingDebt = { debtorId: player.id, creditorId: 'BANK', amount: debtAmt, reason: cardTitle };
      }
    }
  } else if (card.action === 'move') {
    if (card.collectGo && card.target < player.position) {
      player.money += 200;
      room.bankMoney -= 200;
    }
    player.position = card.target;
  } else if (card.action === 'jail') {
    player.position = 10;
    player.inJail = true;
  }

  io.to(code).emit('logMsg', `🟨 ${player.name} sacó ${cardTitle}: "${card.text}"`);
  return { title: cardTitle, text: card.text, playerId: player.id };
}

function advanceTurn(code) {
  const room = rooms[code];
  if (!room || room.players.length === 0) return;
  room.turnIndex = (room.turnIndex + 1) % room.players.length;
  room.hasRolled = false;
  room.timeLeft = TURN_DURATION;
  io.to(code).emit('updateGame', sanitizeRoom(room));
}

function startAuctionSequence(code, leftPlayerName, propIds) {
  const room = rooms[code];
  if (!room || propIds.length === 0 || room.players.length === 0) return;
  room.auction = {
    phase: 'warning',
    timeLeft: 30,
    leftPlayerName,
    queue: [...propIds],
    highestBid: 0,
    highestBidderId: null,
    highestBidderName: 'Nadie',
    passedPlayers: new Array()
  };
  io.to(code).emit('updateGame', sanitizeRoom(room));
}

function nextAuctionItem(code) {
  const room = rooms[code];
  if (!room || !room.auction) return;
  if (room.auction.queue.length === 0 || room.players.length === 0) {
    room.auction = null;
    io.to(code).emit('logMsg', '🔨 La subasta ha finalizado.');
    io.to(code).emit('updateGame', sanitizeRoom(room));
    return;
  }
  room.auction.phase = 'bidding';
  room.auction.timeLeft = 25;
  room.auction.highestBid = 0;
  room.auction.highestBidderId = null;
  room.auction.highestBidderName = 'Nadie';
  room.auction.passedPlayers = new Array();
  io.to(code).emit('updateGame', sanitizeRoom(room));
}

function finishCurrentAuctionItem(code) {
  const room = rooms[code];
  if (!room || !room.auction) return;
  const tileId = room.auction.queue.shift();
  const tile = room.board[tileId];

  if (room.auction.highestBidderId && room.auction.highestBid > 0) {
    const winner = room.players.find(p => p.id === room.auction.highestBidderId);
    if (winner && winner.money >= room.auction.highestBid) {
      winner.money -= room.auction.highestBid;
      room.bankMoney += room.auction.highestBid;
      winner.properties.push(tileId);
      room.propertiesOwner[tileId] = winner.id;
      io.to(code).emit('logMsg', `🔨 ¡${winner.name} ganó ${tile.name} por M${room.auction.highestBid}!`);
    }
  } else {
    delete room.propertiesOwner[tileId];
    delete room.houses[tileId];
    delete room.mortgaged[tileId];
    io.to(code).emit('logMsg', `🔄 Nadie pujó por ${tile.name}. Vuelve al tablero libre.`);
  }
  nextAuctionItem(code);
}

function startRoomTimer(code) {
  if (roomTimers[code]) clearInterval(roomTimers[code]);
  roomTimers[code] = setInterval(() => {
    const room = rooms[code];
    if (!room) {
      clearInterval(roomTimers[code]);
      delete roomTimers[code];
      return;
    }
    if (room.auction) {
      room.auction.timeLeft -= 1;
      io.to(code).emit('auctionTick', sanitizeRoom(room).auction);
      if (room.auction.timeLeft <= 0) {
        if (room.auction.phase === 'warning') nextAuctionItem(code);
        else finishCurrentAuctionItem(code);
      }
      return;
    }
    if (room.pendingDebt) return;
    if (room.started && room.players.length > 1) {
      room.timeLeft -= 1;
      io.to(code).emit('timerTick', room.timeLeft);
      if (room.timeLeft <= 0) {
        const skippedPlayer = room.players[room.turnIndex];
        io.to(code).emit('logMsg', `⏰ Se acabó el tiempo de ${skippedPlayer.name}. Turno saltado.`);
        advanceTurn(code);
      }
    }
  }, 1000);
}io.on('connection', (socket) => {
  socket.on('createRoom', (playerName) => {
    const code = generateRoomCode();
    const token = PLAYER_TOKENS[0];
    rooms[code] = {
      code,
      hostId: socket.id,
      started: false,
      bankMoney: 20580 - 1500,
      players: new Array({
        id: socket.id,
        name: playerName || 'Jugador 1',
        money: 1500,
        position: 0,
        properties: new Array(),
        token: token.icon,
        color: token.color,
        inJail: false
      }),
      propertiesOwner: {},
      houses: {},
      mortgaged: {},
      turnIndex: 0,
      hasRolled: false,
      timeLeft: TURN_DURATION,
      pendingDebt: null,
      auction: null,
      board: BOARD_DATA
    };
    socket.join(code);
    startRoomTimer(code);
    socket.emit('roomJoined', { room: sanitizeRoom(rooms[code]), playerId: socket.id });
  });

  socket.on('joinRoom', ({ code, playerName }) => {
    const upperCode = code.toUpperCase();
    const room = rooms[upperCode];
    if (!room) return socket.emit('errorMsg', 'Código de sala inválido.');
    if (room.players.length >= 6) return socket.emit('errorMsg', 'La sala está llena (máx 6 jugadores).');

    const usedIcons = room.players.map(p => p.token);
    const availableToken = PLAYER_TOKENS.find(t => !usedIcons.includes(t.icon)) || PLAYER_TOKENS[room.players.length];

    const newPlayer = {
      id: socket.id,
      name: playerName || `Jugador ${room.players.length + 1}`,
      money: 1500,
      position: 0,
      properties: new Array(),
      token: availableToken.icon,
      color: availableToken.color,
      inJail: false
    };

    room.players.push(newPlayer);
    room.bankMoney -= 1500;
    socket.join(upperCode);
    socket.to(upperCode).emit('newPlayerJoinedVoice', socket.id);
    io.to(upperCode).emit('updateGame', sanitizeRoom(room));
    socket.emit('roomJoined', { room: sanitizeRoom(room), playerId: socket.id });
  });

  socket.on('startGame', (code) => {
    const room = rooms[code];
    if (!room || room.hostId !== socket.id) return;
    if (room.players.length < 2) return;
    room.started = true;
    room.timeLeft = TURN_DURATION;
    io.to(code).emit('logMsg', '🚀 ¡La partida ha comenzado!');
    io.to(code).emit('updateGame', sanitizeRoom(room));
  });

  socket.on('rollDice', (code) => {
    const room = rooms[code];
    if (!room || !room.started || room.pendingDebt || room.auction) return;
    const currentPlayer = room.players[room.turnIndex];
    if (!currentPlayer || currentPlayer.id !== socket.id || room.hasRolled) return;

    room.hasRolled = true;
    const d1 = Math.floor(Math.random() * 6) + 1;
    const d2 = Math.floor(Math.random() * 6) + 1;
    const total = d1 + d2;

    let oldPos = currentPlayer.position;
    let newPos = (oldPos + total) % 40;

    if (newPos < oldPos && newPos !== 30) {
      currentPlayer.money += 200;
      room.bankMoney -= 200;
    }

    currentPlayer.position = newPos;
    const tile = room.board[newPos];
    let actionRequired = null;
    let debtTriggered = false;
    let drawnCard = null;

    if (tile.type === 'chance' || tile.type === 'chest') {
      drawnCard = handleSpecialTileCard(room, code, currentPlayer, tile);
      if (room.pendingDebt) debtTriggered = true;
    } else if (tile.type === 'gotojail') {
      currentPlayer.position = 10;
      currentPlayer.inJail = true;
      io.to(code).emit('logMsg', `🚓 ${currentPlayer.name} fue enviado a la Cárcel.`);
    } else if (tile.type === 'tax') {
      if (currentPlayer.money >= tile.amount) {
        currentPlayer.money -= tile.amount;
        room.bankMoney += tile.amount;
        io.to(code).emit('logMsg', `💸 ${currentPlayer.name} pagó M${tile.amount} de impuestos.`);
      } else {
        debtTriggered = true;
        room.pendingDebt = { debtorId: currentPlayer.id, creditorId: 'BANK', amount: tile.amount, reason: tile.name };
      }
    } else if (new Array('street', 'station', 'utility').includes(tile.type)) {
      const ownerId = room.propertiesOwner[tile.id];
      if (!ownerId && currentPlayer.money >= tile.price) {
        actionRequired = { type: 'canBuy', tile };
      } else if (ownerId && ownerId !== currentPlayer.id) {
        const owner = room.players.find(p => p.id === ownerId);
        const rent = calculateRent(room, tile, total);
        if (owner && rent > 0) {
          if (currentPlayer.money >= rent) {
            currentPlayer.money -= rent;
            owner.money += rent;
            io.to(code).emit('logMsg', `${currentPlayer.name} pagó M${rent} de alquiler a ${owner.name}.`);
          } else {
            debtTriggered = true;
            room.pendingDebt = { debtorId: currentPlayer.id, creditorId: owner.id, amount: rent, reason: `Alquiler en ${tile.name}` };
          }
        }
      }
    }

    io.to(code).emit('diceRolled', { d1, d2, oldPos, newPos, total, player: currentPlayer, tile, actionRequired, drawnCard, room: sanitizeRoom(room) });

    if (!actionRequired && !debtTriggered) {
      const animDelay = (total * 280) + 1800;
      setTimeout(() => {
        if (rooms[code] && !rooms[code].pendingDebt && rooms[code].players[rooms[code].turnIndex]?.id === currentPlayer.id) {
          advanceTurn(code);
        }
      }, animDelay);
    }
  });

  socket.on('buyProperty', ({ code, tileId }) => {
    const room = rooms[code];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    const tile = room.board[tileId];

    if (player && tile && !room.propertiesOwner[tileId] && player.money >= tile.price) {
      player.money -= tile.price;
      room.bankMoney += tile.price;
      player.properties.push(tileId);
      room.propertiesOwner[tileId] = player.id;

      socket.emit('showPropertyCard', tile);
      io.to(code).emit('logMsg', `✅ ${player.name} compró ${tile.name} por M${tile.price}.`);
      advanceTurn(code);
    }
  });

  socket.on('skipBuy', (code) => {
    const room = rooms[code];
    if (!room) return;
    if (room.players[room.turnIndex]?.id === socket.id) {
      io.to(code).emit('logMsg', `${room.players[room.turnIndex].name} decidió no comprar.`);
      advanceTurn(code);
    }
  });

  socket.on('buildHouse', ({ code, tileId }) => {
    const room = rooms[code];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    const tile = room.board[tileId];
    if (!player || !tile || tile.type !== 'street') return;
    if (room.propertiesOwner[tileId] !== player.id) return;
    if (!hasFullColorSet(room, player.id, tile.color)) return;
    if (room.mortgaged[tileId]) return;

    const currentHouses = room.houses[tileId] || 0;
    if (currentHouses >= 5 || player.money < tile.houseCost) return;

    const groupTiles = room.board.filter(t => t.type === 'street' && t.color === tile.color);
    const minHouses = Math.min(...groupTiles.map(t => room.houses[t.id] || 0));
    if (currentHouses > minHouses) return;

    player.money -= tile.houseCost;
    room.bankMoney += tile.houseCost;
    room.houses[tileId] = currentHouses + 1;

    const label = room.houses[tileId] === 5 ? 'un HOTEL 🏨' : `casa #${room.houses[tileId]} 🏠`;
    io.to(code).emit('logMsg', `🏗️ ${player.name} construyó ${label} en ${tile.name}.`);
    io.to(code).emit('updateGame', sanitizeRoom(room));
  });socket.on('mortgageProperty', ({ code, tileId }) => {
    const room = rooms[code];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    const tile = room.board[tileId];
    if (!player || !tile || room.propertiesOwner[tileId] !== player.id) return;
    if (room.mortgaged[tileId] || (room.houses[tileId] || 0) > 0) return;

    const mortgageValue = Math.floor(tile.price / 2);
    room.mortgaged[tileId] = true;
    player.money += mortgageValue;
    room.bankMoney -= mortgageValue;

    io.to(code).emit('logMsg', `🏦 ${player.name} hipotecó ${tile.name} por M${mortgageValue}.`);
    io.to(code).emit('updateGame', sanitizeRoom(room));
  });

  socket.on('unmortgageProperty', ({ code, tileId }) => {
    const room = rooms[code];
    if (!room) return;
    const player = room.players.find(p => p.id === socket.id);
    const tile = room.board[tileId];
    if (!player || !tile || room.propertiesOwner[tileId] !== player.id) return;
    if (!room.mortgaged[tileId]) return;

    const unmortgageCost = Math.ceil((tile.price / 2) * 1.1);
    if (player.money < unmortgageCost) return;

    player.money -= unmortgageCost;
    room.bankMoney += unmortgageCost;
    delete room.mortgaged[tileId];

    io.to(code).emit('logMsg', `🔓 ${player.name} levantó la hipoteca de ${tile.name} por M${unmortgageCost}.`);
    io.to(code).emit('updateGame', sanitizeRoom(room));
  });

  socket.on('payPendingDebt', (code) => {
    const room = rooms[code];
    if (!room || !room.pendingDebt) return;
    const debt = room.pendingDebt;
    const debtor = room.players.find(p => p.id === debt.debtorId);
    if (!debtor || debtor.id !== socket.id || debtor.money < debt.amount) return;

    debtor.money -= debt.amount;
    if (debt.creditorId === 'BANK') {
      room.bankMoney += debt.amount;
    } else {
      const creditor = room.players.find(p => p.id === debt.creditorId);
      if (creditor) creditor.money += debt.amount;
    }

    room.pendingDebt = null;
    io.to(code).emit('logMsg', `✅ ${debtor.name} pagó su deuda de M${debt.amount}.`);
    advanceTurn(code);
  });

  socket.on('surrenderBankruptcy', (code) => {
    const room = rooms[code];
    if (!room || !room.pendingDebt) return;
    const debt = room.pendingDebt;
    const debtorIdx = room.players.findIndex(p => p.id === debt.debtorId);
    if (debtorIdx === -1) return;
    const debtor = room.players[debtorIdx];
    if (debtor.id !== socket.id) return;

    if (debt.creditorId === 'BANK') {
      room.bankMoney += debtor.money;
      debtor.properties.forEach(propId => {
        delete room.propertiesOwner[propId];
        delete room.houses[propId];
        delete room.mortgaged[propId];
      });
    } else {
      const creditor = room.players.find(p => p.id === debt.creditorId);
      if (creditor) {
        creditor.money += debtor.money;
        debtor.properties.forEach(propId => {
          creditor.properties.push(propId);
          room.propertiesOwner[propId] = creditor.id;
          room.mortgaged[propId] = true;
        });
      }
    }

    room.players.splice(debtorIdx, 1);
    room.pendingDebt = null;
    io.to(code).emit('playerEliminated', debtor.id);
    io.to(code).emit('logMsg', `🏳️ ${debtor.name} se rindió y quedó eliminado.`);

    if (room.players.length > 0) {
      room.turnIndex = debtorIdx % room.players.length;
      room.hasRolled = false;
      room.timeLeft = TURN_DURATION;
    }
    io.to(code).emit('updateGame', sanitizeRoom(room));
  });

  socket.on('leaveGameVoluntarily', (code) => {
    const room = rooms[code];
    if (!room) return;
    const idx = room.players.findIndex(p => p.id === socket.id);
    if (idx === -1) return;

    const leavingPlayer = room.players[idx];
    const propsToAuction = [...leavingPlayer.properties];

    room.bankMoney += leavingPlayer.money;
    propsToAuction.forEach(id => {
      delete room.houses[id];
      delete room.mortgaged[id];
    });

    room.players.splice(idx, 1);
    socket.leave(code);
    io.to(code).emit('playerLeftVoice', socket.id);

    if (room.players.length === 0) {
      clearInterval(roomTimers[code]);
      delete rooms[code];
      return;
    }

    room.turnIndex = room.turnIndex % room.players.length;
    io.to(code).emit('logMsg', `🚪 Salió ${leavingPlayer.name}. Su dinero volvió al Banco.`);

    if (propsToAuction.length > 0) {
      startAuctionSequence(code, leavingPlayer.name, propsToAuction);
    } else {
      io.to(code).emit('updateGame', sanitizeRoom(room));
    }
  });

  socket.on('placeAuctionBid', ({ code, amount }) => {
    const room = rooms[code];
    if (!room || !room.auction || room.auction.phase !== 'bidding') return;
    const player = room.players.find(p => p.id === socket.id);
    const bid = Number(amount);
    if (!player || isNaN(bid)) return;

    if (bid > room.auction.highestBid && player.money >= bid) {
      room.auction.highestBid = bid;
      room.auction.highestBidderId = player.id;
      room.auction.highestBidderName = player.name;
      room.auction.timeLeft = Math.max(room.auction.timeLeft, 10);
      io.to(code).emit('updateGame', sanitizeRoom(room));
    }
  });

  socket.on('passAuctionBid', (code) => {
    const room = rooms[code];
    if (!room || !room.auction || room.auction.phase !== 'bidding') return;
    if (!room.auction.passedPlayers.includes(socket.id)) {
      room.auction.passedPlayers.push(socket.id);
    }
    if (room.auction.passedPlayers.length >= room.players.length) {
      finishCurrentAuctionItem(code);
    }
  });

  socket.on('sendTradeOffer', (data) => {
    const { code, toPlayerId, offerMoney, offerProps, requestMoney, requestProps } = data;
    const room = rooms[code];
    if (!room) return;
    const fromPlayer = room.players.find(p => p.id === socket.id);
    if (!fromPlayer) return;

    io.to(toPlayerId).emit('receiveTradeOffer', {
      fromPlayerId: fromPlayer.id,
      fromPlayerName: fromPlayer.name,
      offerMoney: Number(offerMoney) || 0,
      offerProps: offerProps || new Array(),
      requestMoney: Number(requestMoney) || 0,
      requestProps: requestProps || new Array()
    });
  });

  socket.on('respondTradeOffer', ({ code, accept, trade }) => {
    const room = rooms[code];
    if (!room) return;
    const fromPlayer = room.players.find(p => p.id === trade.fromPlayerId);
    const toPlayer = room.players.find(p => p.id === socket.id);
    if (!fromPlayer || !toPlayer) return;

    if (!accept) {
      io.to(fromPlayer.id).emit('logMsg', `❌ ${toPlayer.name} rechazó tu oferta.`);
      return;
    }
    if (fromPlayer.money < trade.offerMoney || toPlayer.money < trade.requestMoney) {
      return io.to(code).emit('logMsg', '⚠️ El intercambio falló por falta de fondos.');
    }

    fromPlayer.money = fromPlayer.money - trade.offerMoney + trade.requestMoney;
    toPlayer.money = toPlayer.money - trade.requestMoney + trade.offerMoney;

    trade.offerProps.forEach(propId => {
      fromPlayer.properties = fromPlayer.properties.filter(id => id !== propId);
      toPlayer.properties.push(propId);
      room.propertiesOwner[propId] = toPlayer.id;
    });
    trade.requestProps.forEach(propId => {
      toPlayer.properties = toPlayer.properties.filter(id => id !== propId);
      fromPlayer.properties.push(propId);
      room.propertiesOwner[propId] = fromPlayer.id;
    });

    io.to(code).emit('logMsg', `🤝 ¡Trato cerrado entre ${fromPlayer.name} y ${toPlayer.name}!`);
    io.to(code).emit('updateGame', sanitizeRoom(room));
  });

  socket.on('voiceSignal', ({ to, signal }) => {
    io.to(to).emit('voiceSignal', { from: socket.id, signal });
  });

  socket.on('disconnect', () => {
    for (const code in rooms) {
      const room = rooms[code];
      const idx = room.players.findIndex(p => p.id === socket.id);
      if (idx !== -1) {
        const leftPlayer = room.players[idx];
        const propsToAuction = [...leftPlayer.properties];
        room.bankMoney += leftPlayer.money;
        room.players.splice(idx, 1);
        io.to(code).emit('playerLeftVoice', socket.id);
        if (room.players.length === 0) {
          clearInterval(roomTimers[code]);
          delete rooms[code];
        } else {
          room.turnIndex = room.turnIndex % room.players.length;
          if (propsToAuction.length > 0) {
            startAuctionSequence(code, leftPlayer.name, propsToAuction);
          } else {
            io.to(code).emit('updateGame', sanitizeRoom(room));
          }
        }
        break;
      }
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`Servidor Monopoly corriendo en http://localhost:${PORT}`);
});