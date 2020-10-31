export default function (container, title, cases, fatalities,
    hospitalizations, regionsReported, nRegionsTotal) {
    let parent = document.getElementById(container);

    if (regionsReported !== undefined) {
        parent.appendChild(
            element('div', [element('b', title), element('span', {
                'data-toggle': 'tooltip',
                'data-title': 'Cantons reported: ' + regionsReported.join(', '),
                'data-placement': 'bottom'
            }, ' ' + regionsReported.length + '/' + nRegionsTotal)])
        );
    } else {
        parent.appendChild(
            element('div', element('b', title))
        );
    }

    parent.appendChild(element('div', [
        element('span', { class: 'font-size-20' }, Math.round(cases)),
        element('span', ' cases')
    ]));

    parent.appendChild(element('div', [
        element('span', { class: 'font-size-20' }, Math.round(fatalities)),
        element('span', ' fatalities')
    ]));

    parent.appendChild(element('div', [
        element('span', { class: 'font-size-20' }, Math.round(hospitalizations)),
        element('span', ' hospitalizations')
    ]));
}