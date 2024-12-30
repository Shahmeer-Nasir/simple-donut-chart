# Simple Donut Chart

A lightweight, customizable donut chart library for your JavaScript projects.

---
[![Simple donut chart](https://i.imgur.com/KP6pKwx.png)](https://www.npmjs.com/package/@shahmeernasir/simple-donut-chart)

## Table of contents

* [Installation](#Installation)
* [Features](#Features)

```html
<body>
  <div id="donut"></div>
</body>
```

```js
import { createDonutChart } from '@shahmeernasir/simple-donut-chart';

const data = [
  { value: 10, label: 'A' },
  { value: 25, label: 'B' },
  { value: 25, label: 'B' },
  { value: 40, label: 'C' }
];

const options = {
  radius: 80,
  strokeWidth: 16,
  strokeLineCap: 'none',
  colors: [],
  showLegend: true,
  animationDuration: 1000,
};

createDonutChart('#donut', data, options);
```

![Simple donut chart](https://i.imgur.com/RYxLeRB.png)

## Installation

Installation is done using the
[`npm install` command](https://docs.npmjs.com/getting-started/installing-npm-packages-locally):

```bash
npm install @shahmeernasir/simple-donut-chart
```

## Features

  * Simple
  * Zero dependencies
