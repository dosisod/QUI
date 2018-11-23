class QUIrenderer {
	constructor({url=false, str=false, json=false}) {
		if (str) { this.board=JSON.parse(str) }
		else if (json) { this.board=json }
		else {
			//synchronous req is deprecated, but i need to save JSON as var
			var tmp=new XMLHttpRequest();
			tmp.open("GET",url, false)
			tmp.send("")
			this.board=JSON.parse(tmp.responseText)
		}

		this.screenx=window.innerWidth //gets full window size
		this.screeny=window.innerHeight

		this.sizex=this.screenx/this.board["x"] //size of each individual box in grid
		this.sizey=this.screeny/this.board["y"]

		this.canv=document.getElementById("c") //gets canvas and makes disp obj for displaying boxes etc
		this.disp=this.canv.getContext("2d")

		this.mousex=0
		this.mousey=0

		this.mouse=function(e){
			this.mousex=e.clientX
			this.mousey=e.clientY
			this.tempgrid=this.clicked()

			if (this.tempgrid) {
				this.action(this.tempgrid["action"]) //runs JS code from clicked on grid
			}
		}

		this.mouseh=this.mouse.bind(this) //mouse handler
		this.canv.addEventListener("click", this.mouseh, false)

		this.disp.canvas.width=this.screenx //resizes canvas
		this.disp.canvas.height=this.screeny

		this.srcs=[] //stores all urls to be loaded into cache
		this.imgs=[] //image objs that load the images

		this.yscroll=0 //amount that the page has been scrolled
		
		this.currentgridid=0 //current index of this.board["board"]
		this._currentgrid=undefined //undefined getter+setter obj
	}
	get currentgrid() { //when current board requesting board, grab current instance
		return this.board["board"][this.currentgridid]
	}
	set currentgrid(box) { //when current board is set, put it into the board object
		this.board["board"][this.currentgridid]=box
	}
	style(boxes) { //determines what style technique to use on baclground
		console.log("style",boxes)
		for (var i=0;i<boxes.length;i++) {
			console.log("style-inner",boxes[i]) //debug
			if (boxes[i]["bg"]["type"]=="color") {
				this.rect(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])]) //draws background with color
			}
			else if (boxes[i]["bg"]["type"]=="img") {
				if (this.imgs[this.srcs.indexOf(boxes[i]["bg"]["value"])]) { //
					if (this.imgs[this.srcs.indexOf(boxes[i]["bg"]["value"])].complete) {
						this.img(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])]) //draws background with image
					}
				}
			}
			this.text(boxes[i])
		}
	}
	findall() { //finds all unique img urls and loads them
		for (var i of this.board["board"]) {
			if (i["bg"]["type"]=="img") {
				if (!this.srcs.includes(i["bg"]["value"])) { //only appends url if its not there
					this.srcs.push(i["bg"]["value"])
				}
			}
		}
	}
	cache(url) {
		return new Promise(function(resolve){
			var imgobj=new Image()
			imgobj.onload=function(){
				resolve(imgobj)
			}
			imgobj.src=url
		})
	}
	async cacheall() { //caches all imgs in this.srcs
		for (var i in this.srcs) {
			if (!this.imgs[i]) { //if not initialized
				this.imgs[i]=await this.cache(this.srcs[i])
				this.redraw(this.board["board"])
			}
		}
	}
	init() {
		this.findall()
		this.cacheall()
		this.redrawall()
	}
	rect(color, box) { //draws box of certain color at given pos
		this.disp.fillStyle=color
		this.disp.fillRect(...box)
	}
	redraw(boxes) { //redraws all grids
		for(var i=0;i<boxes.length;i++) { //for each box in the board:
			console.log("redraw",boxes[i])
			this.style([boxes[i]]) //draw outline
			this.text(boxes[i]) //render text
		}
	}
	redrawall() {
		this.redraw(this.board["board"])
	}
	img(url, box) { //draws img and trim
		var imgobj=this.imgs[this.srcs.indexOf(url)]

		for (var w=0;w<=~~(box[2]/imgobj.width);w++) {
			for (var h=0;h<=~~(box[3]/imgobj.height);h++) {
				var tempx=Math.min(box[2]-(w*imgobj.width),imgobj.width)
				var tempy=Math.min(box[3]-(h*imgobj.height),imgobj.height)
				if (tempx>0&&tempy>0) {
					this.disp.drawImage(imgobj,0,0,
						tempx,tempy,
						(w*imgobj.width)+box[0],(h*imgobj.height)+box[1],tempx,tempy)
				}
			}
		}
	}
	text(box) { //renders text at given pos
		if (box["text"]) { //makes sure there is text to print
			this.disp.font="48px monospace"
			this.disp.fillStyle="black"
			this.disp.fillText(box["text"], box["box"][0]*this.sizex, (box["box"][1]*this.sizey)+50)
		}
	}
	action(s) { //runs JS code from string
		this.currentaction=new Function(s) //sets function as attribue so it has access to class
		return(this.currentaction())
	}
	clicked() { //finds out what grid was clicked based off mouse pos
		var tempx=~~(this.mousex/this.sizex)
		var tempy=~~(this.mousey/this.sizey)
		var ret //returns the most recent board matching the cords

		for (var i=0;i<this.board["board"].length;i++) {
			//checks to see if the current mouse pos is within the current mouse grid
			if (tempx>=this.board["board"][i]["box"][0]&&
				tempx<this.board["board"][i]["box"][0]+this.board["board"][i]["box"][2]&&
				tempy>=this.board["board"][i]["box"][1]&&
				tempy<this.board["board"][i]["box"][1]+this.board["board"][i]["box"][3]) {
				ret=i //instead of getting first element that matches cords, get the last becase it is ontop of the others
				this.currentgridid=i
			}
		}
		this.currentgrid=this.board["board"][ret]
		return this.board["board"][ret]
	}
	grid(box) { //returns cords for grid based on grid size and screen size
		return [box[0]*this.sizex,box[1]*this.sizey,box[2]*this.sizex,box[3]*this.sizey]
	}
	newimg(src, box) { //wrapper that handles new img srcs
		if (!this.srcs.includes(src)) {
			box["bg"]["value"]=src
			this.srcs.push(src)
			
			//this.imgs[this.srcs.length]=new Image()
			//this.imgs[this.srcs.lengtg].src=src
			
			this.findall()
			this.cacheall()
			//this.redraw(this.currentgrid)

			return box
		}
	}
}
