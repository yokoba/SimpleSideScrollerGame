"use strict";

// キャンバスのサイズを決める時にウィンドウサイズぴったりにならないようにマージンをいれる
const marginHeight = 500;
const marginWidth = 40;

// キャンバスサイズを決める
const $canvas = $("#canvas");
let window_height = window.innerHeight - marginHeight;
let window_width = window.innerWidth - marginWidth;

// ゲームの設定
const jumpSize = 80;

// 難易度
const blockSize = 3;

// ブロックの情報
let blocks = [];
let blockIdx = 0;
let blockMoveSpeed = 20; // ブロックの移動するピクセル数
let blockUpdateInterval = 500; // ブロックの移動する間隔/秒
let blockInterval = 200; // ブロック通しの間隔
let blockWidth = 50; // ブロックの横幅
let startOffset = Number(window_width - (window_width / 4).toFixed(0));
let blockMaxX = startOffset;

// score
let score = 0;
let startTime = 0;

const resizeWindow = () => {
  window_height = window.innerHeight - marginHeight;
  window_width = window.innerWidth - marginWidth;
  $canvas.prop({ width: window_width, height: window_height });
  console.log(`width: ${window_width}, height: ${window_height}`);
};
window.onresize = resizeWindow;
resizeWindow();

let character = {
  x: 100,
  y: $canvas.height() / 2,
  radius: 10,
  name: "character",
  layer: true,
  strokeStyle: "black",
  fillStyle: "black",
  isJump: false,
};

const createBlock = (template) => {
  const topSize = Math.floor(Math.random() * blockSize);
  const bottomSize = blockSize - topSize;

  const top = {
    ...template,
    name: "blockTop" + String(blockIdx),
    group: [String(blockIdx)],
    y: 0,
    height: topSize * 100,
    mouseover: function (layer) {
      console.log(`${layer.name}: ${layer.x}`);
    },
  };

  const bottom = {
    ...template,
    name: "blockBottom" + String(blockIdx),
    group: ["block" + String(blockIdx)],
    y: window_height - bottomSize * 100,
    height: bottomSize * 100,
    mouseover: function (layer) {
      console.log(`${layer.name}: ${layer.x}`);
    },
  };

  return { top, bottom };
};

const clearBlocks = () => {
  let newBlocks = [];

  blocks.forEach((block) => {
    if (block.top.x < 0) {
      $canvas.removeLayer(block.top.name);
      $canvas.removeLayer(block.bottom.name);
    } else {
      newBlocks.push(block);
      blockMaxX = block.top.x + blockInterval;
    }
  });

  blocks = newBlocks;
};

const createBlocks = (x) => {
  const template = {
    layer: true,
    fromCenter: false,
    strokeStyle: "black",
    fillStyle: "black",
    width: blockWidth,
    x: blockMaxX,
  };

  let block = createBlock(template);
  blocks.push({ top: block.top, bottom: block.bottom });
  blockMaxX += blockInterval;
  blockIdx++;
};

for (let i = 0; i < 5; i++) {
  createBlocks();
}

const drawBlock = (block) => {
  if ($canvas.getLayer(block.name)) {
    $canvas.setLayer(block.name, { x: block.x });
  } else {
    $canvas.drawRect(block);
  }
};

const drawBlocks = () => {
  clearBlocks();
  createBlocks();
  blocks.forEach((block) => {
    drawBlock(block.top);
    drawBlock(block.bottom);
    block.top.x -= blockMoveSpeed;
    block.bottom.x -= blockMoveSpeed;
    $canvas.drawLayers();
  });
};

const drawCharacter = () => {
  if ($canvas.getLayer("character")) {
    $canvas.setLayer("character", { y: character.y }).drawLayers();
  } else {
    $canvas.drawArc(character);
  }
};

const main = () => {
  drawCharacter();
  if (character.isJump && character.y > character.afterY) {
    character.y -= 1;
  } else {
    character.isJump = false;
    character.y += 1;
  }

  $("#info").text(`score: ${Math.floor(new Date() - startTime)} `);
};

const gameStart = () => {
  startTime = new Date();
  setInterval(main, 1);
  setInterval(drawBlocks, blockUpdateInterval);
};

(() => {
  const startMsg = "Start";

  const textX = $canvas.width() / 2;
  const textY = $canvas.height() / 2;

  $canvas.drawText({
    layer: true,
    name: "startText",
    group: ["start"],
    fillStyle: "#9cf",
    strokeStyle: "#25a",
    strokeWidth: 2,
    x: textX,
    y: textY,
    fontSize: 48,
    fontFamily: "Verdana, sans-serif",
    text: startMsg,
    visible: true,
    fromCenter: true,
  });

  const textHeight = $("canvas").measureText("startText").height + 10;
  const textWidth = $("canvas").measureText("startText").width + 10;

  console.log(textHeight, textWidth);

  $canvas.drawRect({
    layer: true,
    name: "startBox",
    group: ["start"],
    fillStyle: "#9cf",
    strokeStyle: "#25a",
    strokeWidth: 2,
    opacity: 0.4,
    x: textX + 1,
    y: textY - 3,
    width: textWidth,
    height: textHeight,
    visible: true,
    fromCenter: true,
    click: (layer) => {
      console.log(layer);
      hiddenLayer(layer.group[0]);
      gameStart();
    },
  });

  const hiddenLayer = (name) => {
    const allLayer = $canvas.getLayers();

    allLayer.forEach((layer) => {
      if (layer.group && name === layer.group[0]) {
        $canvas.setLayer(layer.name, {
          visible: false,
        });
      }
    });
    $canvas.drawLayers();
  };

  $("#canvas").attr("tabindex", "0");
  $("#canvas").focus();
  $("#canvas").on("keydown", (e) => {
    if (e.code === "Space") {
      if (!character.isJump) {
        character.afterY = character.y - jumpSize;
        character.isJump = true;
        console.log(character.y);
      }
    }
  });
})();
