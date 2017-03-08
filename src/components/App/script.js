import 'keen-ui/dist/keen-ui.css';

// Component
import {
    UiToolbar
} from 'keen-ui';

export default {
    ctx: null,
    img: null,
    data() {
        return {
            segIdGen: 0,
            isSetting: false,
            isAddCoords: false,
            currentSeg: null,
            original: [0, 0],
            segments: [],
        };
    },
    methods: {
        loadImg(evt) {
            const ctx = this.$refs.canvas.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.canvas.height = img.height;
                ctx.canvas.width = img.width;
                ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
            }
            img.src = URL.createObjectURL(evt.target.files[0]);
            this.ctx = ctx;
            this.img = img;
        },
        settingOriginal() {
            this.isSetting = true;
            this.isAddCoords = false;
        },
        clickCanvas(evt) {
            const point = [evt.offsetX, evt.offsetY];
            if (this.isSetting) {
                this.original = point;
                this.isSetting = false;
            } else if (this.isAddCoords) {
                this.currentSeg.coords.push(point);
            }
        },
        addSegment() {
            this.segments.push({
                id: this.segIdGen++,
                name:"No name",
                velocity: 0,
                quantity: 0,
                coords: [],
            })
        },
        addCoords(seg, evt) {
            this.isAddCoords = true;
            this.isSetting = false;
            this.currentSeg = seg;
        }
    }
};
