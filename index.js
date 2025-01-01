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
    inspectable: false,
  };

  options = { ...defaultOptions, ...options };
  let cumulativeStrokeValue = 0;
  const svgSize = options.radius * 2 + options.padding;
  const maxStrokeWidth = options.padding / 2;

  if (options.strokeWidth > maxStrokeWidth) {
    console.warn(
      `Stroke width exceeds the maximum allowed value. Adjusting to ${maxStrokeWidth}.`
    );
    options.strokeWidth = maxStrokeWidth;
  }

  const circumference = 2 * Math.PI * options.radius;

  // Create SVG
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', svgSize);
  svg.setAttribute('height', svgSize);
  svg.setAttribute('viewBox', `0 0 ${svgSize} ${svgSize}`);
  
  if (options.inspectable) {
    svg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
    svg.setAttribute('style', 'border: 1px solid red;');
  }
  
  data.forEach((item, idx) => {
    const value = item.value;
    const strokeValue = (value / 100) * circumference;
    cumulativeStrokeValue += strokeValue;
    const color = data[idx].colors || getRandomColor();

    data[idx].strokeValue = cumulativeStrokeValue;
    data[idx].strokeWidth = Math.min(data[idx].strokeWidth, maxStrokeWidth) || options.strokeWidth;

    console.log(color, data[idx].strokeWidth);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute(
      'd',
      `M${options.radius + options.padding / 2} ${options.padding / 2}
      a ${options.radius} ${options.radius} 0 0 1 0 ${options.radius * 2}
      a ${options.radius} ${options.radius} 0 0 1 0 -${options.radius * 2}`
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

    svg.prepend(path);
    if (options.showLegend) {
      updateLegend(color, value, container);
    }
  });

  container.appendChild(svg);
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

function getRandomColor() {
  const letters = '0123456789ABCDEF';
  let color = '#';
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}