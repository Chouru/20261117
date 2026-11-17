let bgImage; // 儲存背景圖片
let characterSprite; // 儲存角色一的精靈圖
let walkSprite; // 儲存角色一的走路精靈圖
let magicSprite; // 儲存角色一的施法精靈圖
let magicEffectSprite; // 儲存角色一的魔法特效精靈圖

let characterX; // 儲存角色一目前的水平中心位置
let cameraX = 0; // 記錄背景與鏡頭的偏移量
let isWalking = false; // 記錄角色是否已切換為走路動畫
let facingDirection = 1; // 記錄角色朝向（1 為右，-1 為左）
let isCasting = false; // 記錄角色是否正在播放施法動畫
let magicStartFrame = 0; // 記錄施法動畫開始時的畫面計數
let magicDirection = 1; // 記錄施法時鎖定的方向
let spaceIsDown = false; // 記錄空白鍵是否已按住以避免重複觸發
let activeEffects = []; // 儲存目前畫面上飛行中的魔法特效

const frameCountInSprite = 10; // 設定精靈圖包含的影格數
const frameWidth = 139.5; // 設定每個影格的寬度
const frameHeight = 196; // 設定每個影格的高度
const walkFrameCount = 9; // 設定走路精靈圖包含的影格數
const walkFrameWidth = 1246 / walkFrameCount; // 計算走路動畫每格的寬度
const walkFrameHeight = 198; // 設定走路動畫每格的高度
const magicFrameCount = 4; // 設定施法精靈圖包含的影格數
const magicFrameWidth = 1039 / magicFrameCount; // 計算施法動畫每格的寬度
const magicFrameHeight = 146; // 設定施法動畫每格的高度
const effectFrameCount = 5; // 設定魔法特效精靈圖包含的影格數
const effectFrameWidth = 740 / effectFrameCount; // 計算魔法特效每格的寬度
const effectFrameHeight = 19; // 設定魔法特效每格的高度
const framesPerStep = 8; // 設定動畫每隔幾個畫面更新一格

function preload() { // 在畫布建立前載入圖片
  bgImage = loadImage("bg/3.png"); // 載入指定背景圖片[cite: 2]
  characterSprite = loadImage("1/stop/stop.png"); // 載入角色一的十格精靈圖
  walkSprite = loadImage("1/walk/walk.png"); // 載入角色一的九格走路精靈圖
  magicSprite = loadImage("1/magic/magic.png"); // 載入角色一的四格施法精靈圖
  magicEffectSprite = loadImage("1/magic_effect/magic_effect.png"); // 載入五格魔法特效精靈圖
} // 結束圖片載入函式

function setup() { // 初始化畫布與繪圖模式
  createCanvas(windowWidth, windowHeight); // 建立符合視窗尺寸的畫布
  imageMode(CENTER); // 讓角色座標代表影格的中心點
  characterX = width / 2; // 將角色初始位置設在畫布正中央
  cameraX = bgImage.width; // 讓鏡頭初始對齊中間那張背景圖
  frameRate(60); // 將動畫更新速率設定為每秒六十格
} // 結束初始化函式

function draw() { // 每個畫面更新一次背景與角色
  background("#87CEEB"); // 使用天空藍作為預設底色

  // 繪製三張串接的背景圖片（左、中、右）
  let bgW = bgImage.width;
  let bgH = bgImage.height;
  // 保持背景高度填滿畫布，寬度等比例縮放
  let drawBgH = height;
  let drawBgW = bgW * (height / bgH);

  // 繪製三張串接背景（根據 cameraX 偏移量進行捲動）
  for (let i = -1; i <= 1; i++) {
    let bgX = width / 2 + (i * drawBgW) - cameraX;
    image(bgImage, bgX, height / 2, drawBgW, drawBgH);
  }

  const movingRight = keyIsDown(RIGHT_ARROW); // 檢查右方向鍵目前是否按住
  const movingLeft = keyIsDown(LEFT_ARROW); // 檢查左方向鍵目前是否按住
  isWalking = movingRight || movingLeft; // 設定是否走路
  const movementStep = constrain(width * 0.004, 2, 8); // 移動速度

  // 計算背景的最大可移動邊界（三張圖的總寬度範圍）
  let minCameraX = 0;
  let maxCameraX = drawBgW * 2;

  if (movingRight) {
    isWalking = true;
    facingDirection = 1;
    // 優先讓背景往左滾動（鏡頭往右）
    if (cameraX < maxCameraX) {
      cameraX += movementStep;
      cameraX = constrain(cameraX, minCameraX, maxCameraX);
    } else {
      // 背景到底時，角色往右移動
      const characterScale = (height / 3) / frameHeight;
      const characterWidth = frameWidth * characterScale;
      characterX += movementStep;
      characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2);
    }
  } else if (movingLeft) {
    isWalking = true;
    facingDirection = -1;
    // 優先讓背景往右滾動（鏡頭往左）
    if (cameraX > minCameraX) {
      cameraX -= movementStep;
      cameraX = constrain(cameraX, minCameraX, maxCameraX);
    } else {
      // 背景到底時，角色往左移動
      const characterScale = (height / 3) / frameHeight;
      const characterWidth = frameWidth * characterScale;
      characterX -= movementStep;
      characterX = constrain(characterX, characterWidth / 2, width - characterWidth / 2);
    }
  }

  // 計算角色尺寸與位置
  const characterScale = (height / 3) / frameHeight; // 角色高度固定為畫布 1/3
  const characterWidth = frameWidth * characterScale; 
  const characterHeight = frameHeight * characterScale; 

  if (isCasting && frameCount - magicStartFrame >= magicFrameCount * framesPerStep) { // 檢查施法動畫是否結束
    isCasting = false; 
    activeEffects.push({ x: characterX + magicDirection * characterWidth / 2, y: height - characterHeight * 0.58, direction: magicDirection }); 
  } 

  const activeSprite = isCasting ? magicSprite : isWalking ? walkSprite : characterSprite; 
  const activeFrameCount = isCasting ? magicFrameCount : isWalking ? walkFrameCount : frameCountInSprite; 
  const activeFrameWidth = isCasting ? magicFrameWidth : isWalking ? walkFrameWidth : frameWidth; 
  const activeFrameHeight = isCasting ? magicFrameHeight : isWalking ? walkFrameHeight : frameHeight; 
  const elapsedMagicFrames = frameCount - magicStartFrame; 
  const frameIndex = isCasting ? floor(elapsedMagicFrames / framesPerStep) : floor(frameCount / framesPerStep) % activeFrameCount; 
  const sourceX = frameIndex * activeFrameWidth; 
  const activeWidth = activeFrameWidth * characterScale; 
  const activeHeight = activeFrameHeight * characterScale; 
  const characterY = height - activeHeight / 2; 

  // 繪製角色
  push(); 
  translate(characterX, characterY); 
  scale(isCasting ? magicDirection : facingDirection, 1); 
  image(activeSprite, 0, 0, activeWidth, activeHeight, sourceX, 0, activeFrameWidth, activeFrameHeight); 
  pop(); 

  // 繪製魔法特效
  const effectScale = characterScale; 
  const effectWidth = effectFrameWidth * effectScale; 
  const effectHeight = effectFrameHeight * effectScale; 
  const effectSpeed = max(6, width * 0.008); 
  for (let effectIndex = activeEffects.length - 1; effectIndex >= 0; effectIndex--) { 
    const effect = activeEffects[effectIndex]; 
    effect.x += effect.direction * effectSpeed; 
    if (effect.x > width || effect.x < 0) { 
      activeEffects.splice(effectIndex, 1); 
      continue; 
    } 
    const effectFrameIndex = floor(frameCount / framesPerStep) % effectFrameCount; 
    push(); 
    translate(effect.x, effect.y); 
    scale(effect.direction, 1); 
    image(magicEffectSprite, 0, 0, effectWidth, effectHeight, effectFrameIndex * effectFrameWidth, 0, effectFrameWidth, effectFrameHeight); 
    pop(); 
  } 
} 

function keyPressed() { 
  if (keyCode === RIGHT_ARROW) { 
    isWalking = true; 
    facingDirection = 1; 
    return false; 
  } 
  if (keyCode === LEFT_ARROW) { 
    isWalking = true; 
    facingDirection = -1; 
    return false; 
  } 
  if (keyCode === 32) { // 空白鍵施法
    if (!spaceIsDown && !isCasting) { 
      isCasting = true; 
      magicStartFrame = frameCount; 
      magicDirection = facingDirection; 
    } 
    spaceIsDown = true; 
    return false; 
  } 
} 

function keyReleased() { 
  if (keyCode === 32) { 
    spaceIsDown = false; 
  } 
} 

function windowResized() { 
  resizeCanvas(windowWidth, windowHeight); 
}