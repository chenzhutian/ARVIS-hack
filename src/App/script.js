import region1 from '../assets/region1.png';
import region2 from '../assets/region2.png';

export default {
    ctx: null,
    img: null,
    data() {
        return {
            regionId: 1,
            segIdGen: 0,
            isSetting: false,
            isAddCoords: false,
            currentSeg: null,
            original: [0, 0],
            segments: [],
            results: '',
        };
    },
    mounted() {
        const cache = localStorage.getItem('segments');
        const cacheId = localStorage.getItem('regionId');
        if (cacheId) {
            this.regionId = +cacheId;
        }
        if (cache) {
            const segments = JSON.parse(cache);
            for (const seg of segments) {
                seg.coords = seg.coords.map(d => ([d.utm_lon, d.utm_lat]));
            }
            this.segments = segments;
        }

        this.loadImg(this.regionId);
        setInterval(this.saveSegment(), 2000);
    },
    methods: {
        loadImg(id) {
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
                this.drawRoads();
            };
            img.src = id === 1 ? region1 : region2;
            this.regionId = id;
            this.ctx = ctx2;
            this.img = img;
        },
        loadSegs(evt) {
            const file = evt.target.files[0];
            const fr = new FileReader();

            fr.onload = (e) => {
                this.segments = JSON.parse(e.target.result);
                for (const seg of this.segments) {
                    seg.coords = seg.coords.map(d => ([d.utm_lon, d.utm_lat]));
                }
                this.drawRoads();
            };
            fr.readAsText(file);
        },
        settingOriginal() {
            this.isSetting = true;
            this.isAddCoords = false;
        },
        clickCanvas(evt) {
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
                        evt.offsetY - this.original[1],
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
                name: 'No name',
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
        saveSegment(m) {
            let results = JSON.parse(JSON.stringify(this.segments));
            for (const seg of results) {
                seg.coords = seg.coords.map(d => ({
                    utm_lat: d[1],
                    utm_lon: d[0],
                }));
            }
            results = JSON.stringify(results);
            if (m === null) {
                this.results = results;
            }
            localStorage.setItem('regionId', this.regionId);
            localStorage.setItem('segments', results);
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
        },
    },
};
