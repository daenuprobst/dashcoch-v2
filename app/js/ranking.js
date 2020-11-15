export default function(container, data, property, asc=true,
    mark=['Switzerland']) {
  const c = document.getElementById(container);

  const arr = [];
  for (const [country, dates] of Object.entries(data)) {
    // Get the max date
    const sortedDateKeys = Object.keys(dates).sort((a, b) => {
      return parseInt(b) - parseInt(a);
    });

    arr.push({
      date: new Date(parseInt(sortedDateKeys[0])),
      country: country,
      value: Math.round(1000 * dates[sortedDateKeys[0]][property]) / 1000,
    });
  }

  if (asc) {
    arr.sort((a, b) => {
      return a.value - b.value;
    });
  } else {
    arr.sort((a, b) => {
      return b.value - a.value;
    });
  }

  let i = 1;
  for (const entry of arr) {
    const markedClass = entry.country === 'Switzerland' ? 'table-danger' : '';
    c.appendChild(element('tr', {class: markedClass}, [
      element('td', i++),
      element('td', _dc.t('countries.' + entry.country)),
      element('td', {
        'data-sort': +entry.date,
      }, entry.date.toLocaleDateString()),
      element('td', {
        class: 'text-right',
      }, entry.value),
    ]));
  }
}
