import { apps } from '@dash-incubator/dapp-sdk';
import { alert } from 'ui/components';
import { directive, dom } from 'ui/lib';


async function save(data) {
    let result = await apps.audio.save(
        await apps.audio.create(data)
    );

    console.log(result);
}


// Only necessary to collect values from each input element.
// If your using a framework or library delete this function
// and pass input values to the `save` function
const metadata = async function(e) {
    let button = this.element,
        data = dom.element('audio');

    for (let key in data) {
        if (key === 'keywords') {
            let values = [];

            for (let k in data[key]) {
                if (!data[key][k].value) {
                    continue;
                }

                values.push(data[key][k].value);
            }

            data[key] = values;
        }
        else if (['encrypt', 'transcoded'].includes(key)) {
            data[key] = data[key].checked || false;
        }
        else if (['audio', 'banner', 'thumbnail'].includes(key)) {
            data[key] = data[key].files[0] || '';
        }
        else {
            data[key] = data[key].value || '';
        }
    }

    button.classList.add('button--processing');

    await save(data);

    button.classList.remove('button--processing');
    alert.success('Dash Document saved successfully! Check console for output');
};

const audio = async function (e) {
    e.preventDefault();
    e.stopPropagation();

    this.element.labels[0].classList.add('--hidden');
    this.refs.metadata.classList.remove('--hidden');
};

const images = async function (e) {
    e.preventDefault();
    e.stopPropagation();

    let text = this.refs.text;

    if (!text) {
        return;
    }

    dom.update(() => {
        node.text(text, this.element.files[0].name);
    });
};

const reset = function (e) {
    this.value = '';
};


directive.on('upload.audio', audio);
directive.on('upload.banner', images);
directive.on('upload.thumbnail', images);
directive.on('upload.reset', reset);
directive.on('upload.metadata', metadata);
