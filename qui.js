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
			var current=this.clicked()

			if (current) {
				this.action(current["action"]) //runs JS code from clicked on grid
			}
		}

		this.mouseh=this.mouse.bind(this) //mouse handler
		this.canv.addEventListener("click", this.mouseh, false)

		this.disp.canvas.width=this.screenx //resizes canvas
		this.disp.canvas.height=this.screeny

		this.srcs=[] //stores all urls to be loaded into cache
		this.imgs=[] //image objs that load the images
	}
	style(boxes) { //determines what style technique to use on baclground
		console.log("style",boxes)
		for (var i=0;i<boxes.length;i++) {
			console.log("style-inner",boxes[i]) //debug
			if (boxes[i]["bg"]["type"]=="color") {
				this.rect(boxes[i]["bg"]["value"], [...boxes[i]["box"]]) //draws background with color
			}
			else if (boxes[i]["bg"]["type"]=="img") {
				this.img(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])]) //draws background with image
			}
			this.text(boxes[i])
		}
	}
	cache() { //finds all unique img urls and loads them
		for (var i of this.board["board"]) {
			if (i["bg"]["type"]=="img") {
				if (!this.srcs.includes(i["bg"]["value"])) { //only appends url if its not there
					this.srcs.push(i["bg"]["value"])
				}
			}
		}
		for (var i=0;i<this.srcs.length;i++) { //loads each string into an object
			this.imgs[i]=new Image()
			this.imgs[i].src=this.srcs[i]
		}
		//screen stays like this until all images are loaded
		this.redraw([{"bg":{"type":"color","value":"#777"},"text":"Loading Images...","box":[0,0,this.board["x"],this.board["y"]]}])
	}
	check() { //loops until all images in cache are loaded in
		for (var i=0;i<this.imgs.length;i++) {
			if (!this.imgs[i].complete) {
				setTimeout(this.check.bind(this),20) //re run until every img in cache is loaded
				return
			}
		}
	}
	init() {
		this.cache()
		this.check()

		this.rect("#fff",[0,0,this.board["x"],this.board["y"]]) //after imgs load, blank screen
		this.redraw(this.board["board"])
	}
	rect(color, box) { //draws box of certain color at given pos
		this.disp.fillStyle=color
		this.disp.fillRect(...this.grid(box))
	}
	redraw(boxes) { //redraws all grids
		for(var i=0;i<boxes.length;i++) { //for each box in the board:
			console.log("redraw",boxes[i])
			this.style([boxes[i]]) //draw outline
			this.text(boxes[i]) //render text
		}
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
					//console.log(0,0,tempx,tempy,(w*imgobj.width)+box[0],(h*imgobj.height)+box[1],tempx,tempy)
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
		var tmp=new Function(s)
		return(tmp())
	}
	clicked() { //finds out what grid was clicked based off mouse pos
		var tempx=~~(this.mousex/this.sizex)
		var tempy=~~(this.mousey/this.sizey)
		var ret //returns the must recent board matching the cords
		for (var i of this.board["board"]) {
			if (tempx>=i["box"][0]&&tempx<i["box"][0]+i["box"][2]&&tempy>=i["box"][1]&&tempy<i["box"][1]+i["box"][3]) {
				ret=i; //instead of getting first element that matches cords, get the last becase it is ontop of the others
			}
		}
		return ret
	}
	grid(box) { //returns cords for grid based on grid size and screen size
		return [box[0]*this.sizex,box[1]*this.sizey,box[2]*this.sizex,box[3]*this.sizey]
	}
}
