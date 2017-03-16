import region1 from '../assets/region1.png';
import region2 from '../assets/region2.png';
/* eslint-disable no-plusplus */
export default {
    ctx: null,
    img: null,
    data() {
        return {
            regionId: 1,
            segIdGen: 0,
            poiIdGen: 0,
            cpIdGen: 0,
            isAddCoords: false,
            isAddPOI: false,
            isAddCP: false,
            currentSeg: null,
            segments: [],
            cps: [],
            pois: [],
            results: '',
            autoSave: null,
        };
    },
    mounted() {
        const cache = localStorage.getItem('results');
        const cacheId = localStorage.getItem('regionId');
        if (cacheId) {
            this.regionId = +cacheId;
        }
        if (cache) {
            this.parse(cache);
        }

        this.loadImg(this.regionId);
        this.autoSave = setInterval(this.saveData, 1000);
    },
    destroyed() {
        clearInterval(this.autoSave);
    },
    methods: {
        parse(dataStr) {
            const data = JSON.parse(dataStr);
            this.segments = data.segs || [];
            this.pois = data.pois || [];
            this.cps = data.cps || [];
            for (const seg of this.segments) {
                seg.coords = seg.coords.map(d => ([d.utm_lon, d.utm_lat]));
            }
            this.poiIdGen = Math.max(...this.pois.map(d => d.id));
            this.segIdGen = Math.max(...this.segments.map(d => d.id));
            this.cpIdGen = Math.max(...this.cps.map(d => d.id));
        },
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
                this.parse(e.target.result);
                this.drawRoads();
            };
            fr.readAsText(file);
        },
        clickCanvas(evt) {
            if (evt.ctrlKey) {
                return;
            }
            if (this.isAddCoords) {
                this.currentSeg
                    .coords
                    .push([evt.offsetX, evt.offsetY]);
                this.drawRoads();
            } else if (this.isAddPOI) {
                const poi = {
                    id: this.poiIdGen++,
                    Name: 'No name',
                    Type: 'No type',
                    utm_lat: evt.offsetY,
                    utm_lon: evt.offsetX,
                };
                this.pois.push(poi);
                this.drawRoads();
            } else if (this.isAddCP) {
                const cp = {
                    id: this.cpIdGen++,
                    quantity: 700,
                    r: 10,
                    utm_lat: evt.offsetY,
                    utm_lon: evt.offsetX,
                };
                this.cps.push(cp);
                this.drawRoads();
            }
        },
        cleanState() {
            this.isAddCoords = false;
            this.isAddPOI = false;
            this.isAddCP = false;
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
            this.cleanState();
            this.isAddCoords = true;
            this.currentSeg = seg;
        },
        addPOI() {
            this.cleanState();
            this.isAddPOI = true;
        },
        addCP() {
            this.cleanState();
            this.isAddCP = true;
        },
        removePOI(idx) {
            this.pois.splice(idx, 1);
        },
        removeCP(idx) {
            this.cps.splice(idx, 1);
        },
        removeCoords(seg) {
            const cS = seg || this.currentSeg;
            cS.coords.pop();
            this.drawRoads();
        },
        saveData(m) {
            let results = JSON.parse(JSON.stringify(this.segments));
            for (const seg of results) {
                seg.coords = seg.coords.map(d => ({
                    utm_lat: d[1],
                    utm_lon: d[0],
                }));
            }
            results = JSON.stringify({
                pois: this.pois,
                cps: this.cps,
                segs: results,
            });
            localStorage.setItem('regionId', this.regionId);
            localStorage.setItem('results', results);
            if (m === null) {
                this.results = results;
            }
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

            const PI2 = Math.PI * 2;
            ctx.fillStyle = 'green';
            for (const poi of this.pois) {
                ctx.beginPath();
                if (poi) {
                    ctx.arc(poi.utm_lon, poi.utm_lat, 3, 0, PI2, false);
                }
                ctx.fill();
            }

            for (const cp of this.cps) {
                ctx.beginPath();
                ctx.fillStyle = `rgba(52, 152, 219, ${cp.quantity / 1000})`;
                if (cp) {
                    ctx.arc(cp.utm_lon, cp.utm_lat, cp.r, 0, PI2, false);
                }
                ctx.fill();
            }
        },
        cleanCache() {
            // localStorage.clear();
            this.pois = [];
            this.segments = [];
            this.cps = [];
            this.drawRoads();
        },
    },
};
