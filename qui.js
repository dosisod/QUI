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
		
		this.currentgridid=undefined //current index of this.board["board"]
		this._currentgrid=undefined //undefined getter+setter obj
	}
	get currentgrid() { //when current board requesting board, grab current instance
		return this.board["board"][this.currentgridid]
	}
	set currentgrid(box) { //when current board is set, put it into the board object
		this.board["board"][this.currentgridid]=box
	}
	style(boxes) { //determines what style technique to use on baclground
		for (var i=0;i<boxes.length;i++) {
			if (boxes[i]["bg"]["type"]=="color") { //solid background color
				this.rect(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])]) //draws background with color
			}
			else if (boxes[i]["bg"]["type"]=="img") { //tiled background img
				if (this.imgs[this.srcs.indexOf(boxes[i]["bg"]["value"])]) { //
					if (this.imgs[this.srcs.indexOf(boxes[i]["bg"]["value"])].complete) {
						this.img(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])]) //draws background with image
					}
				}
			}
			else if (boxes[i]["bg"]["type"]=="gradient") { //color gradient
				this.gradient(boxes[i]["bg"]["value"], [...this.grid(boxes[i]["box"])])
			}
			this.text(boxes[i]) //adds basic text formatting
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
	cache(url) { //chaches single image
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
				this.imgs[i]=await this.cache(this.srcs[i]) //awaits for img to finish
				this.redraw(this.board["board"]) //then redraw the screen
			}
		}
	}
	init() { //initializes the screen
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
			this.style([boxes[i]]) //draw outline
			this.text(boxes[i]) //render text
		}
	}
	redrawall() {
		this.redraw(this.board["board"])
	}
	img(url, box) { //draws img and trim
		var imgobj=this.imgs[this.srcs.indexOf(url)] //based off of src find its respective img obj

		for (var w=0;w<=~~(box[2]/imgobj.width);w++) {
			for (var h=0;h<=~~(box[3]/imgobj.height);h++) {
				var tempx=Math.min(box[2]-(w*imgobj.width),imgobj.width)   //partialy fill img if it cant squeeze a full img near border
				var tempy=Math.min(box[3]-(h*imgobj.height),imgobj.height) //  so, if img is 16 px and only 2px are left, fill the 2px with a partial img
				if (tempx>0&&tempy>0) {
					this.disp.drawImage(imgobj,0,0, //start from 0,0 of source img
						tempx,tempy, //display the full img or however much is needed to fill border
						(w*imgobj.width)+box[0],(h*imgobj.height)+box[1],tempx,tempy) //display that to the screen in respective spot
				}
			}
		}
	}
	gradient(params, box) { //prints a gradient background
		params=params.split(" ") //splits the params into an array
		params[0]=params[0].toLowerCase() //converts the "X" or "Y" to lowercase

		//makes a new gradient pattern obj
		if (params[0]=="x") {
			var tempgradient=this.disp.createLinearGradient(box[0], box[1], box[0]+box[2], box[1]) //display left to right
		}
		else if (params[0]=="y") {
			var tempgradient=this.disp.createLinearGradient(box[0], box[1], box[0], box[1]+box[3]) //display top to bottom
		}
		params.shift(0) //removes the "x" or "y"
		for (var i=0;i<params.length;i++) { //loop through all of the colors and add them to the gradient
			tempgradient.addColorStop(1/(params.length-1)*i,params[i]) //added current color and make sure it evenly takes up space
		}
		this.disp.fillStyle=tempgradient
		this.disp.fillRect(...box)
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
		var tempx=~~(this.mousex/this.sizex) //finds what grid cordinates of the mouse are
		var tempy=~~(this.mousey/this.sizey) //
		var ret //returns the most recent board matching the cords

		for (var i=0;i<this.board["board"].length;i++) {
			//checks to see if the current mouse pos is within the current mouse grid
			if (tempx>=this.board["board"][i]["box"][0]&&
				tempx<this.board["board"][i]["box"][0]+this.board["board"][i]["box"][2]&&
				tempy>=this.board["board"][i]["box"][1]&&
				tempy<this.board["board"][i]["box"][1]+this.board["board"][i]["box"][3]) {
				if (!("ignore" in this.board["board"][i])) { //if ignore flag is set then ignore this board
					ret=i //instead of getting first element that matches cords, get the last becase it is ontop of the others
					this.currentgridid=i
				}
			}
		}
		if (ret) {
			this.currentgrid=this.board["board"][ret]
			return this.board["board"][ret]
		}
		else {
			return false
		}
	}
	grid(box) { //returns cords for grid based on grid size and screen size
		return [box[0]*this.sizex,box[1]*this.sizey,box[2]*this.sizex,box[3]*this.sizey]
	}
	newimg(src, box) { //wrapper that handles new img srcs
		if (!this.srcs.includes(src)) {
			box["bg"]["value"]=src
			this.srcs.push(src)
						
			this.findall()
			this.cacheall()
			
			return box
		}
	}
}
