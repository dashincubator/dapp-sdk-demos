import { apps } from '@dash-incubator/dapp-sdk';
import { alert } from 'ui/components';
import { directive, dom, emitter, node } from 'ui/lib';


let comment = {
        create: async (content) => {
            return await apps.comment.save(
                await apps.comment.create({ content, parent, thread })
            );
        },
        get: async (parent = '') => {
            return await apps.comment.get({
                where: [
                    ['parent', '==', parent],
                    ['thread', '==', thread]
                ]
            });
        }
    },
    parent = '',
    thread = 'dapp-sdk-demos';


function template(found, nested = false) {
    let html = '';

    for (let i = 0, n = found.length; i < n; i ++) {
        let data = found[i].data;

        html += `
            <div class="row --flex-column ${nested ? '--border-border --border-left --border-state --margin-top --margin-600 --padding-left --padding-600' : ''}">
                <div class="--flex-row --flex-vertical">
                    <div class="image --background-black-500 --border-radius --border-radius-900 --color --color-white-400 --flex-center --margin-right --margin-300 --size --size-800">
                        ?
                    </div>

                    <div class="text-list">
                        <span class="text">
                            Identity: &nbsp; <b>${data['$ownerId']}</b>
                        </span>
                        <span class="text --flex-vertical --margin-0px --text-200">
                            <div class="icon --margin-right --margin-100 --size-300">
                                <svg width="16" height="16" viewBox="0 0 16 16">
                                    <path d="M8 0a8 8 0 100 16A8 8 0 008 0zm0 14a6.001 6.001 0 01.002-12.002A6.001 6.001 0 018 14z"/>
                                    <path d="M8.5 7.769V3.976h-1v4.207l2.975 2.975.707-.707z"/>
                                </svg>
                            </div>

                            <b>
                                ${new Date(data['$createdAt'])}
                            </b>
                        </span>
                    </div>
                </div>

                <div class="text --margin-top --margin-400">
                    ${data['content']}
                </div>

                <div class="row --flex-horizontal-space-between --margin-top --margin-300">
                    <b class="link link--underline --color-black-500 --color-primary --color-state --inline --text-300" data-bind='{"parent": "${data['$id']}", "refs": { "button": "comment.button", "title": "comment.title" }}' data-click='comment.reply'>
                        reply
                    </b>

                    <b class="link link--underline --color-black-500 --color-primary --color-state --inline --text-300" data-bind='{"parent": "${data['$id']}"}' data-click='comment.load'>
                        load replies to this comment
                    </b>
                </div>
            </div>

            <div class='border --border-dashed --border-grey-500 --border-width-300 --margin-vertical --margin-500'></div>
        `;
    }

    return html;
}


// Only necessary to collect values from each input element.
// If your using a framework or library delete this function
// and pass input values to the `comment.create` function
const init = async () => {
    let element = (dom.ref('comments') || {}).element;

    if (!element) {
        return;
    }

    let found = await comment.get();

    if (!found.length) {
        element.innerHTML = `No comments found for thread: &nbsp; <b>dapp-sdk-demos</b>`;
        return;
    }

    dom.update(() => {
        node.html(element, template(found));
    });
};

const load = async function(e) {
    let parent = this.parent,
        trigger = this.element;

    if (!parent) {
        return;
    }

    dom.update(() => {
        trigger.innerHTML = 'loading nested comments...';
    });

    let found = await comment.get(parent);

    if (!found.length) {
        dom.update(() => {
            trigger.innerHTML = '0 nested comments found';
        });
        return;
    }

    dom.update(() => {
        node.html(trigger.parentNode.parentNode, {
            append: template(found, true)
        });

        trigger.parentNode.removeChild(trigger);
    });
};

const post = async function(e) {
    let button = this.element,
        value = ( this.refs.comment || {} ).value || '';

    if (!value) {
        return;
    }

    button.classList.add('button--processing');
    console.log(`${parent ? 'replying to' : 'posting'} comment`);

    let result = await comment.create(value);

    parent = '';

    button.classList.remove('button--processing');
    console.log(result);
};

const reply = async function(e) {
    let button = this.refs.button,
        title = this.refs.title;

    if (!button || !title) {
        return;
    }

    parent = this.parent;

    button.innerHTML = 'Reply To Comment';
    title.innerHTML = `Replying to Comment: ${parent}`;
};


directive.on('comment.load', load);
directive.on('comment.post', post);
directive.on('comment.reply', reply);
emitter.on('user.init', init);
