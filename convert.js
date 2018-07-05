#!/usr/bin/node
fs = require('fs')
fs.readFile(0, 'utf8', function (err,data) {
  if (err) {
    return console.log(err);
  }
  const pixels = data.split('\n')
    .map(line => line.split(' '))
    .map(arr => {
      const posline = arr[0].substring(0, arr[0].length - 1);
      pos = posline.split(',')
      let color = arr[5] || '';
      color = color.startsWith('srgba') ? color.substring(1) : color;
      return {
        pos: {
          x: pos[0], y: pos[1]
        },
        color
      }
    })
    .filter(isDrawablePixel)
  let svg = pixels
    .filter(pixel => !!pixel.pos.x && !!pixel.pos.y && !!pixel.color)
    .map(toRectangle)
    .map(r => `  ${r}`)
    .join('\n')
  let classes = []
  pixels
    .map(pixel => pixel.color)
    .forEach(color => {
      classes[color] = `.${asIdentifier(color)} { fill: ${color} }`
    })
  const width = maxValue(pixels, _ => parseInt(_.pos.x, 10)) + 1;
  const height = maxValue(pixels, _ => parseInt(_.pos.y)) + 1;
  svg = `<?xml version="1.0" standalone="no"?>
<svg width="${width}" height="${height}" version="1.1" xmlns="http://www.w3.org/2000/svg">
<style type="text/css">
<![CDATA[
  rect {
    fill: black
  }
  ${Object.values(classes).join('\n  ')}
]]>
</style>
${svg}
</svg>`
  process.stdout.write(svg)
});
function toRectangle(pixel) {
  let css = " "
  with (pixel) {
    if (color !== 'black') {
      css = ` class="${asIdentifier(color)}"`
    }
    return `<rect x="${pos.x}" y="${pos.y}" width="1" height="1"${css} />`
  }
}
const identifiers = []
function asIdentifier(text) {
  const id = text.replace(/[\(\),]/g, '_');
  identifiers.push(id)
  return 'c' + identifiers.indexOf(id)
}
function maxValue(array, fn) {
  return Math.max(...array.map(fn))
}
function isDrawablePixel(pixel) {
  return pixel.color && ['none', 'transparent'].indexOf(pixel.color) === -1 && !pixel.color.match(/rgba\(\d+,\d+,\d+,0\.?0*\)/)
}
