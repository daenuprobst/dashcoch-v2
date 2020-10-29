import { getRow } from './helpers.js'

function initDailyList(df, df_updates, container) {
    let c = document.getElementById(container);
    let today = Date.parse(moment(new Date()).tz('Europe/Zurich').format('YYYY-MM-DD'));
    let yesterday = Date.parse(moment(new Date()).subtract(1, 'day').tz('Europe/Zurich').format('YYYY-MM-DD'));

    let rowToday = getRow(df, today);
    let rowYesterday = getRow(df, yesterday);

    let cantonIds = ['CH']
    for (let i = 0; i < df_updates.length; i++) {
        cantonIds.push(df_updates[i][0]);
    }

    let items = cantonIds.map(cantonId => {
        let suffix = '_diff';
        if (dashcoch.state.daily_total) {
            suffix = '';
        }

        if (dashcoch.state.daily_per_capita) {
            suffix += '_pc'
        }

        let valueToday = rowToday[cantonId + suffix]
        let valueYesterday = rowYesterday[cantonId + suffix]

        // Replace null with '--' or round otherweise
        if (valueToday === null) {
            valueToday = '--';
        } else {
            valueToday = Math.round((valueToday + Number.EPSILON) * 1000) / 1000
        }

        if (valueYesterday === null) {
            valueYesterday = '--';
        } else {
            valueYesterday = Math.round((valueYesterday + Number.EPSILON) * 1000) / 1000
        }

        return element('div', { class: 'w-full w-sm-half p-10 canton-list-item-container' },
            element('div', { class: 'd-flex h-50 rounded bg-very-dark canton-list-item' }, [
                element('div', {
                    class: "canton-list-item-flag w-50 p-5 rounded-left",
                    style: "background-image: url('/assets/flags/" + cantonId + ".svg')"
                }),
                element('div', { class: 'd-flex flex-column justify-content-around p-5' }, [
                    element('div', { class: 'text-center' }, cantonId),
                ]),
                element('div', { class: 'd-flex flex-column justify-content-around flex-fill p-5' }, [
                    element('div', { class: 'text-center' }, 'Today'),
                    element('div', { class: 'text-center font-weight-bold' }, valueToday)
                ]),
                element('div', { class: 'd-flex flex-column justify-content-around flex-fill p-5' }, [
                    element('div', { class: 'text-center' }, 'Yesterday'),
                    element('div', { class: 'text-center' }, valueYesterday)
                ]),
                element('button', {
                    class: 'btn btn-default h-50',
                    type: 'button',
                    click: () => {
                        dashcoch.state.daily_canton = cantonId;
                        dashcoch.updateDaily();
                    }
                }, element('i', { class: 'far fa-chart-bar' }))
            ])
        )
    });

    items.forEach(item => {
        c.appendChild(item);
    });
}

export { initDailyList };