export function createDonutChart(selector, data, options) {
  const container = document.querySelector(selector);
  if (!container) {
    throw new Error(`No element found for selector: ${selector}`);
  }

  const defaultOptions = {
    radius: 40,
    strokeWidth: 8,
    strokeLineCap: 'round',
    colors: [],
    showLegend: true,
    animation: 'progress',
    animationDuration: 500,
    padding: 20,
    controls: false,
  };

  options = { ...defaultOptions, ...options };
  let cumulativeStrokeValue = 0;

  const state = {
    svg: null,
    radius: options.radius,
    padding: options.padding,
    paths: [],
    borderVisible: false,
  };

  const maxStrokeWidth = state.padding / 2;

  if (options.strokeWidth > maxStrokeWidth) {
    console.warn(
      `Stroke width exceeds the maximum allowed value. Adjusting to ${maxStrokeWidth}.`
    );
    options.strokeWidth = maxStrokeWidth;
  }

  const svgSize = state.radius * 2 + state.padding;
  const circumference = 2 * Math.PI * state.radius;

  // Create SVG
  state.svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  state.svg.setAttribute('width', svgSize);
  state.svg.setAttribute('height', svgSize);
  state.svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
  container.appendChild(state.svg);

  data.forEach((item, idx) => {
    const strokeValue = (item.value / 100) * circumference;
    cumulativeStrokeValue += strokeValue;
    const color = data[idx].colors || getRandomColor();
    
    data[idx].strokeValue = cumulativeStrokeValue;
    data[idx].strokeWidth = Math.min(data[idx].strokeWidth, maxStrokeWidth) || options.strokeWidth;
    
    console.log(color, data[idx].strokeWidth);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      `M${state.radius + state.padding / 2} ${state.padding / 2}
       a ${state.radius} ${state.radius} 0 1 1 0 ${state.radius * 2}
       a ${state.radius} ${state.radius} 0 1 1 0 -${state.radius * 2}`
    );
    path.setAttribute('stroke-width', "1");
    path.setAttribute('stroke-linecap', options.strokeLineCap);
    path.setAttribute('stroke-dasharray', `0, ${circumference}`);
    path.setAttribute('stroke', "transparent");
    path.setAttribute('fill', 'none');
    path.style.transition = `all ${options.animationDuration}ms ease`;

    
    switch (options.animation) {
      case 'inflate':
        path.setAttribute('stroke-dasharray', `${data[idx].strokeValue}, ${circumference}`);
        path.setAttribute('stroke', color);
        path.setAttribute('fill', 'none');

        setTimeout(() => {
          path.setAttribute('stroke-width', `${data[idx].strokeWidth}`);
        }, 100);
        break;
      case 'progress':
        path.setAttribute('stroke-width', `${data[idx].strokeWidth}`);
        path.setAttribute('stroke', color);
        path.setAttribute('fill', 'none');
        
        setTimeout(() => {
          path.setAttribute('stroke-dasharray', `${data[idx].strokeValue}, ${circumference}`);
        }, 100);
        break;
      case 'none':
        path.setAttribute('stroke-dasharray', `${data[idx].strokeValue}, ${circumference}`);
        path.setAttribute('stroke-width', `${data[idx].strokeWidth}`);
        path.setAttribute('stroke', color);
        path.setAttribute('fill', 'none');
        break;
      default:
        path.setAttribute('stroke-dasharray', `${data[idx].strokeValue}, ${circumference}`);
        path.setAttribute('stroke-width', `${data[idx].strokeWidth}`);
        path.setAttribute('stroke', color);
        path.setAttribute('fill', 'none');
        break;
    }

    state.paths.push({
      element: path,
      strokeWidth: options.strokeWidth,
      strokeColor: color,
      strokeValue,
    });

    state.svg.prepend(path);

    if (options.showLegend) {
      updateLegend(color, item.value, container);
    }
  });

  // Add controls if enabled
  if (options.controls) {
    addControls(container, state);
  }
}

function animatePaths(paths, circumference, animation) {
  paths.forEach((pathObj) => {
    const { element, strokeValue } = pathObj;

    switch (animation) {
      case 'progress':
        setTimeout(() => {
          element.setAttribute('stroke-dasharray', `${strokeValue}, ${circumference}`);
        }, 100);
        break;
      case 'inflate':
        element.setAttribute('stroke-dasharray', `${strokeValue}, ${circumference}`);
        break;
      case 'none':
        element.setAttribute('stroke-dasharray', `${strokeValue}, ${circumference}`);
        break;
      default:
        break;
    }
  });
}

function updateLegend(color, value, container) {
  const legend = document.createElement('div');
  legend.style.display = 'flex';
  legend.style.alignItems = 'center';
  legend.style.marginBottom = '5px';

  const colorBox = document.createElement('div');
  colorBox.style.width = '20px';
  colorBox.style.height = '20px';
  colorBox.style.backgroundColor = color;
  colorBox.style.marginRight = '10px';

  const text = document.createElement('span');
  text.textContent = `${value}%`;

  legend.appendChild(colorBox);
  legend.appendChild(text);
  container.appendChild(legend);
}

function addControls(container, state) {
  const controlsDiv = document.createElement('div');
  controlsDiv.style.width = 'fit-content';
  controlsDiv.style.padding = '10px';
  controlsDiv.style.marginTop = '20px';
  controlsDiv.style.backgroundColor = '#2e2e2e';
  controlsDiv.style.color = '#fff';
  controlsDiv.style.fontFamily = 'Arial, sans-serif';
  // controlsDiv.style.display = 'flex';
  // controlsDiv.style.flexDirection = 'column';

  // Border toggle
  const borderToggle = document.createElement('input');
  borderToggle.type = 'checkbox';
  borderToggle.id = 'toggle-border';
  borderToggle.addEventListener('change', (e) => {
    state.borderVisible = e.target.checked;
    state.svg.style.border = state.borderVisible ? '1px solid red' : 'none';
  });

  const borderLabel = document.createElement('label');
  borderLabel.htmlFor = 'toggle-border';
  borderLabel.textContent = 'Show SVG Border';
  controlsDiv.appendChild(borderToggle);
  controlsDiv.appendChild(borderLabel);

  // Padding adjuster
  createRangeInput(controlsDiv, 'Padding', state.padding, 0, 100, 1, (value) => {
    state.padding = value;
    updateSVG(state);
  });

  // Radius adjuster
  createRangeInput(controlsDiv, 'Radius', state.radius, 10, 100, 1, (value) => {
    state.radius = value;
    updateSVG(state);
  });

  // Stroke width adjuster
  state.paths.forEach((pathObj, idx) => {
    createRangeInput(
      controlsDiv,
      `Stroke Width for Path ${idx + 1}`,
      pathObj.strokeWidth,
      1,
      state.padding / 2,
      1,
      (value) => {
        pathObj.strokeWidth = value;
        pathObj.element.setAttribute('stroke-width', value);
      }
    );
  });

  // Stroke color adjuster
  state.paths.forEach((pathObj, idx) => {
    const colorInput = document.createElement('input');
    colorInput.type = 'color';
    colorInput.value = pathObj.strokeColor;
    colorInput.addEventListener('input', (e) => {
      pathObj.strokeColor = e.target.value;
      pathObj.element.setAttribute('stroke', e.target.value);
    });

    const colorLabel = document.createElement('label');
    colorLabel.textContent = `Stroke Color for Path ${idx + 1}`;
    controlsDiv.appendChild(colorLabel);
    controlsDiv.appendChild(colorInput);
  });

  container.appendChild(controlsDiv);
}

function createRangeInput(parent, label, value, min, max, step, onChange) {
  const wrapper = document.createElement('div');
  const rangeLabel = document.createElement('label');
  rangeLabel.textContent = label;

  const rangeInput = document.createElement('input');
  rangeInput.type = 'range';
  rangeInput.min = min;
  rangeInput.max = max;
  rangeInput.step = step;
  rangeInput.value = value;

  rangeInput.addEventListener('input', (e) => {
    onChange(Number(e.target.value));
  });

  wrapper.appendChild(rangeLabel);
  wrapper.appendChild(rangeInput);
  parent.appendChild(wrapper);
}

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function updateSVG(state) {
  const svgSize = state.radius * 2 + state.padding;
  state.svg.setAttribute('width', svgSize);
  state.svg.setAttribute('height', svgSize);
  state.svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
  state.paths.forEach((pathObj) => {
    const { element } = pathObj;
    element.setAttribute(
      'd',
      `M${state.radius + state.padding / 2} ${state.padding / 2}
       a ${state.radius} ${state.radius} 0 1 1 0 ${state.radius * 2}
       a ${state.radius} ${state.radius} 0 1 1 0 -${state.radius * 2}`
    );
  });
}
