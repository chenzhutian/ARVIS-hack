// import $ from 'jquery';
import { UiCollapsible, UiSelect } from 'keen-ui';
import {
    GET_COURSES_LIST,
    SELECT_COURSE,
    SELECT_VIDEO,
} from '../../store/types';

export default {
    components: {
        UiSelect,
        UiCollapsible,
    },
    mounted() {
        // Get the course list when component is ready
        this.getCoursesList();
    },
    data() {
        return {
            hashVideo: null,
            videosList: [],
        };
    },
    methods: {
        ...mapActions({
            getCoursesList: GET_COURSES_LIST,
            selectCourse: SELECT_COURSE,
            selectVideo: SELECT_VIDEO,
        }),
    },
    computed: {
        courseId: {
            get() {
                const course = this.$store.state.selectedCourse;
                if (!course) {
                    return '';
                }
                const videosList = course.videos;
                const videoByFirsetSection = {};
                videosList.forEach((video) => {
                    const sections = video.section.split('>>');
                    const section = sections[1];
                    if (!(section in videoByFirsetSection)) {
                        videoByFirsetSection[section] = {
                            section,
                            order: +sections[0],
                            videos: [],
                        };
                    }
                    videoByFirsetSection[section].videos.push(video);
                });

                const sortVideosList = Object.keys(videoByFirsetSection)
                    .map(section => videoByFirsetSection[section])
                    .sort((a, b) => a.order - b.order);
                const hashVideo = {};
                sortVideosList.forEach((group, groupIndex) => {
                    group.videos.forEach((video) => {
                        hashVideo[video.id] = `#v_group${groupIndex}`;
                    });
                });
                this.hashVideo = hashVideo;
                this.videosList = sortVideosList;
                return course.id;
            },
            set(value) {
                this.selectCourse({
                    selectedCourseId: value.value,
                });
            },
        },
        ...mapState({
            videoId(state) {
                if (!this.hashVideo || !state.selectedVideo) {
                    return null;
                }
                const videoId = state.selectedVideo.id;
                // $('#sidebar').scrollTop(0);
                // const position = $(this.hashVideo[videoId]).position();
                // if (position) {
                //     $('#sidebar').scrollTop(position.top - 50);
                // }
                return videoId;
            },
            coursesList(state) {
                const coursesList = state.coursesList;
                if (!coursesList) {
                    return null;
                }
                return coursesList.sort((a, b) => {
                    const aId = a.year || '0';
                    const bId = b.year || '0';
                    const orderA = aId.match(/[0-9]+/g).join('');
                    const orderB = bId.match(/[0-9]+/g).join('');
                    return orderB.localeCompare(orderA);
                }).map(d => ({ label: `${d.year} ${d.name}`, value: d.id }));
            },
        }),
    },
};
