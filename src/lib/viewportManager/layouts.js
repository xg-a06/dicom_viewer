
function createDiv ({ top, left, width, height }) {
  const div = document.createElement('div');
  div.style.cssText = `position:absolute;top:${top};left:${left};width:${width};height:${height};`;
  return div;
}

const layouts = {
  'L1x1': {
    rows: 1,
    columns: 1,
    data: [
      {
        row: 1,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      }
    ]
  },
  'L1x2': {
    rows: 1,
    columns: 2,
    data: [
      {
        row: 1,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 1,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      }
    ]
  },
  'L2x1': {
    rows: 2,
    columns: 1,
    data: [
      {
        row: 1,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 2,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      }
    ]
  },
  'L2+1': {
    rows: 2,
    columns: 2,
    data: [
      {
        row: 1,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 1,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 2,
        column: 1,
        rowSpan: 1,
        columnSpan: 2
      }
    ]
  },
  'L1+2': {
    rows: 2,
    columns: 2,
    data: [
      {
        row: 1,
        column: 1,
        rowSpan: 2,
        columnSpan: 1
      },
      {
        row: 1,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 2,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      }
    ]
  },
  'L1x3': {
    rows: 1,
    columns: 3,
    data: [
      {
        row: 1,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 1,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 1,
        column: 3,
        rowSpan: 1,
        columnSpan: 1
      }
    ]
  },
  'L2x2': {
    rows: 2,
    columns: 2,
    data: [
      {
        row: 1,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 1,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 2,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 2,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      }
    ]
  },
  'L1+3': {
    rows: 3,
    columns: 2,
    data: [
      {
        row: 1,
        column: 1,
        rowSpan: 3,
        columnSpan: 1
      },
      {
        row: 1,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 2,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 3,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      }
    ]
  },
  'L3x3': {
    rows: 3,
    columns: 3,
    data: [
      {
        row: 1,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 1,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 1,
        column: 3,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 2,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 2,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 2,
        column: 3,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 3,
        column: 1,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 3,
        column: 2,
        rowSpan: 1,
        columnSpan: 1
      },
      {
        row: 3,
        column: 3,
        rowSpan: 1,
        columnSpan: 1
      }
    ]
  },
}


const doLayout = (layoutType) => {
  const layout = layouts[layoutType];
  const { rows, columns } = layout;
  const rets = layout.data.map(({ row, column, rowSpan, columnSpan }) => {
    return createDiv({
      top: `${100 * (row - 1) / rows}%`,
      left: `${100 * (column - 1) / columns}%`,
      width: `${100 * columnSpan / columns}%`,
      height: `${100 * rowSpan / rows}%`,
    });
  })
  return rets;
}


export default doLayout;