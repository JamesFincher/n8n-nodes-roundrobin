const { src, dest } = require('gulp');
const path = require('path');

/**
 * Copies node icon files to the dist folder
 */
function buildIcons() {
  const nodeTypes = [
    {
      src: './nodes/RoundRobin/roundrobin.svg',
      dest: './dist/nodes/RoundRobin',
    }
  ];

  const nodeTypeStreams = nodeTypes.map(nodeType => {
    return src(nodeType.src).pipe(dest(nodeType.dest));
  });

  return Promise.all(nodeTypeStreams);
}

exports['build:icons'] = buildIcons; 