# Ali Alfatemi — Academic Website

Source for [alialfatemi.github.io](https://alialfatemi.github.io/), Ali Alfatemi's
academic and research website. It presents research projects, publications,
teaching, professional experience, and contact information.

## Local preview

```bash
git clone https://github.com/AliAlfatemi/alialfatemi.github.io.git
cd alialfatemi.github.io
python3 -m http.server 8000
```

Open [localhost:8000](http://localhost:8000/) in a browser.

## Structure

- [index.html](index.html): homepage.
- [styles.css](styles.css): shared styling and responsive layout.
- [script.js](script.js): client-side interactions.
- [publications/](publications/): publication record.
- [research/](research/): research overview.
- [teaching/](teaching/): teaching information.
- [images/](images/): visual assets.

The site is served as static HTML, CSS, and JavaScript through GitHub Pages.
Keep publication titles, author order, venues, and DOI links consistent with
the corresponding publisher records when updating the academic content.

## Interactive traffic demo

The homepage includes a browser-based traffic simulation with normal traffic,
a DDoS surge, and mitigation scenarios. Visitors can adjust attack intensity,
toggle mitigation, pause the animation, and replay the scenario.

`ddos-demo.js` models a bounded FIFO queue with a service capacity of 120
requests/s and a 240-request queue. Its illustrative admission rules filter
94% of attack requests and 2% of legitimate requests when mitigation is enabled.
The visualization samples packet motion while metrics follow the queue model.
Animation pauses outside the viewport and respects reduced-motion preferences.

Run the model's accounting, capacity, and recovery tests with Node.js:

```bash
node --test tests/ddos-demo.test.cjs
```
