(() => {
  'use strict';
  const form = document.querySelector('[data-catalog-filters]');
  if (!form) return;

  const fields = [...form.querySelectorAll('input, select')];
  const output = document.querySelector('[data-filter-count]');
  const groups = [...document.querySelectorAll('[data-catalog-group]')].map(group => ({
    element: group,
    works: [...group.querySelectorAll('[data-work]')],
  }));
  const normalize = value => value.normalize('NFKC').toLowerCase().replaceAll('ё', 'е').trim();
  for (const group of groups) {
    for (const work of group.works) {
      work.dataset.search = normalize(work.dataset.search);
    }
  }

  const update = () => {
    const selection = new FormData(form);
    const query = normalize(String(selection.get('q') ?? '')).split(/\s+/).filter(Boolean);
    const year = selection.get('year');
    const topic = selection.get('topic');
    const kind = selection.get('type');
    let count = 0;

    for (const { element, works } of groups) {
      let visible = 0;
      for (const work of works) {
        const match = (!year || work.dataset.year === year)
          && (!topic || work.dataset.topics.split(' ').includes(topic))
          && (!kind || work.dataset.kind === kind)
          && query.every(term => work.dataset.search.includes(term));
        work.hidden = !match;
        if (match) visible += 1;
      }
      element.hidden = visible === 0;
      count += visible;
    }

    output.textContent = count ? output.dataset.label.replace('{count}', String(count)) : output.dataset.empty;
    const newUrl = new URL(window.location.href);
    for (const field of fields) {
      if (field.value.trim()) newUrl.searchParams.set(field.name, field.value.trim());
      else newUrl.searchParams.delete(field.name);
    }
    if (newUrl.href !== window.location.href) history.replaceState(null, '', newUrl);
  };

  const initial = new URLSearchParams(window.location.search);
  for (const field of fields) {
    const value = initial.get(field.name);
    if (value !== null && (field.tagName !== 'SELECT' || [...field.options].some(option => option.value === value))) {
      field.value = value;
    }
  }
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('input', update);
  form.hidden = false;
  output.hidden = false;
  update();
})();
