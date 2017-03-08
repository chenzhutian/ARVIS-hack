// CSS
import 'nvd3/build/nv.d3.min.css';
import 'video.js/dist/video-js.min.css';
// js
// import $ from 'jquery';
import d3 from 'd3';

import videojs from 'video.js';
import 'videojs-youtube';
import { mapActions, mapState } from 'vuex';
import { FETCH_CLICKS, UPDATE_CLICKS_FILTER } from 'src/store';
// service
import { arrayAggregate } from 'src/service/util';
// components
import TagsInput from 'components/TagsInput';
import SeekLine from 'components/SeekLineGraph';
import Nvd3StackChart from 'components/Nvd3StackChart';

export default {
    components: {
        TagsInput,
        SeekLine,
        Nvd3StackChart,
    },
    mounted() {
        // init colors
        this.colors = d3.scale.ordinal()
            .range(['#1f77b4', '#fdae6b', '#2ca02c', '#d62728', '#9467bd', '#8c564b'])
            .domain(['seeked', 'pause', 'play', 'stalled', 'error', 'ratechange']);
    },
    methods: {
        removeFilter(index) {
            const id = this.filters[index].split('=').shift();
            this.$store.dispatch(UPDATE_CLICKS_FILTER, { id, value: null });
        },
        extractClicks(denseLogs, filters) {
            // the code here can ben improved
            const clickfilters = Object.keys(filters).map((key) => {
                const value = filters[key];
                switch (key) {
                    case 'country':
                        return c => c.country === value;
                    case 'timestamp':
                        return c => c.timestamp === value;
                    default:
                        return () => { };
                }
            });
            let clicks = denseLogs
                .map((d) => {
                    d.clicks.forEach((c) => {
                        c.timestamp = new Date(d.timestamp).setHours(0);
                    });
                    return d.clicks;
                })
                .reduce((a, b) => a.concat(b), []);
            for (const filterFunc of clickfilters) {
                clicks = clicks.filter(filterFunc);
            }
            return clicks;
        },
        ...mapActions({
            getDenseLogs: FETCH_CLICKS,
        }),
    },
    computed: {
        ...mapState({
            selectedCourse: 'selectedCourse',
            selectedVideo(state) {
                const video = state.selectedVideo;
                let progressMask;
                if (this.$el) {
                    progressMask = this.$el.querySelector('#content-video-progress-bar');
                    progressMask.style.width = '0%';
                }

                if (video) {
                    // this.currentTime = videoInfo.currentTime;
                    this.videoSource.src = video.url;
                    if (typeof video.url === 'string' &&
                        video.url.indexOf('www.youtube.com') !== -1) {
                        this.videoSource.type = 'video/youtube';
                    } else {
                        this.videoSource.type = 'video/mp4';
                    }

                    if (!this.player) {
                        this.player = videojs('moocVideo', this.videoConfig);
                        this.player.on('timeupdate', function () {
                            const currentPos = this.currentTime(); // Get currenttime
                            const inverseMaxDuration = 1 / this.duration(); // Get video duration
                            if (progressMask) {
                                progressMask.style.width = `${100 * currentPos * inverseMaxDuration}%`;
                            }
                        });
                    }
                    this.player.src(this.videoSource);
                    this.player.poster('');
                    this.getDenseLogs();
                } else if (this.player) {
                    this.player.pause();
                    this.player.poster('');
                }
                return video;
            },
            filters(state) {
                const clicksFilters = state.clicksFilters;
                return Object.keys(clicksFilters)
                    .map(filterId => `${filterId}=${clicksFilters[filterId]}`);
            },
            seekData(state) {
                let clicks = state.denseLogs;
                const filters = state.clicksFilters;
                let seekData = null;
                if (clicks) {
                    clicks = this.extractClicks(clicks, filters);
                    seekData = clicks.filter(c => c.type === 'seek_video');
                }
                return seekData;
            },
            chartData(state) {
                let clicks = state.denseLogs;
                const filters = state.clicksFilters;

                let chartData = null;
                if (clicks) {
                    clicks = this.extractClicks(clicks, filters);
                    const colors = this.colors;
                    const clicksDist = {};
                    let videoLength = Math.max(...clicks.map(c => c.currentTime || c.oldTime || 0));
                    videoLength = Math.ceil(Math.max(this.selectedVideo.duration, videoLength));
                    clicks.forEach((click) => {
                        const time = Math.min(
                            Math.floor(click.currentTime || click.oldTime),
                            videoLength - 1,
                        );
                        const type = click.type;

                        if (!(type in clicksDist)) {
                            clicksDist[type] = Array(videoLength).fill(0);
                        }
                        clicksDist[type][time] += 1;
                    });

                    chartData = Object.keys(clicksDist)
                        .filter(d => d !== 'show_transcript' && d !== 'hide_transcript')
                        .map(key => ({
                            key,
                            values: arrayAggregate(3, clicksDist[key]).map((d, i) => [i, d]),
                            color: colors(key),
                        }));
                }
                return chartData;
            },
        }),
    },
    data() {
        return {
            player: null,
            videoSource: { src: null, type: 'video/mp4' },
            videoConfig: {
                techOrder: ['youtube', 'html5'],
                playbackRates: [1, 1.5, 2],
                controls: true,
                preload: 'none',
                controlBar: {
                    currentTimeDisplay: true,
                    durationDisplay: true,
                    timeDivider: true,
                    remainingTimeDisplay: false,
                },
            },
            chartAggregation: 3,
            chartConfig: {
                x: d => d[0],
                y: d => d[1],
                xAxis: {
                    tickFormat(d) {
                        const trueD = d * 3; // hard code
                        let sec = trueD % 60;
                        const min = Math.floor(trueD / 60);
                        if (sec === 0) {
                            sec = '00';
                        }
                        return d3.time.format(`${min}'${sec}`);
                    },
                },

            },
            colors: null,
        };
    },
};
