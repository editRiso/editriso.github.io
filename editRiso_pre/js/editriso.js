const risoColors = [];
for (c in RISOCOLORS) {
  risoColors.push(RISOCOLORS[c].name);
}
console.log(risoColors);

let inkslotOptions = [];
let fillOptions, strokeOptions;
let risoInks = []; // risoinks
let inkslot = {
  A: 'BLUE',
  B: 'RED',
  C: 'YELLOW',
  D: 'BLACK'
}
let colors = []; //

let formats = {
  a5: {
    name: 'A5',
    width: 1748,
    height: 2480,
    printWidth: 148,
    printHeight: 210
  },
  postcard: {
    name: 'Post Card',
    width: 1181,
    height: 1748,
    printWidth: 105,
    printHeight: 148
  },
  cd: {
    name: 'CD Jacket',
    width: 1417,
    height: 1417,
    printWidth: 120,
    printHeight: 120
  }
};

// outside the page size
let editorOutsideWidth = 200;
let editorOutsideHeight = 200;
let bleed = 35;

let formatSelectBox;
let size;
let selectedFormat;

let toolMode = 'rect';
let targetInkFillNum;
let targetInkStrokeNum;
let isSettingState = false;

let startPoint = {};
let tmpPx, tmpPy, tmpWidth, tmpHeight;
let tmpPolygon = {};
tmpPolygon.id = null;
tmpPolygon.vertexes = [];

let img;
let tmpImg;

// for loading images
let imgList = [];
let imgIndex = 0;
let imgIndexMax;

let boundingBoxes = [];
let pressedX, pressedY;
let boundingCornerSize = 10;
let boundingFill;
let boundingStroke;
let prePosX, prePosY, preW, preH, preFontSize;
let relativeX, relativeY;
let relativeVertexes = [];
let resizePosX, resizePosY, resizeW, resizeH, resizeFontSize;
let tmpMax, tmpMin;

let polygonGuides = [];
let polygonGuideSize = 10;

let locked = false;

let strokeWeightVal;
let superEllipseCornerVal;
let tightnessFill;
let tightnessStroke;
let vertexTypeFill;
let vertexTypeStroke;

let fontsLoaded = [
  'DMSans-Regular', 'DMSans-Medium', 'DMSans-Bold', 'DMSans-Italic', 'DMSans-MediumItalic', 'DMSans-BoldItalic',
  'AbrilFatface-Regular',
  'Arvo-Regular', 'Arvo-Bold', 'Arvo-Italic', 'Arvo-BoldItalic',
  'Bangers-Regular',
  'LexendPeta-Regular',
  'Modak-Regular',
  'Monoton-Regular',
  'Syncopate-Regular', 'Syncopate-Bold',
  // 'NotoSansJP-Thin', 'NotoSansJP-Light', 'NotoSansJP-Regular', 'NotoSansJP-Medium', 'NotoSansJP-Bold', 'NotoSansJP-Black'
];
let fonts = [];
let selectedFont = fontsLoaded[0];
let fontSizeVal = 24;
let textString = 'Type something.';

// objects
let objects = [];
let objectId = 0;

// tool bar
let tools = [
  'rect',
  'ellipse',
  'superellipse',
  'polygon',
  // 'edit vertex',
  'text',
  // 'image',
  'select'
];
let toolBar = true;
let previewCut = true;

function preload() {
  ciFont = loadFont('fonts/DMSans-Bold.ttf');
  monoFont = loadFont('fonts/RobotoMono-VariableFont_wght.ttf');

  for (let font in fontsLoaded) {
    if (/Noto/.test(fontsLoaded[font])) {
      print(fontsLoaded[font] + ' is loaded as OTF.');
      fonts[fontsLoaded[font]] = loadFont('fonts/' + fontsLoaded[font] + '.otf');
    } else {
      fonts[fontsLoaded[font]] = loadFont('fonts/' + fontsLoaded[font] + '.ttf');
    }
  }
}

function setup() {
  selectedFormat = 'postcard';
  let canvas = createCanvas(formats[selectedFormat].width + editorOutsideWidth * 2, formats[selectedFormat].height + editorOutsideHeight * 2);
  canvas.parent('er-canvas-wrapper');

  pixelDensity(1);
  // angleMode(DEGREES);
  rectMode(CENTER);
  ellipseMode(CENTER);
  frameRate(10);

  // preparing riso objects
  for (let slot in inkslot) {
    colors[inkslot[slot]] = new Riso(inkslot[slot]);
  }

  // tool bar
  divToolbar = createDiv().id('toolbar').class('er-toolbar');
  titleTools = createElement('h2', 'Tool mode').class('er-toolbar-title').parent('toolbar');
  divToolbarButtonWrapper = createDiv().id('toolbar__tool-button-wrapper').class('er-toolbar__tool-button-wrapper').parent('toolbar');
  for (let tool in tools) {
    toolbarButton = createDiv(tools[tool]).addClass('er-toolbar__button').addClass('er-toolbar__button--' + tools[tool]);
    if (tools[tool] == toolMode) {
      toolbarButton.addClass('is-active');
    }
    toolbarButton.parent('toolbar__tool-button-wrapper');
    console.log(toolbarButton);
    toolbarButton.elt.addEventListener('click', function(){changeToolMode(tools[tool])});
    toolbarButton.elt.addEventListener('click', function(){handleActive('toolbar__tool-button-wrapper', this)});
  }

  // ink setting
  titleInkSetting = createElement('h2', 'RISO inks').class('er-toolbar-title').parent('toolbar');
  divInkSetting = createDiv().id('inksetting').class('er-inksetting').parent('toolbar');
  for (let slot in inkslot) {
    let bgValueDisplay;
    for (let color in RISOCOLORS) {
      if (RISOCOLORS[color].name == inkslot[slot]) {
        bgValueDisplay = 'rgba(' + RISOCOLORS[color].color[0] + ', ' + RISOCOLORS[color].color[1] + ', ' + RISOCOLORS[color].color[2] + ', 1)';
      }
    }
    inkDisplay = createDiv().id('ink-display-' + slot).class('er-inksetting__ink-display').style('background', bgValueDisplay).parent('inksetting');
    inkDisplayLabel = createElement('span', slot).class('er-inksetting__ink-label').parent('ink-display-' + slot);
    inkDisplayName = createElement('span', inkslot[slot]).class('er-inksetting__ink-name').parent('ink-display-' + slot);
    inkSwitchButton = createDiv().class('er-inksetting__ink-switch-button').parent('ink-display-' + slot).elt.addEventListener('click', function() {
      let selects = document.getElementsByClassName('er-inksetting__ink-select');
      let target = document.getElementById('ink-select-' + slot);
      for (i = 0;i < selects.length;i++) {
        selects[i].classList.remove('is-shown');
      }
      target.classList.add('is-shown');
      isSettingState = true;
    });;
    inkSelect = createElement('div').id('ink-select-' + slot).class('er-inksetting__ink-select').parent('ink-display-' + slot);
    inkSelectName = createElement('h4', inkslot[slot]).id('ink-name-' + slot).class('er-inksetting__ink-select-name').parent('ink-select-' + slot);
    inkSelectClose = createDiv().class('er-inksetting__close-button').parent('ink-select-' + slot).elt.addEventListener('click', function() {
      let target = document.getElementById('ink-select-' + slot);
      console.log(target.classList);
      target.classList.remove('is-shown');
      isSettingState = false;
    });
    inkSelectList = createElement('ul').id('ink-select-list-' + slot).class('er-inksetting__ink-select-list').parent('ink-select-' + slot);
    for (let color in RISOCOLORS) {
      let bgValueSelectItem;
      bgValueSelectItem = 'rgba(' + RISOCOLORS[color].color[0] + ', ' + RISOCOLORS[color].color[1] + ', ' + RISOCOLORS[color].color[2] + ', 1)';
      inkSelectItem = createElement('li', RISOCOLORS[color].name).id('ink-select-item-' + slot + '-' + RISOCOLORS[color].name).class('er-inksetting__ink-select-item').style('background', bgValueSelectItem).parent('ink-select-list-' + slot);
      if (RISOCOLORS[color].name == inkslot[slot]) {
        inkSelectItem.addClass('is-active');
      }
      inkSelectItem.elt.addEventListener('click', function() {
        if(this.classList.contains('is-disabled') == false) {
          console.log('not disabled!');
          selectInkslot(slot, RISOCOLORS[color].name);
          refleshInkSetting(slot);
          handleActive('ink-select-list-' + slot, this);
        }
      });
    }
  }
  updateSlotSelect();

  // default ink number
  targetInkFill = 'A';
  targetInkStroke = 'B';

  titlePresentColorSelector = createElement('h2', 'Color').id('present-color-title--fill').class('er-toolbar-title').parent('toolbar');
  divPresentColorSelectorFill = createDiv().id('present-color-selector--fill').class('er-color-selector').parent('toolbar');
  titlePresentColorSelectorFill = createElement('h3', 'Fill:').class('er-toolbar-title').addClass('er-toolbar-title--small').parent('present-color-selector--fill');
  generateColorSelector('presentFill', 'present-color-selector--fill', 'targetInkFill');
  divPresentColorSelectorStroke = createDiv().id('present-color-selector--stroke').class('er-color-selector').parent('toolbar');
  titlePresentColorSelectorStroke = createElement('h3', 'Stroke:').class('er-toolbar-title').addClass('er-toolbar-title--small').parent('present-color-selector--stroke');
  generateColorSelector('presentStroke', 'present-color-selector--stroke', 'targetInkStroke');

  // default stroke weight
  strokeWeightVal = 1;

  // stroke weight slider
  strokeWeightSlider = createSlider(0, 100, 1, 1);
  strokeWeightSlider.position(500 + bleed, height - 20);
  strokeWeightSlider.style('width', '100px');
  strokeWeightSlider.changed(strokeWeightChanged);

  // default superellipse corner
  superEllipseCornerVal = 2;

  // superellipse corner slider
  superEllipseCornerSlider = createSlider(0.1, 10, 2, 0.01);
  superEllipseCornerSlider.position(600 + bleed, height - 20);
  superEllipseCornerSlider.style('width', '100px');
  superEllipseCornerSlider.changed(superEllipseCornerChanged);

  // default curve tightness
  tightnessVal = 0;

  // curve tightness slider
  tightnessFillSlider = createSlider(-10, 10, 0, 1);
  tightnessFillSlider.position(700 + bleed, height - 20);
  tightnessFillSlider.style('width', '100px');
  tightnessFillSlider.changed(tightnessFillChanged);
  tightnessStrokeSlider = createSlider(-10, 10, 0, 1);
  tightnessStrokeSlider.position(800 + bleed, height - 20);
  tightnessStrokeSlider.style('width', '100px');
  tightnessStrokeSlider.changed(tightnessStrokeChanged);

  // default vertex type
  vertexTypeFill = 'curve'
  vertexTypeStroke = 'curve';

  // vertex type radio
  vertexTypeFillSelector = createSelect();
  vertexTypeFillSelector.position(1000 + bleed, height - 20);
  vertexTypeFillSelector.option('curve');
  vertexTypeFillSelector.option('straight');
  vertexTypeFillSelector.style('width', '200px');
  vertexTypeFillSelector.changed(selectVertexTypeFill);
  vertexTypeStrokeSelector = createSelect();
  vertexTypeStrokeSelector.position(1200 + bleed, height - 20);
  vertexTypeStrokeSelector.option('curve');
  vertexTypeStrokeSelector.option('straight');
  vertexTypeStrokeSelector.style('width', '200px');
  vertexTypeStrokeSelector.changed(selectVertexTypeStroke);

  // fonts
  fontSelector = createSelect();
  fontSelector.position(400 + bleed, 20);
  for (let font in fontsLoaded) {
    fontSelector.option(fontsLoaded[font]);
  }
  fontSelector.changed(selectFont);

  // default font size
  fontSizeVal = 40;

  // font size slider
  fontSizeSlider = createSlider(0, 800, 1, 1);
  fontSizeSlider.position(600 + bleed, 20);
  fontSizeSlider.style('width', '100px');
  fontSizeSlider.changed(fontSizeChanged);

  // text input
  textInput = createInput('Type something');
  textInput.position(800 + bleed, 20);
  textInput.input(updateText);
}

function draw() {
  size = formats[selectedFormat];
  let sizeWidth = size.width;
  let sizeHeight = size.height;
  setSize(size);
  background(245);
  clearRiso();

  strokeWeightVal = strokeWeightSlider.value();
  superEllipseCornerVal = superEllipseCornerSlider.value();
  tightnessFill = tightnessFillSlider.value();
  tightnessStroke = tightnessStrokeSlider.value();
  fontSizeVal = fontSizeSlider.value();
  vertexTypeFill = vertexTypeFillSelector.value();
  vertexTypeStroke = vertexTypeStrokeSelector.value();

  if (mouseIsPressed) {
    if (mouseX > editorOutsideWidth - bleed && mouseY > editorOutsideHeight - bleed && mouseX < width - editorOutsideWidth + bleed && mouseY < height - editorOutsideHeight + bleed) {
      // behavior for each tool in action
      if (startPoint.x > mouseX) {
        tmpPx = mouseX;
        tmpWidth = startPoint.x - mouseX;
      } else {
        tmpPx = startPoint.x;
        tmpWidth = mouseX - startPoint.x;
      }
      if (startPoint.y > mouseY) {
        tmpPy = mouseY;
        tmpHeight = startPoint.y - mouseY;
      } else {
        tmpPy = startPoint.y;
        tmpHeight = mouseY - startPoint.y;
      }
      if (keyIsPressed == true) {
        if (keyCode == SHIFT) {
          print('shift is pressed');
          tmpWidth = Math.max(tmpWidth, tmpHeight);
          tmpHeight = Math.max(tmpWidth, tmpHeight);
        }
      }
      switch (toolMode) {
        case 'rect':
          if (targetInkFill != 'transparent') {
            drawRect(targetInkFill, fill, tmpPx, tmpPy, tmpWidth, tmpHeight, 0, 0);
          }
          if (targetInkStroke != 'transparent') {
            drawRect(targetInkStroke, stroke, tmpPx, tmpPy, tmpWidth, tmpHeight, strokeWeightVal, 0);
          }
          break;
        case 'ellipse':
          if (targetInkFill != 'transparent') {
            drawEllipse(targetInkFill, fill, tmpPx + tmpWidth / 2, tmpPy + tmpHeight / 2, tmpWidth, tmpHeight, 0, 0);
          }
          if (targetInkStroke != 'transparent') {
            drawEllipse(targetInkStroke, stroke, tmpPx + tmpWidth / 2, tmpPy + tmpHeight / 2, tmpWidth, tmpHeight, strokeWeightVal, 0);
          }
          break;
        case 'superellipse':
          if (targetInkFill != 'transparent') {
            drawSuperellipse(targetInkFill, fill, tmpPx + tmpWidth / 2, tmpPy + tmpHeight / 2, tmpWidth, tmpHeight, 0, superEllipseCornerVal, 0);
          }
          if (targetInkStroke != 'transparent') {
            drawSuperellipse(targetInkStroke, stroke, tmpPx + tmpWidth / 2, tmpPy + tmpHeight / 2, tmpWidth, tmpHeight, strokeWeightVal, superEllipseCornerVal, 0);
          }
          break;
        case 'polygon':
          break;
        case 'text':
          break;
        default:
          break;
      }
    }
  }

  // draw tmporary polygon
  if (tmpPolygon.id !== null) {
    if (tmpPolygon.inkFill != 'transparent') {
      drawPolygon(tmpPolygon.inkFill, fill, tmpPolygon.posX + editorOutsideWidth, tmpPolygon.posY + editorOutsideHeight, tmpPolygon.vertexes, tmpPolygon.isClosed, tmpPolygon.strokeWeight, tmpPolygon.vertexTypeFill, tmpPolygon.tightnessFill, 0);
    }
    if (tmpPolygon.inkStroke != 'transparent') {
      drawPolygon(tmpPolygon.inkStroke, stroke, tmpPolygon.posX + editorOutsideWidth, tmpPolygon.posY + editorOutsideHeight, tmpPolygon.vertexes, tmpPolygon.isClosed, tmpPolygon.strokeWeight, tmpPolygon.vertexTypeFill, tmpPolygon.tightnessStroke, 0);
    }
  }

  // show objects as they are
  for (let i in objects) {
    switch (objects[i].type) {
      case 'rect':
        if (objects[i].inkFill != 'transparent') {
          drawRect(objects[i].inkFill, fill, objects[i].posX - objects[i].width / 2 + editorOutsideWidth, objects[i].posY - objects[i].height / 2 + editorOutsideHeight, objects[i].width, objects[i].height, 0, 0);
        }
        if (objects[i].inkStroke != 'transparent') {
          drawRect(objects[i].inkStroke, stroke, objects[i].posX - objects[i].width / 2 + editorOutsideWidth, objects[i].posY - objects[i].height / 2 + editorOutsideHeight, objects[i].width, objects[i].height, objects[i].strokeWeight, 0);
        }
        break;
      case 'ellipse':
        if (objects[i].inkFill != 'transparent') {
          drawEllipse(objects[i].inkFill, fill, objects[i].posX + editorOutsideWidth, objects[i].posY + editorOutsideHeight, objects[i].width, objects[i].height, 0, 0);
        }
        if (objects[i].inkStroke != 'transparent') {
          drawEllipse(objects[i].inkStroke, stroke, objects[i].posX + editorOutsideWidth, objects[i].posY + editorOutsideHeight, objects[i].width, objects[i].height, objects[i].strokeWeight, 0);
        }
        break;
      case 'superellipse':
        if (objects[i].inkFill != 'transparent') {
          drawSuperellipse(objects[i].inkFill, fill, objects[i].posX + editorOutsideWidth, objects[i].posY + editorOutsideHeight, objects[i].width, objects[i].height, 0, objects[i].cornerVal, 0);
        }
        if (objects[i].inkStroke != 'transparent') {
          drawSuperellipse(objects[i].inkStroke, stroke, objects[i].posX + editorOutsideWidth, objects[i].posY + editorOutsideHeight, objects[i].width, objects[i].height, objects[i].strokeWeight, objects[i].cornerVal, 0);
        }
        break;
      case 'polygon':
        if (objects[i].inkFill != 'transparent') {
          drawPolygon(objects[i].inkFill, fill, objects[i].posX + editorOutsideWidth, objects[i].posY + editorOutsideHeight, objects[i].vertexes, objects[i].isClosed, objects[i].strokeWeight, objects[i].vertexTypeFill, objects[i].tightnessFill, 0);
        }
        if (objects[i].inkStroke != 'transparent') {
          drawPolygon(objects[i].inkStroke, stroke, objects[i].posX + editorOutsideWidth, objects[i].posY + editorOutsideHeight, objects[i].vertexes, objects[i].isClosed, objects[i].strokeWeight, objects[i].vertexTypeFill, objects[i].tightnessStroke, 0);
        }
        break;
      case 'image':
        if (imgList[i].load != undefined) {
          push();
          colors[objects[i].inkFill].image(imgList[i].load, objects[i].posX / 2, objects[i].posY / 2, objects[i].imgWidth, objects[i].imgHeight);
          pop();
        }
        break;
      case 'text':
        if (objects[i].inkFill != 'transparent') {
          drawText(objects[i].inkFill, fill, objects[i].posX - objects[i].width / 2 + editorOutsideWidth, objects[i].posY - objects[i].height / 2 + editorOutsideHeight, objects[i].width, objects[i].height, 0, objects[i].fontFace, objects[i].fontSize, objects[i].content);
        }
        if (objects[i].inkStroke != 'transparent') {
          drawText(objects[i].inkStroke, stroke, objects[i].posX - objects[i].width / 2 + editorOutsideWidth, objects[i].posY - objects[i].height / 2 + editorOutsideHeight, objects[i].width, objects[i].height, objects[i].strokeWeight, objects[i].fontFace, objects[i].fontSize, objects[i].content);
        }
        break;
    }
  }

  if (toolMode == 'select') {
    // bounding box
    for (let b of boundingBoxes) {
      b.draw();
      if (mouseX >= b.x - b.w / 2 + editorOutsideWidth && b.x + b.w / 2 + editorOutsideWidth >= mouseX && mouseY >= b.y - b.h / 2 + editorOutsideHeight && b.y + b.h / 2 + editorOutsideHeight >= mouseY) {
        b.hover();
      }
    }
  }

  // polygon guide
  if (toolMode == 'polygon') {
    for (let i in objects) {
      if (objects[i].type == 'polygon') {
        generatePolygonGuide(objects[i]);
      }
    }
    for (let p of polygonGuides) {
      p.draw();
    }
    if (tmpPolygon.id != null) {
      push();
      fill('rgba(255, 255, 255, 1)');
      stroke('rgba(255, 0, 0, 1)');
      strokeWeight(1);
      rectMode(CORNER);
      rect(tmpPolygon.vertexes[0].x + editorOutsideWidth - polygonGuideSize / 2, tmpPolygon.vertexes[0].y + editorOutsideHeight - polygonGuideSize / 2, polygonGuideSize, polygonGuideSize);
      pop();
      if (tmpPolygon.vertexes.length > 1) {
        push();
        ellipseMode(CORNER);
        ellipse(tmpPolygon.vertexes[tmpPolygon.vertexes.length - 1].x + editorOutsideWidth - polygonGuideSize / 2, tmpPolygon.vertexes[tmpPolygon.vertexes.length - 1].y + editorOutsideHeight - polygonGuideSize / 2, polygonGuideSize, polygonGuideSize);
        pop();
        for (let i = 1;i < tmpPolygon.vertexes.length - 1;i++) {
          push();
          noStroke();
          fill('rgba(255, 0, 0, 1)');
          ellipseMode(CORNER);
          ellipse(tmpPolygon.vertexes[i].x + editorOutsideWidth - polygonGuideSize / 2, tmpPolygon.vertexes[i].y + editorOutsideHeight - polygonGuideSize / 2, polygonGuideSize, polygonGuideSize);
          pop();
        }
      }
    }
  }

  // vertex edit
  if (toolMode == 'edit vertex') {
    for (let i in objects) {
      if (objects[i].type == 'polygon') {
        generatePolygonGuide(objects[i]);
      }
    }
    for (let p of polygonGuides) {
      p.draw();
    }
  }

  // download button
  push();
  fill(0);
  ellipse(width - 80, height - 80, 80, 80);
  pop();
  push();
  fill(255);
  textAlign(CENTER, CENTER);
  textSize(40);
  textFont();
  // text(icons.download, width - 80, height - 85)
  pop();

  //  cutouts
  // colors[0].cutout(colors[1]);

  // draw trimmarks for each color
  drawTrimmarks(sizeWidth, sizeHeight, bleed);

  drawRiso();

  // preview cut
  if (previewCut == true) {
    push();
    noFill();
    stroke('rgba(0, 255, 255, 0.8)');
    strokeWeight(1);
    for (i = 0; i < width; i++) {
      line(i * 10, 200, i * 10 + 5, 200);
      line(i * 10, height - 200, i * 10 + 5, height - 200);
    }
    for (j = 0; j < height; j++) {
      line(200, j * 10, 200, j * 10 + 5);
      line(width - 200, j * 10, width - 200, j * 10 + 5);
    }
    pop();
  }
}

//
function handleActive(id, target) {
  let buttons = document.getElementById(id).children;
  console.log(buttons);
  for (let i = 0;i < buttons.length;i++) {
    if (buttons[i].classList.contains('is-active')) {
      buttons[i].classList.remove('is-active');
    }
  }
  target.classList.add('is-active');
}

// format select
function selectFormat() {
  let form = formatSelectBox.value();
  switch (form) {
    case 'Post Card':
      selectedFormat = 'postcard';
      break;
    case 'A5':
      selectedFormat = 'a5';
      break;
    case 'CD Jacket':
      selectedFormat = 'cd';
      break;
  }
  print(selectedFormat + ' is selected');
}

// ink slot select
function selectInkslot(slot, value) {
  inkslot[slot] = value;
  colors[inkslot[slot]] = new Riso(inkslot[slot]);
}
function refleshInkSetting(slot) {
  let targetOptionFill = document.getElementById('li-presentFill-' + slot);
  let targetOptionStroke = document.getElementById('li-presentStroke-' + slot);
  let targetInkDisplay = document.getElementById('ink-display-' + slot);
  let targetInkName = document.getElementById('ink-name-' + slot);
  let bgValue;
  for (let color in RISOCOLORS) {
    if (RISOCOLORS[color].name == inkslot[slot]) {
      bgValue = 'rgba(' + RISOCOLORS[color].color[0] + ', ' + RISOCOLORS[color].color[1] + ', ' + RISOCOLORS[color].color[2] + ', 1)';
    }
  }
  targetOptionFill.innerHTML = inkslot[slot];
  targetOptionFill.style.background = bgValue;
  targetOptionStroke.innerHTML = inkslot[slot];
  targetOptionStroke.style.background = bgValue;
  targetInkDisplay.children[1].innerHTML = inkslot[slot];
  targetInkDisplay.style.background = bgValue;
  targetInkName.innerHTML = inkslot[slot];
  updateSlotSelect();
}
function updateSlotSelect() {
  for (let slot in inkslot) {
    let targetItems = document.getElementById('ink-select-list-' + slot).children;
      for (let i = 0;i < targetItems.length;i++) {
        targetItems[i].classList.remove('is-disabled');
        for (let slot in inkslot) {
          targetItems[i].classList.remove('is-ink-' + slot);
          if (targetItems[i].innerHTML == inkslot[slot]) {
            targetItems[i].classList.add('is-disabled', 'is-ink-' + slot);
          }
        }
      }
  }
}

// generate color selector
// for fill and stroke
// 全slotのチップを常に表示する
function generateColorSelector(id, parent, target) {
  divColorSelector = createDiv().id(id).parent(parent);
  colorList = createElement('ul').id('ul-' + id).class('er-color-selector__list').parent(id);
  for (let ink in inkslot) {
    let bgValue;
    console.log(inkslot[ink]);
    for (let color in RISOCOLORS) {
      if (RISOCOLORS[color].name == inkslot[ink]) {
        bgValue = 'rgba(' + RISOCOLORS[color].color[0] + ', ' + RISOCOLORS[color].color[1] + ', ' + RISOCOLORS[color].color[2] + ', 1)';
      }
    }
    console.log(bgValue);
    colorListItem = createElement('li', inkslot[ink]).id('li-' + id + '-' + ink).addClass('er-color-selector__list-item').addClass('er-color-selector__list-item--' + target + '-' + ink).style('background', bgValue).parent('ul-' + id);
    switch(target) {
      case 'targetInkFill':
        if (ink == targetInkFill) {
          colorListItem.addClass('is-active');
        }
        break;
      case 'targetInkStroke':
        if (ink == targetInkStroke) {
          colorListItem.addClass('is-active');
        }
        break;
    }
    colorListItem.elt.addEventListener('click', function() {handleActive('ul-' + id, this)});
    colorListItem.elt.addEventListener('click', function() {
      switch(target) {
        case 'targetInkFill':
          targetInkFill = ink;
          break;
        case 'targetInkStroke':
          targetInkStroke = ink;
          break;
      }
    });
  }
}

// change tool mode
function changeToolMode(tool) {
  if (tmpPolygon.id != null) {
    if (tmpPolygon.isClosed == false) {
      print('is not closed');
      objects.push({
        'id': tmpPolygon.id,
        'type': 'polygon',
        'vertexes': tmpPolygon.vertexes,
        'strokeWeight': tmpPolygon.strokeWeight,
        'tightnessFill': tmpPolygon.tightnessFill,
        'tightnessStroke': tmpPolygon.tightnessStroke,
        'vertexTypeFill': tmpPolygon.vertexTypeFill,
        'vertexTypeStroke': tmpPolygon.vertexTypeStroke,
        'vertexCount': tmpPolygon.vertexCount,
        'isClosed': tmpPolygon.isClosed,
        'inkFill': tmpPolygon.inkFill,
        'inkStroke': tmpPolygon.inkStroke
      });
      objectId = tmpPolygon.id + 1;
    } else {
      print('is closed');
    }
  }
  toolMode = tool;
  print('tool mode: ' + toolMode);
  tmpPolygon.id = null;
  tmpPolygon.vertexes = [];
  if (toolMode == 'select') {
    for (let i in objects) {
      generateBoundingbox(objects[i]);
    }
  }
}

// select font
function selectFont() {
  let form = fontSelector.value();
  print('font: ' + form);
  selectedFont = form;
}

function fontSizeChanged() {
  print('font size: ' + fontSizeVal);
}

function strokeWeightChanged() {
  print('stroke weight: ' + strokeWeightVal);
}

function superEllipseCornerChanged() {
  print('superellipsecorner: ' + superEllipseCornerVal);
}

function tightnessFillChanged() {
  print('Fill curve tightness: ' + tightnessFill);
}

function tightnessStrokeChanged() {
  print('Stroke curve tightness: ' + tightnessStroke);
}

// select curve Vertex
function selectVertexTypeFill() {
  let form = vertexTypeFillSelector.value();
  print('vertex type (fill): ' + form);
  vertexTypeFill = form;
}

function selectVertexTypeStroke() {
  let form = vertexTypeStrokeSelector.value();
  print('vertex type (stroke): ' + form);
  vertexTypeStroke = form;
}

// update text
function updateText() {
  print('you are typing: ', this.value());
  textString = this.value();
}

function mousePressed() {
  print('tool mode: ' + toolMode);

  startPoint.x = mouseX;
  startPoint.y = mouseY;

  if (toolMode == 'select') {
    pressedX = mouseX;
    pressedY = mouseY;
    // bounding
    for (let i = boundingBoxes.length - 1; i >= 0; i--) {
      if (boundingBoxes[i].pressed()) {
        print('boundingBox[' + i + '] is pressed.');
        break;
      }
    }
  }

  if (toolMode == 'eidt vertex') {
    pressedX = mouseX;
    pressedY = mouseY;
    // polygon guides
    for (let i = polygonGuides.length - 1; i >= 0; i--) {
      if (polygonGuides[i].pressed()) {
        print('polygonGuides[' + i + '] is pressed.');
        break;
      }
    }
  }
}

function mouseDragged() {
  print('start point is: (' + startPoint.x + ', ' + startPoint.y + '), and current point is: (' + mouseX + ', ' + mouseY + ')');

  if (toolMode == 'select') {
    // bounding
    for (let b of boundingBoxes) {
      b.drag();
    }
  }

  if (toolMode == 'edit vertex') {
    for (let p of polygonGuides) {
      p.drag();
    }
  }
}

function mouseReleased() {
  if (
    (mouseX > editorOutsideWidth - bleed && mouseY > editorOutsideHeight - bleed && mouseX < width - editorOutsideWidth + bleed && mouseY < height - editorOutsideHeight + bleed)
    && !isSettingState
  ) {
    if (toolMode == 'select') {
      // add object to objects
    } else if (toolMode == 'edit vertex') {
      //
    } else if (toolMode == 'polygon') {
      print(tmpPolygon);
      if (tmpPolygon.id == null) {
        tmpPolygon.id = objectId;
        tmpPolygon.type = 'polygon';
        tmpPolygon.strokeWeight = strokeWeightVal;
        tmpPolygon.tightnessFill = tightnessFill;
        tmpPolygon.tightnessStroke = tightnessStroke;
        tmpPolygon.vertexTypeFill = vertexTypeFill;
        tmpPolygon.vertexTypeStroke = vertexTypeStroke;
        tmpPolygon.vertexCount = 0;
        tmpPolygon.isClosed = false;
        tmpPolygon.vertexes.push({
          x: mouseX - editorOutsideWidth,
          y: mouseY - editorOutsideHeight
        });
        tmpPolygon.inkFill = targetInkFill;
        tmpPolygon.inkStroke = targetInkStroke;
      }
    } else {
      objects.push({
        'id': objectId
      });
      objects[objectId].type = toolMode;
    }
    print(objects);
    switch (toolMode) {
      case 'rect':
      case 'ellipse':
      case 'superellipse':
        objects[objectId].posX = tmpPx + tmpWidth / 2 - editorOutsideWidth;
        objects[objectId].posY = tmpPy + tmpHeight / 2 - editorOutsideHeight;
        objects[objectId].width = tmpWidth;
        objects[objectId].height = tmpHeight;
        objects[objectId].strokeWeight = strokeWeightVal;
        objects[objectId].inkFill = targetInkFill;
        objects[objectId].inkStroke = targetInkStroke;
        if (toolMode == 'superellipse') {
          objects[objectId].cornerVal = superEllipseCornerVal;
        }
        break;
      case 'polygon':
        if (tmpPolygon.id !== null) {
          if (tmpPolygon.isClosed == false) {
            print('tmporary polygon id: ' + tmpPolygon.id);
            let dFromStartPoint = dist(mouseX - editorOutsideWidth, mouseY - editorOutsideHeight, tmpPolygon.vertexes[0].x, tmpPolygon.vertexes[0].y);
            if (dFromStartPoint < 10) {
              if (tmpPolygon.vertexCount > 1) {
                print('closed');
                tmpPolygon.isClosed = true;
                objects.push({
                  'id': tmpPolygon.id,
                  'type': 'polygon',
                  'vertexes': tmpPolygon.vertexes,
                  'strokeWeight': tmpPolygon.strokeWeight,
                  'tightnessFill': tmpPolygon.tightnessFill,
                  'tightnessStroke': tmpPolygon.tightnessStroke,
                  'vertexTypeFill': tmpPolygon.vertexTypeFill,
                  'vertexTypeStroke': tmpPolygon.vertexTypeStroke,
                  'vertexCount': tmpPolygon.vertexCount,
                  'isClosed': tmpPolygon.isClosed,
                  'inkFill': tmpPolygon.inkFill,
                  'inkStroke': tmpPolygon.inkStroke
                });
                objectId = tmpPolygon.id + 1;
                tmpPolygon.id = null;
                tmpPolygon.vertexes = [];
                tmpPolygon.vertexCount = 0;
                print('objectId: ' + objectId);
              }
            } else {
              tmpPolygon.vertexCount++;
              tmpPolygon.vertexes.push({
                x: mouseX - editorOutsideWidth,
                y: mouseY - editorOutsideHeight
              });
            }
          }
        }
        break;
      case 'text':
        objects[objectId].fontSize = fontSizeVal;
        objects[objectId].fontFace = selectedFont;
        objects[objectId].strokeWeight = strokeWeightVal;
        objects[objectId].inkFill = targetInkFill;
        objects[objectId].inkStroke = targetInkStroke;
        objects[objectId].content = textString;
        let tmpTextBounds = fonts[selectedFont].textBounds(textString, tmpPx, tmpPy, fontSizeVal);
        objects[objectId].posX = tmpPx + tmpTextBounds.w / 2 - editorOutsideWidth;
        objects[objectId].posY = tmpPy + tmpTextBounds.h / 2 - editorOutsideHeight;
        objects[objectId].width = tmpTextBounds.w;
        objects[objectId].height = tmpTextBounds.h;
        break;
    }
    if ((toolMode != 'polygon') && (toolMode != 'select')) {
      objectId++;
    }
  }

  // bounding
  if (toolMode == 'select') {
    for (let b of boundingBoxes) {
      b.release();
    }
  }

  // edit vertex
  if (toolMode == 'edit vertex') {
    for (let p  of polygonGuides) {
      p.release();
    }
  }

  // download button
  let dlr = dist(mouseX, mouseY, width - 80, height - 80);
  if (dlr < 80) {
    exportRiso();
  }
}

function uploadImage(file) {
  if (file.type === 'image') {
    tmpImg = file.data;
    objects.push({
      'id': objectId
    });
    objects[objectId].type = 'image';
    objects[objectId].outputColor = 'grayscale';
    objects[objectId].inkFill = targetInkFill;
    objects[objectId].posX = width / 2;
    objects[objectId].posY = height / 2;
    objects[objectId].imgWidth = width / 2;
    objects[objectId].imgHeight = height / 2;
    objects[objectId].data = tmpImg;
    let tmpLoad = loadImage(tmpImg);
    imgList.push({
      'id': objectId,
      'load': tmpLoad
    });
    objectId++;
    print(imgList);
  } else {
    tmpImg = null;
  }
}

// objects
let drawRect = function(targetColor, drawMode, posX, posY, width, height, strokeWeight, angle) {
  push();
  if (drawMode == fill) {
    colors[inkslot[targetColor]].fill(255);
    colors[inkslot[targetColor]].noStroke();
  } else {
    colors[inkslot[targetColor]].noFill();
    colors[inkslot[targetColor]].stroke(255);
    colors[inkslot[targetColor]].strokeWeight(strokeWeight);
  }
  colors[inkslot[targetColor]].translate(posX + width / 2, posY + height / 2);
  colors[inkslot[targetColor]].rotate(angle);
  colors[inkslot[targetColor]].rect(-width / 2, -height / 2, width, height);
  colors[inkslot[targetColor]].rotate(-angle);
  colors[inkslot[targetColor]].translate(-posX - width / 2, -posY - height / 2);
  pop();
}

let drawEllipse = function(targetColor, drawMode, posX, posY, width, height, strokeWeight, angle) {
  push();
  if (drawMode == fill) {
    colors[inkslot[targetColor]].fill(255);
    colors[inkslot[targetColor]].noStroke();
  } else {
    colors[inkslot[targetColor]].noFill();
    colors[inkslot[targetColor]].stroke(255);
    colors[inkslot[targetColor]].strokeWeight(strokeWeight);
  }
  colors[inkslot[targetColor]].translate(posX + width / 2, posY + height / 2);
  colors[inkslot[targetColor]].rotate(angle);
  colors[inkslot[targetColor]].ellipse(-width / 2, -height / 2, width, height);
  colors[inkslot[targetColor]].rotate(-angle);
  colors[inkslot[targetColor]].translate(-posX - width / 2, -posY - height / 2);
  pop();
}

let drawSuperellipse = function(targetColor, drawMode, posX, posY, width, height, strokeWeight, cornerVal, angle) {
  push();
  if (drawMode == fill) {
    colors[inkslot[targetColor]].fill(255);
    colors[inkslot[targetColor]].noStroke();
  } else {
    colors[inkslot[targetColor]].noFill();
    colors[inkslot[targetColor]].stroke(255);
    colors[inkslot[targetColor]].strokeWeight(strokeWeight);
  }
  colors[inkslot[targetColor]].beginShape();
  for (let seAngle = 0; seAngle < TWO_PI; seAngle += 0.1) {
    colors[inkslot[targetColor]].vertex(posX + pow(abs(cos(seAngle)), 2 / cornerVal) * (width / 2) * sgn(cos(seAngle)), posY + pow(abs(sin(seAngle)), 2 / cornerVal) * (height / 2) * sgn(sin(seAngle)));
  }
  colors[inkslot[targetColor]].endShape(CLOSE);
  pop();
}

let drawPolygon = function(targetColor, drawMode, posX, posY, vertexes, isClosed, strokeWeight, vertexType, curveTightness, angle) {
  push();
  if (drawMode == fill) {
    colors[inkslot[targetColor]].fill(255);
    colors[inkslot[targetColor]].noStroke();
  } else {
    colors[inkslot[targetColor]].noFill();
    colors[inkslot[targetColor]].stroke(255);
    colors[inkslot[targetColor]].strokeWeight(strokeWeight);
  }
  colors[inkslot[targetColor]].curveTightness(curveTightness);
  colors[inkslot[targetColor]].beginShape();
  if (vertexType == 'curve') {
    colors[inkslot[targetColor]].curveVertex(vertexes[vertexes.length - 1].x + editorOutsideWidth, vertexes[vertexes.length - 1].y + editorOutsideHeight);
    for (let i = 0; i < vertexes.length; i++) {
      colors[inkslot[targetColor]].curveVertex(vertexes[i].x + editorOutsideWidth, vertexes[i].y + editorOutsideHeight);
    }
    if (isClosed) {
      colors[inkslot[targetColor]].curveVertex(vertexes[0].x + editorOutsideWidth, vertexes[0].y + editorOutsideHeight);
      colors[inkslot[targetColor]].curveVertex(vertexes[1].x + editorOutsideWidth, vertexes[1].y + editorOutsideHeight);
    } else {
      colors[inkslot[targetColor]].curveVertex(vertexes[vertexes.length - 1].x + editorOutsideWidth, vertexes[vertexes.length - 1].y + editorOutsideHeight);
    }
  } else {
    colors[inkslot[targetColor]].vertex(vertexes[vertexes.length - 1].x + editorOutsideWidth, vertexes[vertexes.length - 1].y + editorOutsideHeight);
    for (let i = 0; i < vertexes.length; i++) {
      colors[inkslot[targetColor]].vertex(vertexes[i].x + editorOutsideWidth, vertexes[i].y + editorOutsideHeight);
    }
    if (isClosed) {
      colors[inkslot[targetColor]].vertex(vertexes[0].x + editorOutsideWidth, vertexes[0].y + editorOutsideHeight);
      colors[inkslot[targetColor]].vertex(vertexes[1].x + editorOutsideWidth, vertexes[1].y + editorOutsideHeight);
    } else {
      colors[inkslot[targetColor]].vertex(vertexes[vertexes.length - 1].x + editorOutsideWidth, vertexes[vertexes.length - 1].y + editorOutsideHeight);
    }
  }
  colors[inkslot[targetColor]].endShape();
  pop();
}

let drawText = function(targetColor, drawMode, posX, posY, width, height, strokeWeight, fontFace, fontSize, content) {
  push();
  if (drawMode == fill) {
    colors[inkslot[targetColor]].fill(255);
    colors[inkslot[targetColor]].noStroke();
  } else {
    colors[inkslot[targetColor]].noFill();
    colors[inkslot[targetColor]].stroke(255);
    colors[inkslot[targetColor]].strokeWeight(strokeWeight);
  }
  colors[inkslot[targetColor]].textAlign(LEFT, TOP);
  colors[inkslot[targetColor]].textFont(fontFace);
  colors[inkslot[targetColor]].textSize(fontSize);
  colors[inkslot[targetColor]].text(content, posX, posY);
  pop();
}

// bounding box
function generateBoundingbox(object) {
  if (!boundingBoxes[object.id]) {
    let boundingPosX, boundingPosY, boundingWidth, boundingHeight;
    let boundingVertexesX = [];
    let boundingVertexesY = [];
    switch (object.type) {
      case 'rect':
      case 'ellipse':
      case 'superellipse':
        boundingPosX = object.posX;
        boundingPosY = object.posY;
        boundingWidth = object.width;
        boundingHeight = object.height;
        break;
      case 'polygon':
        for (let i = 0; i < object.vertexes.length; i++) {
          boundingVertexesX.push(object.vertexes[i].x);
          boundingVertexesY.push(object.vertexes[i].y);
        }
        boundingPosX = min(boundingVertexesX) + (max(boundingVertexesX) - min(boundingVertexesX)) / 2 ;
        boundingPosY = min(boundingVertexesY) + (max(boundingVertexesY) - min(boundingVertexesY)) / 2;
        boundingWidth = max(boundingVertexesX) - min(boundingVertexesX);
        boundingHeight = max(boundingVertexesY) - min(boundingVertexesY);
        break;
      case 'text':
        boundingPosX = object.posX;
        boundingPosY = object.posY;
        boundingWidth = object.width;
        boundingHeight = object.height;
        break;
    }
    if (object.type == 'polygon') {
      boundingBoxes.push(new boundingBox(object.id, boundingPosX, boundingPosY, boundingWidth, boundingHeight, boundingVertexesX, boundingVertexesY));
    } else {
      boundingBoxes.push(new boundingBox(object.id, boundingPosX, boundingPosY, boundingWidth, boundingHeight, null, null));
    }
  }
}
let boundingBox = function(id, x, y, w, h, vertexesX, vertexesY) {
  this.id = id;
  this.type = objects[this.id].type;
  this.x = x;
  this.y = y;
  this.w = w;
  this.h = h;
  this.aspectRatio = w / h;
  this.rotate = 0;
  this.isDragged = false;
  this.isResized = false;
  this.isRotated = false;
  if (this.type == 'polygon') {
    this.vertexes = [];
    for (let i = 0; i < vertexesX.length; i++) {
      this.vertexes.push({
        x: vertexesX[i],
        y: vertexesY[i]
      });
    }
    print(this.vertexes);
  }
}
boundingBox.prototype.draw = function() {
  if (this.isDragged) {
    boundingFill = 'rgba(0, 255, 0, 0.1)';
    boundingStroke = 'rgba(0, 255, 0, 1)';
  } else {
    boundingFill = 'rgba(0, 255, 0, 0.05)';
    boundingStroke = 'rgba(0, 255, 0, 0.75)';
  }
  push();
  fill(boundingFill);
  stroke(boundingStroke);
  strokeWeight(1);
  rectMode(CORNER);
  translate(this.x + editorOutsideWidth, this.y + editorOutsideHeight);
  rotate(this.rotate / 10);
  rect(-this.w / 2, -this.h / 2, this.w, this.h);
  pop();
  push();
  fill('rgba(255, 255, 255, 1)');
  stroke(boundingStroke);
  strokeWeight(1);
  rectMode(CORNER);
  if (objects[this.id].type == 'polygon') {
    for (let v in this.vertexes) {
      push();
      ellipseMode(CENTER);
      ellipse(objects[this.id].vertexes[v].x + editorOutsideWidth, objects[this.id].vertexes[v].y + editorOutsideHeight, boundingCornerSize, boundingCornerSize);
      pop();
    }
  }
  translate(this.x + editorOutsideWidth, this.y + editorOutsideHeight);
  rotate(this.rotate / 10);
  rect(-this.w / 2 - boundingCornerSize / 2, -this.h / 2 - boundingCornerSize / 2, boundingCornerSize, boundingCornerSize);
  rect(this.w / 2 - boundingCornerSize / 2, this.h / 2 - boundingCornerSize / 2, boundingCornerSize, boundingCornerSize);
  rect(this.w / 2 - boundingCornerSize / 2, -this.h / 2 - boundingCornerSize / 2, boundingCornerSize, boundingCornerSize);
  rect(-this.w / 2 - boundingCornerSize / 2, this.h / 2 - boundingCornerSize / 2, boundingCornerSize, boundingCornerSize);
  rect(-this.w / 2 - boundingCornerSize / 2, -boundingCornerSize / 2, boundingCornerSize, boundingCornerSize);
  rect(this.w / 2 - boundingCornerSize / 2, -boundingCornerSize / 2, boundingCornerSize, boundingCornerSize);
  rect(-boundingCornerSize / 2, -this.h / 2 - boundingCornerSize / 2, boundingCornerSize, boundingCornerSize);
  rect(-boundingCornerSize / 2, this.h / 2 - boundingCornerSize / 2, boundingCornerSize, boundingCornerSize);
  pop();
}
boundingBox.prototype.hover = function() {
  fill('rgba(0, 255, 0, 0.75)');
  textSize(16);
  textFont(monoFont);
  text('[' + this.id + ']' + this.type + '(' + this.x + ', ' + this.y + ') ' + this.w + ' x ' + this.h, this.x - this.w / 2 + editorOutsideWidth, this.y - this.h / 2 + editorOutsideHeight - 10);
}
boundingBox.prototype.pressed = function() {
  // drag
  if (this.x - this.w / 2 + editorOutsideWidth + boundingCornerSize / 2 <= mouseX && mouseX <= this.x + this.w / 2 + editorOutsideWidth - boundingCornerSize / 2 && this.y - this.h / 2 + editorOutsideHeight + boundingCornerSize / 2 <= mouseY && mouseY <= this.y + this.h / 2 + editorOutsideHeight - boundingCornerSize / 2) {
    this.isDragged = true;
    return this.isDragged;
  } else {
    // resized

    // left top
    if (this.x - this.w / 2 + editorOutsideWidth - boundingCornerSize / 2 <= mouseX &&
      mouseX <= this.x - this.w / 2 + editorOutsideWidth + boundingCornerSize / 2 &&
      this.y - this.h / 2 + editorOutsideHeight - boundingCornerSize / 2 <= mouseY &&
      mouseY <= this.y - this.h / 2 + editorOutsideHeight + boundingCornerSize / 2) {
      this.isResized = 'left top';
    }
    // right top
    if (this.x + this.w / 2 + editorOutsideWidth - boundingCornerSize / 2 <= mouseX &&
      mouseX <= this.x + this.w / 2 + editorOutsideWidth + boundingCornerSize / 2 &&
      this.y - this.h / 2 + editorOutsideHeight - boundingCornerSize / 2 <= mouseY &&
      mouseY <= this.y - this.h / 2 + editorOutsideHeight + boundingCornerSize / 2) {
      this.isResized = 'right top';
    }
    // left bottom
    if (this.x - this.w / 2 + editorOutsideWidth - boundingCornerSize / 2 <= mouseX &&
      mouseX <= this.x - this.w /2 + editorOutsideWidth + boundingCornerSize / 2 &&
      this.y + this.h / 2 + editorOutsideHeight - boundingCornerSize / 2 <= mouseY &&
      mouseY <= this.y + this.h / 2 + editorOutsideHeight + boundingCornerSize / 2) {
      this.isResized = 'left bottom';
    }
    // right bottom
    if (this.x + this.w / 2 + editorOutsideWidth - boundingCornerSize / 2 <= mouseX &&
      mouseX <= this.x + this.w / 2 + editorOutsideWidth + boundingCornerSize / 2 &&
      this.y + this.h / 2 + editorOutsideHeight - boundingCornerSize / 2 <= mouseY &&
      mouseY <= this.y + this.h / 2 + editorOutsideHeight + boundingCornerSize / 2) {
      this.isResized = 'right bottom';
    }
    prePosX = this.x;
    prePosY = this.y;
    preW = this.w;
    preH = this.h;
    if (objects[this.id].type == 'text') {
      preFontSize = objects[this.id].fontSize;
    }
    if (objects[this.id].type == 'polygon') {
      relativeVertexes = [];
      for (let v in this.vertexes) {
        relativeX = map(this.vertexes[v].x - prePosX, 0, preW, 0, 100);
        relativeY = map(this.vertexes[v].y - prePosY, 0, preH, 0, 100);
        relativeVertexes.push({
          x: relativeX,
          y: relativeY
        });
      }
    }
    return this.isResized;
  }
}
boundingBox.prototype.drag = function() {
  if (this.isDragged) {
    draggedX = mouseX - pressedX;
    draggedY = mouseY - pressedY;
    this.x += draggedX;
    this.y += draggedY;
    if (this.type == 'polygon') {
      for (let v in this.vertexes) {
        this.vertexes[v].x += draggedX;
        this.vertexes[v].y += draggedY;
      }
    }

    // apply to objects
    switch (this.type) {
      case 'rect':
      case 'ellipse':
      case 'text':
      case 'superellipse':
        objects[this.id].posX += draggedX;
        objects[this.id].posY += draggedY;
        break;
      case 'polygon':
        for (let v of objects[this.id].vertexes) {
          v.x += draggedX;
          v.y += draggedY;
        }
        break;
    }
    pressedX = mouseX;
    pressedY = mouseY;
  }

  // rotated
  if (this.isRotated) {
    draggedX = mouseX - pressedX;
    draggedY = mouseY - pressedY;
    tmpMax = max(draggedX, draggedY);
    tmpMin = min(draggedX, draggedY);
    if (mouseY < pressedY) {
      this.rotate = tmpMin;
    } else {
      this.rotate = tmpMax;
    }
    print('rotate: ' + this.rotate);
    // apply to objects
    switch (objects[this.id].type) {
      case 'rect':
        objects[this.id].rotate = this.rotate;
        break;
    }
  }

  // resized
  switch (this.isResized) {
    case 'left top':
      if (mouseX < prePosX + preW / 2 + editorOutsideWidth) {
        resizePosX = mouseX - editorOutsideWidth;
        resizeW = prePosX + preW / 2 - (mouseX - editorOutsideWidth);
      } else {
        resizePosX = prePosX + preW / 2;
        resizeW = (mouseX - editorOutsideWidth) - resizePosX;
      }
      if (mouseY < prePosY + preH / 2 + editorOutsideHeight) {
        if (objects[this.id].type == 'text') {
          resizeH = resizeW / this.aspectRatio;
          resizePosY = prePosY + preH / 2 - resizeH / 2 - editorOutsideHeight;
        } else {
          resizePosY = mouseY - editorOutsideHeight;
          resizeH = prePosY + preH / 2 - (mouseY - editorOutsideHeight);
        }
      } else {
        resizePosY = prePosY + preH / 2;
        if (objects[this.id].type == 'text') {
          resizeH = resizeW / this.aspectRatio;
        } else {
          resizeH = (mouseY - editorOutsideHeight) - resizePosY;
        }
      }
      break;
    case 'right top':
      if (prePosX - preW / 2 + editorOutsideWidth < mouseX) {
        resizePosX = prePosX - preW / 2;
        resizeW = (mouseX - editorOutsideWidth) - (prePosX - preW / 2);
      } else {
        resizePosX = mouseX - editorOutsideWidth;
        resizeW = prePosX - preW / 2 - (mouseX - editorOutsideWidth);
      }
      if (mouseY < prePosY + preH / 2 + editorOutsideHeight) {
        if (objects[this.id].type == 'text') {
          resizePosY = (prePosY + preH) - (resizeW / this.aspectRatio);
          resizeH = (prePosY + preH) - resizePosY;
        } else {
          resizePosY = mouseY - editorOutsideHeight;
          resizeH = prePosY + preH / 2 - (mouseY - editorOutsideHeight);
        }
      } else {
        resizePosY = prePosY + preH / 2;
        if (objects[this.id].type == 'text') {
          resizeH = resizeW / this.aspectRatio;
        } else {
          resizeH = (mouseY - editorOutsideHeight) - resizePosY;
        }
      }
      break;
    case 'left bottom':
      if (mouseX < prePosX + preW / 2 + editorOutsideWidth) {
        resizePosX = mouseX - editorOutsideWidth;
        resizeW = prePosX + preW / 2 - (mouseX - editorOutsideWidth);
      } else {
        resizePosX = prePosX + preW / 2;
        resizeW = (mouseX - editorOutsideWidth) - resizePosX;
      }
      if (prePosY - preH / 2 + editorOutsideHeight < mouseY) {
        resizePosY = prePosY - preH / 2;
        if (objects[this.id].type == 'text') {
          resizeH = resizeW / this.aspectRatio;
        } else {
          resizeH = (mouseY - editorOutsideHeight) - resizePosY;
        }
      } else {
        if (objects[this.id].type == 'text') {
          resizePosY = (prePosY + preH) - (resizeW / this.aspectRatio);
          resizeH = (prePosY + preH) - resizePosY;
        } else {
          resizePosY = mouseY - editorOutsideHeight;
          resizeH = prePosY - preH / 2 - resizePosY;
        }
      }
      break;
    case 'right bottom':
      if (prePosX - preW / 2 + editorOutsideWidth < mouseX) {
        resizePosX = prePosX - preW / 2;
        resizeW = (mouseX - editorOutsideWidth) - (prePosX - preW / 2);
      } else {
        resizePosX = mouseX - editorOutsideWidth;
        resizeW = prePosX - preW / 2 - (mouseX - editorOutsideWidth);
      }
      if (prePosY - preH / 2 + editorOutsideHeight < mouseY) {
        resizePosY = prePosY - preH / 2;
        if (objects[this.id].type == 'text') {
          resizeH = resizeW / this.aspectRatio;
        } else {
          resizeH = (mouseY - editorOutsideHeight) - resizePosY;
        }
      } else {
        if (objects[this.id].type == 'text') {
          resizePosY = (prePosY + preH) - (resizeW / this.aspectRatio);
          resizeH = (prePosY + preH) - resizePosY;
        } else {
          resizePosY = mouseY - editorOutsideHeight;
          resizeH = prePosY - preH / 2 - resizePosY;
        }
      }
      break;
  }
  if (this.isResized != false) {
    if (objects[this.id].type == 'text') {
      resizeFontSize = preFontSize * (resizeW / preW);
      let resizeTextBounds = fonts[objects[this.id].fontFace].textBounds(objects[this.id].content, resizePosX, resizePosY + resizeH / 2, resizeFontSize);
      this.x = resizeTextBounds.x + resizeTextBounds.w / 2;
      this.y = resizeTextBounds.y + resizeTextBounds.h / 2;
      this.w = resizeTextBounds.w;
      this.h = resizeTextBounds.h;
    } else {
      this.x = resizePosX + resizeW / 2;
      this.y = resizePosY + resizeH / 2;
      this.w = resizeW;
      this.h = resizeH;
    }
    if (objects[this.id].type == 'polygon') {
      for (let v in relativeVertexes) {
        this.vertexes[v].x = this.x + (relativeVertexes[v].x * (this.w / 100));
        this.vertexes[v].y = this.y + (relativeVertexes[v].y * (this.h / 100));
      }
    }

    // apply to objects
    switch (objects[this.id].type) {
      case 'rect':
      case 'ellipse':
      case 'superellipse':
        objects[this.id].posX = this.x;
        objects[this.id].posY = this.y;
        objects[this.id].width = this.w;
        objects[this.id].height = this.h;
        break;
      case 'text':
        objects[this.id].fontSize = resizeFontSize;
        objects[this.id].posX = this.x;
        objects[this.id].posY = this.y;
        objects[this.id].width = this.w;
        objects[this.id].height = this.h;
        break;
      case 'polygon':
        for (let v in this.vertexes) {
          objects[this.id].vertexes[v].x = this.vertexes[v].x;
          objects[this.id].vertexes[v].y = this.vertexes[v].y;
        }
        break;
    }
  }
}
boundingBox.prototype.release = function() {
  this.isDragged = false;
  this.isResized = false;
  this.isRotated = false;
  print('Setting items for object[' + this.id + '] should appear when it is clicked.');
}

// vertex edit button
function showVertexEditButton(object) {
  push();
  fill('rgba(0, 255, 0, 0.75)');
  textSize(16);
  textFont(monoFont);
  textAlign(RIGHT, TOP);
  text('[edit vertex]', object.x + object.w / 2 + editorOutsideWidth, object.y + object.h / 2 + 10 + editorOutsideHeight);
  pop();
}

// polygon guide
function generatePolygonGuide(object) {
  polygonGuides.push(new polygonGuide(object.id, object.vertexes));
}
let polygonGuide = function(id, vertexes) {
  this.vertexes = vertexes;
  this.id = id;
  this.startPoint = vertexes[0];
  this.endPoint = vertexes[vertexes.length - 1];
  this.isClosed = objects[id].isClosed;
  this.isDragged = false;
}
polygonGuide.prototype.draw = function() {
  if (this.isClosed == false) {
    push();
    fill('rgba(255, 255, 255, 1)');
    stroke('rgba(255, 0, 0, 1)');
    strokeWeight(1);
    rectMode(CORNER);
    rect(this.startPoint.x + editorOutsideWidth - polygonGuideSize / 2, this.startPoint.y + editorOutsideHeight - polygonGuideSize / 2, polygonGuideSize, polygonGuideSize);
    ellipseMode(CORNER);
    ellipse(this.endPoint.x + editorOutsideWidth - polygonGuideSize / 2, this.endPoint.y + editorOutsideHeight - polygonGuideSize / 2, polygonGuideSize, polygonGuideSize);
    pop();
  } else {
    push();
    noStroke();
    fill('rgba(255, 0, 0, 1)');
    ellipseMode(CORNER);
    ellipse(this.startPoint.x + editorOutsideWidth - polygonGuideSize / 2, this.startPoint.y + editorOutsideHeight - polygonGuideSize / 2, polygonGuideSize, polygonGuideSize);
    ellipse(this.endPoint.x + editorOutsideWidth - polygonGuideSize / 2, this.endPoint.y + editorOutsideHeight - polygonGuideSize / 2, polygonGuideSize, polygonGuideSize);
    pop();
  }
  for (let i = 1;i < this.vertexes.length - 1;i++) {
    push();
    noStroke();
    fill('rgba(255, 0, 0, 1)');
    ellipseMode(CORNER);
    ellipse(this.vertexes[i].x + editorOutsideWidth - polygonGuideSize / 2, this.vertexes[i].y + editorOutsideHeight - polygonGuideSize / 2, polygonGuideSize, polygonGuideSize);
    pop();
  }
}
polygonGuide.prototype.pressed = function() {
  print('pressed');
  // drag
  if (this.endPoint.x + editorOutsideWidth - polygonGuideSize / 2 <= mouseX && mouseX <= this.endPoint.x + editorOutsideWidth + polygonGuideSize / 2 && this.endPoint.y + editorOutsideHeight - polygonGuideSize / 2 < mouseY && mouseY <= this.endPoint.y + editorOutsideHeight + polygonGuideSize / 2) {
    print('endPoint is pressed');
    this.isDragged = true;
    return this.isDragged;
  }

}
polygonGuide.prototype.drag = function() {
  if (this.isDragged) {
    print(this.id + ' is dragged');
  }
}
polygonGuide.prototype.release = function() {
  this.isDragged = false;
}

// draw trimmarks
function drawTrimmarks(sizeWidth, sizeHeight, bleed) {
  for (let slot in inkslot) {
    // service id
    colors[inkslot[slot]].push();
    colors[inkslot[slot]].translate(width / 2, height / 2);
    colors[inkslot[slot]].fill(255);
    colors[inkslot[slot]].noStroke();
    colors[inkslot[slot]].textAlign(LEFT, BASELINE);
    colors[inkslot[slot]].textFont(ciFont);
    colors[inkslot[slot]].textSize(48);
    colors[inkslot[slot]].text('EditRiso', -sizeWidth / 2 + bleed, -sizeHeight / 2 - bleed * 2);
    colors[inkslot[slot]].textAlign(RIGHT, BASELINE);
    colors[inkslot[slot]].textFont(monoFont);
    colors[inkslot[slot]].textSize(bleed / 2);
    colors[inkslot[slot]].text('powered by p5.riso.js', sizeWidth / 2 - bleed, -sizeHeight / 2 - bleed * 2);
    colors[inkslot[slot]].pop();

    // trimmark common setting
    colors[inkslot[slot]].push();
    colors[inkslot[slot]].translate(width / 2, height / 2);
    colors[inkslot[slot]].stroke(255);
    colors[inkslot[slot]].noFill();
    colors[inkslot[slot]].strokeWeight(1);

    // left top
    colors[inkslot[slot]].line(-sizeWidth / 2 - 118, -sizeHeight / 2 - bleed, -sizeWidth / 2, -sizeHeight / 2 - bleed);
    colors[inkslot[slot]].line(-sizeWidth / 2 - 118 - bleed, -sizeHeight / 2, -sizeWidth / 2 - bleed, -sizeHeight / 2);
    colors[inkslot[slot]].line(-sizeWidth / 2 - bleed, -sizeHeight / 2 - 118, -sizeWidth / 2 - bleed, -sizeHeight / 2);
    colors[inkslot[slot]].line(-sizeWidth / 2, -sizeHeight / 2 - 118 - bleed, -sizeWidth / 2, -sizeHeight / 2 - bleed);

    // center top
    colors[inkslot[slot]].line(0, -sizeHeight / 2 - 118 - bleed, 0, -sizeHeight / 2 - bleed);
    colors[inkslot[slot]].line(-118, -sizeHeight / 2 - 59 - bleed, 118, -sizeHeight / 2 - 59 - bleed);
    colors[inkslot[slot]].ellipseMode(CENTER);
    colors[inkslot[slot]].ellipse(0, -sizeHeight / 2 - 59 - bleed, 59, 59);

    // right top
    colors[inkslot[slot]].line(sizeWidth / 2 + 118, -sizeHeight / 2 - bleed, sizeWidth / 2, -sizeHeight / 2 - bleed);
    colors[inkslot[slot]].line(sizeWidth / 2 + 118 + bleed, -sizeHeight / 2, sizeWidth / 2 + bleed, -sizeHeight / 2);
    colors[inkslot[slot]].line(sizeWidth / 2 + bleed, -sizeHeight / 2 - 118, sizeWidth / 2 + bleed, -sizeHeight / 2);
    colors[inkslot[slot]].line(sizeWidth / 2, -sizeHeight / 2 - 118 - bleed, sizeWidth / 2, -sizeHeight / 2 - bleed);

    // left middle
    colors[inkslot[slot]].line(-sizeWidth / 2 - 118 - bleed, 0, -sizeWidth / 2 - bleed, 0);
    colors[inkslot[slot]].line(-sizeWidth / 2 - 59 - bleed, -118, -sizeWidth / 2 - 59 - bleed, 118);
    colors[inkslot[slot]].ellipse(-sizeWidth / 2 - 59 - bleed, 0, 59, 59);

    // right middle
    colors[inkslot[slot]].line(sizeWidth / 2 + 118 + bleed, 0, sizeWidth / 2 + bleed, 0);
    colors[inkslot[slot]].line(sizeWidth / 2 + 59 + bleed, -118, sizeWidth / 2 + 59 + bleed, 118);
    colors[inkslot[slot]].ellipse(sizeWidth / 2 + 59 + bleed, 0, 59, 59);

    // left bottom
    colors[inkslot[slot]].line(-sizeWidth / 2 - 118, sizeHeight / 2 + bleed, -sizeWidth / 2, sizeHeight / 2 + bleed);
    colors[inkslot[slot]].line(-sizeWidth / 2 - 118 - bleed, sizeHeight / 2, -sizeWidth / 2 - bleed, sizeHeight / 2);
    colors[inkslot[slot]].line(-sizeWidth / 2 - bleed, sizeHeight / 2 + 118, -sizeWidth / 2 - bleed, sizeHeight / 2);
    colors[inkslot[slot]].line(-sizeWidth / 2, sizeHeight / 2 + 118 + bleed, -sizeWidth / 2, sizeHeight / 2 + bleed);

    // center bottom
    colors[inkslot[slot]].line(0, sizeHeight / 2 + 118 + bleed, 0, sizeHeight / 2 + bleed);
    colors[inkslot[slot]].line(-118, sizeHeight / 2 + 59 + bleed, 118, sizeHeight / 2 + 59 + bleed);
    colors[inkslot[slot]].ellipse(0, sizeHeight / 2 + 59 + bleed, 59, 59);

    // right bottom
    colors[inkslot[slot]].line(sizeWidth / 2 + 118, sizeHeight / 2 + bleed, sizeWidth / 2, sizeHeight / 2 + bleed);
    colors[inkslot[slot]].line(sizeWidth / 2 + 118 + bleed, sizeHeight / 2, sizeWidth / 2 + bleed, sizeHeight / 2);
    colors[inkslot[slot]].line(sizeWidth / 2 + bleed, sizeHeight / 2 + 118, sizeWidth / 2 + bleed, sizeHeight / 2);
    colors[inkslot[slot]].line(sizeWidth / 2, +sizeHeight / 2 + 118 + bleed, sizeWidth / 2, sizeHeight / 2 + bleed);
    colors[inkslot[slot]].pop();

    // colors
    colors[inkslot[slot]].push();
    colors[inkslot[slot]].translate(width / 2, height / 2);
    colors[inkslot[slot]].fill(255);
    colors[inkslot[slot]].noStroke();
    switch (slot) {
      case 'A':
        i = 0;
        break;
      case 'B':
        i = 1;
        break;
      case 'C':
        i = 2;
        break;
      case 'D':
        i = 3;
        break;
    }
    colors[inkslot[slot]].rect(-sizeWidth / 2 + bleed, sizeHeight / 2 + bleed * 2 + bleed * 0.5 * i, bleed * 0.5, bleed * 0.5);
    colors[inkslot[slot]].rect(-sizeWidth / 2 + bleed, sizeHeight / 2 + bleed * 2 + bleed * 0.5 * i, bleed * 0.5, bleed * 0.5);
    colors[inkslot[slot]].textAlign(LEFT, TOP);
    colors[inkslot[slot]].textFont(monoFont);
    colors[inkslot[slot]].textSize(bleed / 2);
    colors[inkslot[slot]].text(inkslot[slot], -sizeWidth / 2 + bleed * 1.75, sizeHeight / 2 + bleed * 1.9 + bleed * 0.5 * i);
    colors[inkslot[slot]].pop();

    // size
    colors[inkslot[slot]].push();
    colors[inkslot[slot]].translate(width / 2, height / 2);
    colors[inkslot[slot]].fill(255);
    colors[inkslot[slot]].noStroke();
    colors[inkslot[slot]].textAlign(RIGHT, TOP);
    colors[inkslot[slot]].textFont(monoFont);
    colors[inkslot[slot]].textSize(bleed / 2);
    colors[inkslot[slot]].text(formats[selectedFormat].name + ' ' + formats[selectedFormat].printWidth + 'mm * ' + formats[selectedFormat].printHeight + 'mm ' + '(300dpi)', sizeWidth / 2 - bleed, sizeHeight / 2 + bleed * 2);
    colors[inkslot[slot]].pop();
  }

}

// resize canvas
function setSize(size) {
  resizeCanvas(size.width + 400, size.height + 400);
}

// sgn for superellipse
function sgn(val) {
  if (val == 0) {
    return 0;
  }
  return val / abs(val);
}
