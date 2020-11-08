export default function(container, title, titleKey, cases, fatalities,
    hospitalizations, regionsReported, nRegionsTotal) {
  const parent = document.getElementById(container);

  if (regionsReported !== undefined) {
    parent.appendChild(
        element('div', [element('b', {
          'data-i18n': titleKey,
        }, title), element('span', {
          'data-toggle': 'tooltip',
          'data-title': regionsReported.join(', '),
          'data-placement': 'bottom',
        }, ' ' + regionsReported.length + '/' + nRegionsTotal)]),
    );
  } else {
    parent.appendChild(
        element('div', element('b', {'data-i18n': titleKey}, title)),
    );
  }

  parent.appendChild(element('div', [
    element('span', {class: 'font-size-20'}, Math.round(cases)),
    element('span', ' '),
    element('span', {'data-i18n': 'summary.cases'}, 'cases'),
  ]));

  parent.appendChild(element('div', [
    element('span', {class: 'font-size-20'}, Math.round(fatalities)),
    element('span', ' '),
    element('span', {'data-i18n': 'summary.fatalities'}, 'fatalities'),
  ]));

  parent.appendChild(element('div', [
    element('span', {class: 'font-size-20'}, Math.round(hospitalizations)),
    element('span', ' '),
    element('span', {
      'data-i18n': 'summary.hospitalizations',
    }, 'hospitalizations'),
  ]));
}
