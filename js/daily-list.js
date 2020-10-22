function initDailyList(df, df_updates, container) {
    let c = document.getElementById(container);
    let today = moment(new Date()).tz('Europe/Zurich').format('YYYY-MM-DD');
    let yesterday = moment(new Date()).subtract(1, 'day').tz('Europe/Zurich').format('YYYY-MM-DD');
    let rowToday = df.loc({ rows: [today] });
    let rowYesterday = df.loc({ rows: [yesterday] });

    let cantonIds = df_updates['canton'].values;
    cantonIds.unshift('CH');

    let items = cantonIds.map(cantonId => {
        let valueToday = rowToday[cantonId + '_diff'].data[0]
        let valueYesterday = rowYesterday[cantonId + '_diff'].data[0]

        return element('div', { class: 'w-full w-sm-half p-10 canton-list-item-container' },
            element('div', { class: 'd-flex h-50 rounded bg-very-dark canton-list-item' }, [
                element('div', {
                    class: "canton-list-item-flag w-50 p-5 rounded-left",
                    style: "background-image: url('/assets/flags/" + cantonId + ".svg')"
                }),
                element('div', { class: 'd-flex flex-column justify-content-around flex-fill p-5' }, [
                    element('div', { class: 'text-center' }, 'Today'),
                    element('div', { class: 'text-center' }, isNaN(valueToday) ? '--' : valueToday)
                ]),
                element('div', { class: 'd-flex flex-column justify-content-around flex-fill p-5' }, [
                    element('div', { class: 'text-center' }, 'Yesterday'),
                    element('div', { class: 'text-center' }, isNaN(valueYesterday) ? '--' : valueYesterday)
                ]),
                element('button', {
                    class: 'btn btn-default h-50',
                    type: 'button',
                    click: () => {
                        updateDaily(cantonId);
                        document.getElementById('daily-canton-title').innerHTML = cantons.find(c => c.id == cantonId).name;
                    }
                }, 'More')
            ])
        )
    });

    items.forEach(item => {
        c.appendChild(item);
    });
}