/* global solemartGuideConfig, wp */
(() => {
  const root = document.getElementById('solemart-guide-editor');
  const payload = document.getElementById('solemart-guide-payload');
  if (!root || !payload) return;
  let data;
  try { data = JSON.parse(payload.value); } catch { data = {}; }
  if (!data || Array.isArray(data) || typeof data !== 'object') data = {};
  let nextId = 0;
  const save = () => { payload.value = JSON.stringify(data); };
  function button(text, action) {
    const node = document.createElement('button');
    node.type = 'button'; node.className = 'button'; node.textContent = text;
    node.addEventListener('click', action); return node;
  }
  function fields(parent, schema, value) {
    Object.entries(schema).forEach(([key, definition]) => {
      const wrap = document.createElement(definition.type === 'repeat' ? 'fieldset' : 'div');
      wrap.className = 'solemart-field'; parent.append(wrap);
      if (definition.type === 'repeat') {
        const legend = document.createElement('legend'); legend.textContent = definition.label; wrap.append(legend);
        if (!Array.isArray(value[key])) value[key] = [];
        const rows = document.createElement('div'); wrap.append(rows);
        const add = button('Add item', () => { value[key].push({}); renderRows(); save(); });
        wrap.append(add);
        function renderRows() {
          rows.replaceChildren();
          value[key].forEach((item, index) => {
            const row = document.createElement('fieldset'); row.className = 'solemart-row';
            const title = document.createElement('legend'); title.textContent = `Item ${index + 1}`; row.append(title);
            fields(row, definition.fields, item);
            row.append(button('Move up', () => {
              if (index > 0) { [value[key][index - 1], value[key][index]] = [value[key][index], value[key][index - 1]]; renderRows(); save(); }
            }), button('Remove item', () => { value[key].splice(index, 1); renderRows(); save(); }));
            rows.append(row);
          });
          add.disabled = value[key].length >= definition.max;
        }
        renderRows(); return;
      }
      const id = `solemart-field-${++nextId}`;
      const label = document.createElement('label'); label.htmlFor = id; label.textContent = definition.label; wrap.append(label);
      const input = document.createElement(definition.type === 'textarea' ? 'textarea' : 'input');
      if (input.tagName === 'INPUT') input.type = ['image', 'url'].includes(definition.type) ? 'url' : 'text';
      else input.rows = 4;
      input.id = id; input.value = typeof value[key] === 'string' ? value[key] : ''; input.maxLength = 30000;
      input.addEventListener('input', () => { value[key] = input.value; save(); }); wrap.append(input);
      if (definition.type === 'image') {
        wrap.append(button('Choose / upload image', () => {
          const picker = wp.media({ title: 'Choose shoe image', library: { type: 'image' }, multiple: false });
          picker.on('select', () => {
            const image = picker.state().get('selection').first().toJSON();
            value[key] = image.url; input.value = image.url;
            if (!value.imageAlt && image.alt) {
              value.imageAlt = image.alt;
              // Redraw this row's form so the selected media alt text is visible.
              const container = wrap.parentElement;
              const altLabel = [...container.querySelectorAll('label')].find(el => el.textContent === 'Image description');
              const altInput = altLabel && document.getElementById(altLabel.htmlFor);
              if (altInput) altInput.value = image.alt;
            }
            save();
          }); picker.open();
        }));
      }
    });
  }
  fields(root, solemartGuideConfig.schema, data);
  save();
})();
