function initDailyList(df, container) {
    let c = document.getElementById(container);
    let row = df.loc({ rows: ['2020-10-21'] });

    let list = element('div', cantons.map(canton => {
        return element('p', canton.name)
    }));
    c.appendChild(list)
}