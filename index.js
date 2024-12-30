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
    animationDuration: 500,
  };

  options = { ...defaultOptions, ...options };
  const circumference = 2 * Math.PI * options.radius;

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  svg.setAttribute('width', options.radius * 2 + 20);
  svg.setAttribute('height', options.radius * 2 + 20);
  svg.setAttribute('viewBox', `0 0 ${options.radius * 2 + 20} ${options.radius * 2 + 20}`);
  
  let cumulativeStrokeValue = 0;

  data.forEach((item, idx) => {
    const value = item.value;
    const strokeValue = (value / 100) * circumference;
    cumulativeStrokeValue += strokeValue;
    data[idx].strokeValue = cumulativeStrokeValue;
    const color = options.colors[idx] || getRandomColor();
    console.log(color);

    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', `
      M${options.radius + 10} 10
      a ${options.radius} ${options.radius} 0 0 1 0 ${options.radius * 2}
      a ${options.radius} ${options.radius} 0 0 1 0 -${options.radius * 2}`);
    path.setAttribute('stroke', color);
    path.setAttribute('fill', 'none');
    path.setAttribute('stroke-width', options.strokeWidth);
    path.setAttribute('stroke-linecap', options.strokeLineCap);
    path.setAttribute('stroke-dasharray', `0, ${circumference}`);
    path.style.transition = `stroke-dasharray ${options.animationDuration}ms ease`;

    setTimeout(() => {
      path.setAttribute('stroke-dasharray', `${data[idx].strokeValue}, ${circumference}`);
    }, 100);

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