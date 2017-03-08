import Vue from 'vue';

// CSS
// import 'bootstrap-webpack';
// import 'font-awesome-webpack';
import App from './components/App';

/* eslint-disable no-new */
new Vue({
    el: '#app',
    render: h => h(App),
});
