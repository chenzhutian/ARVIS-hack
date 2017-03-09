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
            results: '',
        };
    },
    methods: {
        loadImg(evt) {
            const ctx = this.$refs.canvas.getContext('2d');
            const ctx2 = this.$refs.roads.getContext('2d');
            const img = new Image();
            img.onload = () => {
                ctx.canvas.height = img.height;
                ctx.canvas.width = img.width;
                ctx2.canvas.height = img.height;
                ctx2.canvas.width = img.width;
                ctx.drawImage(img, 0, 0, ctx.canvas.width, ctx.canvas.height);
                ctx2.beginPath();
                ctx2.moveTo(0, 0);
                ctx2.lineTo(200, 200);
                ctx2.stroke();
            }
            img.src = URL.createObjectURL(evt.target.files[0]);
            this.ctx = ctx2;
            this.img = img;
        },
        settingOriginal() {
            this.isSetting = true;
            this.isAddCoords = false;
        },
        clickCanvas(evt) {
            console.log(evt);
            if (evt.ctrlKey) {
                return;
            }
            if (this.isSetting) {
                this.original = [evt.offsetX, evt.offsetY];
                this.isSetting = false;
            } else if (this.isAddCoords) {
                this.currentSeg
                    .coords
                    .push([evt.offsetX - this.original[0],
                        evt.offsetY - this.original[1]
                    ]);
                this.drawRoads();
            }
        },
        cleanState() {
            this.isSetting = false;
            this.isAddCoords = false;
            this.currentSeg = null;
        },
        rightClickCanvas(evt) {
            evt.preventDefault();
            this.cleanState();
        },
        addSegment() {
            const seg = {
                id: this.segIdGen++,
                name: "No name",
                velocity: 0,
                quantity: 0,
                width: 2,
                coords: [],
            };
            this.segments.push(seg);
            this.cleanState();
            this.currentSeg = seg;
            this.isAddCoords = true;
        },
        addCoords(seg, evt) {
            this.isAddCoords = true;
            this.isSetting = false;
            this.currentSeg = seg;
        },
        removeCoords(seg) {
            if (!seg) seg = this.currentSeg;
            console.log(seg);
            seg.coords.pop();
            this.drawRoads();
        },
        saveSegment() {
            const results = JSON.stringify(this.segments);
            const coords = results.coords.map(d => ({
                utm_lat: d[1],
                utm_lon: d[0]
            }));
            results.coords = coords;
            this.results = results;
            console.log(this.results);
        },
        drawRoads() {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
            for (const seg of this.segments) {
                if (seg.coords[0]) {
                    ctx.beginPath();
                    ctx.moveTo(seg.coords[0][0], seg.coords[0][1]);
                    for (let i = 1, len = seg.coords.length; i < len; ++i) {
                        const coord = seg.coords[i];
                        ctx.lineTo(coord[0], coord[1]);
                    }
                    ctx.lineWidth = seg.width;
                    ctx.stroke();
                }
            }
        }
    }
};
