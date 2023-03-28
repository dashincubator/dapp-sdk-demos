import { apps, user } from '@dash-incubator/dapp-sdk';
import { alert, state } from 'ui/components';
import { dom, emitter } from 'ui/lib';


let initialized = false;


const init = async () => {
    if (initialized) {
        return;
    }

    initialized = await user.session.start();

    if (initialized) {
        await apps.register();

        alert.deactivate.error();
        alert.success('tDash found, all relevant contract information cached, welcome to the demo!', 8);

        let loading = dom.ref('anchor.loading');

        if (loading) {
            state.deactivate(loading.element);
        }

        emitter.dispatch('user.init');
    }
    else {
        alert.error(`Deposit tDash in <b>${user.session.wallet.address}</b> to continue`);

        setTimeout(init, (1000 * 30));
    }
};


emitter.once('components.mounted', init);
