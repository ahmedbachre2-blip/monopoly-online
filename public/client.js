const socket = io();
let currentRoom = null;
let myId = null;
let joinActionType = null;
let pendingRoomCode = '';
let pendingBuyTile = null;
let tradeTargetPlayer = null;
let incomingTradeData = null;
let isAnimatingMove = false;
let visualPositions = {};

document.getElementById('btn-go-create').onclick = () => {
  joinActionType = 'create';
  document.getElementById('name-screen-subtitle').innerText = 'Creando partida nueva';
  document.getElementById('lobby-screen').classList.add('hidden');
  document.getElementById('name-screen').classList.remove('hidden');
};

document.getElementById('btn-go-join').onclick = () => {
  const code = document.getElementById('room-code-input').value.trim().toUpperCase();
  if (code.length !== 6) {
    document.getElementById('error-msg').innerText = 'El código debe tener 6 caracteres.';
    return;
  }
  joinActionType = 'join';
  pendingRoomCode = code;
  document.getElementById('name-screen-subtitle').innerText = `Entrando a la sala: ${code}`;
  document.getElementById('lobby-screen').classList.add('hidden');
  document.getElementById('name-screen').classList.remove('hidden');
};

document.getElementById('btn-back-lobby').onclick = () => {
  document.getElementById('name-screen').classList.add('hidden');
  document.getElementById('lobby-screen').classList.remove('hidden');
};

document.getElementById('btn-confirm-enter').onclick = () => {
  const name = document.getElementById('player-name').value.trim();
  if (!name) {
    document.getElementById('name-error-msg').innerText = 'Por favor escribe tu nombre.';
    return;
  }
  if (joinActionType === 'create') {
    socket.emit('createRoom', name);
  } else {
    socket.emit('joinRoom', { code: pendingRoomCode, playerName: name });
  }
};

document.getElementById('btn-start-game').onclick = () => {
  socket.emit('startGame', currentRoom.code);
};

socket.on('errorMsg', (msg) => {
  document.getElementById('name-screen').classList.add('hidden');
  document.getElementById('lobby-screen').classList.remove('hidden');
  document.getElementById('error-msg').innerText = msg;
});

socket.on('roomJoined', ({ room, playerId }) => {
  currentRoom = room;
  myId = playerId;
  room.players.forEach(p => { visualPositions[p.id] = p.position; });
  document.getElementById('lobby-screen').classList.add('hidden');
  document.getElementById('name-screen').classList.add('hidden');
  document.getElementById('game-screen').classList.remove('hidden');
  document.getElementById('display-room-code').innerText = room.code;
  renderBoard(room);
  updateUI(room);
});socket.on('updateGame', (room) => {
  currentRoom = room;
  if (!isAnimatingMove) {
    room.players.forEach(p => { visualPositions[p.id] = p.position; });
    renderBoard(room);
  }
  updateUI(room);
});

socket.on('logMsg', (msg) => {
  document.getElementById('game-log').innerText = msg;
});

socket.on('timerTick', (timeLeft) => {
  const pct = Math.max(0, (timeLeft / 30) * 100);
  document.getElementById('turn-timer-fill').style.width = `${pct}%`;
  document.getElementById('turn-timer-text').innerText = `⏳ ${timeLeft}s`;
});

document.getElementById('btn-roll').onclick = () => {
  document.getElementById('btn-roll').classList.add('hidden');
  socket.emit('rollDice', currentRoom.code);
};

socket.on('diceRolled', ({ d1, d2, oldPos, total, player, tile, actionRequired, drawnCard, room }) => {
  currentRoom = room;
  document.getElementById('dice-display').innerText = `🎲 ${d1} + 🎲 ${d2} = ${total}`;

  isAnimatingMove = true;
  let step = 0;
  let currentStepPos = oldPos;

  const moveInterval = setInterval(() => {
    step += 1;
    currentStepPos = (currentStepPos + 1) % 40;
    visualPositions[player.id] = currentStepPos;
    renderBoard(currentRoom);

    if (step >= total) {
      clearInterval(moveInterval);
      isAnimatingMove = false;
      visualPositions[player.id] = player.position;
      renderBoard(currentRoom);
      updateUI(currentRoom);

      if (drawnCard && drawnCard.playerId === myId) {
        document.getElementById('event-card-type').innerText = drawnCard.title;
        document.getElementById('event-card-text').innerText = drawnCard.text;
        document.getElementById('event-card-modal').classList.remove('hidden');
      }

      if (player.id === myId && actionRequired && actionRequired.type === 'canBuy') {
        pendingBuyTile = actionRequired.tile;
        const buyBtn = document.getElementById('btn-buy');
        buyBtn.innerText = `COMPRAR (${tile.name} - M${tile.price})`;
        buyBtn.classList.remove('hidden');
        document.getElementById('btn-skip').classList.remove('hidden');
      }
    }
  }, 260);
});

document.getElementById('btn-close-event-card').onclick = () => {
  document.getElementById('event-card-modal').classList.add('hidden');
};

document.getElementById('btn-buy').onclick = () => {
  if (!pendingBuyTile) return;
  socket.emit('buyProperty', { code: currentRoom.code, tileId: pendingBuyTile.id });
  hideBuyControls();
};

document.getElementById('btn-skip').onclick = () => {
  socket.emit('skipBuy', currentRoom.code);
  hideBuyControls();
};

function hideBuyControls() {
  document.getElementById('btn-buy').classList.add('hidden');
  document.getElementById('btn-skip').classList.add('hidden');
  pendingBuyTile = null;
}

socket.on('showPropertyCard', (tile) => {
  const modal = document.getElementById('card-modal');
  const header = document.getElementById('card-header');
  header.style.backgroundColor = tile.color || '#222';
  header.innerText = tile.type === 'station' ? 'ESTACIÓN DE FERROCARRIL' : 'TÍTULO DE PROPIEDAD';
  document.getElementById('card-title').innerText = tile.name;
  document.getElementById('card-price').innerText = `M${tile.price}`;
  document.getElementById('card-rent').innerText = `M${tile.rents ? tile.rents : tile.rent}`;
  modal.classList.remove('hidden');
});

document.getElementById('btn-close-modal').onclick = () => {
  document.getElementById('card-modal').classList.add('hidden');
};document.getElementById('btn-pay-debt').onclick = () => {
  socket.emit('payPendingDebt', currentRoom.code);
};

document.getElementById('btn-surrender').onclick = () => {
  if (confirm('¿Seguro que deseas rendirte y quedar eliminado?')) {
    socket.emit('surrenderBankruptcy', currentRoom.code);
  }
};

socket.on('playerEliminated', (elimId) => {
  if (elimId === myId) {
    alert('Has quedado en bancarrota y saliste de la partida.');
    location.reload();
  }
});

document.getElementById('btn-leave-game').onclick = () => {
  if (confirm('¿Salir de la partida? Tu dinero irá al Banco y tus propiedades se subastarán.')) {
    socket.emit('leaveGameVoluntarily', currentRoom.code);
    location.reload();
  }
};

document.getElementById('btn-place-bid').onclick = () => {
  const amount = Number(document.getElementById('auc-bid-input').value);
  if (amount > 0) {
    socket.emit('placeAuctionBid', { code: currentRoom.code, amount });
    document.getElementById('auc-bid-input').value = '';
  }
};

document.getElementById('btn-pass-bid').onclick = () => {
  socket.emit('passAuctionBid', currentRoom.code);
};

socket.on('auctionTick', (auction) => {
  if (!auction) return;
  document.getElementById('auction-timer-badge').innerText = `⏳ ${auction.timeLeft}s`;
});

function openTradeModal(targetPlayer) {
  if (targetPlayer.id === myId) return;
  tradeTargetPlayer = targetPlayer;
  const me = currentRoom.players.find(p => p.id === myId);

  document.getElementById('trade-target-name').innerText = `${targetPlayer.token} ${targetPlayer.name}`;
  document.getElementById('offer-money').value = 0;
  document.getElementById('request-money').value = 0;

  document.getElementById('offer-props-list').innerHTML = me.properties.map(id => {
    const t = currentRoom.board[id];
    return `<label><input type="checkbox" value="${id}"> ${t.name}</label>`;
  }).join('') || '<small>Sin propiedades</small>';

  document.getElementById('request-props-list').innerHTML = targetPlayer.properties.map(id => {
    const t = currentRoom.board[id];
    return `<label><input type="checkbox" value="${id}"> ${t.name}</label>`;
  }).join('') || '<small>Sin propiedades</small>';

  document.getElementById('trade-modal').classList.remove('hidden');
}

document.getElementById('btn-cancel-trade').onclick = () => {
  document.getElementById('trade-modal').classList.add('hidden');
};

document.getElementById('btn-send-trade').onclick = () => {
  const offerMoney = Number(document.getElementById('offer-money').value) || 0;
  const requestMoney = Number(document.getElementById('request-money').value) || 0;
  const offerProps = Array.from(document.querySelectorAll('#offer-props-list input:checked')).map(el => Number(el.value));
  const requestProps = Array.from(document.querySelectorAll('#request-props-list input:checked')).map(el => Number(el.value));

  socket.emit('sendTradeOffer', {
    code: currentRoom.code,
    toPlayerId: tradeTargetPlayer.id,
    offerMoney,
    offerProps,
    requestMoney,
    requestProps
  });

  document.getElementById('trade-modal').classList.add('hidden');
  document.getElementById('game-log').innerText = `📨 Oferta enviada a ${tradeTargetPlayer.name}...`;
};

socket.on('receiveTradeOffer', (trade) => {
  incomingTradeData = trade;
  document.getElementById('inc-from-name').innerText = trade.fromPlayerName;
  const offeredNames = trade.offerProps.map(id => currentRoom.board[id].name).join(', ') || 'Ninguna';
  const reqNames = trade.requestProps.map(id => currentRoom.board[id].name).join(', ') || 'Ninguna';

  document.getElementById('inc-trade-details').innerHTML = `
    <p><strong>Te ofrece:</strong> M${trade.offerMoney} + [${offeredNames}]</p>
    <p><strong>Te pide:</strong> M${trade.requestMoney} + [${reqNames}]</p>
  `;
  document.getElementById('incoming-trade-modal').classList.remove('hidden');
});

document.getElementById('btn-accept-trade').onclick = () => {
  socket.emit('respondTradeOffer', { code: currentRoom.code, accept: true, trade: incomingTradeData });
  document.getElementById('incoming-trade-modal').classList.add('hidden');
};

document.getElementById('btn-reject-trade').onclick = () => {
  socket.emit('respondTradeOffer', { code: currentRoom.code, accept: false, trade: incomingTradeData });
  document.getElementById('incoming-trade-modal').classList.add('hidden');
};let voiceMode = 'off';
let localStream = null;
const peers = {};
const rtcConfig = { iceServers: new Array({ urls: 'stun:://google.com' }) };

const voiceBtn = document.getElementById('btn-voice-menu');
const voiceDropdown = document.getElementById('voice-dropdown');

voiceBtn.onclick = () => voiceDropdown.classList.toggle('hidden');

document.querySelectorAll('#voice-dropdown button').forEach(btn => {
  btn.onclick = async () => {
    const mode = btn.getAttribute('data-mode');
    voiceDropdown.classList.add('hidden');
    await setVoiceMode(mode);
  };
});

async function setVoiceMode(mode) {
  voiceMode = mode;
  if (mode === 'off') {
    voiceBtn.innerText = '🔇 Voz';
    if (localStream) {
      localStream.getTracks().forEach(t => t.stop());
      localStream = null;
    }
    Object.values(peers).forEach(pc => pc.close());
    for (let k in peers) delete peers[k];
    document.querySelectorAll('audio.remote-audio').forEach(a => a.remove());
    return;
  }

  try {
    if (!localStream && mode === 'talk') {
      localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
    }
    if (localStream) {
      localStream.getAudioTracks().forEach(track => {
        track.enabled = (mode === 'talk');
      });
    }
    voiceBtn.innerText = mode === 'talk' ? '🔊 Hablando' : '🎧 Escuchando';

    currentRoom.players.forEach(p => {
      if (p.id !== myId && !peers[p.id]) {
        createPeerConnection(p.id, true);
      }
    });
  } catch (err) {
    alert('No se pudo activar el micrófono. Abre el juego con HTTPS o da permiso de micrófono.');
    voiceBtn.innerText = '🔇 Error Mic';
  }
}

function createPeerConnection(targetId, isInitiator) {
  const pc = new RTCPeerConnection(rtcConfig);
  peers[targetId] = pc;

  if (localStream) {
    localStream.getTracks().forEach(track => pc.addTrack(track, localStream));
  }

  pc.onicecandidate = (e) => {
    if (e.candidate) {
      socket.emit('voiceSignal', { to: targetId, signal: { candidate: e.candidate } });
    }
  };

  pc.ontrack = (e) => {
    let audioEl = document.getElementById(`audio-${targetId}`);
    if (!audioEl) {
      audioEl = document.createElement('audio');
      audioEl.id = `audio-${targetId}`;
      audioEl.className = 'remote-audio';
      audioEl.autoplay = true;
      document.body.appendChild(audioEl);
    }
    audioEl.srcObject = e.streams;
    audioEl.muted = (voiceMode === 'off');
  };

  if (isInitiator) {
    pc.createOffer().then(offer => {
      pc.setLocalDescription(offer);
      socket.emit('voiceSignal', { to: targetId, signal: { sdp: offer } });
    });
  }
  return pc;
}

socket.on('newPlayerJoinedVoice', (newId) => {
  if (voiceMode !== 'off') createPeerConnection(newId, true);
});

socket.on('voiceSignal', async ({ from, signal }) => {
  if (voiceMode === 'off') return;
  let pc = peers[from] || createPeerConnection(from, false);

  if (signal.sdp) {
    await pc.setRemoteDescription(new RTCSessionDescription(signal.sdp));
    if (signal.sdp.type === 'offer') {
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit('voiceSignal', { to: from, signal: { sdp: answer } });
    }
  } else if (signal.candidate) {
    await pc.addIceCandidate(new RTCIceCandidate(signal.candidate));
  }
});

socket.on('playerLeftVoice', (id) => {
  if (peers[id]) {
    peers[id].close();
    delete peers[id];
  }
  const el = document.getElementById(`audio-${id}`);
  if (el) el.remove();
});function getGridPosition(index) {
  if (index <= 10) return { row: 11, col: 11 - index };
  if (index <= 20) return { row: 11 - (index - 10), col: 1 };
  if (index <= 30) return { row: 1, col: index - 20 + 1 };
  return { row: index - 30 + 1, col: 11 };
}

function renderBoard(room) {
  const boardEl = document.getElementById('board');
  document.querySelectorAll('.tile').forEach(el => el.remove());

  room.board.forEach((tile, idx) => {
    const pos = getGridPosition(idx);
    const tileEl = document.createElement('div');
    const isMort = room.mortgaged && room.mortgaged[idx];
    tileEl.className = `tile ${isMort ? 'mortgaged-tile' : ''}`;
    tileEl.style.gridRow = pos.row;
    tileEl.style.gridColumn = pos.col;

    const houseCount = (room.houses && room.houses[idx]) || 0;
    let houseIcons = '';
    if (houseCount === 5) houseIcons = '🏨';
    else if (houseCount > 0) houseIcons = '🏠'.repeat(houseCount);

    let colorBar = '';
    if (tile.color) {
      colorBar = `<div class="tile-color" style="background:${tile.color}">${houseIcons}</div>`;
    } else if (tile.type === 'station') {
      colorBar = `<div class="tile-color" style="background:#333; color:white;">🚂</div>`;
    }

    const priceTag = tile.price ? `<div class="tile-price">${isMort ? 'HIPOT.' : 'M' + tile.price}</div>` : '';

    const playersHere = room.players.filter(p => (visualPositions[p.id] ?? p.position) === idx);
    const tokensHtml = playersHere.map(p =>
      `<div class="player-token-badge" style="background:${p.color}" title="${p.name}">${p.token}</div>`
    ).join('');

    tileEl.innerHTML = `
      ${colorBar}
      <div class="tile-name">${tile.name}</div>
      <div class="tokens-container">${tokensHtml}</div>
      ${priceTag}
    `;
    boardEl.appendChild(tileEl);
  });
}

function hasFullColorClient(room, playerId, color) {
  const sameColor = room.board.filter(t => t.type === 'street' && t.color === color);
  return sameColor.every(t => room.propertiesOwner[t.id] === playerId);
}

function updateUI(room) {
  const me = room.players.find(p => p.id === myId);
  const currentTurnPlayer = room.players[room.turnIndex];

  if (me) {
    document.getElementById('my-money').innerText = `M${me.money}`;
    const listEl = document.getElementById('my-properties-list');

    listEl.innerHTML = me.properties.map(id => {
      const t = room.board[id];
      const borderCol = t.color || '#222';
      const isMort = room.mortgaged && room.mortgaged[id];
      const hCount = (room.houses && room.houses[id]) || 0;
      const hLabel = hCount === 5 ? '🏨 Hotel' : (hCount > 0 ? `🏠 x${hCount}` : '');

      let actionsHtml = '';
      if (isMort) {
        const unmortCost = Math.ceil((t.price / 2) * 1.1);
        actionsHtml += `<button class="btn-blue" onclick="unmortgageProp(${id})">🔓 Recuperar (M${unmortCost})</button>`;
      } else {
        if (t.type === 'street' && hasFullColorClient(room, myId, t.color) && hCount < 5) {
          const buildTxt = hCount === 4 ? `🏨 Hotel (M${t.houseCost})` : `🏠 Casa (M${t.houseCost})`;
          actionsHtml += `<button class="btn-green" style="padding:4px 8px; font-size:0.75rem;" onclick="buildHouseProp(${id})">${buildTxt}</button>`;
        }
        if (hCount === 0) {
          const mortVal = Math.floor(t.price / 2);
          actionsHtml += `<button class="btn-orange" onclick="mortgageProp(${id})">🏦 Hipotecar (+M${mortVal})</button>`;
        }
      }

      return `
        <div class="prop-item ${isMort ? 'is-mortgaged' : ''}" style="border-left-color:${borderCol}">
          <div>${t.name} ${hLabel} ${isMort ? '(HIPOTECADA)' : ''}</div>
          <div class="prop-actions">${actionsHtml}</div>
        </div>
      `;
    }).join('') || '<small>Aún no tienes propiedades.</small>';
  }

  document.getElementById('bank-money').innerText = `M${room.bankMoney}`;

  const playersBar = document.getElementById('players-list-bar');
  playersBar.innerHTML = '';
  room.players.forEach((p, idx) => {
    const chip = document.createElement('div');
    chip.className = `player-chip ${room.started && idx === room.turnIndex ? 'active-turn' : ''}`;
    chip.style.borderColor = p.color;
    chip.innerHTML = `<span>${p.token}</span> <span>${p.name}</span> <span>(M${p.money})</span>`;
    if (p.id !== myId) {
      chip.onclick = () => openTradeModal(p);
    }
    playersBar.appendChild(chip);
  });

  const startBtn = document.getElementById('btn-start-game');
  const rollBtn = document.getElementById('btn-roll');

  if (!room.started) {
    rollBtn.classList.add('hidden');
    if (room.players.length < 2) {
      document.getElementById('turn-indicator').innerText = '⏳ Esperando más jugadores (mín. 2)...';
      startBtn.classList.add('hidden');
    } else if (room.hostId === myId) {
      document.getElementById('turn-indicator').innerText = '✅ Listos para empezar';
      startBtn.classList.remove('hidden');
    } else {
      document.getElementById('turn-indicator').innerText = '⏳ Esperando que el anfitrión inicie...';
      startBtn.classList.add('hidden');
    }
  } else {
    startBtn.classList.add('hidden');
    if (currentTurnPlayer) {
      document.getElementById('turn-indicator').innerText = `Turno de: ${currentTurnPlayer.token} ${currentTurnPlayer.name}`;
    }
    if (currentTurnPlayer && currentTurnPlayer.id === myId && !room.hasRolled && !room.pendingDebt && !room.auction) {
      rollBtn.classList.remove('hidden');
    } else {
      rollBtn.classList.add('hidden');
    }
  }

  if (!currentTurnPlayer || currentTurnPlayer.id !== myId) {
    hideBuyControls();
  }

  const debtModal = document.getElementById('debt-modal');
  if (room.pendingDebt && room.pendingDebt.debtorId === myId && me) {
    debtModal.classList.remove('hidden');
    document.getElementById('debt-info').innerText = `Debes M${room.pendingDebt.amount} (${room.pendingDebt.reason}). Tu saldo: M${me.money}`;

    const payBtn = document.getElementById('btn-pay-debt');
    if (me.money >= room.pendingDebt.amount) {
      payBtn.classList.remove('hidden');
      payBtn.innerText = `PAGAR DEUDA (M${room.pendingDebt.amount})`;
    } else {
      payBtn.classList.add('hidden');
    }

    const unmortProps = me.properties.filter(id => !(room.mortgaged && room.mortgaged[id]) && !((room.houses && room.houses[id]) > 0));
    document.getElementById('debt-props-list').innerHTML = unmortProps.map(id => {
      const t = room.board[id];
      const val = Math.floor(t.price / 2);
      return `<div style="display:flex; justify-content:space-between; align-items:center; padding:4px; border-bottom:1px solid #ddd;">
        <span>${t.name}</span>
        <button class="btn-orange" onclick="mortgageProp(${id})">Hipotecar (+M${val})</button>
      </div>`;
    }).join('') || '<small>No tienes más propiedades para hipotecar.</small>';
  } else {
    debtModal.classList.add('hidden');
  }

  const aucModal = document.getElementById('auction-modal');
  if (room.auction) {
    aucModal.classList.remove('hidden');
    document.getElementById('auction-timer-badge').innerText = `⏳ ${room.auction.timeLeft}s`;
    if (room.auction.phase === 'warning') {
      document.getElementById('auction-title').innerText = `🚪 Salió ${room.auction.leftPlayerName}`;
      document.getElementById('auction-subtitle').innerText = `Propiedades a subastar: [${room.auction.queueNames.join(', ')}]. La subasta comienza en breve...`;
      document.getElementById('auction-active-box').classList.add('hidden');
    } else {
      const tile = room.board[room.auction.currentTileId];
      document.getElementById('auction-title').innerText = `🔨 SUBASTA EN CURSO`;
      document.getElementById('auction-subtitle').innerText = `Propiedades restantes: ${room.auction.queueNames.length}`;
      document.getElementById('auction-active-box').classList.remove('hidden');
      document.getElementById('auc-prop-name').innerText = tile.name;
      document.getElementById('auc-prop-orig').innerText = `M${tile.price}`;
      document.getElementById('auc-highest-bid').innerText = `M${room.auction.highestBid}`;
      document.getElementById('auc-highest-bidder').innerText = room.auction.highestBidderName;
    }
  } else {
    aucModal.classList.add('hidden');
  }
}

window.buildHouseProp = (tileId) => socket.emit('buildHouse', { code: currentRoom.code, tileId });
window.mortgageProp = (tileId) => socket.emit('mortgageProperty', { code: currentRoom.code, tileId });
window.unmortgageProp = (tileId) => socket.emit('unmortgageProperty', { code: currentRoom.code, tileId });